with open('components/OrgChartCanvas.tsx', 'r') as f:
    content = f.read()

content = content.replace("setEditingNode({ ...editingNode, bgType: type as 'light' | 'dark' })", "setEditingNode(editingNode ? { ...editingNode, bgType: type as 'light' | 'dark' } : null)")

with open('components/OrgChartCanvas.tsx', 'w') as f:
    f.write(content)
