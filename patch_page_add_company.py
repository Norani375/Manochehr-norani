import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# I'll replace the select with a div containing the select and a '+' button.
old_div = """                <div className="min-w-0 flex flex-col">
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

new_div = """                <div className="min-w-0 flex flex-col group/company">
                  <div className="flex items-center gap-1">
                    <select 
                      value={activeCompanyId}
                      onChange={(e) => {
                        if (e.target.value === 'ADD_NEW') {
                          const name = prompt('نام شرکت جدید را وارد کنید:');
                          if (name) {
                            const newId = 'company_' + Date.now();
                            addCompany({ id: newId, name, licenseNo: '' });
                            setActiveCompanyId(newId);
                          }
                        } else {
                          setActiveCompanyId(e.target.value);
                        }
                      }}
                      className="bg-transparent font-black text-sm text-slate-900 dark:text-white leading-tight truncate focus:outline-none appearance-none cursor-pointer max-w-[150px]"
                    >
                      {companies.map(c => (
                        <option key={c.id} value={c.id} className="text-slate-900">{c.name}</option>
                      ))}
                      <option value="ADD_NEW" className="text-blue-600 font-bold">+ افزودن شرکت جدید</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-0.5">خدمات صرافی و پولی</p>
                </div>"""

content = content.replace(old_div, new_div)

# Add addCompany to the context extraction
content = content.replace(
    "const { companies, activeCompanyId, setActiveCompanyId } = useCompany();",
    "const { companies, activeCompanyId, setActiveCompanyId, addCompany } = useCompany();"
)

with open('app/page.tsx', 'w') as f:
    f.write(content)
