import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'settings', 'connection_test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firestore is offline or uninitialized.');
    }
  }
}

export interface PersonnelNode {
  id: string;
  name: string;
  title: string;
  category: 'president' | 'board' | 'operations' | 'compliance' | 'branch' | 'executive';
  key: string;
}

export interface CompanySettings {
  issueDate: string;
  customLogo?: string | null;
}

// Sync all personnel to Firestore
export async function savePersonnelToFirestore(personnelList: PersonnelNode[], companyId: string = 'default') {
  const path = `companies/${companyId}/personnel`;
  try {
    for (const p of personnelList) {
      await setDoc(doc(db, path, p.key), {
        id: p.id,
        name: p.name,
        title: p.title,
        category: p.category,
        key: p.key
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Save single node update
export async function saveSinglePersonnelToFirestore(p: PersonnelNode, companyId: string = 'default') {
  const path = `companies/${companyId}/personnel/${p.key}`;
  try {
    await setDoc(doc(db, `companies/${companyId}/personnel`, p.key), {
      id: p.id,
      name: p.name,
      title: p.title,
      category: p.category,
      key: p.key
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete single node
export async function deletePersonnelFromFirestore(key: string, companyId: string = 'default') {
  const path = `companies/${companyId}/personnel/${key}`;
  try {
    await deleteDoc(doc(db, `companies/${companyId}/personnel`, key));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Save company settings
export async function saveSettingsToFirestore(settings: Partial<CompanySettings>, companyId: string = 'default') {
  const path = `companies/${companyId}/settings/company`;
  try {
    await setDoc(doc(db, `companies/${companyId}/settings`, 'company'), {
      issueDate: settings.issueDate,
      customLogo: settings.customLogo || null
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Subscribe to real-time personnel updates
export function subscribePersonnel(callback: (list: PersonnelNode[]) => void, companyId: string = 'default') {
  const path = `companies/${companyId}/personnel`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: PersonnelNode[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.key && data.id && data.name && data.title && data.category) {
          list.push({
            id: data.id,
            name: data.name,
            title: data.title,
            category: data.category,
            key: data.key
          });
        }
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Subscribe to real-time settings updates
export function subscribeSettings(callback: (settings: CompanySettings) => void, companyId: string = 'default') {
  const path = `companies/${companyId}/settings/company`;
  return onSnapshot(
    doc(db, `companies/${companyId}/settings`, 'company'),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          issueDate: data.issueDate || '۱۴۰۴/۰۱/۰۱',
          customLogo: data.customLogo || null
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Employee Record Interface
export interface EmployeeRecord {
  id: string;
  fullName: string;
  fatherName: string;
  grandfatherName: string;
  position: string;
  tazkiraNo: string;
  education: string;
  experience: string;
  phone: string;
  tin: string;
  email: string;
  photo?: string | null;
  signature?: string | null;
  formDate: string;
  updatedAt: string;
}

// Save employee record
export async function saveEmployee(employee: EmployeeRecord, companyId: string = 'default') {
  const path = `companies/${companyId}/employees/${employee.id}`;
  try {
    await setDoc(doc(db, `companies/${companyId}/employees`, employee.id), {
      ...employee,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete employee record
export async function deleteEmployee(id: string, companyId: string = 'default') {
  const path = `companies/${companyId}/employees/${id}`;
  try {
    await deleteDoc(doc(db, `companies/${companyId}/employees`, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscribe to employees
export function subscribeEmployees(callback: (employees: EmployeeRecord[]) => void, companyId: string = 'default') {
  const path = `companies/${companyId}/employees`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: EmployeeRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as EmployeeRecord);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Default Employee Data for Seeding
export const DEFAULT_EMPLOYEES: EmployeeRecord[] = [
  {
    id: 'EMP-001',
    fullName: 'برکت‌الله غفوری',
    fatherName: 'عبدالغفور',
    grandfatherName: '',
    position: 'سهمدار و رئیس هیئت مدیره',
    tazkiraNo: '1399-1104-55522',
    education: 'لیسانس کامپیوتر ساینس',
    experience: 'مدیریت ارشد شرکت و سهمدار اصلی.',
    phone: '0799112030',
    tin: '9003365203',
    email: 'b.ghafouri@exchange.af',
    photo: null,
    signature: null,
    formDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'EMP-002',
    fullName: 'بسم‌الله شیرزی',
    fatherName: 'دوست‌محمد',
    grandfatherName: '',
    position: 'رئیس هیئت نظار',
    tazkiraNo: '45188',
    education: 'لیسانس ادبیات پشتو',
    experience: 'نظارت بر امور داخلی و اداری.',
    phone: '0788223040',
    tin: '9005155800',
    email: 'bismillah.shirzai@exchange.af',
    photo: null,
    signature: null,
    formDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'EMP-003',
    fullName: 'برکت‌الله غفوری',
    fatherName: 'عبدالغفور',
    grandfatherName: '',
    position: 'عضو هیئت نظار',
    tazkiraNo: '1399-1104-55522',
    education: 'لیسانس اقتصاد',
    experience: 'کارشناس امور اقتصادی و نظارت.',
    phone: '0799112030',
    tin: '9003365203',
    email: 'b.ghafouri@exchange.af',
    photo: null,
    signature: null,
    formDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'EMP-004',
    fullName: 'عظیم‌الله رحمانی',
    fatherName: 'محمد آجان',
    grandfatherName: '',
    position: 'عضو هیئت نظار',
    tazkiraNo: '35806',
    education: 'لیسانس حقوق و علوم سیاسی',
    experience: 'متخصص در امور حقوقی و نظارت.',
    phone: '0777334050',
    tin: '9020613858',
    email: 'azim.rahmani@exchange.af',
    photo: null,
    signature: null,
    formDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'EMP-005',
    fullName: 'محمد فهیم',
    fatherName: 'محمد امان',
    grandfatherName: '',
    position: 'مسئول رعایت از قانون و مقررات',
    tazkiraNo: '97484',
    education: 'لیسانس ادبیات دری',
    experience: 'مدیریت اطاعت‌پذیری و رعایت مقررات DAB.',
    phone: '0785445060',
    tin: '',
    email: 'compliance@exchange.af',
    photo: null,
    signature: null,
    formDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'EMP-006',
    fullName: 'صالح‌محمد',
    fatherName: 'عبدالرحیم',
    grandfatherName: '',
    position: 'مسئول عملیاتی',
    tazkiraNo: '48424',
    education: 'لیسانس حقوق و علوم سیاسی',
    experience: 'مدیریت عملیاتی و اجرایی شرکت.',
    phone: '0790556070',
    tin: '9020613858',
    email: 'operations@exchange.af',
    photo: null,
    signature: null,
    formDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'EMP-007',
    fullName: 'رحمت‌الله',
    fatherName: 'فیض‌الله',
    grandfatherName: '',
    position: 'نماینده تخار',
    tazkiraNo: '29384',
    education: 'فارغ صنف 12 عمومی',
    experience: 'مسئول نمایندگی ولایت تخار.',
    phone: '0701654321',
    tin: '',
    email: 'takhar.branch@exchange.af',
    photo: null,
    signature: null,
    formDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'EMP-008',
    fullName: 'عبید‌الله',
    fatherName: 'نصر‌الله',
    grandfatherName: '',
    position: 'خزانه دار تخار',
    tazkiraNo: '48392',
    education: 'فارغ صنف 12 عمومی',
    experience: 'امور خزانه‌داری در نمایندگی تخار.',
    phone: '',
    tin: '',
    email: '',
    photo: null,
    signature: null,
    formDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'EMP-009',
    fullName: 'اجمل احمدی',
    fatherName: 'نورآغا',
    grandfatherName: '',
    position: 'نماینده کابل',
    tazkiraNo: '46338',
    education: 'فارغ صنف 12 عمومی',
    experience: 'مسئول نمایندگی پایتخت (کابل).',
    phone: '0700123456',
    tin: '',
    email: 'kabul.branch@exchange.af',
    photo: null,
    signature: null,
    formDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'EMP-010',
    fullName: 'ریحان',
    fatherName: 'شیرآغا',
    grandfatherName: '',
    position: 'عضو نمایندگی کابل',
    tazkiraNo: '12345',
    education: 'فارغ صنف 12 عمومی',
    experience: 'فعالیت در بخش خدمات مشتریان کابل.',
    phone: '',
    tin: '',
    email: '',
    photo: null,
    signature: null,
    formDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'EMP-011',
    fullName: 'صدیق‌الله',
    fatherName: 'حبیب‌الله',
    grandfatherName: '',
    position: 'منشی و خزانه دار کابل',
    tazkiraNo: '67890',
    education: 'فارغ صنف 12 عمومی',
    experience: 'امور اداری و خزانه‌داری مرکز.',
    phone: '',
    tin: '',
    email: '',
    photo: null,
    signature: null,
    formDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'EMP-012',
    fullName: 'محمد‌يوسف',
    fatherName: 'عبدالمجید',
    grandfatherName: '',
    position: 'نماینده امام صاحب',
    tazkiraNo: '98680',
    education: 'فارغ صنف 12 عمومی',
    experience: 'مسئول نمایندگی ولسوالی امام صاحب.',
    phone: '0703456789',
    tin: '',
    email: 'imamsaheb.branch@exchange.af',
    photo: null,
    signature: null,
    formDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'EMP-013',
    fullName: 'عبدالمجید',
    fatherName: 'محمد‌يوسف',
    grandfatherName: '',
    position: 'خزانه دار امام صاحب',
    tazkiraNo: '54321',
    education: 'فارغ صنف 12 عمومی',
    experience: 'امور مالی و خزانه‌داری امام صاحب.',
    phone: '',
    tin: '',
    email: '',
    photo: null,
    signature: null,
    formDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'EMP-014',
    fullName: 'عتیق‌الله',
    fatherName: 'شمس‌الدین',
    grandfatherName: '',
    position: 'نماینده کشم',
    tazkiraNo: '7252',
    education: 'فارغ صنف 12 عمومی',
    experience: 'مسئول نمایندگی ولسوالی کشم.',
    phone: '0702987654',
    tin: '',
    email: 'keshem.branch@exchange.af',
    photo: null,
    signature: null,
    formDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  }
];

// Save multiple employees (seeding)
export async function seedEmployees(employees: EmployeeRecord[], companyId: string = 'default') {
  try {
    for (const emp of employees) {
      await setDoc(doc(db, `companies/${companyId}/employees`, emp.id), {
        ...emp,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

// ----------------------------------------------------
// Compliance & Regulatory Reporting Models and Methods
// ----------------------------------------------------

export type ComplianceReportType = 'STR' | 'LCTR' | 'AML_PERIODIC' | 'SANCTIONS_AUDIT' | 'KYC_RISK_AUDIT';
export type ComplianceReportStatus = 'draft' | 'under_review' | 'approved' | 'submitted_to_dab' | 'archived';
export type ComplianceSeverity = 'normal' | 'medium' | 'high' | 'critical';

export interface SubjectDetails {
  fullName: string;
  fatherName?: string;
  tazkiraOrPassport: string;
  phone: string;
  address: string;
  nationality: string;
  occupation: string;
  tinOrBusinessReg?: string;
  isPEP?: boolean;
}

export interface TransactionDetails {
  amount: number;
  currency: string;
  amountAfnEquivalent: number;
  transactionDate: string;
  transactionType: 'buy_currency' | 'sell_currency' | 'domestic_remittance' | 'international_hawala' | 'cash_deposit';
  originCity: string;
  destinationCity: string;
  receiverName?: string;
  receiverPhone?: string;
  sourceOfFunds?: string;
  purposeOfTransaction?: string;
}

export interface ComplianceReport {
  id: string;
  reportNumber: string;
  type: ComplianceReportType;
  title: string;
  reportingPeriod: string;
  date: string;
  status: ComplianceReportStatus;
  severity: ComplianceSeverity;
  complianceOfficer: string;
  branchName: string;
  subjectDetails: SubjectDetails;
  transactionDetails: TransactionDetails;
  indicators: string[];
  narrativeFindings: string;
  riskRating: ComplianceSeverity;
  actionTaken: string;
  submissionRefNo?: string;
  submissionDate?: string;
  authorityTarget: 'DAB_NON_BANK' | 'FinTRACA' | 'GENERAL_SUPERVISION';
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RegulatoryDirective {
  id: string;
  directiveNo: string;
  title: string;
  issuingAuthority: string;
  issueDate: string;
  effectiveDate: string;
  complianceDeadline: string;
  category: 'AML_CFT' | 'CAPITAL_REQ' | 'BRANCH_RULES' | 'SANCTIONS' | 'REPORTING_TIMELINE' | 'TECH_SYSTEMS';
  priority: 'urgent' | 'high' | 'medium' | 'normal';
  summary: string;
  actionItems: string[];
  companyComplianceStatus: 'compliant' | 'in_progress' | 'action_required' | 'under_review';
  assignedOfficer: string;
  notes: string;
  updatedAt: string;
}

export interface AuthoritySubmission {
  id: string;
  submissionCode: string;
  reportId: string;
  reportTitle: string;
  reportType: ComplianceReportType;
  targetAuthority: string;
  submissionMethod: 'OFFICIAL_LETTER' | 'SECURE_DAB_PORTAL' | 'PHYSICAL_SUBMISSION' | 'EMAIL_ENCRYPTED';
  submissionDate: string;
  officialDispatchNo: string;
  incomingDabRefNo?: string;
  status: 'submitted' | 'received_by_dab' | 'clarification_requested' | 'accepted' | 'closed';
  receiptNotes?: string;
  submittedBy: string;
  updatedAt: string;
}

// Compliance Reports CRUD
export async function saveComplianceReport(report: ComplianceReport, companyId: string = 'default') {
  const path = `companies/${companyId}/compliance_reports/${report.id}`;
  try {
    await setDoc(doc(db, `companies/${companyId}/compliance_reports`, report.id), {
      ...report,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteComplianceReport(id: string, companyId: string = 'default') {
  const path = `companies/${companyId}/compliance_reports/${id}`;
  try {
    await deleteDoc(doc(db, `companies/${companyId}/compliance_reports`, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeComplianceReports(callback: (reports: ComplianceReport[]) => void, companyId: string = 'default') {
  const path = `companies/${companyId}/compliance_reports`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: ComplianceReport[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as ComplianceReport);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Regulatory Directives CRUD
export async function saveRegulatoryDirective(directive: RegulatoryDirective, companyId: string = 'default') {
  const path = `companies/${companyId}/regulatory_directives/${directive.id}`;
  try {
    await setDoc(doc(db, `companies/${companyId}/regulatory_directives`, directive.id), {
      ...directive,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteRegulatoryDirective(id: string, companyId: string = 'default') {
  const path = `companies/${companyId}/regulatory_directives/${id}`;
  try {
    await deleteDoc(doc(db, `companies/${companyId}/regulatory_directives`, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeRegulatoryDirectives(callback: (directives: RegulatoryDirective[]) => void, companyId: string = 'default') {
  const path = `companies/${companyId}/regulatory_directives`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: RegulatoryDirective[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as RegulatoryDirective);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Authority Submissions CRUD
export async function saveAuthoritySubmission(submission: AuthoritySubmission, companyId: string = 'default') {
  const path = `companies/${companyId}/regulatory_submissions/${submission.id}`;
  try {
    await setDoc(doc(db, `companies/${companyId}/regulatory_submissions`, submission.id), {
      ...submission,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAuthoritySubmission(id: string, companyId: string = 'default') {
  const path = `companies/${companyId}/regulatory_submissions/${id}`;
  try {
    await deleteDoc(doc(db, `companies/${companyId}/regulatory_submissions`, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeAuthoritySubmissions(callback: (submissions: AuthoritySubmission[]) => void, companyId: string = 'default') {
  const path = `companies/${companyId}/regulatory_submissions`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: AuthoritySubmission[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as AuthoritySubmission);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}
