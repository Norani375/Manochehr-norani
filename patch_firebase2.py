import re

with open('lib/firebase.ts', 'r') as f:
    content = f.read()

# Update subscribeSettings
content = content.replace(
    "export function subscribeSettings(callback: (settings: CompanySettings) => void) {",
    "export function subscribeSettings(callback: (settings: CompanySettings) => void, companyId: string = 'default') {"
)
content = content.replace(
    "doc(db, 'settings', 'company')",
    "doc(db, `companies/${companyId}/settings`, 'company')"
)

# Update saveSettingsToFirestore
content = content.replace(
    "export async function saveSettingsToFirestore(settings: Partial<CompanySettings>) {",
    "export async function saveSettingsToFirestore(settings: Partial<CompanySettings>, companyId: string = 'default') {"
)
content = content.replace(
    "const docRef = doc(db, 'settings', 'company');",
    "const docRef = doc(db, `companies/${companyId}/settings`, 'company');"
)

with open('lib/firebase.ts', 'w') as f:
    f.write(content)
