import re
with open('components/CompanyProposal.tsx', 'r') as f:
    content = f.read()

content = content.replace("interface CompanyProposalProps {", "interface CompanyProposalProps {\n  companyId?: string;")

with open('components/CompanyProposal.tsx', 'w') as f:
    f.write(content)
    
with open('components/CompanyArticles.tsx', 'r') as f:
    content2 = f.read()

content2 = content2.replace("interface CompanyArticlesProps {", "interface CompanyArticlesProps {\n  companyId?: string;")

with open('components/CompanyArticles.tsx', 'w') as f:
    f.write(content2)
