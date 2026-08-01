with open('app/layout.tsx', 'r') as f:
    content = f.read()

import_statement = "import { CompanyProvider } from '@/lib/companyContext';\n"
content = content.replace("export const metadata: Metadata = {", import_statement + "export const metadata: Metadata = {")
content = content.replace("<body className=\"font-sans\" suppressHydrationWarning>{children}</body>", "<body className=\"font-sans\" suppressHydrationWarning>\n        <CompanyProvider>\n          {children}\n        </CompanyProvider>\n      </body>")

with open('app/layout.tsx', 'w') as f:
    f.write(content)
