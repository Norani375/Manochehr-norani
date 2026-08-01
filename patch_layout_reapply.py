import re
with open('app/layout.tsx', 'r') as f:
    content = f.read()

content = "import { CompanyProvider } from '@/lib/companyContext';\n" + content
content = content.replace("{children}", "<CompanyProvider>\n          {children}\n        </CompanyProvider>")

with open('app/layout.tsx', 'w') as f:
    f.write(content)
