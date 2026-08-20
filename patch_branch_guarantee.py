import re
with open('components/DabBranchRenewalForm.tsx', 'r') as f:
    content = f.read()

# Add toEnglishDigits to the import
if "toEnglishDigits" not in content:
    content = content.replace('import React,', "import { toEnglishDigits } from '@/lib/utils';\nimport React,")

# Update EditableField
old_ed = """const EditableField = ({ isEditMode, value, onChange, placeholder, className = "" }: EditableFieldProps) => {"""
new_ed = """interface EditableFieldProps {
  isEditMode: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  dir?: string;
  isTazkira?: boolean;
}
const EditableField = ({ isEditMode, value, onChange, placeholder, className = "", dir, isTazkira }: EditableFieldProps) => {"""

content = re.sub(r'interface EditableFieldProps \{.*?\}', '', content, flags=re.DOTALL) # remove old interface
content = content.replace(old_ed, new_ed)

# update input
old_input = """      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs ${className}`}
      />"""

new_input = """      <input
        type="text"
        value={value}
        onChange={(e) => onChange(isTazkira ? toEnglishDigits(e.target.value) : e.target.value)}
        placeholder={placeholder}
        dir={dir || (isTazkira ? "ltr" : undefined)}
        className={`w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs ${isTazkira ? 'text-left font-sans' : ''} ${className}`}
      />"""

content = content.replace(old_input, new_input)

# Update Tazkira invocations
content = content.replace("onChange={(val) => updateField('repTazkiraNo', val)}", "onChange={(val) => updateField('repTazkiraNo', val)} isTazkira")

with open('components/DabBranchRenewalForm.tsx', 'w') as f:
    f.write(content)
