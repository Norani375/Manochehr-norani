import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'app');
const CANONICAL_IMPORT = '@/components/DabStandardFormsWorkspace';

function collectPageFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) files.push(...collectPageFiles(fullPath));
    else if (entry === 'page.tsx' || entry === 'page.ts') files.push(fullPath);
  }
  return files;
}

const dabPages = collectPageFiles(ROOT).filter((file) => file.includes('/dab-'));
const violations: string[] = [];

for (const file of dabPages) {
  const source = readFileSync(file, 'utf8');
  const isDabRoute = file.includes('/dab-');
  if (!isDabRoute) continue;

  const importsLegacyDabForm = /from ['\"]@\/components\/Dab[A-Za-z0-9]+Form['\"]/.test(source);
  const usesCanonicalWorkspace = source.includes(CANONICAL_IMPORT);

  if (importsLegacyDabForm && !usesCanonicalWorkspace) {
    violations.push(file.replace(`${process.cwd()}/`, ''));
  }
}

if (violations.length > 0) {
  console.error('[DAB routes] Legacy form route detected:');
  for (const file of violations) console.error(` - ${file}`);
  process.exit(1);
}

console.log(`[DAB routes] OK: ${dabPages.length} DAB route pages pass canonical workspace checks.`);
