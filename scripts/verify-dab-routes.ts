import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'app');
const CANONICAL_IMPORT = '@/components/DabStandardFormsWorkspace';
const CANONICAL_SHAREHOLDER_IMPORT = '@/components/DabShareholderGuaranteeStandardForm';

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
  const importsLegacyDabForm = /from ['\"]@\/components\/Dab[A-Za-z0-9]+Form['\"]/.test(source);
  const usesCanonicalWorkspace = source.includes(CANONICAL_IMPORT);
  const usesCanonicalShareholderForm = source.includes(CANONICAL_SHAREHOLDER_IMPORT);

  // The shareholder guarantee form is a dedicated canonical renderer.
  // It is allowed to bypass the generic workspace because it is itself
  // the canonical implementation for shareholder-guarantee.
  const isShareholderGuaranteeRoute = file.includes('/dab-shareholder-guarantee/');
  const hasApprovedCanonicalRenderer = usesCanonicalWorkspace || (isShareholderGuaranteeRoute && usesCanonicalShareholderForm);

  if (importsLegacyDabForm && !hasApprovedCanonicalRenderer) {
    violations.push(file.replace(`${process.cwd()}/`, ''));
  }
}

if (violations.length > 0) {
  console.error('[DAB routes] Legacy form route detected:');
  for (const file of violations) console.error(` - ${file}`);
  process.exit(1);
}

console.log(`[DAB routes] OK: ${dabPages.length} DAB route pages pass canonical workspace checks.`);
