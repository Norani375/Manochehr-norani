const fs = require('fs');

let content = fs.readFileSync('components/DabBranchRenewalChecklist.tsx', 'utf8');

// 1. Replace the canvas start
const canvasStartMatch = /<div\s+id="dab-branch-renewal-checklist-canvas"\s+className="([^"]+)"\s*>/;
const match = content.match(canvasStartMatch);

if (match) {
    const originalClasses = match[1];
    const wrapper = `{(renderAll ? BRANCH_PRESETS.map(p => ({
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
      <div key={index} id={renderAll ? \`dab-branch-renewal-checklist-canvas-\${index}\` : "dab-branch-renewal-checklist-canvas"} className={\`${originalClasses} \${renderAll ? 'break-after-page mb-8 print:mb-0' : ''}\`}>`;

    content = content.replace(match[0], wrapper);
    
    // Replace all `data.` with `branchData.` INSIDE the canvas.
    const parts = content.split(wrapper);
    if (parts.length === 2) {
        let canvas = parts[1];
        
        // We need to replace `data.` with `branchData.` but be careful not to replace it in the end of the file where there is no `branchData` in scope?
        // Actually, the whole rest of the file is the canvas.
        
        // Let's first close the map at the very end.
        // It currently ends with:
        //       </div>
        //     </div>
        //   );
        // }
        // We need to insert `))}` before the second to last `</div>`.
        // Let's just do a regex replace at the end of the file.
        canvas = canvas.replace(/<\/div>\s*<\/div>\s*\);\s*\}\s*$/, '</div>\n      ))}\n    </div>\n  );\n}');
        
        canvas = canvas.replace(/data\./g, 'branchData.');
        canvas = canvas.replace(/isEditing={isEditing}/g, 'isEditing={renderAll ? false : isEditing}');
        
        content = parts[0] + wrapper + canvas;
    }
}

fs.writeFileSync('components/DabBranchRenewalChecklist.tsx', content);
console.log("Checklist JS refactor done.");
