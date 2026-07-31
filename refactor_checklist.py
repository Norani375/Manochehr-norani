import re

with open('components/DabBranchRenewalChecklist.tsx', 'r') as f:
    content = f.read()

# 1. Add renderAll state
content = content.replace(
    'const [isSaved, setIsSaved] = useState(false);',
    'const [isSaved, setIsSaved] = useState(false);\n  const [renderAll, setRenderAll] = useState(false);'
)

# 2. Add "All Branches" button
preset_btn_replacement = """
          <button
            onClick={() => setRenderAll(true)}
            className={`px-3 py-1.5 rounded-lg border font-bold text-xs ${
              renderAll ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            همه نمایندگی‌ها (۶ فرم)
          </button>
          {BRANCH_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => { setRenderAll(false); loadBranchPreset(preset); }}
              className={`px-3 py-1.5 rounded-lg border font-bold text-xs ${
                (!renderAll && data.branchNo === preset.branchNo) ? 'bg-blue-600 text-white border-blue-700 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {preset.name}
            </button>
          ))}
"""
content = re.sub(r'\{BRANCH_PRESETS\.map\(\(preset, idx\) => \(\s*<button.*?</button>\s*\)\)\}', preset_btn_replacement, content, flags=re.DOTALL)

# 3. Replace the canvas wrapper
canvas_start = '<div id="dab-branch-renewal-checklist-canvas" className="bg-white border border-slate-300 p-8 sm:p-12 rounded-xl shadow-sm text-sm print:border-none print:shadow-none print:p-0 print:m-0 w-full max-w-4xl mx-auto">'
canvas_wrapper = """{(renderAll ? BRANCH_PRESETS.map(p => ({
          ...data,
          branchNo: p.branchNo,
          marketName: p.marketName,
          shopNo: p.shopNo,
          districtProvince: p.districtProvince,
          staff: data.staff.map((s, idx) => idx === 0 ? {
            ...s,
            name: p.repName,
            fatherName: p.repFather,
            idNo: p.repTazkira
          } : s)
        })) : [data]).map((branchData, index) => (
      <div key={index} id={renderAll ? `dab-branch-renewal-checklist-canvas-${index}` : "dab-branch-renewal-checklist-canvas"} className={`bg-white border border-slate-300 p-8 sm:p-12 rounded-xl shadow-sm text-sm print:border-none print:shadow-none print:p-0 print:m-0 w-full max-w-4xl mx-auto ${renderAll ? 'break-after-page mb-8 print:mb-0' : ''}`}>"""

content = content.replace(canvas_start, canvas_wrapper)

# 4. Close the map at the end of the file
end_replacement = """      </div>
      ))}
    </div>
  );
}"""

content = content.replace('      </div>\n    </div>\n  );\n}', end_replacement)

# 5. Inside the canvas, replace `data.` with `branchData.`
parts = content.split('{(renderAll ? BRANCH_PRESETS.map(p => ({')
if len(parts) == 2:
    header = parts[0]
    canvas = parts[1]
    
    canvas = canvas.replace('data.', 'branchData.')
    # Also replace isEditing
    canvas = canvas.replace('isEditing={isEditing}', 'isEditing={renderAll ? false : isEditing}')
    canvas = canvas.replace('isEditMode={isEditing}', 'isEditMode={renderAll ? false : isEditing}')
    
    content = header + '{(renderAll ? BRANCH_PRESETS.map(p => ({' + canvas

with open('components/DabBranchRenewalChecklist.tsx', 'w') as f:
    f.write(content)

print("Checklist refactoring done.")
