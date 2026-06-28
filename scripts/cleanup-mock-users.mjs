/**
 * Cleanup mock/seed users from the database.
 * Removes users/<id>, their usernames index entry, and predictions/<id>.
 * A user is considered mock if: user.mock === true, id starts with "mock_",
 * or id matches /^user_\d+$/ (legacy seed script).
 *
 * Run: FIREBASE_SERVICE_ACCOUNT=... FIREBASE_DATABASE_URL=... node scripts/cleanup-mock-users.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = getDatabase();

const isMock = (id, u) =>
  !!u && (u.mock === true || id.startsWith('mock_') || /^user_\d+$/.test(id));

async function main() {
  const [usersSnap, usernamesSnap] = await Promise.all([
    db.ref('users').get(),
    db.ref('usernames').get(),
  ]);

  const users = usersSnap.val() || {};
  const usernames = usernamesSnap.val() || {};

  const mockIds = Object.entries(users)
    .filter(([id, u]) => isMock(id, u))
    .map(([id]) => id);

  if (mockIds.length === 0) {
    console.log('No mock users found. Nothing to do.');
    return;
  }

  const mockIdSet = new Set(mockIds);
  const updates = {};

  for (const id of mockIds) {
    updates[`users/${id}`] = null;
    updates[`predictions/${id}`] = null;
    console.log(
      `- ${users[id].displayName || ''} (@${users[id].userName || '?'}) [${id}] ${users[id].score ?? 0}pts`
    );
  }

  // Remove any username index entries pointing at a mock uid (key may or may
  // not be normalized, so match by value to be safe).
  for (const [key, uid] of Object.entries(usernames)) {
    if (mockIdSet.has(uid)) updates[`usernames/${key}`] = null;
  }

  await db.ref().update(updates);
  console.log(`\nRemoved ${mockIds.length} mock user(s) + their predictions/usernames.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
