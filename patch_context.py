import re
with open('lib/companyContext.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const context = useContext(CompanyContext);",
    "console.log('useCompany called! context is:', !!context);\n  const context = useContext(CompanyContext);"
)

with open('lib/companyContext.tsx', 'w') as f:
    f.write(content)
