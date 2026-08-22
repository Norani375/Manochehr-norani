# DAB Form Route Map

## Canonical form registry

All DAB form routes use the canonical `DAB_OFFICIAL_FORMS` registry through `DabStandardFormsWorkspace`.

| Legacy route | Canonical form ID | Data preservation |
|---|---|---|
| `/dab-fx-guarantee` | `fx-guarantee` | Existing canonical Firestore records are preserved. Legacy component remains in the repository for source/data compatibility. |
| `/dab-fx-responsible-employee` | `fx-responsible-employee` | Existing canonical Firestore records are preserved. |
| `/dab-organization-chart` | `organization-chart` | Existing canonical Firestore records are preserved. |
| `/dab-renewal-form-1` | `license-renewal` | Existing canonical Firestore records are preserved. |
| `/dab-renewal` | `license-renewal` | Existing canonical Firestore records are preserved. |
| `/dab-shareholder-guarantee` | `shareholder-guarantee` | Existing canonical Firestore records are preserved. |

## Rule

The route layer no longer creates a second form implementation. The canonical workspace is the single user interface for DAB forms. Form IDs remain stable so existing `companies/{companyId}/dabOfficialForms/{formId}` records are not deleted.

The old specialized components are retained for compatibility and audit history. They are not the active route UI.
