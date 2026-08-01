import sys
import re

files = [
    'components/MeetingMinutes.tsx',
    'components/DabLicenseChecklist.tsx',
    'components/DabBranchRenewalChecklist.tsx',
    'components/DabLicenseRenewalChecklist.tsx',
    'components/OrgChartCanvas.tsx'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # We will just append `companyId?: string;` inside the interface that ends with `Props {`
    content = re.sub(
        r'(interface \w+Props \{)',
        r'\1\n  companyId?: string;',
        content
    )
    with open(file, 'w') as f:
        f.write(content)
