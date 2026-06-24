/**
 * Mock upcoming matches for testing UI
 * Run: node scripts/mock-upcoming.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = getDatabase();

// Create mock matches with upcoming timestamps
const now = Date.now();
const HOUR = 60 * 60 * 1000;

const mockMatches = {
  // Match in 30 minutes (red urgency)
  'test-1': {
    game: 901,
    fifaId: 'test-001',
    round: 'Group Stage',
    group: 'A',
    date: new Date(now + 30 * 60 * 1000).toISOString(),
    timestamp: Math.floor((now + 30 * 60 * 1000) / 1000),
    location: 'Test Stadium',
    locationCity: 'Test City',
    locationCountry: 'Test Country',
    home: 'VIE',
    homeName: 'Việt Nam',
    homeScore: -1,
    away: 'JPN',
    awayName: 'Nhật Bản',
    awayScore: -1,
  },
  // Match in 2 hours (green urgency)
  'test-2': {
    game: 902,
    fifaId: 'test-002',
    round: 'Group Stage',
    group: 'A',
    date: new Date(now + 2 * HOUR).toISOString(),
    timestamp: Math.floor((now + 2 * HOUR) / 1000),
    location: 'Test Stadium 2',
    locationCity: 'Test City 2',
    locationCountry: 'Test Country 2',
    home: 'KOR',
    homeName: 'Hàn Quốc',
    homeScore: -1,
    away: 'GER',
    awayName: 'Đức',
    awayScore: -1,
  },
  // Match in 45 minutes (yellow urgency)
  'test-3': {
    game: 903,
    fifaId: 'test-003',
    round: 'Group Stage',
    group: 'B',
    date: new Date(now + 45 * 60 * 1000).toISOString(),
    timestamp: Math.floor((now + 45 * 60 * 1000) / 1000),
    location: 'Test Stadium 3',
    locationCity: 'Test City 3',
    locationCountry: 'Test Country 3',
    home: 'BRA',
    homeName: 'Brazil',
    homeScore: -1,
    away: 'ARG',
    awayName: 'Argentina',
    awayScore: -1,
  },
  // Match in 5 minutes (very urgent)
  'test-4': {
    game: 904,
    fifaId: 'test-004',
    round: 'Group Stage',
    group: 'B',
    date: new Date(now + 5 * 60 * 1000).toISOString(),
    timestamp: Math.floor((now + 5 * 60 * 1000) / 1000),
    location: 'Test Stadium 4',
    locationCity: 'Test City 4',
    locationCountry: 'Test Country 4',
    home: 'FRA',
    homeName: 'Pháp',
    homeScore: -1,
    away: 'ENG',
    awayName: 'Anh',
    awayScore: -1,
  },
};

async function main() {
  console.log('Adding mock upcoming matches...');

  // Add mock matches to database
  await db.ref('matches').update(mockMatches);

  console.log('Done! Added 4 mock matches:');
  console.log('- test-1: 30 phút nữa (🔴 Đỏ)');
  console.log('- test-2: 2 giờ nữa (🟢 Xanh)');
  console.log('- test-3: 45 phút nữa (🟡 Vàng)');
  console.log('- test-4: 5 phút nữa (🔴 Đỏ nhấp nháy)');
  console.log('\nTruy cập https://vnworldcup.web.app/ten-cua-ban de xem');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
