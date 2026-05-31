/**
 * Init script: Clear all data → Fetch World Cup 2026 schedule from FIFA API → Insert into DB
 * Run: node init-matches.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = getDatabase();

const FIFA_COMPETITION_ID = '17';
const FIFA_SEASON_ID = '285023';

function getLocaleText(arr, locale = 'en-GB') {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return '';
  const found = arr.find(item => item.Locale === locale);
  return found ? found.Description : arr[0].Description;
}

function parseGroup(groupName) {
  if (!groupName) return null;
  const match = groupName.match(/Group\s+(.+)/i);
  return match ? match[1] : groupName;
}

async function fetchAllMatches() {
  const allMatches = [];
  let continuationToken = null;

  do {
    let url = `https://api.fifa.com/api/v3/calendar/matches?idseason=${FIFA_SEASON_ID}&idcompetition=${FIFA_COMPETITION_ID}&count=500`;
    if (continuationToken) {
      url += `&continuationtoken=${continuationToken}`;
    }

    console.log(`Fetching: ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`FIFA API error: ${res.status}`);
    const data = await res.json();

    if (data.Results) {
      allMatches.push(...data.Results);
      console.log(`  Got ${data.Results.length} matches (total: ${allMatches.length})`);
    }

    continuationToken = data.ContinuationToken;
  } while (continuationToken);

  return allMatches;
}

async function main() {
  // 1. Clear all data
  console.log('=== Step 1: Clearing all data... ===');
  await db.ref().set(null);
  console.log('All data cleared!\n');

  // 2. Fetch all matches from FIFA API
  console.log('=== Step 2: Fetching World Cup 2026 schedule... ===');
  const fifaMatches = await fetchAllMatches();
  console.log(`\nTotal matches fetched: ${fifaMatches.length}\n`);

  // 3. Convert and insert
  console.log('=== Step 3: Inserting matches into database... ===');
  const matches = {};
  const roundCounts = {};

  for (const fm of fifaMatches) {
    const round = getLocaleText(fm.StageName);
    const group = parseGroup(getLocaleText(fm.GroupName));

    roundCounts[round] = (roundCounts[round] || 0) + 1;

    const match = {
      game: fm.MatchNumber,
      fifaId: fm.IdMatch,
      round: round,
      group: group,
      date: fm.Date,
      timestamp: Math.floor(new Date(fm.Date).getTime() / 1000),
      location: getLocaleText(fm.Stadium?.Name),
      locationCity: getLocaleText(fm.Stadium?.CityName),
      locationCountry: fm.Stadium?.IdCountry || '',
      home: fm.Home?.Abbreviation || '',
      homeName: fm.Home?.ShortClubName || getLocaleText(fm.Home?.TeamName),
      homeScore: fm.HomeTeamScore ?? fm.Home?.Score ?? -1,
      away: fm.Away?.Abbreviation || '',
      awayName: fm.Away?.ShortClubName || getLocaleText(fm.Away?.TeamName),
      awayScore: fm.AwayTeamScore ?? fm.Away?.Score ?? -1,
    };

    matches[String(match.game)] = match;
  }

  await db.ref('matches').set(matches);
  console.log(`Inserted ${Object.keys(matches).length} matches\n`);

  // 4. Summary
  console.log('=== Step 4: Summary ===\n');
  console.log('By round:');
  for (const [round, count] of Object.entries(roundCounts).sort((a, b) => a[1] - b[1])) {
    console.log(`  ${round}: ${count} matches`);
  }

  // Show first 5 matches as sample
  console.log('\nSample matches:');
  const sorted = Object.values(matches).sort((a, b) => a.timestamp - b.timestamp);
  for (const m of sorted.slice(0, 5)) {
    console.log(`  Game ${m.game}: ${m.homeName} vs ${m.awayName} | ${m.group || m.round} | ${m.date}`);
  }

  console.log('\nDone! Database ready for World Cup 2026.');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
