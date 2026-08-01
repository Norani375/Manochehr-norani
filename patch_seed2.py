with open('app/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("await seedEmployees(DEFAULT_EMPLOYEES);", "await seedEmployees(DEFAULT_EMPLOYEES, activeCompanyId);")

with open('app/page.tsx', 'w') as f:
    f.write(content)
