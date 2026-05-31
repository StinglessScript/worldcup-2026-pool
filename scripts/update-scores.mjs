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
const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = getDatabase();

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
 * Fetch today's matches from FIFA API
 */
async function fetchFifaMatches() {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
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
  console.log('Fetching FIFA matches...');
  const fifaMatches = await fetchFifaMatches();
  console.log(`Found ${fifaMatches.length} matches today`);

  // Get matches from DB
  console.log('Reading matches from database...');
  const matchesSnap = await db.ref('matches').once('value');
  const matches = matchesSnap.val();
  if (!matches) {
    console.log('No matches in database, exiting');
    return;
  }
  console.log(`Found ${Object.keys(matches).length} matches in database`);

  // Update scores
  const scoreUpdates = {};

  for (const fifaMatch of fifaMatches) {
    for (const [gameId, match] of Object.entries(matches)) {
      if (match.fifaId === fifaMatch.IdMatch) {
        const homeScore = fifaMatch.Home?.Score ?? -1;
        const awayScore = fifaMatch.Away?.Score ?? -1;

        if (homeScore >= 0 && match.homeScore !== homeScore) {
          scoreUpdates[`matches/${gameId}/homeScore`] = homeScore;
        }
        if (awayScore >= 0 && match.awayScore !== awayScore) {
          scoreUpdates[`matches/${gameId}/awayScore`] = awayScore;
        }
      }
    }
  }

  if (Object.keys(scoreUpdates).length > 0) {
    await db.ref().update(scoreUpdates);
    console.log(`Updated ${Object.keys(scoreUpdates).length} scores`);
  } else {
    console.log('No score changes');
  }

  // Calculate points for updated matches
  console.log('Reading users...');
  const usersSnap = await db.ref('users').once('value');
  const users = usersSnap.val();
  if (!users) {
    console.log('No users in database, exiting');
    return;
  }
  console.log(`Found ${Object.keys(users).length} users`);

  const pointUpdates = {};

  for (const matchId of Object.keys(scoreUpdates).map(k => k.split('/')[1])) {
    const matchData = (await db.ref(`matches/${matchId}`).once('value')).val();
    if (!matchData || matchData.homeScore < 0 || matchData.awayScore < 0) continue;

    for (const userId of Object.keys(users)) {
      const predSnap = await db.ref(`predictions/${userId}/${matchId}`).once('value');
      const pred = predSnap.val();
      if (!pred) continue;

      const points = calculatePoints(
        matchData.homeScore, matchData.awayScore,
        pred.homePrediction, pred.awayPrediction
      );

      if (pred.points !== points) {
        pointUpdates[`predictions/${userId}/${matchId}/points`] = points;
      }
    }
  }

  if (Object.keys(pointUpdates).length > 0) {
    await db.ref().update(pointUpdates);
    console.log(`Calculated ${Object.keys(pointUpdates).length} prediction points`);
  } else {
    console.log('No points to calculate');
  }

  // Update user total scores
  const scoreDiffUpdates = {};
  for (const path of Object.keys(pointUpdates)) {
    const [, userId, matchId] = path.split('/');
    const before = (await db.ref(`predictions/${userId}/${matchId}/points`).once('value')).val() ?? 0;
    const after = pointUpdates[path];
    const diff = after - before;

    if (diff !== 0) {
      const currentScore = (await db.ref(`users/${userId}/score`).once('value')).val() ?? 0;
      scoreDiffUpdates[`users/${userId}/score`] = currentScore + diff;
    }
  }

  if (Object.keys(scoreDiffUpdates).length > 0) {
    await db.ref().update(scoreDiffUpdates);
    console.log(`Updated ${Object.keys(scoreDiffUpdates).length} user scores`);
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
