import re

with open('components/DabBranchRenewalChecklist.tsx', 'r') as f:
    content = f.read()

# Make it unconditionally visible (remove isEditing condition if it exists)
content = content.replace('{isEditing && (\n        <div className="bg-slate-50', '<div className="bg-slate-50')
content = content.replace('              </button>\n            ))}\n          </div>\n        </div>\n      )}', '              </button>\n            ))}\n          </div>\n        </div>')

# Add "همه نمایندگی‌ها" button before mapping BRANCH_PRESETS
target_map = '{BRANCH_PRESETS.map((p, i) => ('
new_buttons = """
          <button
            onClick={() => setRenderAll(true)}
            className={`px-3 py-1.5 rounded-lg border font-bold text-[11px] ${
              renderAll ? 'bg-teal-600 text-white border-teal-700 shadow-sm' : 'bg-white text-slate-800 border-slate-300 hover:border-teal-500'
            }`}
          >
            همه نمایندگی‌ها (۶ فرم)
          </button>
          {BRANCH_PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => { setRenderAll(false); loadBranchPreset(p); }}
              className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] ${
                (!renderAll && data.branchNo === p.branchNo) ? 'bg-slate-800 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-800 border-slate-300 hover:border-teal-500'
              }`}
"""

content = content.replace(target_map + '\n              <button\n                key={i}\n                onClick={() => loadBranchPreset(p)}\n                className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:border-teal-500 text-slate-800 dark:text-slate-200 font-bold text-[11px]"\n              >', new_buttons)

with open('components/DabBranchRenewalChecklist.tsx', 'w') as f:
    f.write(content)
