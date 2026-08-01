import re

files = [
    'components/MeetingMinutes.tsx',
    'components/DabLicenseChecklist.tsx',
    'components/DabLicenseRenewalChecklist.tsx',
    'components/DabBranchRenewalChecklist.tsx',
    'components/OrgChartCanvas.tsx'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # We need to find `export default function Name({ ... }: NameProps)` and insert `companyId = 'default', `
    content = re.sub(
        r'(export default function \w+\(\{[^}]*)(\}\s*:\s*\w+Props(?:| & \{[^}]*\})\)\s*\{)',
        r'\1, companyId = "default" \2',
        content
    )
    with open(file, 'w') as f:
        f.write(content)
