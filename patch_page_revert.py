import re
with open('app/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("function OrgChartPageContent() {", "export default function OrgChartPage() {")

wrapper = """
export default function OrgChartPage() {
  return (
    <CompanyProvider>
      <OrgChartPageContent />
    </CompanyProvider>
  );
}
"""
content = content.replace(wrapper, "")
content = content.replace("import { useCompany, CompanyProvider }", "import { useCompany }")

with open('app/page.tsx', 'w') as f:
    f.write(content)
