with open('components/MeetingMinutes.tsx', 'r') as f:
    content = f.read()

if "toEnglishDigits" not in content:
    content = content.replace("import React, ", "import { toEnglishDigits } from '@/lib/utils';\nimport React, ")

content = content.replace(
    "updated[i].idNo = e.target.value;",
    "updated[i].idNo = toEnglishDigits(e.target.value);"
)

with open('components/MeetingMinutes.tsx', 'w') as f:
    f.write(content)
