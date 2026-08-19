/**
 * Central registry for the DAB licensing and renewal workflow.
 *
 * Keep regulatory labels and workflow rules in one place. UI components must
 * consume this registry instead of duplicating business rules.
 */

export const DAB_FORM_CODES = {
  renewal: 'DAB-FXD-MSP-RENEWAL',
  shareholder: 'DAB-FXD-MSP-SHAREHOLDER',
  employee: 'DAB-FXD-MSP-EMPLOYEE',
  branch: 'DAB-FXD-MSP-BRANCH',
  representative: 'DAB-FXD-MSP-REPRESENTATIVE',
  guarantee: 'DAB-FXD-MSP-GUARANTEE',
  ownershipChange: 'DAB-FXD-MSP-OWNERSHIP-CHANGE',
  nameChange: 'DAB-FXD-MSP-NAME-CHANGE',
  locationChange: 'DAB-FXD-MSP-LOCATION-CHANGE',
  suspension: 'DAB-FXD-MSP-SUSPENSION',
  closure: 'DAB-FXD-MSP-CLOSURE',
} as const;

export type DabFormCode = (typeof DAB_FORM_CODES)[keyof typeof DAB_FORM_CODES];

export type DabCaseStatus =
  | 'draft'
  | 'documents_pending'
  | 'internal_review'
  | 'ready_for_submission'
  | 'submitted'
  | 'under_dab_review'
  | 'additional_information_requested'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export const DAB_CASE_STATUS_LABELS: Record<DabCaseStatus, string> = {
  draft: 'پیش‌نویس',
  documents_pending: 'اسناد ناقص',
  internal_review: 'بررسی داخلی',
  ready_for_submission: 'آماده ارسال',
  submitted: 'ارسال‌شده',
  under_dab_review: 'تحت بررسی د افغانستان بانک',
  additional_information_requested: 'درخواست معلومات اضافی',
  approved: 'تأییدشده',
  rejected: 'ردشده',
  completed: 'تکمیل‌شده',
  cancelled: 'لغوشده',
};

export interface DabCompanyProfile {
  companyId: string;
  legalName: string;
  tradeName?: string;
  licenseNumber: string;
  licenseType: 'exchange' | 'money_services' | 'exchange_and_money_services';
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
  tin?: string;
  province?: string;
  district?: string;
  address?: string;
  phone?: string;
  email?: string;
  authorizedRepresentative?: string;
}

export interface DabPersonRecord {
  id: string;
  fullName: string;
  fatherName?: string;
  grandfatherName?: string;
  nationalId?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  phone?: string;
  email?: string;
  position?: string;
  ownershipPercent?: number;
  isPoliticallyExposed?: boolean;
  status: 'active' | 'inactive' | 'pending_review';
}

export interface DabBranchRecord {
  id: string;
  companyId: string;
  name: string;
  province: string;
  district?: string;
  address: string;
  shopNumber?: string;
  managerName?: string;
  phone?: string;
  licenseNumber?: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface DabDocumentRecord {
  id: string;
  caseId: string;
  requirementKey: string;
  fileName: string;
  storagePath?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  status: 'uploaded' | 'verified' | 'rejected' | 'expired';
  uploadedBy: string;
  uploadedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface DabComplianceCheck {
  id: string;
  caseId: string;
  category: 'kyc' | 'aml_cft' | 'sanctions' | 'tax' | 'criminal_clearance' | 'governance' | 'documents';
  status: 'pending' | 'clear' | 'flagged' | 'not_applicable';
  reviewer?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface DabRenewalCase {
  caseId: string;
  companyId: string;
  licenseId: string;
  formCode: typeof DAB_FORM_CODES.renewal;
  status: DabCaseStatus;
  applicationDate: string;
  dabReferenceNumber?: string;
  majorChanges: boolean;
  applicantName?: string;
  applicantPosition?: string;
  applicantPhone?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  completedAt?: string;
}

export interface DabAuditEvent {
  id: string;
  companyId: string;
  caseId?: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
  createdAt: string;
}

export const DAB_REQUIRED_CASE_SECTIONS = [
  'company',
  'license',
  'shareholders',
  'management',
  'employees',
  'branches',
  'documents',
  'tax',
  'compliance',
  'applicant',
  'declaration',
] as const;

export type DabCaseSection = (typeof DAB_REQUIRED_CASE_SECTIONS)[number];

export const DAB_FORM_CATALOG: ReadonlyArray<{
  code: DabFormCode;
  title: string;
  purpose: string;
}> = [
  { code: DAB_FORM_CODES.renewal, title: 'تمدید جواز', purpose: 'ثبت و پیگیری پرونده تمدید جواز.' },
  { code: DAB_FORM_CODES.shareholder, title: 'شهرت سهمدار', purpose: 'ثبت معلومات سهمدار و مالکیت.' },
  { code: DAB_FORM_CODES.employee, title: 'شهرت کارمند', purpose: 'ثبت معلومات کارمندان مشمول بررسی.' },
  { code: DAB_FORM_CODES.branch, title: 'معلومات شعبه', purpose: 'ثبت و مدیریت شعب و نمایندگی‌ها.' },
  { code: DAB_FORM_CODES.representative, title: 'معلومات نماینده', purpose: 'ثبت نماینده باصلاحیت.' },
  { code: DAB_FORM_CODES.guarantee, title: 'تضمین سهمدار', purpose: 'ثبت معلومات تضمین و اسناد آن.' },
  { code: DAB_FORM_CODES.ownershipChange, title: 'تغییر مالکیت', purpose: 'ثبت تغییرات مالکیت و اسناد مربوط.' },
  { code: DAB_FORM_CODES.nameChange, title: 'تغییر نام', purpose: 'ثبت تغییر نام و اسناد مربوط.' },
  { code: DAB_FORM_CODES.locationChange, title: 'تغییر موقعیت', purpose: 'ثبت تغییر موقعیت و آدرس.' },
  { code: DAB_FORM_CODES.suspension, title: 'تعلیق فعالیت', purpose: 'ثبت درخواست و تصمیم تعلیق.' },
  { code: DAB_FORM_CODES.closure, title: 'ترک پیشه', purpose: 'ثبت ختم فعالیت و پرونده نهایی.' },
];

export const DAB_WORKFLOW_TRANSITIONS: ReadonlyArray<{
  from: DabCaseStatus;
  to: DabCaseStatus;
  roles: string[];
}> = [
  { from: 'draft', to: 'documents_pending', roles: ['owner', 'manager', 'admin'] },
  { from: 'documents_pending', to: 'internal_review', roles: ['owner', 'manager', 'admin'] },
  { from: 'internal_review', to: 'ready_for_submission', roles: ['compliance', 'admin'] },
  { from: 'ready_for_submission', to: 'submitted', roles: ['authorized_representative', 'admin'] },
  { from: 'submitted', to: 'under_dab_review', roles: ['admin'] },
  { from: 'under_dab_review', to: 'additional_information_requested', roles: ['admin'] },
  { from: 'under_dab_review', to: 'approved', roles: ['admin'] },
  { from: 'under_dab_review', to: 'rejected', roles: ['admin'] },
  { from: 'additional_information_requested', to: 'internal_review', roles: ['owner', 'manager', 'compliance', 'admin'] },
  { from: 'approved', to: 'completed', roles: ['admin'] },
];

export function canTransitionDabCase(from: DabCaseStatus, to: DabCaseStatus, role: string): boolean {
  return DAB_WORKFLOW_TRANSITIONS.some((item) => item.from === from && item.to === to && item.roles.includes(role));
}
