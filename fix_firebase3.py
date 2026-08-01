with open('lib/firebase.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "export async function saveSinglePersonnelToFirestore(p: PersonnelNode) {",
    "export async function saveSinglePersonnelToFirestore(p: PersonnelNode, companyId: string = 'default') {"
)
content = content.replace(
    "const path = `personnel/${p.key}`;",
    "const path = `companies/${companyId}/personnel/${p.key}`;"
)
content = content.replace(
    "const docRef = doc(db, 'personnel', p.key);",
    "const docRef = doc(db, `companies/${companyId}/personnel`, p.key);"
)

# And let's verify savePersonnelToFirestore
content = content.replace(
    "export async function savePersonnelToFirestore(personnelList: PersonnelNode[]) {",
    "export async function savePersonnelToFirestore(personnelList: PersonnelNode[], companyId: string = 'default') {"
)
content = content.replace(
    "const docRef = doc(db, 'personnel', p.key);",
    "const docRef = doc(db, `companies/${companyId}/personnel`, p.key);"
)
content = content.replace(
    "const path = 'personnel';",
    "const path = `companies/${companyId}/personnel`;"
)

# And deletePersonnelFromFirestore
content = content.replace(
    "export async function deletePersonnelFromFirestore(key: string) {",
    "export async function deletePersonnelFromFirestore(key: string, companyId: string = 'default') {"
)
content = content.replace(
    "const path = `personnel/${key}`;",
    "const path = `companies/${companyId}/personnel/${key}`;"
)
content = content.replace(
    "const docRef = doc(db, 'personnel', key);",
    "const docRef = doc(db, `companies/${companyId}/personnel`, key);"
)

with open('lib/firebase.ts', 'w') as f:
    f.write(content)
