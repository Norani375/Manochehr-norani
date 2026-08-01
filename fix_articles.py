with open('components/CompanyArticles.tsx', 'r') as f:
    content = f.read()

content = content.replace("export default function CompanyArticles({ customLogo }: CompanyArticlesProps) {", "export default function CompanyArticles({ customLogo, companyId = 'default' }: CompanyArticlesProps) {")

with open('components/CompanyArticles.tsx', 'w') as f:
    f.write(content)
