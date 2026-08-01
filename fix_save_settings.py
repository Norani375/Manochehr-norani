with open('app/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("saveSettingsToFirestore({ issueDate: currentIssueDate, customLogo: updatedLogo });", "saveSettingsToFirestore({ issueDate: currentIssueDate, customLogo: updatedLogo }, activeCompanyId);")
content = content.replace("saveSettingsToFirestore({ issueDate, customLogo: logoDataUrl });", "saveSettingsToFirestore({ issueDate, customLogo: logoDataUrl }, activeCompanyId);")
content = content.replace("saveSettingsToFirestore({ issueDate: newDate, customLogo });", "saveSettingsToFirestore({ issueDate: newDate, customLogo }, activeCompanyId);")

with open('app/page.tsx', 'w') as f:
    f.write(content)
