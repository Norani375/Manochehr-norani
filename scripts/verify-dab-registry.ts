import {
  DAB_OFFICIAL_FORM_BY_ID,
  type DabOfficialFormDefinition,
} from '../lib/dabOfficialFormRegistry';
import {
  DAB_OFFICIAL_WEBSITE_FORMS,
  type DabOfficialWebsiteForm,
} from '../lib/dabOfficialWebsiteFormManifest';

const OFFICIAL_HOSTS = new Set(['dab.gov.af', 'www.dab.gov.af']);

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`[DAB registry] ${message}`);
  }
}

function hostOf(url: string): string {
  return new URL(url).hostname.toLowerCase();
}

function verifyUniqueIds(forms: readonly { id: string }[], label: string): void {
  const ids = forms.map((form) => form.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert(duplicates.length === 0, `${label} contains duplicate IDs: ${[...new Set(duplicates)].join(', ')}`);
}

function verifyOfficialDefinition(form: DabOfficialFormDefinition): void {
  assert(form.official === true, `${form.id} is not marked as official.`);
  assert(OFFICIAL_HOSTS.has(hostOf(form.sourceUrl)), `${form.id} has a non-DAB source URL: ${form.sourceUrl}`);
  assert(form.title.trim().length > 0, `${form.id} has an empty title.`);
  assert(form.printNotice.trim().length > 0, `${form.id} has no print notice.`);
}

function verifyWebsiteManifestEntry(form: DabOfficialWebsiteForm): void {
  assert(form.official === true, `${form.id} is not marked as official in the website manifest.`);
  assert(OFFICIAL_HOSTS.has(hostOf(form.sourceUrl)), `${form.id} has a non-DAB website source URL.`);
  assert(form.title.trim().length > 0, `${form.id} has an empty website title.`);
}

verifyUniqueIds(Object.values(DAB_OFFICIAL_FORM_BY_ID), 'canonical registry');
verifyUniqueIds(DAB_OFFICIAL_WEBSITE_FORMS, 'website manifest');

for (const form of Object.values(DAB_OFFICIAL_FORM_BY_ID)) {
  verifyOfficialDefinition(form);
}

for (const form of DAB_OFFICIAL_WEBSITE_FORMS) {
  verifyWebsiteManifestEntry(form);
}

const canonicalTitles = new Set(
  Object.values(DAB_OFFICIAL_FORM_BY_ID).map((form) => form.title.trim()),
);

const websiteTitlesNotInCanonical = DAB_OFFICIAL_WEBSITE_FORMS.filter(
  (form) => !canonicalTitles.has(form.title.trim()),
);

assert(
  websiteTitlesNotInCanonical.length === 0,
  `website manifest contains titles not represented by the canonical registry: ${websiteTitlesNotInCanonical.map((form) => form.id).join(', ')}`,
);

console.log(
  `[DAB registry] OK: ${Object.keys(DAB_OFFICIAL_FORM_BY_ID).length} canonical forms and ${DAB_OFFICIAL_WEBSITE_FORMS.length} website forms passed integrity checks.`,
);
