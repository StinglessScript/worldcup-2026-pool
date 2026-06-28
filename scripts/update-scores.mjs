/**
 * GitHub Actions script: Fetch FIFA API → Update scores → Calculate points
 * Runs every 5 minutes via GitHub Actions cron
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// Timeout after 2 minutes
setTimeout(() => {
  console.error('Script timed out after 2 minutes');
  process.exit(1);
}, 120000);

// FIFA API constants
const FIFA_COMPETITION_ID = '17';
const FIFA_SEASON_ID = '285023';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = getDatabase();

/**
 * Extract description from FIFA locale array
 */
function getLocaleText(arr, locale = 'en-GB') {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return '';
  const found = arr.find(item => item.Locale === locale);
  return found ? found.Description : arr[0].Description;
}

/**
 * Parse group name: "Group A" → "A"
 */
function parseGroup(groupName) {
  if (!groupName) return null;
  const match = groupName.match(/Group\s+(.+)/i);
  return match ? match[1] : groupName;
}

/**
 * Determine match winner
 */
function getWinner(home, away) {
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'tied';
}

/**
 * Which side advanced ('home' | 'away' | null), from the FIFA Winner team id.
 * Reliable for knockout matches decided by penalties (FIFA sets Winner even
 * when the recorded score is a draw).
 */
function winnerSide(fifaMatch) {
  const w = fifaMatch.Winner;
  if (!w) return null;
  if (fifaMatch.Home?.IdTeam && w === fifaMatch.Home.IdTeam) return 'home';
  if (fifaMatch.Away?.IdTeam && w === fifaMatch.Away.IdTeam) return 'away';
  return null;
}

/**
 * Round multiplier by FIFA MatchNumber. Group stage is 1; knockout escalates.
 */
function getMultiplier(game) {
  const n = Number(game);
  if (n <= 88) return 1; // group stage + Round of 32
  if (n <= 96) return 2; // Round of 16
  if (n <= 100) return 3; // Quarter-finals
  if (n <= 102) return 4; // Semi-finals
  if (n === 103) return 3; // Third-place play-off
  return 5; // Final (104)
}

/**
 * Knockout points (mirrors the Rules page):
 *   base = score (15 exact / 10−diff / 0) + advance bonus (+5 if right team goes through)
 *   total = base × round multiplier
 *   hope star: ×2 if the advance pick is right, else −10 × multiplier
 * Scored only once the actual advancing side is known.
 */
function calculateKnockoutPoints(match, pred) {
  const hs = match.homeScore;
  const as = match.awayScore;
  const hp = pred.homePrediction;
  const ap = pred.awayPrediction;
  if (hs < 0 || as < 0 || hp == null || ap == null) return 0;

  let score = 0;
  if (hs === hp && as === ap) score = 15;
  else if (getWinner(hs, as) === getWinner(hp, ap)) {
    score = Math.max(0, 10 - (Math.abs(hp - hs) + Math.abs(ap - as)));
  }

  const mult = getMultiplier(match.game);
  const actualWinner = match.winner; // 'home' | 'away'
  const predAdvance =
    pred.advance ?? (hp > ap ? 'home' : hp < ap ? 'away' : null);
  const advanceCorrect =
    !!actualWinner && !!predAdvance && actualWinner === predAdvance;

  if (pred.star) {
    return advanceCorrect ? (score + 5) * mult * 2 : -10 * mult;
  }
  return (score + (advanceCorrect ? 5 : 0)) * mult;
}

/**
 * Calculate prediction points
 * - 15 pts: exact score
 * - 10 - diff: correct winner
 * - 0 pts: wrong
 */
function calculatePoints(homeScore, awayScore, homePred, awayPred) {
  if (homeScore < 0 || homePred === null || awayPred === null) return 0;
  if (homeScore === homePred && awayScore === awayPred) return 15;
  if (getWinner(homeScore, awayScore) === getWinner(homePred, awayPred)) {
    const diff = Math.abs(homePred - homeScore) + Math.abs(awayPred - awayScore);
    return Math.max(0, 10 - diff);
  }
  return 0;
}

/**
 * Convert FIFA API match to our database format
 */
