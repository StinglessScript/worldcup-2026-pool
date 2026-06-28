/**
 * Mock 100 users with random predictions and scores
 * Run: node mock-100-users.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = getDatabase();

const VIETNAMESE_NAMES = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung',
  'Hoàng Văn Em', 'Vũ Thị Phương', 'Đặng Văn Giang', 'Bùi Thị Hoa',
  'Đỗ Văn Inh', 'Ngô Thị Kim', 'Lý Văn Long', 'Mai Thị Minh',
  'Tạ Văn Nam', 'Đinh Thị Oanh', 'Phan Văn Phúc', 'Trịnh Thị Quỳnh',
  'Võ Văn Rồng', 'Lưu Thị Sang', 'Dương Văn Tâm', 'Huỳnh Thị Uyên',
  'Nguyễn Văn Việt', 'Trần Thị Xuân', 'Lê Văn Yên', 'Phạm Thị Zung',
  'Hoàng Văn Bảo', 'Vũ Thị Châu', 'Đặng Văn Dũng', 'Bùi Thị Giang',
  'Đỗ Văn Hùng', 'Ngô Thị Iris', 'Lý Văn Khánh', 'Mai Thị Liên',
  'Tạ Văn Mạnh', 'Đinh Thị Nhung', 'Phan Văn Oliver', 'Trịnh Thị Phương',
  'Võ Văn Quốc', 'Lưu Thị Rosa', 'Dương Văn Sơn', 'Huỳnh Thị Trang',
  'Nguyễn Văn Tuấn', 'Trần Thị Uyên', 'Lê Văn Vinh', 'Phạm Thị Wendy',
  'Hoàng Văn Xuân', 'Vũ Thị Yến', 'Đặng Văn Zed', 'Bùi Thị Ánh',
  'Đỗ Văn Bình', 'Ngô Thị Cúc', 'Lý Văn Đức', 'Mai Thị Em',
  'Tạ Văn Phú', 'Đinh Thị Quế', 'Phan Văn Rồi', 'Trịnh Thị Sen',
  'Võ Văn Tài', 'Lưu Thị Uyên', 'Dương Văn Vỹ', 'Huỳnh Thị Xinh',
  'Nguyễn Văn Yusuf', 'Trần Thị Zara', 'Lê Văn Anh', 'Phạm Thị Bích',
  'Hoàng Văn Cao', 'Vũ Thị Diệu', 'Đặng Văn Edward', 'Bùi Thị Flora',
  'Đỗ Văn George', 'Ngô Thị Hannah', 'Lý Văn Ian', 'Mai Thị Julia',
  'Tạ Văn Kevin', 'Đinh Thị Laura', 'Phan Văn Michael', 'Trịnh Thị Nancy',
  'Võ Văn Oscar', 'Lưu Thị Peter', 'Dương Văn Quang', 'Huỳnh Thị Rosa',
  'Nguyễn Văn Simon', 'Trần Thị Tina', 'Lê Văn Unity', 'Phạm Thị Victor',
  'Hoàng Văn Wayne', 'Vũ Thị Xenia', 'Đặng Văn Yanni', 'Bùi Thị Zola',
  'Đỗ Văn Alpha', 'Ngô Thị Beta', 'Lý Văn Charlie', 'Mai Thị Delta',
  'Tạ Văn Echo', 'Đinh Thị Foxtrot', 'Phan Văn Golf', 'Trịnh Thị Hotel',
  'Võ Văn India', 'Lưu Thị Juliet', 'Dương Văn Kilo', 'Huỳnh Thị Lima',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUsername(name, index) {
  const parts = name.toLowerCase().split(' ');
  const last = parts[parts.length - 1];
  return `${last}${index}`;
}

async function main() {
  console.log('=== Mock 100 users ===\n');

  // Get existing matches
  const matchesSnap = await db.ref('matches').once('value');
  const matches = matchesSnap.val();
  if (!matches) {
    console.log('No matches in database! Run init-matches first.');
    process.exit(1);
  }

  const matchIds = Object.keys(matches);
  console.log(`Found ${matchIds.length} matches\n`);

  // Generate users
  const users = {};
  const usernames = {};
  const predictions = {};

  for (let i = 1; i <= 100; i++) {
    const name = VIETNAMESE_NAMES[(i - 1) % VIETNAMESE_NAMES.length];
    const uid = `user_${String(i).padStart(3, '0')}`;
    const username = generateUsername(name, i);
    const email = `${username}@test.com`;
    const score = randomInt(0, 150);

    users[uid] = {
      email,
      displayName: name,
      userName: username,
      photoURL: '',
      score,
      admin: false,
      mock: true,
    };

    usernames[username] = uid;

    // Generate random predictions for some matches
    predictions[uid] = {};
    const numPredictions = randomInt(5, matchIds.length);
    const shuffled = [...matchIds].sort(() => Math.random() - 0.5);

    for (let j = 0; j < numPredictions; j++) {
      const matchId = shuffled[j];
      predictions[uid][matchId] = {
        homePrediction: randomInt(0, 5),
        awayPrediction: randomInt(0, 5),
        points: 0,
        updatedAt: Date.now() - randomInt(0, 86400000 * 7),
      };
    }
  }

  // Insert users
  console.log('Inserting 100 users...');
  await db.ref('users').set(users);
  console.log('Done!');

  // Insert usernames
  console.log('Inserting usernames...');
  await db.ref('usernames').set(usernames);
  console.log('Done!');

  // Insert predictions
  console.log('Inserting predictions...');
  await db.ref('predictions').set(predictions);
  console.log('Done!');

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Users: ${Object.keys(users).length}`);
  console.log(`Usernames: ${Object.keys(usernames).length}`);
  console.log(`Predictions: ${Object.values(predictions).reduce((sum, p) => sum + Object.keys(p).length, 0)}`);

  // Top 5
  console.log('\n=== Top 5 ===');
  const sorted = Object.entries(users)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 5);

  sorted.forEach(([uid, user], i) => {
    console.log(`${i + 1}. ${user.displayName} (@${user.userName}) - ${user.score} pts`);
  });

  console.log('\nDone!');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
