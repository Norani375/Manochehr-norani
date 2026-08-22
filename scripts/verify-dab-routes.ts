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
  const usesCanonicalWorkspace = source.includes(CANONICAL_IMPORT);
  const usesCanonicalShareholderForm = source.includes(CANONICAL_SHAREHOLDER_IMPORT);

  // A canonical renderer is not a legacy form import.
  // The generic pattern must exclude the approved canonical shareholder renderer.
  const importsLegacyDabForm = [...source.matchAll(/from ['\"](@\/components\/Dab[A-Za-z0-9]+Form)['\"]/g)]
    .some((match) => match[1] !== CANONICAL_SHAREHOLDER_IMPORT);

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
