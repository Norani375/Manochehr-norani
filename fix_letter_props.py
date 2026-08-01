with open('components/DabLicenseRenewalLetter.tsx', 'r') as f:
    content = f.read()

content = content.replace("interface DabLicenseRenewalLetterProps {", "interface DabLicenseRenewalLetterProps {\n  companyId?: string;")

with open('components/DabLicenseRenewalLetter.tsx', 'w') as f:
    f.write(content)