function fifaMatchToDbFormat(fifaMatch) {
  return {
    game: fifaMatch.MatchNumber,
    fifaId: fifaMatch.IdMatch,
    round: getLocaleText(fifaMatch.StageName),
    group: parseGroup(getLocaleText(fifaMatch.GroupName)),
    date: fifaMatch.Date,
    timestamp: Math.floor(new Date(fifaMatch.Date).getTime() / 1000),
    location: getLocaleText(fifaMatch.Stadium?.Name),
    locationCity: getLocaleText(fifaMatch.Stadium?.CityName),
    locationCountry: fifaMatch.Stadium?.IdCountry || '',
    home: fifaMatch.Home?.Abbreviation || '',
    homeName: fifaMatch.Home?.ShortClubName || getLocaleText(fifaMatch.Home?.TeamName),
    homeScore: fifaMatch.HomeTeamScore ?? fifaMatch.Home?.Score ?? -1,
    away: fifaMatch.Away?.Abbreviation || '',
    awayName: fifaMatch.Away?.ShortClubName || getLocaleText(fifaMatch.Away?.TeamName),
    awayScore: fifaMatch.AwayTeamScore ?? fifaMatch.Away?.Score ?? -1,
    // FIFA match status: 0 = finished, 1 = not started, 3 = live.
    matchStatus: fifaMatch.MatchStatus,
    // Advancing side ('home'|'away') for knockout; null until decided.
    winner: winnerSide(fifaMatch),
  };
}

/**
 * Fetch the full tournament calendar from FIFA API.
 * We pull every match (not a date window) so that knockout team
 * assignments — which FIFA fills in days before kickoff — get synced into
 * the DB as soon as they are known, not just live scores in the window.
 */
async function fetchFifaMatches() {
  const url = `https://api.fifa.com/api/v3/calendar/matches?idseason=${FIFA_SEASON_ID}&idcompetition=${FIFA_COMPETITION_ID}&count=500`;

  console.log(`Fetching FIFA API: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FIFA API error: ${res.status}`);
  const data = await res.json();
  return data.Results || [];
}

/**
 * Main: update scores, calculate points, update totals
 */
