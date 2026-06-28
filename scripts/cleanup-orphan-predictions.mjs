/**
 * Remove orphan predictions: any prediction whose gameId does not match an
 * existing match (e.g. leftover test data like game 903).
 *
 * Run: FIREBASE_SERVICE_ACCOUNT=... FIREBASE_DATABASE_URL=... node scripts/cleanup-orphan-predictions.mjs
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
  const [matchesSnap, predsSnap] = await Promise.all([
    db.ref('matches').get(),
    db.ref('predictions').get(),
  ]);

  const validGameIds = new Set(Object.keys(matchesSnap.val() || {}));
  const predictions = predsSnap.val() || {};

  const updates = {};
  let count = 0;
  for (const [uid, games] of Object.entries(predictions)) {
    for (const gameId of Object.keys(games || {})) {
      if (!validGameIds.has(gameId)) {
        updates[`predictions/${uid}/${gameId}`] = null;
        count++;
        console.log(`- predictions/${uid}/${gameId}`);
      }
    }
  }

  if (count === 0) {
    console.log('No orphan predictions found.');
    return;
  }

  await db.ref().update(updates);
  console.log(`\nRemoved ${count} orphan prediction(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
