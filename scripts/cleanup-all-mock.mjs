/**
 * Cleanup all mock data
 * Run: node scripts/cleanup-all-mock.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = getDatabase();

const mockIds = [
  'mock-live-1',
  'mock-live-2',
  'mock-upcoming-1',
  'mock-upcoming-2',
  'mock-recent-1',
  'mock-recent-2',
  'test-1',
  'test-2',
  'test-3',
  'test-4',
];

async function main() {
  console.log('Removing all mock matches...');

  for (const id of mockIds) {
    await db.ref(`matches/${id}`).remove();
    console.log(`  Removed: ${id}`);
  }

  console.log('Done! Removed all mock matches');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
