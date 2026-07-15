const fs = require('fs');
const path = require('path');

const modelsRequiringTenantId = [
  'team', 'pool', 'match', 'court', 'staff', 'auditLog', 
  'preOrder', 'playerStat', 'fanPrediction', 'rainmakerFee', 
  'partnerPayout', 'ledgerEntry', 'sponsorROI', 'equipment', 
  'ballCan', 'freeAgent', 'incidentReport', 'poolTeam'
];

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else {
      if (filepath.endsWith('.ts') || filepath.endsWith('.tsx')) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
};

const files = walkSync(path.join(__dirname, '../src'));
let totalViolations = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let fileModified = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('prisma.')) {
      for (const model of modelsRequiringTenantId) {
        // e.g., prisma.team.findMany, prisma.match.update
        const regex = new RegExp(`prisma\\.${model}\\.(find|update|delete|count|upsert)`, 'i');
        if (regex.test(line)) {
          // simple heuristic: look a few lines around it for tournamentId
          const blockStart = Math.max(0, i - 2);
          const blockEnd = Math.min(lines.length, i + 5);
          const block = lines.slice(blockStart, blockEnd).join('\n');
          
          if (!block.includes('tournamentId') && !block.includes('id:') && !block.includes('id =') && !block.includes('Phase 1')) {
             console.log(`Missing tournamentId in ${file}:${i+1}`);
             const indent = line.match(/^\s*/)[0];
             lines.splice(i, 0, `${indent}// TODO: [Phase 1] Enforce tournamentId row-level isolation context here`);
             fileModified = true;
             i++; // skip the newly inserted line
             totalViolations++;
          }
        }
      }
    }
  }
  if (fileModified) {
      fs.writeFileSync(file, lines.join('\n'));
      console.log(`Updated ${file}`);
  }
}

if (totalViolations > 0) {
  console.log(`Documented ${totalViolations} potential isolation violations.`);
} else {
  console.log('No new tenant isolation violations found.');
}