async function main() {
  // Step 1: Sync scores from FIFA API.
  // Failures here must not block point calculation below.
  try {
    console.log('Fetching FIFA matches...');
    const fifaMatches = await fetchFifaMatches();
    console.log(`Found ${fifaMatches.length} matches today`);

    if (fifaMatches.length > 0) {
      // Get existing matches from DB
      console.log('Reading matches from database...');
      const matchesSnap = await db.ref('matches').once('value');
      const existingMatches = matchesSnap.val() || {};
      console.log(`Found ${Object.keys(existingMatches).length} matches in database`);

      // Build fifaId → gameId lookup
      const fifaIdToGameId = {};
      for (const [gameId, match] of Object.entries(existingMatches)) {
        if (match.fifaId) {
          fifaIdToGameId[match.fifaId] = gameId;
        }
      }

      // Update scores and sync new matches
      const updates = {};
      let updatedCount = 0;
      let newMatchCount = 0;

      for (const fifaMatch of fifaMatches) {
        const parsed = fifaMatchToDbFormat(fifaMatch);
        const existingGameId = fifaIdToGameId[fifaMatch.IdMatch];

        if (existingGameId) {
          // Existing match - update scores if changed
          const existing = existingMatches[existingGameId];
          if (parsed.homeScore >= 0 && existing.homeScore !== parsed.homeScore) {
            updates[`matches/${existingGameId}/homeScore`] = parsed.homeScore;
            updatedCount++;
          }
          if (parsed.awayScore >= 0 && existing.awayScore !== parsed.awayScore) {
            updates[`matches/${existingGameId}/awayScore`] = parsed.awayScore;
            updatedCount++;
          }
          // Track status transitions (upcoming -> live -> finished) so the
          // live tab clears as soon as the feed reports full time.
          if (
            parsed.matchStatus != null &&
            existing.matchStatus !== parsed.matchStatus
          ) {
            updates[`matches/${existingGameId}/matchStatus`] = parsed.matchStatus;
            updatedCount++;
          }
          // Sync knockout team assignments once FIFA fills them in.
          // Only when the API now reports a real team, so we never overwrite
          // a known team with an empty placeholder.
          if (parsed.home && parsed.home !== existing.home) {
            updates[`matches/${existingGameId}/home`] = parsed.home;
            updates[`matches/${existingGameId}/homeName`] = parsed.homeName;
            updatedCount++;
            console.log(`Team set: game ${existingGameId} home -> ${parsed.home}`);
          }
          if (parsed.away && parsed.away !== existing.away) {
            updates[`matches/${existingGameId}/away`] = parsed.away;
            updates[`matches/${existingGameId}/awayName`] = parsed.awayName;
            updatedCount++;
            console.log(`Team set: game ${existingGameId} away -> ${parsed.away}`);
          }
          // Record the advancing side once known (never overwrite with null).
          if (parsed.winner && existing.winner !== parsed.winner) {
            updates[`matches/${existingGameId}/winner`] = parsed.winner;
            updatedCount++;
            console.log(`Winner set: game ${existingGameId} -> ${parsed.winner}`);
          }
        } else {
          // New match not in DB - insert full record
          const gameId = String(parsed.game);
          for (const [key, value] of Object.entries(parsed)) {
            if (value !== undefined && value !== null) {
              updates[`matches/${gameId}/${key}`] = value;
            }
          }
          newMatchCount++;
          console.log(`New match: ${parsed.homeName} vs ${parsed.awayName} (game ${gameId})`);
        }
      }

      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
        console.log(`Updated ${updatedCount} scores, added ${newMatchCount} new matches`);
      } else {
        console.log('No changes needed');
      }
    }
  } catch (err) {
    console.error('FIFA sync failed, continuing to point calculation:', err.message);
  }

  // Step 2: Calculate points for all matches that already have scores.
  // Always runs, even when FIFA returns no matches today.
  console.log('Reading users...');
  const usersSnap = await db.ref('users').once('value');
  const users = usersSnap.val();
  if (!users) {
    console.log('No users in database, exiting');
    return;
  }
  console.log(`Found ${Object.keys(users).length} users`);

  // Read predictions and matches in bulk. The admin SDK bypasses security
  // rules, so the whole tree comes back in one round-trip instead of one
  // read per user per game (which timed out as users/matches grew).
  const allPredictions = (await db.ref('predictions').once('value')).val() || {};
  const allMatches = (await db.ref('matches').once('value')).val() || {};

  const pointUpdates = {};
  const userTotals = {}; // {userId: full recomputed score}

  for (const userId of Object.keys(users)) {
    userTotals[userId] = 0;
    const userPreds = allPredictions[userId] || {};

    for (const [gameId, pred] of Object.entries(userPreds)) {
      const match = allMatches[gameId];
      if (!match) continue;

      // handle score = 0 correctly; skip matches without a score yet
      const hasScore =
        match.homeScore != null && match.homeScore >= 0 &&
        match.awayScore != null && match.awayScore >= 0;

      // Knockout matches carry no group letter. Score them with the knockout
      // rules — but only once the advancing side is known, so a hope star is
      // never wrongly penalised in the brief window before FIFA sets it.
      // Group-stage scoring is untouched.
      const isKnockout = !match.group;

      let newPoints = 0;
      if (hasScore && !isKnockout) {
        newPoints = calculatePoints(
          match.homeScore,
          match.awayScore,
          pred.homePrediction,
          pred.awayPrediction
        );
      } else if (
        hasScore &&
        isKnockout &&
        (match.winner === 'home' || match.winner === 'away')
      ) {
        newPoints = calculateKnockoutPoints(match, pred);
      }

      userTotals[userId] += newPoints;

      if (pred.points !== newPoints) {
        pointUpdates[`predictions/${userId}/${gameId}/points`] = newPoints;
      }
    }
  }

  if (Object.keys(pointUpdates).length > 0) {
    await db.ref().update(pointUpdates);
    console.log(`Calculated ${Object.keys(pointUpdates).length} prediction points`);
  } else {
    console.log('No points to calculate');
  }

  // Recompute each user's total score from scratch and overwrite it.
  // Idempotent: safe under concurrent/overlapping runs and self-heals any drift.
  const scoreUpdates = {};
  for (const userId of Object.keys(users)) {
    const currentScore = users[userId].score ?? 0;
    if (currentScore !== userTotals[userId]) {
      scoreUpdates[`users/${userId}/score`] = userTotals[userId];
    }
  }

  if (Object.keys(scoreUpdates).length > 0) {
    await db.ref().update(scoreUpdates);
    console.log(`Updated ${Object.keys(scoreUpdates).length} user scores`);
  }

  console.log('Done!');
}

main()
  .then(() => {
    console.log('Exiting successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
