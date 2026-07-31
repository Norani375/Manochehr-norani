with open('components/DabBranchRenewalForm.tsx', 'r') as f:
    content = f.read()

content = content.replace('{isEditMode && (\n        <div className="bg-gradient-to-r from-blue-900 to-slate-900', '<div className="bg-gradient-to-r from-blue-900 to-slate-900')
content = content.replace('                </button>\n              );\n            })}\n          </div>\n        </div>\n      )}', '                </button>\n              );\n            })}\n          </div>\n        </div>')

with open('components/DabBranchRenewalForm.tsx', 'w') as f:
    f.write(content)
