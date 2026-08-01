import sys

file_name = sys.argv[1]

with open(file_name, 'r') as f:
    content = f.read()

content = content.replace("_${companyId}_${companyId}", "_${companyId}")

with open(file_name, 'w') as f:
    f.write(content)
