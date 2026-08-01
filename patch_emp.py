with open('components/EmployeeManagement.tsx', 'r') as f:
    content = f.read()

content = content.replace("export default function EmployeeManagement({ customLogo, isEditMode = true }: EmployeeManagementProps) {", "export default function EmployeeManagement({ customLogo, isEditMode = true, companyId = 'default' }: EmployeeManagementProps & { companyId?: string }) {")

content = content.replace(
    "    const unsubscribe = subscribeEmployees((data) => {",
    "    const unsubscribe = subscribeEmployees((data) => {"
)
# Actually, the subscribeEmployees is called like:
# const unsubscribe = subscribeEmployees((data) => {
# ...
# });
content = content.replace(
    "    });\n    return () => unsubscribe();\n  }, [selectedEmployeeId]);",
    "    }, companyId);\n    return () => unsubscribe();\n  }, [selectedEmployeeId, companyId]);"
)

content = content.replace(
    "saveEmployee({ ...editingEmployee, id: empId });",
    "saveEmployee({ ...editingEmployee, id: empId }, companyId);"
)

content = content.replace(
    "saveEmployee(newEmp);",
    "saveEmployee(newEmp, companyId);"
)

content = content.replace(
    "saveEmployee(updatedEmp);",
    "saveEmployee(updatedEmp, companyId);"
)

content = content.replace(
    "deleteEmployee(empId);",
    "deleteEmployee(empId, companyId);"
)

with open('components/EmployeeManagement.tsx', 'w') as f:
    f.write(content)
