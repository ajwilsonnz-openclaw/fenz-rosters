import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = 'PROJECT_SNAPSHOT.md';
const IGNORE_DIRS = new Set(['.next', '.git', 'node_modules', '.vercel', 'public', 'tool-outputs']);
const IGNORE_FILES = new Set(['package-lock.json', 'PROJECT_SNAPSHOT.md', 'dump-project.mjs', 'server.log']);
const ALLOWED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.sql', '.json', '.md', '.css', '.mjs']);

function shouldIgnore(name, isDir) {
  if (IGNORE_DIRS.has(name) || IGNORE_FILES.has(name)) return true;
  if (isDir && name.startsWith('old_')) return true;
  return false;
}

function getFileStructure(dir, prefix = '') {
  let structure = '';
  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => !shouldIgnore(e.name, e.isDirectory()))
    .sort((a, b) => (a.isDirectory() === b.isDirectory() ? a.name.localeCompare(b.name) : a.isDirectory() ? -1 : 1));

  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1;
    const pointer = isLast ? '└── ' : '├── ';
    structure += `${prefix}${pointer}${entry.name}${entry.isDirectory() ? '/' : ''}\n`;
    
    if (entry.isDirectory()) {
      structure += getFileStructure(path.join(dir, entry.name), prefix + (isLast ? '    ' : '│   '));
    }
  });
  return structure;
}

function dumpFiles(dir, currentMarkdown = '') {
  let content = currentMarkdown;
  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => !shouldIgnore(e.name, e.isDirectory()))
    .sort((a, b) => (a.isDirectory() === b.isDirectory() ? a.name.localeCompare(b.name) : a.isDirectory() ? -1 : 1));

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      content = dumpFiles(fullPath, content);
    } else {
      const ext = path.extname(entry.name);
      if (ALLOWED_EXTENSIONS.has(ext)) {
        const relativePath = path.relative(process.cwd(), fullPath);
        const fileContent = fs.readFileSync(fullPath, 'utf-8');
        const lang = ext.slice(1) || 'text';
        
        content += `\n## File: ${relativePath}\n`;
        content += `\`\`\`${lang === 'tsx' || lang === 'ts' ? 'typescript' : lang}\n`;
        content += fileContent;
        content += `\n\`\`\`\n`;
      }
    }
  }
  return content;
}

async function main() {
  console.log('🚀 Generating project snapshot...');
  
  let md = `# Project Snapshot: FENZ OT Prototype\n\n`;
  md += `> **Note**: This is a best-effort snapshot of the current state of the project. It is possible that some legacy code or logic from previous iterations might be mixed in, as this project is evolving rapidly.\n\n`;
  
  md += `## File Structure\n`;
  md += `\`\`\`\n`;
  md += getFileStructure(process.cwd());
  md += `\`\`\`\n\n`;
  
  md += `--- \n\n`;
  md += `## File Contents\n`;
  
  md = dumpFiles(process.cwd(), md);
  
  fs.writeFileSync(OUTPUT_FILE, md);
  console.log(`✅ Snapshot saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);
