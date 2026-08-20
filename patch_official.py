import re
with open('components/DabOfficialCompanyRenewalForm.tsx', 'r') as f:
    content = f.read()

if "toEnglishDigits" not in content:
    content = content.replace("import React,", "import { toEnglishDigits } from '@/lib/utils';\nimport React,")
    content = content.replace("import { useState", "import { toEnglishDigits } from '@/lib/utils';\nimport { useState")

# 1. <input className={inputClass} value={String(data[key as keyof OfficialRenewalData])} onChange={e => update(key as keyof OfficialRenewalData, e.target.value as never)} />
content = content.replace(
    "<input className={inputClass} value={String(data[key as keyof OfficialRenewalData])} onChange={e => update(key as keyof OfficialRenewalData, e.target.value as never)} />",
    "<input dir={key.toLowerCase().includes('tazkira') ? 'ltr' : undefined} className={`${inputClass} ${key.toLowerCase().includes('tazkira') ? 'text-left font-sans' : ''}`} value={String(data[key as keyof OfficialRenewalData])} onChange={e => update(key as keyof OfficialRenewalData, (key.toLowerCase().includes('tazkira') ? toEnglishDigits(e.target.value) : e.target.value) as never)} />"
)

# 2. <input className={inputClass} value={person[key]} onChange={e => updatePerson('shareholders', person.id, key, e.target.value)} />
content = content.replace(
    "<input className={inputClass} value={person[key]} onChange={e => updatePerson('shareholders', person.id, key, e.target.value)} />",
    "<input dir={key.toLowerCase().includes('tazkira') ? 'ltr' : undefined} className={`${inputClass} ${key.toLowerCase().includes('tazkira') ? 'text-left font-sans' : ''}`} value={person[key]} onChange={e => updatePerson('shareholders', person.id, key, key.toLowerCase().includes('tazkira') ? toEnglishDigits(e.target.value) : e.target.value)} />"
)

# 3. <input className={inputClass} value={person[key]} onChange={e => updatePerson('responsibleStaff', person.id, key, e.target.value)} />
content = content.replace(
    "<input className={inputClass} value={person[key]} onChange={e => updatePerson('responsibleStaff', person.id, key, e.target.value)} />",
    "<input dir={key.toLowerCase().includes('tazkira') ? 'ltr' : undefined} className={`${inputClass} ${key.toLowerCase().includes('tazkira') ? 'text-left font-sans' : ''}`} value={person[key]} onChange={e => updatePerson('responsibleStaff', person.id, key, key.toLowerCase().includes('tazkira') ? toEnglishDigits(e.target.value) : e.target.value)} />"
)

# 4. <input className={inputClass} value={branch[key]} onChange={e => updateBranch(branch.id, key, e.target.value)} />
content = content.replace(
    "<input className={inputClass} value={branch[key]} onChange={e => updateBranch(branch.id, key, e.target.value)} />",
    "<input dir={key.toLowerCase().includes('tazkira') ? 'ltr' : undefined} className={`${inputClass} ${key.toLowerCase().includes('tazkira') ? 'text-left font-sans' : ''}`} value={branch[key]} onChange={e => updateBranch(branch.id, key, key.toLowerCase().includes('tazkira') ? toEnglishDigits(e.target.value) : e.target.value)} />"
)

# 5. <input className={inputClass} value={String(data[key])} onChange={e => update(key, e.target.value as never)} />
content = content.replace(
    "<input className={inputClass} value={String(data[key])} onChange={e => update(key, e.target.value as never)} />",
    "<input dir={key.toLowerCase().includes('tazkira') ? 'ltr' : undefined} className={`${inputClass} ${key.toLowerCase().includes('tazkira') ? 'text-left font-sans' : ''}`} value={String(data[key])} onChange={e => update(key, (key.toLowerCase().includes('tazkira') ? toEnglishDigits(e.target.value) : e.target.value) as never)} />"
)

with open('components/DabOfficialCompanyRenewalForm.tsx', 'w') as f:
    f.write(content)
