with open('lib/firebase.ts', 'r') as f:
    content = f.read()

content = content.replace("export async function seedEmployees(employees: EmployeeRecord[]) {", "export async function seedEmployees(employees: EmployeeRecord[], companyId: string = 'default') {")
content = content.replace("await setDoc(doc(db, 'employees', emp.id), {", "await setDoc(doc(db, `companies/${companyId}/employees`, emp.id), {")

with open('lib/firebase.ts', 'w') as f:
    f.write(content)
