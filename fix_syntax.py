with open('components/DabBranchRenewalChecklist.tsx', 'r') as f:
    content = f.read()

content = content.replace("onExportPdf,\n, companyId = \"default\"", "onExportPdf,\n  companyId = \"default\"")
content = content.replace("onExportPdf,, companyId", "onExportPdf, companyId")

with open('components/DabBranchRenewalChecklist.tsx', 'w') as f:
    f.write(content)
