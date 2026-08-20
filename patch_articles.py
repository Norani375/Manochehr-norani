import re
with open('components/CompanyArticles.tsx', 'r') as f:
    content = f.read()

if "toEnglishDigits" not in content:
    content = content.replace("import React,", "import { toEnglishDigits } from '@/lib/utils';\nimport React,")

old_input = """                                value={s.tazkiraNo}
                                onChange={(e) => updateShareholder(s.id, 'tazkiraNo', e.target.value)}
                                className="w-full border px-1 text-center font-mono"
                              />"""

new_input = """                                value={s.tazkiraNo}
                                dir="ltr"
                                onChange={(e) => updateShareholder(s.id, 'tazkiraNo', toEnglishDigits(e.target.value))}
                                className="w-full border px-1 text-left font-sans"
                              />"""

content = content.replace(old_input, new_input)
with open('components/CompanyArticles.tsx', 'w') as f:
    f.write(content)
