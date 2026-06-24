/**
 * Cleanup mock data
 * Run: node scripts/cleanup-mock.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = getDatabase();

async function main() {
  console.log('Removing mock matches...');

  await db.ref('matches/test-1').remove();
  await db.ref('matches/test-2').remove();
  await db.ref('matches/test-3').remove();
  await db.ref('matches/test-4').remove();

  console.log('Done! Removed 4 mock matches');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
