import re
with open('components/DabFxResponsibleEmployeeForm.tsx', 'r') as f:
    content = f.read()

if "toEnglishDigits" not in content:
    content = content.replace("import { useState }", "import { toEnglishDigits } from '@/lib/utils';\nimport { useState }")

old_input = """                  <input
                    type={type === 'date' ? 'date' : 'text'}
                    value={values[key] ?? ''}
                    onChange={event => update(key, event.target.value)}
                    className="mt-1 w-full border border-slate-400 p-2 font-normal"
                  />"""

new_input = """                  <input
                    type={type === 'date' ? 'date' : 'text'}
                    value={values[key] ?? ''}
                    onChange={event => update(key, key === 'identityNo' ? toEnglishDigits(event.target.value) : event.target.value)}
                    dir={key === 'identityNo' ? 'ltr' : undefined}
                    className={`mt-1 w-full border border-slate-400 p-2 font-normal ${key === 'identityNo' ? 'text-left font-sans' : ''}`}
                  />"""

content = content.replace(old_input, new_input)
with open('components/DabFxResponsibleEmployeeForm.tsx', 'w') as f:
    f.write(content)
