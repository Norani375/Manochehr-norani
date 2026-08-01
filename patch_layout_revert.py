with open('app/layout.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { CompanyProvider } from '@/lib/companyContext';\n", "")
content = content.replace("<CompanyProvider>\n          {children}\n        </CompanyProvider>", "{children}")

with open('app/layout.tsx', 'w') as f:
    f.write(content)
