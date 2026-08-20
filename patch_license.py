import re
with open('components/DabLicenseRenewalForm.tsx', 'r') as f:
    content = f.read()

if "toEnglishDigits" not in content:
    content = content.replace("import React,", "import { toEnglishDigits } from '@/lib/utils';\nimport React,")

old_input = """                    <input
                      type="text"
                      value={sh.tazkiraNo}
                      onChange={(e) => updateShareholder(idx, 'tazkiraNo', e.target.value)}
                      className="w-full p-1 border rounded bg-white text-center font-mono"
                    />"""

new_input = """                    <input
                      type="text"
                      dir="ltr"
                      value={sh.tazkiraNo}
                      onChange={(e) => updateShareholder(idx, 'tazkiraNo', toEnglishDigits(e.target.value))}
                      className="w-full p-1 border rounded bg-white text-left font-sans"
                    />"""

content = content.replace(old_input, new_input)
with open('components/DabLicenseRenewalForm.tsx', 'w') as f:
    f.write(content)
