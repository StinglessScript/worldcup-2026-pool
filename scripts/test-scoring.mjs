/**
 * Test script: Clear data → Mock data (correct schema) → Test scoring
 * Run: node test-scoring.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = getDatabase();

function getWinner(home, away) {
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'tied';
}

function calculatePoints(homeScore, awayScore, homePred, awayPred) {
  if (homeScore < 0 || homePred === null || awayPred === null) return 0;
  if (homeScore === homePred && awayScore === awayPred) return 15;
  if (getWinner(homeScore, awayScore) === getWinner(homePred, awayPred)) {
    const diff = Math.abs(homePred - homeScore) + Math.abs(awayPred - awayScore);
    return Math.max(0, 10 - diff);
  }
  return 0;
}

async function main() {
  // ===== 1. CLEAR ALL DATA =====
  console.log('=== Step 1: Clearing all data... ===');
  await db.ref().set(null);
  console.log('All data cleared!\n');

  // ===== 2. MOCK DATA (correct schema) =====
  console.log('=== Step 2: Inserting mock data... ===');

  // Mock matches - full schema matching frontend
  const matches = {
    '1': {
      game: 1,
      fifaId: 'FIFA001',
      round: 'Group Stage',
      group: 'A',
      date: '2026-06-11T18:00:00Z',
      timestamp: Math.floor(new Date('2026-06-11T18:00:00Z').getTime() / 1000),
      location: 'Estadio Azteca',
      locationCity: 'Mexico City',
      locationCountry: 'MEX',
      home: 'BRA',
      homeName: 'Brazil',
      homeScore: -1,
      away: 'SRB',
      awayName: 'Serbia',
      awayScore: -1,
    },
    '2': {
      game: 2,
      fifaId: 'FIFA002',
      round: 'Group Stage',
      group: 'C',
      date: '2026-06-11T21:00:00Z',
      timestamp: Math.floor(new Date('2026-06-11T21:00:00Z').getTime() / 1000),
      location: 'Lusail Stadium',
      locationCity: 'Lusail',
      locationCountry: 'QAT',
      home: 'ARG',
      homeName: 'Argentina',
      homeScore: -1,
      away: 'KSA',
      awayName: 'Saudi Arabia',
      awayScore: -1,
    },
    '3': {
      game: 3,
      fifaId: 'FIFA003',
      round: 'Group Stage',
      group: 'D',
      date: '2026-06-12T18:00:00Z',
      timestamp: Math.floor(new Date('2026-06-12T18:00:00Z').getTime() / 1000),
      location: 'MetLife Stadium',
      locationCity: 'New Jersey',
      locationCountry: 'USA',
      home: 'FRA',
      homeName: 'France',
      homeScore: -1,
      away: 'AUS',
      awayName: 'Australia',
      awayScore: -1,
    },
    '4': {
      game: 4,
      fifaId: 'FIFA004',
      round: 'Group Stage',
      group: 'E',
      date: '2026-06-12T21:00:00Z',
      timestamp: Math.floor(new Date('2026-06-12T21:00:00Z').getTime() / 1000),
      location: 'BC Place',
      locationCity: 'Vancouver',
      locationCountry: 'CAN',
      home: 'GER',
      homeName: 'Germany',
      homeScore: -1,
      away: 'JPN',
      awayName: 'Japan',
      awayScore: -1,
    },
  };

  // Mock users - full schema matching frontend
  const users = {
    'uid_user1': {
      email: 'vana@test.com',
      displayName: 'Nguyễn Văn A',
      userName: 'vana',
      photoURL: '',
      score: 0,
      admin: false,
    },
    'uid_user2': {
      email: 'thib@test.com',
      displayName: 'Trần Thị B',
      userName: 'thib',
      photoURL: '',
      score: 0,
      admin: false,
    },
    'uid_user3': {
      email: 'vanc@test.com',
      displayName: 'Lê Văn C',
      userName: 'vanc',
      photoURL: '',
      score: 0,
      admin: false,
    },
  };

  // Username index for profile lookups
  const usernames = {
    'vana': 'uid_user1',
    'thib': 'uid_user2',
    'vanc': 'uid_user3',
  };

  // Mock predictions - full schema matching frontend
  const now = Date.now();
  const predictions = {
    'uid_user1': {
      '1': { homePrediction: 2, awayPrediction: 1, points: 0, updatedAt: now },
      '2': { homePrediction: 3, awayPrediction: 0, points: 0, updatedAt: now },
      '3': { homePrediction: 2, awayPrediction: 1, points: 0, updatedAt: now },
      '4': { homePrediction: 1, awayPrediction: 1, points: 0, updatedAt: now },
    },
    'uid_user2': {
      '1': { homePrediction: 2, awayPrediction: 0, points: 0, updatedAt: now },
      '2': { homePrediction: 2, awayPrediction: 1, points: 0, updatedAt: now },
      '3': { homePrediction: 3, awayPrediction: 1, points: 0, updatedAt: now },
      '4': { homePrediction: 2, awayPrediction: 1, points: 0, updatedAt: now },
    },
    'uid_user3': {
      '1': { homePrediction: 1, awayPrediction: 0, points: 0, updatedAt: now },
      '2': { homePrediction: 4, awayPrediction: 0, points: 0, updatedAt: now },
      '3': { homePrediction: 2, awayPrediction: 1, points: 0, updatedAt: now },
      '4': { homePrediction: 0, awayPrediction: 2, points: 0, updatedAt: now },
    },
  };

  await db.ref().set({ matches, users, usernames, predictions });
  console.log('Mock data inserted!\n');

  // ===== 3. SIMULATE MATCH RESULTS =====
  console.log('=== Step 3: Simulating match results... ===');

  const results = {
    '1': { homeScore: 2, awayScore: 1 },  // Brazil 2-1 Serbia
    '2': { homeScore: 2, awayScore: 1 },  // Argentina 2-1 Saudi Arabia
    '3': { homeScore: 2, awayScore: 1 },  // France 2-1 Australia
    '4': { homeScore: 1, awayScore: 2 },  // Germany 1-2 Japan
  };

  const scoreUpdates = {};
  for (const [matchId, result] of Object.entries(results)) {
    scoreUpdates[`matches/${matchId}/homeScore`] = result.homeScore;
    scoreUpdates[`matches/${matchId}/awayScore`] = result.awayScore;
  }
  await db.ref().update(scoreUpdates);
  console.log('Match results updated!\n');

  // ===== 4. CALCULATE POINTS =====
  console.log('=== Step 4: Calculating points... ===\n');

  const userNames = { uid_user1: 'Văn A', uid_user2: 'Thị B', uid_user3: 'Văn C' };
  const matchNames = { '1': 'Brazil vs Serbia', '2': 'Argentina vs Saudi Arabia', '3': 'France vs Australia', '4': 'Germany vs Japan' };

  const pointUpdates = {};
  const userTotals = { uid_user1: 0, uid_user2: 0, uid_user3: 0 };

  for (const [matchId, result] of Object.entries(results)) {
    console.log(`--- ${matchNames[matchId]}: ${result.homeScore}-${result.awayScore} ---`);

    for (const userId of ['uid_user1', 'uid_user2', 'uid_user3']) {
      const pred = predictions[userId][matchId];
      const points = calculatePoints(result.homeScore, result.awayScore, pred.homePrediction, pred.awayPrediction);

      pointUpdates[`predictions/${userId}/${matchId}/points`] = points;
      userTotals[userId] += points;

      const status = points === 15 ? '🎯 EXACT' : points > 0 ? '✅ CORRECT' : '❌ WRONG';
      console.log(`  ${userNames[userId]}: predict ${pred.homePrediction}-${pred.awayPrediction} → ${points} pts ${status}`);
    }
    console.log('');
  }

  await db.ref().update(pointUpdates);

  const scoreUpdate = {};
  for (const [userId, total] of Object.entries(userTotals)) {
    scoreUpdate[`users/${userId}/score`] = total;
  }
  await db.ref().update(scoreUpdate);

  // ===== 5. VERIFY =====
  console.log('=== Step 5: Final Scoreboard ===\n');

  const sorted = Object.entries(userTotals).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([userId, score], i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
    console.log(`${medal} ${userNames[userId]}: ${score} points`);
  });

  console.log('\n=== Step 6: Verification ===\n');

  const expected = {
    uid_user1: { '1': 15, '2': 8, '3': 15, '4': 0, total: 38 },
    uid_user2: { '1': 9, '2': 15, '3': 9, '4': 0, total: 33 },
    uid_user3: { '1': 8, '2': 7, '3': 15, '4': 9, total: 39 },
  };

  let allCorrect = true;
  for (const [userId, exp] of Object.entries(expected)) {
    const actual = userTotals[userId];
    if (actual === exp.total) {
      console.log(`✅ ${userNames[userId]}: ${actual} points (expected ${exp.total})`);
    } else {
      console.log(`❌ ${userNames[userId]}: ${actual} points (expected ${exp.total})`);
      allCorrect = false;
    }
  }

  console.log(allCorrect ? '\n🎉 All calculations correct!' : '\n⚠️ Some calculations failed!');

  // Verify database state
  console.log('\n=== Step 7: Database State ===\n');
  const finalData = (await db.ref().once('value')).val();
  console.log('Users:', JSON.stringify(finalData.users, null, 2));
  console.log('\nUsernames:', JSON.stringify(finalData.usernames, null, 2));
  console.log('\nMatch 1:', JSON.stringify(finalData.matches['1'], null, 2));
  console.log('\nPredictions (user1):', JSON.stringify(finalData.predictions.uid_user1, null, 2));

  process.exit(allCorrect ? 0 : 1);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
