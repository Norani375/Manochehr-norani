with open('app/page.tsx', 'r') as f:
    content = f.read()

content = "export const dynamic = 'force-dynamic';\n" + content

with open('app/page.tsx', 'w') as f:
    f.write(content)
