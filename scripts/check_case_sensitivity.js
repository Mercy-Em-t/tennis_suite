const fs = require('fs');
const path = require('path');

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

// Windows case-sensitive existence check
function checkPathCase(targetPath) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) return false;
  const files = fs.readdirSync(dir);
  return files.includes(path.basename(targetPath));
}

function resolveImport(currentFile, importPath) {
  if (!importPath.startsWith('.')) return true; // skip external modules
  
  let targetPath = path.resolve(path.dirname(currentFile), importPath);
  
  // Try adding extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
  for (const ext of [''].concat(extensions)) {
      if (fs.existsSync(targetPath + ext)) {
          // If it exists, check case
          let toCheck = targetPath + ext;
          if (toCheck.endsWith('/index.ts') || toCheck.endsWith('/index.tsx')) {
              if (checkPathCase(path.dirname(toCheck)) && checkPathCase(toCheck)) return true;
          } else {
              if (checkPathCase(toCheck)) return true;
          }
      }
  }
  return false;
}

const files = walkSync(path.join(__dirname, '../src'));
let totalMismatches = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // Match import { xyz } from './abc'
  const regex = /import\s+.*from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      const isCorrect = resolveImport(file, importPath);
      if (!isCorrect) {
          console.log(`Case mismatch or missing import: '${importPath}' in ${file}`);
          totalMismatches++;
      }
    }
  }
}

if (totalMismatches > 0) {
  console.log(`Found ${totalMismatches} import case mismatches or missing files.`);
  process.exit(1);
} else {
  console.log('No import case mismatches found.');
}
