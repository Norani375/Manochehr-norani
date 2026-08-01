with open('app/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("export default function OrgChartPage() {", "function OrgChartPageContent() {")

wrapper = """
export default function OrgChartPage() {
  return (
    <CompanyProvider>
      <OrgChartPageContent />
    </CompanyProvider>
  );
}
"""

content = content + wrapper

# also add CompanyProvider to import
content = content.replace("import { useCompany }", "import { useCompany, CompanyProvider }")

with open('app/page.tsx', 'w') as f:
    f.write(content)
