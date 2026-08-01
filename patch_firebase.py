import re

with open('lib/firebase.ts', 'r') as f:
    content = f.read()

# Update subscribePersonnel
content = content.replace(
    "export function subscribePersonnel(callback: (list: PersonnelNode[]) => void) {",
    "export function subscribePersonnel(callback: (list: PersonnelNode[]) => void, companyId: string = 'default') {"
)
content = content.replace(
    "const path = 'personnel';",
    "const path = `companies/${companyId}/personnel`;"
)

# Update saveSinglePersonnelToFirestore
content = content.replace(
    "export async function saveSinglePersonnelToFirestore(node: PersonnelNode) {",
    "export async function saveSinglePersonnelToFirestore(node: PersonnelNode, companyId: string = 'default') {"
)
content = content.replace(
    "const docRef = doc(db, 'personnel', node.key);",
    "const docRef = doc(db, `companies/${companyId}/personnel`, node.key);"
)

# Update deletePersonnelFromFirestore
content = content.replace(
    "export async function deletePersonnelFromFirestore(key: string) {",
    "export async function deletePersonnelFromFirestore(key: string, companyId: string = 'default') {"
)
content = content.replace(
    "const docRef = doc(db, 'personnel', key);",
    "const docRef = doc(db, `companies/${companyId}/personnel`, key);"
)

# Update savePersonnelToFirestore
content = content.replace(
    "export async function savePersonnelToFirestore(personnelList: PersonnelNode[]) {",
    "export async function savePersonnelToFirestore(personnelList: PersonnelNode[], companyId: string = 'default') {"
)
content = content.replace(
    "const docRef = doc(db, 'personnel', node.key);",
    "const docRef = doc(db, `companies/${companyId}/personnel`, node.key);"
)

# Update subscribeEmployees
content = content.replace(
    "export function subscribeEmployees(callback: (employees: EmployeeRecord[]) => void) {",
    "export function subscribeEmployees(callback: (employees: EmployeeRecord[]) => void, companyId: string = 'default') {"
)
content = content.replace(
    "const path = 'employees';",
    "const path = `companies/${companyId}/employees`;"
)

# Update saveEmployee
content = content.replace(
    "export async function saveEmployee(employee: EmployeeRecord) {",
    "export async function saveEmployee(employee: EmployeeRecord, companyId: string = 'default') {"
)
content = content.replace(
    "const docRef = doc(db, 'employees', employee.id);",
    "const docRef = doc(db, `companies/${companyId}/employees`, employee.id);"
)

# Update deleteEmployee
content = content.replace(
    "export async function deleteEmployee(id: string) {",
    "export async function deleteEmployee(id: string, companyId: string = 'default') {"
)
content = content.replace(
    "const docRef = doc(db, 'employees', id);",
    "const docRef = doc(db, `companies/${companyId}/employees`, id);"
)

# Update seedEmployees
content = content.replace(
    "export async function seedEmployees() {",
    "export async function seedEmployees(companyId: string = 'default') {"
)
content = content.replace(
    "await saveEmployee(employee);",
    "await saveEmployee(employee, companyId);"
)


with open('lib/firebase.ts', 'w') as f:
    f.write(content)
