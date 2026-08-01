with open('lib/firebase.ts', 'r') as f:
    content = f.read()

content = content.replace("const path = 'settings/company';", "const path = `companies/${companyId}/settings/company`;")

with open('lib/firebase.ts', 'w') as f:
    f.write(content)
