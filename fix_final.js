const fs = require('fs');
let code = fs.readFileSync('components/DabBranchRenewalChecklist.tsx', 'utf8');

code = code.replace(/className=\{`px-2.5 py-1 rounded-lg border font-bold text-\[11px\] \$\{([^}]*)\}\s*\n\s*\{p.name\}/, "className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] ${$1}\n            >\n                {p.name}");
fs.writeFileSync('components/DabBranchRenewalChecklist.tsx', code);
