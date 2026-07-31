with open('components/DabBranchRenewalChecklist.tsx', 'r') as f:
    content = f.read()

content = content.replace("              }`}\n                {p.name}\n              </button>", "              }`}\n            >\n                {p.name}\n              </button>")

with open('components/DabBranchRenewalChecklist.tsx', 'w') as f:
    f.write(content)
