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
  };
}

/**
 * Fetch today's matches from FIFA API
 */
async function fetchFifaMatches() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0];

  const url = `https://api.fifa.com/api/v3/calendar/matches?idseason=${FIFA_SEASON_ID}&idcompetition=${FIFA_COMPETITION_ID}&from=${today}&to=${tomorrow}&count=500`;

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

  const pointUpdates = {};
  const scoreDiffs = {}; // Track {userId: totalDiff}

  // Check all matches with scores (not just today's)
  const allMatchesSnap = await db.ref('matches').once('value');
  const allMatches = allMatchesSnap.val() || {};

  for (const [gameId, match] of Object.entries(allMatches)) {
    // Fix Bug 9: handle homeScore = 0 correctly
    if (match.homeScore === undefined || match.homeScore === null || match.homeScore < 0) continue;
    if (match.awayScore === undefined || match.awayScore === null || match.awayScore < 0) continue;

    for (const userId of Object.keys(users)) {
      const predSnap = await db.ref(`predictions/${userId}/${gameId}`).once('value');
      const pred = predSnap.val();
      if (!pred) continue;

      const newPoints = calculatePoints(
        match.homeScore, match.awayScore,
        pred.homePrediction, pred.awayPrediction
      );

      if (pred.points !== newPoints) {
        pointUpdates[`predictions/${userId}/${gameId}/points`] = newPoints;

        // Fix Bug 2: Calculate diff BEFORE writing to DB
        const oldPoints = pred.points ?? 0;
        const diff = newPoints - oldPoints;

        if (diff !== 0) {
          scoreDiffs[userId] = (scoreDiffs[userId] || 0) + diff;
        }
      }
    }
  }

  if (Object.keys(pointUpdates).length > 0) {
    await db.ref().update(pointUpdates);
    console.log(`Calculated ${Object.keys(pointUpdates).length} prediction points`);
  } else {
    console.log('No points to calculate');
  }

  // Update user total scores using pre-calculated diffs
  if (Object.keys(scoreDiffs).length > 0) {
    const scoreUpdates = {};
    for (const [userId, totalDiff] of Object.entries(scoreDiffs)) {
      const currentScore = (await db.ref(`users/${userId}/score`).once('value')).val() ?? 0;
      scoreUpdates[`users/${userId}/score`] = currentScore + totalDiff;
    }

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
