const MATCH_ID = 'cmqz2ayqu0006n4eih63ajspb';
const BASE = 'http://localhost:3000';

async function run() {
  console.log('\n=== GOLDEN LOOP STAGE 1: Cold Start — Broadcaster Hydration ===');
  try {
    const r = await fetch(BASE + '/api/broadcast/latest');
    const d = await r.json();
    const hasTeams = !!(d.teamA && d.teamB);
    const hasState = d.scoreState !== undefined;
    console.log(`HTTP: ${r.status}`);
    console.log(`Team A: ${d.teamA?.franchiseName ?? 'MISSING'}`);
    console.log(`Team B: ${d.teamB?.franchiseName ?? 'MISSING'}`);
    console.log(`scoreState present: ${hasState}`);
    console.log(`RESULT: ${hasTeams && hasState ? 'PASS ✅' : 'FAIL ❌'}`);
  } catch(e) { console.log('RESULT: FAIL ❌ —', e.message); }

  console.log('\n=== GOLDEN LOOP STAGE 2: Scoring with REFEREE JWT ===');
  try {
    const jwt = 'header.' + Buffer.from(JSON.stringify({role:'REFEREE',sub:'ref_001'})).toString('base64') + '.signature';
    const r = await fetch(BASE + '/api/match/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt },
      body: JSON.stringify({ matchId: MATCH_ID, scoringTeam: 'A' })
    });
    const d = await r.json();
    console.log(`HTTP: ${r.status}`);
    if (r.status === 200 && d.match) {
      const state = JSON.parse(d.match.scoreState);
      console.log(`pointsA after tap: ${state.pointsA}`);
      console.log(`matchCompleted: ${d.matchCompleted}`);
    } else {
      console.log('Response:', JSON.stringify(d));
    }
    console.log(`RESULT: ${r.status === 200 ? 'PASS ✅' : 'FAIL ❌'}`);
  } catch(e) { console.log('RESULT: FAIL ❌ —', e.message); }

  console.log('\n=== GOLDEN LOOP STAGE 3 — Gate 2: MARSHALL RBAC Block ===');
  try {
    const jwt = 'header.' + Buffer.from(JSON.stringify({role:'MARSHALL',sub:'m_001'})).toString('base64') + '.signature';
    const r = await fetch(BASE + '/api/match/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt },
      body: JSON.stringify({ matchId: MATCH_ID, scoringTeam: 'A' })
    });
    const d = await r.json();
    console.log(`HTTP: ${r.status}`);
    console.log(`Error body: ${d.error}`);
    console.log(`RESULT: ${r.status === 403 ? 'PASS ✅' : 'FAIL ❌'}`);
  } catch(e) { console.log('RESULT: FAIL ❌ —', e.message); }

  console.log('\n=== GOLDEN LOOP STAGE 4 — Gate 3: Offline Queue Reconciliation ===');
  try {
    const jwt = 'header.' + Buffer.from(JSON.stringify({role:'REFEREE',sub:'ref_001'})).toString('base64') + '.signature';
    const ts = Date.now();
    const payload = [
      { matchId: MATCH_ID, teamScored: 'B', offlineVersion: ts },
      { matchId: MATCH_ID, teamScored: 'B', offlineVersion: ts + 1 }
    ];
    const r = await fetch(BASE + '/api/sync/offline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt },
      body: JSON.stringify({ syncPayloads: payload })
    });
    const d = await r.json();
    console.log(`HTTP: ${r.status}`);
    console.log(`Payloads sent: 2 | Synced: ${d.synced}`);
    console.log(`RESULT: ${r.status === 200 ? 'PASS ✅' : 'FAIL ❌'}`);
  } catch(e) { console.log('RESULT: FAIL ❌ —', e.message); }

  console.log('\n=== GOLDEN LOOP TEST COMPLETE ===');
}

run();
