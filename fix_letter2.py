with open('components/DabLicenseRenewalLetter.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "export default function DabLicenseRenewalLetter({ isEditMode = true, customLogo, onOpenLogoModal, onExportPdf }: DabLicenseRenewalLetterProps) {",
    "export default function DabLicenseRenewalLetter({ isEditMode = true, customLogo, onOpenLogoModal, onExportPdf, companyId = 'default' }: DabLicenseRenewalLetterProps) {"
)

with open('components/DabLicenseRenewalLetter.tsx', 'w') as f:
    f.write(content)
