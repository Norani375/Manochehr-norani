import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

import_stmt = "import { useCompany } from '@/lib/companyContext';\n"
content = content.replace("import { \n  subscribePersonnel,", import_stmt + "import { \n  subscribePersonnel,")

# Add to OrgChartPage component
use_company = "  const { companies, activeCompanyId, setActiveCompanyId } = useCompany();"
content = content.replace("  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);", "  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);\n" + use_company)

# Replace the sidebar branding section
branding_regex = r"<div className=\"min-w-0\">\s*<h1.*?/h1>\s*<p.*?/p>\s*</div>"
replacement = """<div className="min-w-0 flex flex-col">
                  <select 
                    value={activeCompanyId}
                    onChange={(e) => setActiveCompanyId(e.target.value)}
                    className="bg-transparent font-black text-sm text-slate-900 dark:text-white leading-tight truncate focus:outline-none appearance-none cursor-pointer"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id} className="text-slate-900">{c.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-0.5">خدمات صرافی و پولی</p>
                </div>"""
content = re.sub(branding_regex, replacement, content)

# Find all component renders and pass companyId={activeCompanyId}
# {activeTab === 'guarantee-form' ? ( <DabGuaranteeForm isEditMode={isEditMode} customLogo={customLogo} onOpenLogoModal={() => setIsLogoModalOpen(true)} onExportPdf={() => { getPdfExportConfig(); setIsPdfModalOpen(true); }} />
content = re.sub(r'(<(?:DabGuaranteeForm|DabBranchRenewalForm|DabLicenseRenewalForm|DabLicenseRenewalLetter|MeetingMinutes|DabLicenseChecklist|DabLicenseRenewalChecklist|DabBranchRenewalChecklist|EmployeeManagement|CompanyArticles|CompanyProposal)[\s\w=\{\}\'\"\(\)\-\>\/\:]+)(\s*/>)', r'\1 companyId={activeCompanyId}\2', content)

with open('app/page.tsx', 'w') as f:
    f.write(content)
