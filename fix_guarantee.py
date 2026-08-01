with open('components/DabGuaranteeForm.tsx', 'r') as f:
    content = f.read()

content = content.replace("companyId = \"default\", companyId = \"default\"", "companyId = \"default\"")
content = content.replace("companyId?: string ; companyId?: string", "companyId?: string")

with open('components/DabGuaranteeForm.tsx', 'w') as f:
    f.write(content)
