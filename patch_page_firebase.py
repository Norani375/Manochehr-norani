import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("subscribePersonnel((list) => {", "subscribePersonnel((list) => {")

# find the subscribePersonnel call and pass activeCompanyId as second argument
# it looks like:
# const unsubscribePersonnel = subscribePersonnel((list) => { ... });
# wait, if it spans multiple lines, we can just replace the `});` at the very end of the block.
# Let's just find `unsubscribePersonnel = subscribePersonnel` and the matching end.
# Actually, it's easier to just replace it statically.

content = content.replace("""    const unsubscribePersonnel = subscribePersonnel((list) => {
      if (list && list.length > 0) {
        setPersonnel(list);
        localStorage.setItem('bg_org_chart_data', JSON.stringify(list));
      } else {
        // Seed default personnel data to Firestore if database collection is empty
        setPersonnel(DEFAULT_ORG_DATA);
        savePersonnelToFirestore(DEFAULT_ORG_DATA);
      }
    });""", """    const unsubscribePersonnel = subscribePersonnel((list) => {
      if (list && list.length > 0) {
        setPersonnel(list);
        localStorage.setItem(`bg_org_chart_data_${activeCompanyId}`, JSON.stringify(list));
      } else {
        // Seed default personnel data to Firestore if database collection is empty
        setPersonnel(DEFAULT_ORG_DATA);
        savePersonnelToFirestore(DEFAULT_ORG_DATA, activeCompanyId);
      }
    }, activeCompanyId);""")

content = content.replace(
    "saveSinglePersonnelToFirestore(newNode);",
    "saveSinglePersonnelToFirestore(newNode, activeCompanyId);"
)
content = content.replace(
    "saveSinglePersonnelToFirestore(updatedNode);",
    "saveSinglePersonnelToFirestore(updatedNode, activeCompanyId);"
)
content = content.replace(
    "deletePersonnelFromFirestore(key);",
    "deletePersonnelFromFirestore(key, activeCompanyId);"
)

# And for subscribeSettings
content = content.replace("""    const unsubscribeSettings = subscribeSettings((settings) => {
      if (settings) {
        if (settings.issueDate) setIssueDate(settings.issueDate);
        if (settings.customLogo) setCustomLogo(settings.customLogo);
      }
    });""", """    const unsubscribeSettings = subscribeSettings((settings) => {
      if (settings) {
        if (settings.issueDate) setIssueDate(settings.issueDate);
        if (settings.customLogo) setCustomLogo(settings.customLogo);
      }
    }, activeCompanyId);""")

# For seedEmployees
content = content.replace(
    "seedEmployees().then",
    "seedEmployees(activeCompanyId).then"
)

# And for subscribeEmployees
content = content.replace("""    const unsubscribeEmployees = subscribeEmployees((list) => {
      if (list && list.length === 0) {
        // Seed employees if collection is empty
        seedEmployees().then(() => console.log('Seeded default employees'));
      }
    });""", """    const unsubscribeEmployees = subscribeEmployees((list) => {
      if (list && list.length === 0) {
        // Seed employees if collection is empty
        seedEmployees(activeCompanyId).then(() => console.log('Seeded default employees'));
      }
    }, activeCompanyId);""")

with open('app/page.tsx', 'w') as f:
    f.write(content)
