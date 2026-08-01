import sys
import re

file_name = sys.argv[1]

with open(file_name, 'r') as f:
    content = f.read()

# Add companyId to the props
content = re.sub(
    r'(export default function [^\(]+\(\{\s*)([^\}]+)(\s*\}\s*:\s*\{)([^}]+)(\}\s*(?:=\s*\{\})?\s*\)\s*\{)',
    r'\1\2, companyId = "default"\3\4; companyId?: string \5',
    content
)

# Update docRef paths
content = re.sub(
    r"(doc\(db,\s*'settings',\s*')([^']+)'\)",
    r"doc(db, 'settings', `\2_${companyId}`)",
    content
)

# Also update localStorage paths (fix the quotes)
content = re.sub(
    r"(localStorage\.(?:getItem|setItem|removeItem)\()'([^']+)'",
    r"\1`\2_${companyId}`",
    content
)

with open(file_name, 'w') as f:
    f.write(content)
