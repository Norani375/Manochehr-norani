with open('components/DabBranchRenewalChecklist.tsx', 'r') as f:
    content = f.read()

content = content.replace("      </div>      ))}    </div>  );}", "      </div>\n      ))}\n    </div>\n  );\n}")

with open('components/DabBranchRenewalChecklist.tsx', 'w') as f:
    f.write(content)
