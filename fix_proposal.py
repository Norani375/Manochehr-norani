with open('components/CompanyProposal.tsx', 'r') as f:
    content = f.read()

content = content.replace("export default function CompanyProposal({ customLogo }: CompanyProposalProps) {", "export default function CompanyProposal({ customLogo, companyId = 'default' }: CompanyProposalProps) {")

with open('components/CompanyProposal.tsx', 'w') as f:
    f.write(content)
