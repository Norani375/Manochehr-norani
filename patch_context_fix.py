import re
with open('lib/companyContext.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "console.log('useCompany called! context is:', !!context);\n  const context = useContext(CompanyContext);",
    "const context = useContext(CompanyContext);\n  console.log('useCompany called! context is:', !!context);"
)

with open('lib/companyContext.tsx', 'w') as f:
    f.write(content)
