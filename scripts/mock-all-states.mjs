/**
 * Mock matches for all states: Live, Upcoming, Recent
 * Run: node scripts/mock-all-states.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = getDatabase();

const now = Date.now();
const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

const mockMatches = {
  // ===== LIVE MATCHES (đang diễn ra) =====
  'mock-live-1': {
    game: 801,
    fifaId: 'mock-live-001',
    round: 'Group Stage',
    group: 'A',
    date: new Date(now - 45 * MINUTE).toISOString(), // Started 45 mins ago
    timestamp: Math.floor((now - 45 * MINUTE) / 1000),
    location: 'Sân vận động Mỹ Đình',
    locationCity: 'Hà Nội',
    locationCountry: 'Việt Nam',
    home: 'VIE',
    homeName: 'Việt Nam',
    homeScore: -1, // Not finished yet
    away: 'JPN',
    awayName: 'Nhật Bản',
    awayScore: -1,
  },
  'mock-live-2': {
    game: 802,
    fifaId: 'mock-live-002',
    round: 'Group Stage',
    group: 'B',
    date: new Date(now - 30 * MINUTE).toISOString(), // Started 30 mins ago
    timestamp: Math.floor((now - 30 * MINUTE) / 1000),
    location: 'Sân vận động Quốc gia',
    locationCity: 'TP.HCM',
    locationCountry: 'Việt Nam',
    home: 'KOR',
    homeName: 'Hàn Quốc',
    homeScore: -1,
    away: 'GER',
    awayName: 'Đức',
    awayScore: -1,
  },

  // ===== UPCOMING MATCHES (sắp diễn ra) =====
  'mock-upcoming-1': {
    game: 803,
    fifaId: 'mock-upcoming-001',
    round: 'Group Stage',
    group: 'A',
    date: new Date(now + 30 * MINUTE).toISOString(), // In 30 mins
    timestamp: Math.floor((now + 30 * MINUTE) / 1000),
    location: 'Sân vận động Hà Nội',
    locationCity: 'Hà Nội',
    locationCountry: 'Việt Nam',
    home: 'BRA',
    homeName: 'Brazil',
    homeScore: -1,
    away: 'ARG',
    awayName: 'Argentina',
    awayScore: -1,
  },
  'mock-upcoming-2': {
    game: 804,
    fifaId: 'mock-upcoming-002',
    round: 'Group Stage',
    group: 'B',
    date: new Date(now + 2 * HOUR).toISOString(), // In 2 hours
    timestamp: Math.floor((now + 2 * HOUR) / 1000),
    location: 'Sân vận động Đà Nẵng',
    locationCity: 'Đà Nẵng',
    locationCountry: 'Việt Nam',
    home: 'FRA',
    homeName: 'Pháp',
    homeScore: -1,
    away: 'ENG',
    awayName: 'Anh',
    awayScore: -1,
  },

  // ===== RECENT MATCHES (kết quả gần đây) =====
  'mock-recent-1': {
    game: 805,
    fifaId: 'mock-recent-001',
    round: 'Group Stage',
    group: 'A',
    date: new Date(now - 3 * HOUR).toISOString(), // Finished 3 hours ago
    timestamp: Math.floor((now - 3 * HOUR) / 1000),
    location: 'Sân vận động Cần Thơ',
    locationCity: 'Cần Thơ',
    locationCountry: 'Việt Nam',
    home: 'ESP',
    homeName: 'Tây Ban Nha',
    homeScore: 3,
    away: 'POR',
    awayName: 'Bồ Đào Nha',
    awayScore: 1,
  },
  'mock-recent-2': {
    game: 806,
    fifaId: 'mock-recent-002',
    round: 'Group Stage',
    group: 'B',
    date: new Date(now - 5 * HOUR).toISOString(), // Finished 5 hours ago
    timestamp: Math.floor((now - 5 * HOUR) / 1000),
    location: 'Sân vận động Nha Trang',
    locationCity: 'Nha Trang',
    locationCountry: 'Việt Nam',
    home: 'ITA',
    homeName: 'Ý',
    homeScore: 2,
    away: 'NED',
    awayName: 'Hà Lan',
    awayScore: 2,
  },
};

async function main() {
  console.log('Adding mock matches for all states...');

  await db.ref('matches').update(mockMatches);

  console.log('Done! Added 6 mock matches:');
  console.log('');
  console.log('🔴 LIVE (đang diễn ra):');
  console.log('  - mock-live-1: Việt Nam vs Nhật Bản (đá 45 phút trước)');
  console.log('  - mock-live-2: Hàn Quốc vs Đức (đá 30 phút trước)');
  console.log('');
  console.log('⏰ UPCOMING (sắp diễn ra):');
  console.log('  - mock-upcoming-1: Brazil vs Argentina (còn 30 phút)');
  console.log('  - mock-upcoming-2: Pháp vs Anh (còn 2 giờ)');
  console.log('');
  console.log('✅ RECENT (kết quả gần đây):');
  console.log('  - mock-recent-1: Tây Ban Nha 3-1 Bồ Đào Nha (kết thúc 3 giờ trước)');
  console.log('  - mock-recent-2: Ý 2-2 Hà Lan (kết thúc 5 giờ trước)');
  console.log('');
  console.log('Truy cập https://vnworldcup.web.app/username de xem');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
