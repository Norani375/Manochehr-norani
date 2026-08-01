with open('lib/firebase.ts', 'r') as f:
    content = f.read()

content = content.replace("export async function saveSettingsToFirestore(settings: CompanySettings) {", "export async function saveSettingsToFirestore(settings: Partial<CompanySettings>, companyId: string = 'default') {")
content = content.replace("const docRef = doc(db, 'settings', 'company');", "const docRef = doc(db, `companies/${companyId}/settings`, 'company');")

with open('lib/firebase.ts', 'w') as f:
    f.write(content)
