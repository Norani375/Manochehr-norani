import re

with open('components/DabBranchRenewalForm.tsx', 'r') as f:
    content = f.read()

# 1. Add renderAll state
content = content.replace(
    'const [isSaved, setIsSaved] = useState(false);',
    'const [isSaved, setIsSaved] = useState(false);\n  const [renderAll, setRenderAll] = useState(false);'
)

# 2. Add "All Branches" button in the quick selection bar
# The bar maps over REAL_BRANCHES_PRESETS
preset_btn_replacement = """
            <button
              type="button"
              onClick={() => setRenderAll(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                renderAll 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-[1.02]' 
                  : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
              }`}
            >
              <span>همه نمایندگی‌ها (۶ فرم)</span>
            </button>
            {REAL_BRANCHES_PRESETS.map((preset) => {
              const isSelected = !renderAll && data.branchProvince === preset.branchProvince && data.repName === preset.repName;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => { setRenderAll(false); handleSelectPreset(preset); }}
"""
content = content.replace(
    '{REAL_BRANCHES_PRESETS.map((preset) => {\n              const isSelected = data.branchProvince === preset.branchProvince && data.repName === preset.repName;\n              return (\n                <button\n                  key={preset.id}\n                  type="button"\n                  onClick={() => handleSelectPreset(preset)}',
    preset_btn_replacement
)

# 3. Replace the canvas wrapper
canvas_start = '<div id="dab-branch-renewal-canvas" className="bg-white p-6 sm:p-10 border border-slate-300 rounded-2xl shadow-sm text-sm print:border-none print:shadow-none print:p-0 print:m-0">'
canvas_wrapper = """{(renderAll ? REAL_BRANCHES_PRESETS.map(p => ({...data, ...p})) : [data]).map((branchData, index) => (
      <div key={index} id={renderAll ? `dab-branch-renewal-canvas-${index}` : "dab-branch-renewal-canvas"} className={`bg-white p-6 sm:p-10 border border-slate-300 rounded-2xl shadow-sm text-sm print:border-none print:shadow-none print:p-0 print:m-0 ${renderAll ? 'break-after-page mb-8 print:mb-0' : ''}`}>"""

content = content.replace(canvas_start, canvas_wrapper)

# 4. Close the map at the end of the file
# It ends with:
#       </div>
#     </div>
#   );
# }
end_replacement = """      </div>
      ))}
    </div>
  );
}"""

content = content.replace('      </div>\n    </div>\n  );\n}', end_replacement)

# 5. Inside the canvas, replace `data.` with `branchData.`
# And replace `isEditMode={isEditMode}` with `isEditMode={renderAll ? false : isEditMode}`
# We need to only do this replacement INSIDE the canvas part.
parts = content.split('{(renderAll ? REAL_BRANCHES_PRESETS.map(p => ({...data, ...p})) : [data]).map((branchData, index) => (')
if len(parts) == 2:
    header = parts[0]
    canvas = parts[1]
    
    canvas = canvas.replace('data.', 'branchData.')
    canvas = canvas.replace('isEditMode={isEditMode}', 'isEditMode={renderAll ? false : isEditMode}')
    
    content = header + '{(renderAll ? REAL_BRANCHES_PRESETS.map(p => ({...data, ...p})) : [data]).map((branchData, index) => (' + canvas

with open('components/DabBranchRenewalForm.tsx', 'w') as f:
    f.write(content)

print("Refactoring done.")
