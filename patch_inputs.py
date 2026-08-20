import os
import re

files_to_patch = [
    'components/DabShareholderGuaranteeForm.tsx',
    'components/DabGuaranteeForm.tsx',
    'components/DabFxGuaranteeForm.tsx',
]

for filepath in files_to_patch:
    with open(filepath, 'r') as f:
        content = f.read()
    
    if "toEnglishDigits" not in content:
        content = content.replace('import React', "import { toEnglishDigits } from '@/lib/utils';\nimport React")
        
    # Patch Input/Field components
    # Look for: function Input({ ... }) { ... <input ... /> }
    # Or function Field({ ... }) { ... <input ... /> }
    
    # We will use regex to find the input/Field definitions
    # It's safer to just do a manual replacement for each file structure
    with open(filepath, 'w') as f:
        f.write(content)
