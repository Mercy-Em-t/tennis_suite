const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let modifiedCount = 0;

for (const file of files) {
  // Skip the prisma.ts file itself
  if (file.endsWith('prisma.ts') && file.includes('lib')) continue;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Check if it instantiates PrismaClient
  if (content.includes('new PrismaClient()') || content.includes('new PrismaClient();')) {
    
    // Remove the instantiation
    content = content.replace(/const\s+prisma\s*=\s*new\s+PrismaClient\(\)\;?/g, '');
    
    // Remove the import of PrismaClient if it is the only thing imported
    content = content.replace(/import\s*\{\s*PrismaClient\s*\}\s*from\s*['"]@prisma\/client['"]\;?/g, '');

    // Add import { prisma } from '@/lib/prisma';
    if (!content.includes("import { prisma } from '@/lib/prisma'")) {
      content = "import { prisma } from '@/lib/prisma';\n" + content;
    }
    
    // Some files might have imported other things from @prisma/client like `import { PrismaClient, User } from '@prisma/client'`
    // The regex above won't match that, which is good. But they still need the `prisma` import.
    
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
  }
}

console.log(`Modified ${modifiedCount} files.`);
