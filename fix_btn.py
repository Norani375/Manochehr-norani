with open('components/DabBranchRenewalChecklist.tsx', 'r') as f:
    content = f.read()

content = content.replace('              }`}\n                {p.name}', '              }`}\n            >\n              {p.name}')

with open('components/DabBranchRenewalChecklist.tsx', 'w') as f:
    f.write(content)
