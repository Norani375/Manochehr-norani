'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Send,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Building2,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
  FileCheck,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Landmark,
  FileSpreadsheet,
  FileCode,
  Share2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Info,
  Scale,
  Sparkles,
  Lock,
  Layers
} from 'lucide-react';
import {
  ComplianceReport,
  ComplianceReportType,
  ComplianceReportStatus,
  ComplianceSeverity,
  RegulatoryDirective,
  AuthoritySubmission,
  saveComplianceReport,
  deleteComplianceReport,
  subscribeComplianceReports,
  saveRegulatoryDirective,
  deleteRegulatoryDirective,
  subscribeRegulatoryDirectives,
  saveAuthoritySubmission,
  deleteAuthoritySubmission,
  subscribeAuthoritySubmissions
} from '@/lib/firebase';
import { exportElementToPdf } from '@/lib/pdfExport';
import { exportElementToWord } from '@/lib/wordExport';

interface ComplianceReportingProps {
  customLogo?: string | null;
  companyId?: string;
  isEditMode?: boolean;
}

// Default Seed Data for Regulatory Directives
const DEFAULT_DIRECTIVES: RegulatoryDirective[] = [
  {
    id: 'DIR-DAB-1404-01',
    directiveNo: 'متحدالمال نمبر ۱۴۰۴/۱۱/۰۴',
    title: 'الزامیت ثبت هویت بیومتریک و تذکره الکترونیک در کلیه حواله‌جات بالای ۵۰,۰۰۰ افغانی',
    issuingAuthority: 'د افغانستان بانک — آمریت عمومی نظارت بر مؤسسات مالی غیربانکی',
    issueDate: '۱۴۰۴/۱۱/۰۴',
    effectiveDate: '۱۴۰۴/۱۲/۰۱',
    complianceDeadline: '۱۴۰۴/۱۲/۱۵',
    category: 'AML_CFT',
    priority: 'urgent',
    summary: 'کلیه شرکت‌های صرافی و خدمات پولی مکلف‌اند قبل از اجرای هرگونه حواله یا تبادله بالای ۵۰,۰۰۰ افغانی، هویت و تذکره الکترونیکی مشتری را احراز و نسخه آن را در سیستم دیجیتال ثبت نمایند.',
    actionItems: [
      'به‌روزرسانی فرم‌های شناسایی مشتریان (KYC) در تمام شعبات',
      'تطبیق شماره تذکره در حواله‌جات مرکز، کابل، تخار، امام‌صاحب و کشم',
      'ارسال گزارش ماهوار تطبیق به مدیریت نظارت DAB'
    ],
    companyComplianceStatus: 'compliant',
    assignedOfficer: 'محمد فهیم (مسئول رعایت قوانین)',
    notes: 'تمام شعبات به شمول نمایندگی کابل و تخار از اجرای این متحدالمال مطلع شده و چک‌لیست KYC فعال گردید.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'DIR-DAB-1404-02',
    directiveNo: 'متحدالمال نمبر ۱۴۰۴/۰۹/۱۵',
    title: 'ارسال منظم گزارش معاملات نقدی بزرگ (LCTR) تا پنجم هر ماه به آمریت FinTRACA',
    issuingAuthority: 'آمریت تحلیل معاملات و راپورهای مالی (FinTRACA) — د افغانستان بانک',
    issueDate: '۱۴۰۴/۰۹/۱۵',
    effectiveDate: '۱۴۰۴/۱۰/۰۱',
    complianceDeadline: '۱۴۰۴/۱۰/۰۵',
    category: 'REPORTING_TIMELINE',
    priority: 'high',
    summary: 'گزارش‌دهی کلیه معاملات نقدی معادل یا بالاتر از ۵۰۰,۰۰۰ افغانی باید به صورت الکترونیکی و رسمی در فرم‌های معیاری تسلیم گردد.',
    actionItems: [
      'فیلتر روزانه معاملات بالاتر از سقف ۵۰۰ هزار افغانی',
      'تنظیم راپور تجمیعی در پایان هر ماه خورشیدی',
      'اخذ تأییدیه کتبی از رئیس هیئت نظار قبل از ارسال به FinTRACA'
    ],
    companyComplianceStatus: 'compliant',
    assignedOfficer: 'محمد فهیم (مسئول رعایت قوانین)',
    notes: 'سیستم ثبت خودکار معاملات نقدی بزرگ در سامانه فعال بوده و ماهانه ارسال می‌گردد.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'DIR-DAB-1403-03',
    directiveNo: 'مصوبه شورای عالی نمبر ۱۴۰۳/۰۸/۲۲',
    title: 'حفظ حداقل کفایت سرمایه و تضمین بانکی ۵۰ میلیون افغانی شرکت‌های صرافی نوع اول',
    issuingAuthority: 'شورای عالی د افغانستان بانک',
    issueDate: '۱۴۰۳/۰۸/۲۲',
    effectiveDate: '۱۴۰۳/۰۹/۰۱',
    complianceDeadline: '۱۴۰۳/۱۲/۲۹',
    category: 'CAPITAL_REQ',
    priority: 'urgent',
    summary: 'شرکت‌های صرافی و خدمات پولی نوع اول موظف به تأمین و حفظ تضمین بانکی ۵۰,۰۰۰,۰۰۰ افغانی و سرمایه ثبت‌شده مصوب می‌باشند.',
    actionItems: [
      'تثبیت حساب تضمین در د افغانستان بانک به نام شرکت',
      'تطبیق تعهدنامه رسمی سهمدار اصلی (برکت‌الله غفوری)',
      'ارائه صورت‌حساب بانکی معتبر در زمان تمدید جواز سالانه'
    ],
    companyComplianceStatus: 'compliant',
    assignedOfficer: 'برکت‌الله غفوری (رئیس هیئت مدیره)',
    notes: 'تضمین بانکی ۵۰ میلیون افغانی در د افغانستان بانک تودیع و فورم تعهدنامه سهمدار تکمیل و تایید شده است.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'DIR-DAB-1404-04',
    directiveNo: 'رهنمود نظارتی نمبر ۱۴۰۴/۰۳/۱۰',
    title: 'برگزاری دوره‌های آموزشی مبارزه با تمویل تروریزم و پول‌شویی برای کادر خزانه‌داری',
    issuingAuthority: 'آمریت عمومی نظارت بر مؤسسات مالی غیربانکی',
    issueDate: '۱۴۰۴/۰۳/۱۰',
    effectiveDate: '۱۴۰۴/۰۴/۰۱',
    complianceDeadline: '۱۴۰۴/۰۶/۳۰',
    category: 'AML_CFT',
    priority: 'medium',
    summary: 'آموزش پرسونل شعبات پیرامون شناسایی پول‌شویی خرد (Structuring)، حواله‌جات بدون منبع موثق و الگوهای مشکوک.',
    actionItems: [
      'تدوین جزوه آموزشی AML برای خزانه‌داران نمایندگی‌ها',
      'برگزاری جلسه فصلی توجیهی برای نمایندگان تخار، کابل و امام‌صاحب',
      'ثبت گواهی اشتراک در دوسیه کارمندان'
    ],
    companyComplianceStatus: 'in_progress',
    assignedOfficer: 'محمد فهیم (مسئول رعایت قوانین)',
    notes: 'جلسه اول برگزار شد؛ دوره تکمیلی در ماه جاری برگزار خواهد گردید.',
    updatedAt: new Date().toISOString()
  }
];

// Default Seed Data for Compliance Reports
const DEFAULT_REPORTS: ComplianceReport[] = [
  {
    id: 'REP-STR-1404-001',
    reportNumber: 'DAB/COMP/STR/1404/001',
    type: 'STR',
    title: 'گزارش معامله مشکوک — حواله ارزی چندمرحله‌ای با مبالغ خرد (Structuring)',
    reportingPeriod: 'فصل چهارم ۱۴۰۴',
    date: '۱۴۰۴/۱۱/۲۰',
    status: 'submitted_to_dab',
    severity: 'high',
    complianceOfficer: 'محمد فهیم ولد محمد امان',
    branchName: 'نمایندگی کابل — سرای شهزاده',
    subjectDetails: {
      fullName: 'احمد رشاد ولد غلام سخی',
      fatherName: 'غلام سخی',
      tazkiraOrPassport: 'تذکره شماره ۷۸۴۱۲-کابل',
      phone: '0799887766',
      address: 'کابل، دشت برچی، کوچه سوم',
      nationality: 'افغان',
      occupation: 'تجارت انفرادی بدون جواز ثبت‌شده',
      tinOrBusinessReg: 'فاقد TIN',
      isPEP: false
    },
    transactionDetails: {
      amount: 45000,
      currency: 'USD',
      amountAfnEquivalent: 3150000,
      transactionDate: '۱۴۰۴/۱۱/۱۹',
      transactionType: 'international_hawala',
      originCity: 'کابل',
      destinationCity: 'دبی — امارات متحده عربی',
      receiverName: 'شرکت بازرگانی النور',
      receiverPhone: '+971501234567',
      sourceOfFunds: 'ادعای پس‌انداز شخصی بدون اسناد بانکی',
      purposeOfTransaction: 'خرید کالای تجاری اعلام‌نشده'
    },
    indicators: [
      'تلاش برای تقسیم مبلغ به ۵ تراکنش ۹,۰۰۰ دالری طی دو روز (Structuring)',
      'عدم تمایل به ارائه فاکتور یا بارنامه معتبر تجارتی',
      'ناهمخوانی گردش مالی با شغل اظهارشده مشتری'
    ],
    narrativeFindings: 'مشتری نامبرده در تاریخ ۱۹ دلو ۱۴۰۴ با مراجعه به نمایندگی کابل قصد ارسال مبلغ ۴۵,۰۰۰ دالر آمریکایی را در اقساط خرد داشت تا از شمولیت در فرم LCTR جلوگیری نماید. پس از درخواست مسئول باجه جهت ارائه فاکتور خرید یا منبع مشروع وجوه، مشتری از ارائه اسناد استنکاف ورزید. طبق ماده ۱۵ قانون مبارزه با پول‌شویی و تمویل تروریزم د افغانستان بانک، این تراکنش مشکوک ارزیابی و مراتب به آمریت FinTRACA ارسال گردید.',
    riskRating: 'high',
    actionTaken: 'تراکنش تا زمان اخذ هدایت کتبی از مراجع ذیصلاح معلق گردید و دوسیه به FinTRACA ارسال شد.',
    submissionRefNo: 'DAB-FinTRACA-IN-1404-982',
    submissionDate: '۱۴۰۴/۱۱/۲۱',
    authorityTarget: 'FinTRACA',
    attachments: ['کاپی_تذکره_مشتری.pdf', 'رسید_درخواستی_حواله.pdf'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'REP-LCTR-1404-002',
    reportNumber: 'DAB/COMP/LCTR/1404/014',
    type: 'LCTR',
    title: 'گزارش معامله نقدی بزرگ — تبادله اسعار عمده به ارزش ۲,۵۰۰,۰۰۰ افغانی',
    reportingPeriod: 'ماه جدی ۱۴۰۴',
    date: '۱۴۰۴/۱۰/۲۸',
    status: 'submitted_to_dab',
    severity: 'normal',
    complianceOfficer: 'محمد فهیم ولد محمد امان',
    branchName: 'دفتر مرکزی — ولایت کندز',
    subjectDetails: {
      fullName: 'حاجی عبدالمتین ولد نورمحمد',
      fatherName: 'نورمحمد',
      tazkiraOrPassport: 'تذکره الکترونیکی ۵۴۲۱۹۸۳',
      phone: '0700554433',
      address: 'کندز، بندر کابل، جوار مارکیت صرافی',
      nationality: 'افغان',
      occupation: 'واردکننده مواد غذایی و غلات',
      tinOrBusinessReg: 'TIN: 9004455661',
      isPEP: false
    },
    transactionDetails: {
      amount: 35000,
      currency: 'USD',
      amountAfnEquivalent: 2450000,
      transactionDate: '۱۴۰۴/۱۰/۲۸',
      transactionType: 'buy_currency',
      originCity: 'کندز',
      destinationCity: 'کندز',
      receiverName: 'خود شخص',
      receiverPhone: '0700554433',
      sourceOfFunds: 'عایدات فروش غلات و مواد خوراکه وارداتی',
      purposeOfTransaction: 'تبادله دالر به افغانی جهت تسویه حسابات دهقانان محلی'
    },
    indicators: [
      'معامله نقدی بالاتر از آستانه ۵۰۰,۰۰۰ افغانی (مشمول ماده ۱۲ مقرره LCTR)',
      'اسناد هویتی و جواز تجارتی مشتری معتبر و احراز هویت بیومتریک تکمیل گردید'
    ],
    narrativeFindings: 'معامله با رعایت کامل دستورالعمل‌های KYC انجام پذیرفت. هویت مشتری توسط تذکره الکترونیکی احراز و جواز فعالیت شرکت بازرگانی وی در سیستم ثبت شد. منبع وجوه مشروع و مستند به فاکتورهای فروش است.',
    riskRating: 'normal',
    actionTaken: 'معامله با اخذ اثر انگشت و امضا اجرا و در راپور ماهوار LCTR ثبت و به DAB ارسال گردید.',
    submissionRefNo: 'DAB-LCTR-1404-Q4-088',
    submissionDate: '۱۴۰۴/۱۱/۰۲',
    authorityTarget: 'FinTRACA',
    attachments: ['جواز_تجارت_مشتری.pdf', 'صورتحساب_تبادله.pdf'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'REP-AUDIT-1404-003',
    reportNumber: 'DAB/COMP/AUDIT/1404/004',
    type: 'AML_PERIODIC',
    title: 'راپور تفتیش داخلی و بررسی رعایت قوانین در نمایندگی‌های ولایتی',
    reportingPeriod: 'شش‌ماهه دوم سال ۱۴۰۴',
    date: '۱۴۰۴/۱۱/۱۵',
    status: 'approved',
    severity: 'medium',
    complianceOfficer: 'محمد فهیم ولد محمد امان',
    branchName: 'تمام نمایندگی‌ها (کندز، کابل، تخار، امام‌صاحب، کشم)',
    subjectDetails: {
      fullName: 'ارزیابی ساختار نظارتی شعبات شرکت صرافی برکت‌الله غفوری',
      tazkiraOrPassport: 'جواز شماره DAB/7-0965',
      phone: '0799112030',
      address: 'کندز، مومند مارکیت، منزل ۲، دکان ۳۰۱',
      nationality: 'افغان',
      occupation: 'تفتیش داخلی رسمی',
      isPEP: false
    },
    transactionDetails: {
      amount: 0,
      currency: 'AFN',
      amountAfnEquivalent: 0,
      transactionDate: '۱۴۰۴/۱۱/۱۵',
      transactionType: 'cash_deposit',
      originCity: 'مرکز',
      destinationCity: 'شعبات'
    },
    indicators: [
      'بررسی ثبت روزانه دفاتر حواله‌جات و تبادله اسعار در تمامی ۵ نمایندگی',
      'تطبیق لست مشتریان با لیست تحریم‌های بین‌المللی و د افغانستان بانک',
      'بررسی رعایت سقف‌های قانونی نگهداری نقدینگی در گاوصندوق‌ها'
    ],
    narrativeFindings: 'در نتیجه تفتیش دوره‌ای، عملکرد شعبات کندز، تخار، کابل و امام‌صاحب در وضعیت مطلوب و مطابق معیارهای د افغانستان بانک ارزیابی شد. به نمایندگی کشم بدخشان توصیه گردید سرعت اسکن و ثبت الکترونیکی تذکره مشتریان را ارتقا دهد.',
    riskRating: 'normal',
    actionTaken: 'توصیه‌نامه نظارتی صادر شد و به تصویب رئیس هیئت نظار (بسم‌الله شیرزی) رسید.',
    authorityTarget: 'DAB_NON_BANK',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Default Submissions
const DEFAULT_SUBMISSIONS: AuthoritySubmission[] = [
  {
    id: 'SUB-2026-001',
    submissionCode: 'SUB-DAB-FinTRACA-1404-112',
    reportId: 'REP-STR-1404-001',
    reportTitle: 'گزارش معامله مشکوک — حواله ارزی چندمرحله‌ای با مبالغ خرد (Structuring)',
    reportType: 'STR',
    targetAuthority: 'آمریت تحلیل معاملات و راپورهای مالی (FinTRACA) — د افغانستان بانک',
    submissionMethod: 'SECURE_DAB_PORTAL',
    submissionDate: '۱۴۰۴/۱۱/۲۱',
    officialDispatchNo: 'مکتوب نمبر BG-COMP/1404/89',
    incomingDabRefNo: 'DAB-FinTRACA-IN-1404-982',
    status: 'received_by_dab',
    receiptNotes: 'راپور به شماره ثبت ۹۸۲ در سیستم FinTRACA وصول و رسید رسمی الکترونیکی صادر گردید.',
    submittedBy: 'محمد فهیم (مسئول رعایت قوانین)',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SUB-2026-002',
    submissionCode: 'SUB-DAB-LCTR-1404-045',
    reportId: 'REP-LCTR-1404-002',
    reportTitle: 'گزارش معامله نقدی بزرگ — تبادله اسعار عمده به ارزش ۲,۵۰۰,۰۰۰ افغانی',
    reportType: 'LCTR',
    targetAuthority: 'آمریت عمومی نظارت بر مؤسسات مالی غیربانکی — د افغانستان بانک',
    submissionMethod: 'OFFICIAL_LETTER',
    submissionDate: '۱۴۰۴/۱۱/۰۲',
    officialDispatchNo: 'مکتوب نمبر BG-COMP/1404/72',
    incomingDabRefNo: 'DAB-NBFIS-1404-4412',
    status: 'accepted',
    receiptNotes: 'راپور ماهوار LCTR ماه جدی پذیرفته و در دوسیه نظارتی شرکت درج گردید.',
    submittedBy: 'محمد فهیم (مسئول رعایت قوانین)',
    updatedAt: new Date().toISOString()
  }
];

export default function ComplianceReporting({
  customLogo,
  companyId = 'default',
  isEditMode = false
}: ComplianceReportingProps) {
  // State
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'reports' | 'directives' | 'submissions' | 'view_report'>('overview');
  const [reports, setReports] = useState<ComplianceReport[]>(DEFAULT_REPORTS);
  const [directives, setDirectives] = useState<RegulatoryDirective[]>(DEFAULT_DIRECTIVES);
  const [submissions, setSubmissions] = useState<AuthoritySubmission[]>(DEFAULT_SUBMISSIONS);
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  // Modals & Active Selections
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false);
  const [isCreateDirectiveModalOpen, setIsCreateDirectiveModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [reportToSubmit, setReportToSubmit] = useState<ComplianceReport | null>(null);

  // Form State for New Report
  const [formData, setFormData] = useState<Partial<ComplianceReport>>({
    type: 'STR',
    title: '',
    severity: 'medium',
    status: 'draft',
    complianceOfficer: 'محمد فهیم ولد محمد امان',
    branchName: 'دفتر مرکزی — ولایت کندز',
    authorityTarget: 'FinTRACA',
    reportingPeriod: '۱۴۰۴',
    date: new Date().toLocaleDateString('fa-IR'),
    subjectDetails: {
      fullName: '',
      fatherName: '',
      tazkiraOrPassport: '',
      phone: '',
      address: '',
      nationality: 'افغان',
      occupation: '',
      tinOrBusinessReg: '',
      isPEP: false
    },
    transactionDetails: {
      amount: 10000,
      currency: 'USD',
      amountAfnEquivalent: 700000,
      transactionDate: new Date().toLocaleDateString('fa-IR'),
      transactionType: 'international_hawala',
      originCity: 'کندز',
      destinationCity: 'کابل',
      receiverName: '',
      receiverPhone: '',
      sourceOfFunds: '',
      purposeOfTransaction: ''
    },
    indicators: [],
    narrativeFindings: '',
    riskRating: 'medium',
    actionTaken: ''
  });

  // Form State for Directive
  const [directiveForm, setDirectiveForm] = useState<Partial<RegulatoryDirective>>({
    directiveNo: '',
    title: '',
    issuingAuthority: 'د افغانستان بانک — آمریت عمومی نظارت بر مؤسسات مالی غیربانکی',
    issueDate: new Date().toLocaleDateString('fa-IR'),
    effectiveDate: new Date().toLocaleDateString('fa-IR'),
    complianceDeadline: '',
    category: 'AML_CFT',
    priority: 'high',
    summary: '',
    actionItems: [''],
    companyComplianceStatus: 'in_progress',
    assignedOfficer: 'محمد فهیم (مسئول رعایت قوانین)',
    notes: ''
  });

  // Form State for Submission
  const [submissionForm, setSubmissionForm] = useState<{
    targetAuthority: string;
    submissionMethod: 'OFFICIAL_LETTER' | 'SECURE_DAB_PORTAL' | 'PHYSICAL_SUBMISSION' | 'EMAIL_ENCRYPTED';
    officialDispatchNo: string;
    submittedBy: string;
    receiptNotes: string;
  }>({
    targetAuthority: 'آمریت تحلیل معاملات و راپورهای مالی (FinTRACA) — د افغانستان بانک',
    submissionMethod: 'SECURE_DAB_PORTAL',
    officialDispatchNo: `BG-COMP/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
    submittedBy: 'محمد فهیم (مسئول رعایت قوانین)',
    receiptNotes: ''
  });

  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    const unsubReports = subscribeComplianceReports((data) => {
      if (data && data.length > 0) {
        setReports(data);
      }
    }, companyId);

    const unsubDirectives = subscribeRegulatoryDirectives((data) => {
      if (data && data.length > 0) {
        setDirectives(data);
      }
    }, companyId);

    const unsubSubmissions = subscribeAuthoritySubmissions((data) => {
      if (data && data.length > 0) {
        setSubmissions(data);
      }
    }, companyId);

    return () => {
      unsubReports();
      unsubDirectives();
      unsubSubmissions();
    };
  }, [companyId]);

  // Currency Conversion calculation
  const handleAmountOrCurrencyChange = (amount: number, currency: string) => {
    let rate = 70.0;
    if (currency === 'USD') rate = 70.0;
    else if (currency === 'EUR') rate = 76.5;
    else if (currency === 'PKR') rate = 0.25;
    else if (currency === 'AED') rate = 19.1;
    else if (currency === 'IRR') rate = 0.0011;
    else if (currency === 'AFN') rate = 1.0;

    const afnEq = Math.round(amount * rate);
    setFormData(prev => ({
      ...prev,
      transactionDetails: {
        ...(prev.transactionDetails || {
          amount: 0,
          currency: 'USD',
          amountAfnEquivalent: 0,
          transactionDate: '',
          transactionType: 'international_hawala',
          originCity: '',
          destinationCity: ''
        }),
        amount,
        currency,
        amountAfnEquivalent: afnEq
      }
    }));
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchSearch =
        (r.title && r.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.reportNumber && r.reportNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.subjectDetails?.fullName && r.subjectDetails.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.branchName && r.branchName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchType = typeFilter === 'ALL' || r.type === typeFilter;
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchSeverity = severityFilter === 'ALL' || r.severity === severityFilter;

      return matchSearch && matchType && matchStatus && matchSeverity;
    });
  }, [reports, searchTerm, typeFilter, statusFilter, severityFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = reports.length;
    const strCount = reports.filter(r => r.type === 'STR').length;
    const lctrCount = reports.filter(r => r.type === 'LCTR').length;
    const submittedCount = reports.filter(r => r.status === 'submitted_to_dab').length;
    const highRiskCount = reports.filter(r => r.severity === 'high' || r.severity === 'critical').length;
    const pendingDirectives = directives.filter(d => d.companyComplianceStatus !== 'compliant').length;
    return {
      total,
      strCount,
      lctrCount,
      submittedCount,
      highRiskCount,
      pendingDirectives,
      complianceScore: Math.round(((directives.length - pendingDirectives) / Math.max(directives.length, 1)) * 100)
    };
  }, [reports, directives]);

  // Handle Save New Report
  const handleSaveReport = async () => {
    if (!formData.title) {
      alert('لطفاً عنوان گزارش را وارد نمایید.');
      return;
    }

    const reportId = formData.id || `REP-${formData.type}-${Date.now()}`;
    const reportNum = formData.reportNumber || `DAB/COMP/${formData.type}/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;

    const newReport: ComplianceReport = {
      id: reportId,
      reportNumber: reportNum,
      type: (formData.type as ComplianceReportType) || 'STR',
      title: formData.title || 'گزارش نظارتی',
      reportingPeriod: formData.reportingPeriod || '۱۴۰۴',
      date: formData.date || new Date().toLocaleDateString('fa-IR'),
      status: (formData.status as ComplianceReportStatus) || 'draft',
      severity: (formData.severity as ComplianceSeverity) || 'medium',
      complianceOfficer: formData.complianceOfficer || 'محمد فهیم ولد محمد امان',
      branchName: formData.branchName || 'دفتر مرکزی — کندز',
      subjectDetails: formData.subjectDetails || {
        fullName: 'نامشخص',
        tazkiraOrPassport: '-',
        phone: '-',
        address: '-',
        nationality: 'افغان',
        occupation: '-'
      },
      transactionDetails: formData.transactionDetails || {
        amount: 0,
        currency: 'AFN',
        amountAfnEquivalent: 0,
        transactionDate: '',
        transactionType: 'cash_deposit',
        originCity: '',
        destinationCity: ''
      },
      indicators: formData.indicators || [],
      narrativeFindings: formData.narrativeFindings || '',
      riskRating: (formData.riskRating as ComplianceSeverity) || 'medium',
      actionTaken: formData.actionTaken || '',
      authorityTarget: formData.authorityTarget || 'FinTRACA',
      attachments: formData.attachments || [],
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveComplianceReport(newReport, companyId);
    setReports(prev => {
      const idx = prev.findIndex(r => r.id === newReport.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newReport;
        return copy;
      }
      return [newReport, ...prev];
    });

    setIsCreateReportModalOpen(false);
    setSelectedReport(newReport);
    setActiveSubTab('view_report');
  };

  // Handle Save Directive
  const handleSaveDirective = async () => {
    if (!directiveForm.title || !directiveForm.directiveNo) {
      alert('لطفاً شماره متحدالمال و عنوان را وارد نمایید.');
      return;
    }

    const newDirective: RegulatoryDirective = {
      id: directiveForm.id || `DIR-DAB-${Date.now()}`,
      directiveNo: directiveForm.directiveNo || 'متحدالمال نمبر ۱۴۰۴/...',
      title: directiveForm.title || '',
      issuingAuthority: directiveForm.issuingAuthority || 'د افغانستان بانک',
      issueDate: directiveForm.issueDate || new Date().toLocaleDateString('fa-IR'),
      effectiveDate: directiveForm.effectiveDate || new Date().toLocaleDateString('fa-IR'),
      complianceDeadline: directiveForm.complianceDeadline || '',
      category: directiveForm.category || 'AML_CFT',
      priority: directiveForm.priority || 'high',
      summary: directiveForm.summary || '',
      actionItems: (directiveForm.actionItems || []).filter(item => item.trim().length > 0),
      companyComplianceStatus: directiveForm.companyComplianceStatus || 'in_progress',
      assignedOfficer: directiveForm.assignedOfficer || 'محمد فهیم (مسئول رعایت قوانین)',
      notes: directiveForm.notes || '',
      updatedAt: new Date().toISOString()
    };

    await saveRegulatoryDirective(newDirective, companyId);
    setDirectives(prev => {
      const idx = prev.findIndex(d => d.id === newDirective.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newDirective;
        return copy;
      }
      return [newDirective, ...prev];
    });

    setIsCreateDirectiveModalOpen(false);
  };

  // Handle Submit to Authority
  const handleConfirmSubmission = async () => {
    if (!reportToSubmit) return;

    const submissionId = `SUB-${Date.now()}`;
    const submissionCode = `SUB-DAB-${reportToSubmit.type}-${Date.now().toString().slice(-4)}`;

    const newSub: AuthoritySubmission = {
      id: submissionId,
      submissionCode,
      reportId: reportToSubmit.id,
      reportTitle: reportToSubmit.title,
      reportType: reportToSubmit.type,
      targetAuthority: submissionForm.targetAuthority,
      submissionMethod: submissionForm.submissionMethod,
      submissionDate: new Date().toLocaleDateString('fa-IR'),
      officialDispatchNo: submissionForm.officialDispatchNo,
      incomingDabRefNo: `DAB-ACK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'submitted',
      receiptNotes: submissionForm.receiptNotes || 'گزارش به صورت رسمی ارسال شد و تأییدیه اولیه ثبت گردید.',
      submittedBy: submissionForm.submittedBy,
      updatedAt: new Date().toISOString()
    };

    // Update report status
    const updatedReport: ComplianceReport = {
      ...reportToSubmit,
      status: 'submitted_to_dab',
      submissionRefNo: newSub.incomingDabRefNo,
      submissionDate: newSub.submissionDate,
      updatedAt: new Date().toISOString()
    };

    await saveAuthoritySubmission(newSub, companyId);
    await saveComplianceReport(updatedReport, companyId);

    setSubmissions(prev => [newSub, ...prev]);
    setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));

    setIsSubmitModalOpen(false);
    setReportToSubmit(null);
    alert(`گزارش با شماره ثبت رسمی ${newSub.incomingDabRefNo} به مرجع نظارتی ارسال گردید.`);
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // PDF Export
  const handleExportPdf = async () => {
    if (!selectedReport) return;
    setIsExporting(true);
    try {
      await exportElementToPdf({
        elementId: 'compliance-report-canvas',
        filename: `${selectedReport.reportNumber.replace(/\//g, '_')}_DAB_Compliance.pdf`,
        paperSize: 'a4',
        orientation: 'portrait',
        marginMm: 10,
        qualityScale: 2.5
      });
    } catch (e) {
      console.error(e);
      alert('خطا در صدور پی دی اف');
    } finally {
      setIsExporting(false);
    }
  };

  // Word Export
  const handleExportWord = async () => {
    if (!selectedReport) return;
    await exportElementToWord({
      elementId: 'compliance-report-canvas',
      filename: `${selectedReport.reportNumber.replace(/\//g, '_')}_Compliance_Report.doc`,
      title: selectedReport.title
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 font-sans dir-rtl text-slate-900 dark:text-slate-100">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-6 relative overflow-hidden print:hidden border border-blue-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>سامانه نظارتی و اطاعت‌پذیری مقررات د افغانستان بانک (DAB / FinTRACA)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              مدیریت رعایت قوانین، تفتیش و گزارش‌دهی نظارتی
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              تولید راپورهای رسمی STR و LCTR، رهگیری لحظه‌ای متحدالمال‌های بانک مرکزی، تطبیق ضوابط مبارزه با پول‌شویی و ارسال به مراجع نظارتی.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setFormData({
                  type: 'STR',
                  title: '',
                  severity: 'high',
                  status: 'draft',
                  complianceOfficer: 'محمد فهیم ولد محمد امان',
                  branchName: 'دفتر مرکزی — ولایت کندز',
                  authorityTarget: 'FinTRACA',
                  reportingPeriod: '۱۴۰۴',
                  date: new Date().toLocaleDateString('fa-IR'),
                  subjectDetails: {
                    fullName: '',
                    fatherName: '',
                    tazkiraOrPassport: '',
                    phone: '',
                    address: '',
                    nationality: 'افغان',
                    occupation: '',
                    tinOrBusinessReg: '',
                    isPEP: false
                  },
                  transactionDetails: {
                    amount: 25000,
                    currency: 'USD',
                    amountAfnEquivalent: 1750000,
                    transactionDate: new Date().toLocaleDateString('fa-IR'),
                    transactionType: 'international_hawala',
                    originCity: 'کندز',
                    destinationCity: 'کابل'
                  },
                  indicators: [
                    'تلاش برای تقسیم تراکنش (Structuring)',
                    'استنکاف از ارائه مدارک هویتی معتبر'
                  ],
                  narrativeFindings: '',
                  riskRating: 'high',
                  actionTaken: ''
                });
                setIsCreateReportModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ایجاد راپور جدید (STR / LCTR)</span>
            </button>

            <button
              onClick={() => setIsCreateDirectiveModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-white/15 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>ثبت متحدالمال بانک مرکزی</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/10 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'داشبورد و وضعیت نظارتی', icon: Landmark },
            { id: 'reports', label: `راپورهای نظارتی (${reports.length})`, icon: FileText },
            { id: 'directives', label: `متحدالمال‌های DAB (${directives.length})`, icon: BookOpen },
            { id: 'submissions', label: `سوابق ارسال به مراجع (${submissions.length})`, icon: Send },
            ...(selectedReport ? [{ id: 'view_report', label: `مشاهده راپور: ${selectedReport.reportNumber}`, icon: Eye }] : [])
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-white text-slate-900 shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeSubTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: OVERVIEW DASHBOARD */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">مجموع راپورهای نظارتی</span>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono">{stats.total}</span>
                <span className="text-xs font-bold text-slate-500">پرونده ثبت‌شده</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <span className="text-rose-600 font-mono font-black">{stats.strCount} STR</span>
                <span>•</span>
                <span className="text-blue-600 font-mono font-black">{stats.lctrCount} LCTR</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ارسال‌شده به د افغانستان بانک</span>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <Send className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-emerald-600">{stats.submittedCount}</span>
                <span className="text-xs font-bold text-slate-500">راپور تسلیم‌شده</span>
              </div>
              <div className="mt-3 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>دارای شماره ثبت و رسیدی رسمی</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">موارد دارای ریسک بالا (High Risk)</span>
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-rose-600">{stats.highRiskCount}</span>
                <span className="text-xs font-bold text-slate-500">معامله تحت تفتیش</span>
              </div>
              <div className="mt-3 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>نیازمند گزارش به FinTRACA</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">شاخص اطاعت‌پذیری (Compliance Rate)</span>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <Scale className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-indigo-600">{stats.complianceScore}٪</span>
                <span className="text-xs font-bold text-emerald-600">عالی و استاندارد</span>
              </div>
              <div className="mt-3 text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <span>{directives.length - stats.pendingDirectives} از {directives.length} متحدالمال کاملاً اجرا شد</span>
              </div>
            </div>
          </div>

          {/* Urgent Regulatory Notices & Recent Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Recent Compliance Reports */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>آخرین راپورهای نظارتی ثبت‌شده</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">معاملات ارزی، صرافی و حواله‌جات مشمول گزارش به DAB</p>
                </div>
                <button
                  onClick={() => setActiveSubTab('reports')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>مشاهده همه</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>

              <div className="space-y-3">
                {reports.slice(0, 3).map(report => (
                  <div
                    key={report.id}
                    onClick={() => {
                      setSelectedReport(report);
                      setActiveSubTab('view_report');
                    }}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-slate-50/50 dark:bg-slate-800/30 transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          report.type === 'STR' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          report.type === 'LCTR' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {report.type}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                          {report.reportNumber}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 font-medium">{report.date}</span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {report.title}
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>شخص: <strong>{report.subjectDetails?.fullName}</strong></span>
                        <span>مبلغ: <strong>{report.transactionDetails?.amount.toLocaleString()} {report.transactionDetails?.currency}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
                        report.status === 'submitted_to_dab' ? 'bg-emerald-100 text-emerald-800' :
                        report.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {report.status === 'submitted_to_dab' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        <span>
                          {report.status === 'submitted_to_dab' ? 'ارسال‌شده به DAB' :
                           report.status === 'approved' ? 'تأیید داخلی' : 'پیش‌نویس'}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Regulatory Tracking Status */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <span>متحدالمال‌های کلیدی DAB</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ضوابط لازم‌الاجرا و مهلت تطبیق</p>
                </div>
                <button
                  onClick={() => setActiveSubTab('directives')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>مدیریت</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>

              <div className="space-y-3">
                {directives.slice(0, 3).map(dir => (
                  <div key={dir.id} className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-400">{dir.directiveNo}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        dir.companyComplianceStatus === 'compliant' ? 'bg-emerald-100 text-emerald-800' :
                        dir.companyComplianceStatus === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {dir.companyComplianceStatus === 'compliant' ? 'کاملاً منطبق' : 'در حال اقدام'}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed">
                      {dir.title}
                    </h3>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>مهلت: {dir.complianceDeadline}</span>
                      <span>مسئول: {dir.assignedOfficer.split(' ')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW: COMPLIANCE REPORTS LIST */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجو در راپورها، نام مشتری، شماره گزارش یا نمایندگی..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none"
              >
                <option value="ALL">تمام انواع راپور</option>
                <option value="STR">گزارش معاملات مشکوک (STR)</option>
                <option value="LCTR">معاملات نقدی بزرگ (LCTR)</option>
                <option value="AML_PERIODIC">تفتیش و بازرسی دوره‌ای</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none"
              >
                <option value="ALL">تمام وضعیت‌ها</option>
                <option value="draft">پیش‌نویس</option>
                <option value="approved">تأییدشده</option>
                <option value="submitted_to_dab">ارسال‌شده به DAB</option>
              </select>

              <button
                onClick={() => {
                  setFormData({
                    type: 'STR',
                    title: '',
                    severity: 'high',
                    status: 'draft',
                    complianceOfficer: 'محمد فهیم ولد محمد امان',
                    branchName: 'دفتر مرکزی — ولایت کندز',
                    authorityTarget: 'FinTRACA',
                    reportingPeriod: '۱۴۰۴',
                    date: new Date().toLocaleDateString('fa-IR'),
                    subjectDetails: {
                      fullName: '',
                      fatherName: '',
                      tazkiraOrPassport: '',
                      phone: '',
                      address: '',
                      nationality: 'افغان',
                      occupation: '',
                      tinOrBusinessReg: '',
                      isPEP: false
                    },
                    transactionDetails: {
                      amount: 10000,
                      currency: 'USD',
                      amountAfnEquivalent: 700000,
                      transactionDate: new Date().toLocaleDateString('fa-IR'),
                      transactionType: 'international_hawala',
                      originCity: 'کندز',
                      destinationCity: 'کابل'
                    },
                    indicators: [],
                    narrativeFindings: '',
                    riskRating: 'high',
                    actionTaken: ''
                  });
                  setIsCreateReportModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>راپور جدید</span>
              </button>
            </div>
          </div>

          {/* Reports Table Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black text-slate-500 dark:text-slate-400">
                    <th className="p-4">شماره راپور</th>
                    <th className="p-4">نوع راپور</th>
                    <th className="p-4">عنوان و شرح معامله</th>
                    <th className="p-4">مشخصات شخص / مشتری</th>
                    <th className="p-4">مبلغ و ارز</th>
                    <th className="p-4">شعبه</th>
                    <th className="p-4">وضعیت</th>
                    <th className="p-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                        هیچ راپور نظارتی منطبق با فیلترها یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map(report => (
                      <tr key={report.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {report.reportNumber}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            report.type === 'STR' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            report.type === 'LCTR' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {report.type}
                          </span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{report.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{report.date}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold">{report.subjectDetails?.fullName || '—'}</div>
                          <div className="text-[11px] text-slate-400">{report.subjectDetails?.phone || ''}</div>
                        </td>
                        <td className="p-4 font-mono">
                          <div className="font-bold">{report.transactionDetails?.amount.toLocaleString()} {report.transactionDetails?.currency}</div>
                          <div className="text-[10px] text-slate-400">≈ {report.transactionDetails?.amountAfnEquivalent?.toLocaleString()} AFN</div>
                        </td>
                        <td className="p-4 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {report.branchName}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                            report.status === 'submitted_to_dab' ? 'bg-emerald-100 text-emerald-800' :
                            report.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {report.status === 'submitted_to_dab' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            <span>
                              {report.status === 'submitted_to_dab' ? 'ارسال به DAB' :
                               report.status === 'approved' ? 'تأییدشده' : 'پیش‌نویس'}
                            </span>
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setActiveSubTab('view_report');
                              }}
                              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="مشاهده و چاپ رسمی"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {report.status !== 'submitted_to_dab' && (
                              <button
                                onClick={() => {
                                  setReportToSubmit(report);
                                  setIsSubmitModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                title="ارسال رسمی به د افغانستان بانک"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={async () => {
                                if (confirm('آیا از حذف این راپور اطمینان دارید؟')) {
                                  await deleteComplianceReport(report.id, companyId);
                                  setReports(prev => prev.filter(r => r.id !== report.id));
                                  if (selectedReport?.id === report.id) setSelectedReport(null);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 hover:bg-rose-100 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: REGULATORY DIRECTIVES TRACKER */}
      {activeSubTab === 'directives' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>دفتر ثبت و رهگیری بخشنامه‌ها و متحدالمال‌های د افغانستان بانک</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                اطمینان از تطبیق به‌موقع مصوبات شورای عالی DAB و آمریت نظارت بر مؤسسات مالی غیربانکی
              </p>
            </div>

            <button
              onClick={() => setIsCreateDirectiveModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت بخشنامه جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {directives.map(dir => (
              <div key={dir.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-black border border-indigo-200 dark:border-indigo-800">
                      {dir.directiveNo}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      dir.companyComplianceStatus === 'compliant' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      dir.companyComplianceStatus === 'in_progress' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {dir.companyComplianceStatus === 'compliant' ? 'تطبیق کامل شده' :
                       dir.companyComplianceStatus === 'in_progress' ? 'در جریان اقدام' : 'نیازمند اقدام فوری'}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-relaxed">
                    {dir.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {dir.summary}
                  </p>

                  {dir.actionItems && dir.actionItems.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-slate-500">اقدامات اجرایی شرکت:</div>
                      <ul className="space-y-1 text-xs">
                        {dir.actionItems.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <span>مهلت تطبیق: </span>
                    <strong className="text-slate-800 dark:text-slate-200">{dir.complianceDeadline}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        const newStatus = dir.companyComplianceStatus === 'compliant' ? 'in_progress' : 'compliant';
                        const updated = { ...dir, companyComplianceStatus: newStatus as any };
                        await saveRegulatoryDirective(updated, companyId);
                        setDirectives(prev => prev.map(d => d.id === dir.id ? updated : d));
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold transition-all"
                    >
                      تغییر وضعیت
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: AUTHORITY SUBMISSIONS LOG */}
      {activeSubTab === 'submissions' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-600" />
                  <span>سوابق ارسال و رسیدهای رسمی د افغانستان بانک / FinTRACA</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ردیابی مکاتیب صادره، شماره وارده و رسیدهای الکترونیکی تسلیم راپورها
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {submissions.map(sub => (
                <div key={sub.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-black">
                        {sub.submissionCode}
                      </span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {sub.reportTitle}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800">
                      تأیید وصول شده
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">مرجع نظارتی دریافت‌کننده:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{sub.targetAuthority}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">شماره مکتوب صادره شرکت:</span>
                      <strong className="font-mono text-slate-800 dark:text-slate-200">{sub.officialDispatchNo}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">شماره رسیدی رسمی DAB:</span>
                      <strong className="font-mono text-emerald-600 font-black">{sub.incomingDabRefNo}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">تاریخ و مسئول تسلیم:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{sub.submissionDate} — {sub.submittedBy}</strong>
                    </div>
                  </div>

                  {sub.receiptNotes && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{sub.receiptNotes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: OFFICIAL REPORT PREVIEW & PRINT CANVAS */}
      {activeSubTab === 'view_report' && selectedReport && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs print:hidden">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSubTab('reports')}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                بازگشت به لست راپورها
              </button>
              <span className="text-xs font-mono font-bold text-slate-500">
                {selectedReport.reportNumber}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ رسمی (Print)</span>
              </button>

              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-500 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'در حال صدور...' : 'خروجی PDF'}</span>
              </button>

              <button
                onClick={handleExportWord}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-500 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>خروجی Word (.docx)</span>
              </button>
            </div>
          </div>

          {/* PRINT CANVAS (Standardized for DAB / FinTRACA Official Layout) */}
          <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-200 print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto" id="compliance-report-canvas" ref={printRef}>
            
            {/* Document Official Header */}
            <div className="border-b-2 border-slate-900 pb-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-right space-y-1">
                  <div className="text-xs font-black text-slate-900">د افغانستان بانک — Da Afghanistan Bank</div>
                  <div className="text-[11px] font-bold text-slate-700">آمریت تحلیل معاملات و راپورهای مالی (FinTRACA)</div>
                  <div className="text-[11px] font-bold text-slate-700">آمریت عمومی نظارت بر مؤسسات مالی غیربانکی</div>
                </div>

                <div className="w-20 h-20 flex items-center justify-center p-1 border border-slate-300 rounded-xl">
                  {customLogo ? (
                    <img src={customLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-center font-black text-[10px] text-blue-900">
                      <div>DAB / MSP</div>
                      <div>لوگوی شرکت</div>
                    </div>
                  )}
                </div>

                <div className="text-left font-mono text-[11px] space-y-1">
                  <div>Ref: <strong>{selectedReport.reportNumber}</strong></div>
                  <div>Date: <strong>{selectedReport.date}</strong></div>
                  <div>License: <strong>DAB/7-0965</strong></div>
                </div>
              </div>

              <div className="text-center mt-4">
                <h1 className="text-xl font-black text-slate-950">
                  {selectedReport.type === 'STR' ? 'فورم رسمی گزارش معاملات مشکوک (STR)' :
                   selectedReport.type === 'LCTR' ? 'فورم رسمی گزارش معاملات نقدی بزرگ (LCTR)' :
                   'فورم تفتیش و اطاعت‌پذیری مقررات د افغانستان بانک'}
                </h1>
                <div className="text-xs font-bold text-slate-700 mt-1">
                  شرکت صرافی و خدمات پولی برکت‌الله غفوری (سهامی خاص) — جواز صرافی DAB/7-0965
                </div>
              </div>
            </div>

            {/* General Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-300 rounded-xl mb-6 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">نوعیت راپور:</span>
                <strong className="font-black text-slate-900">{selectedReport.type}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">شعبه صادرکننده:</span>
                <strong className="font-bold text-slate-900">{selectedReport.branchName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">مسئول رعایت قوانین:</span>
                <strong className="font-bold text-slate-900">{selectedReport.complianceOfficer}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">درجه ریسک نظارتی:</span>
                <strong className={`font-black uppercase ${
                  selectedReport.severity === 'high' || selectedReport.severity === 'critical' ? 'text-rose-700' : 'text-slate-900'
                }`}>{selectedReport.severity}</strong>
              </div>
            </div>

            {/* Section 1: Customer / Subject Information */}
            <div className="mb-6 space-y-2">
              <h2 className="text-sm font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-2">
                <span>بخش اول: مشخصات هویتی و مسلکی شخص / مشتری تحت نظارت</span>
              </h2>
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-100 font-bold w-1/4">اسم و ولد:</td>
                    <td className="p-2.5 w-1/4 font-bold">{selectedReport.subjectDetails?.fullName} (ولد: {selectedReport.subjectDetails?.fatherName || '—'})</td>
                    <td className="p-2.5 bg-slate-100 font-bold w-1/4">نمبر تذکره / پاسپورت:</td>
                    <td className="p-2.5 w-1/4 font-mono font-bold">{selectedReport.subjectDetails?.tazkiraOrPassport}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-100 font-bold">شماره تماس:</td>
                    <td className="p-2.5 font-mono">{selectedReport.subjectDetails?.phone}</td>
                    <td className="p-2.5 bg-slate-100 font-bold">شغل / فعالیت اقتصادی:</td>
                    <td className="p-2.5">{selectedReport.subjectDetails?.occupation}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 bg-slate-100 font-bold">سکونت و آدرس دقیق:</td>
                    <td className="p-2.5" colSpan={3}>{selectedReport.subjectDetails?.address}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 2: Transaction Details */}
            <div className="mb-6 space-y-2">
              <h2 className="text-sm font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-2">
                <span>بخش دوم: جزئیات تراکنش، مبادله ارزی یا حواله</span>
              </h2>
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-100 font-bold w-1/4">مبلغ و نوع ارز:</td>
                    <td className="p-2.5 w-1/4 font-mono font-black text-slate-900">
                      {selectedReport.transactionDetails?.amount.toLocaleString()} {selectedReport.transactionDetails?.currency}
                    </td>
                    <td className="p-2.5 bg-slate-100 font-bold w-1/4">معادل به افغانی (AFN):</td>
                    <td className="p-2.5 w-1/4 font-mono font-black text-slate-900">
                      {selectedReport.transactionDetails?.amountAfnEquivalent?.toLocaleString()} AFN
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-100 font-bold">تاریخ و نوعیت معامله:</td>
                    <td className="p-2.5">{selectedReport.transactionDetails?.transactionDate} — {selectedReport.transactionDetails?.transactionType}</td>
                    <td className="p-2.5 bg-slate-100 font-bold">مبدأ و مقصد:</td>
                    <td className="p-2.5">{selectedReport.transactionDetails?.originCity} به {selectedReport.transactionDetails?.destinationCity}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-100 font-bold">منبع اظهارشده وجوه:</td>
                    <td className="p-2.5" colSpan={3}>{selectedReport.transactionDetails?.sourceOfFunds || 'اظهار نشده / در حال تحقیق'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 bg-slate-100 font-bold">هدف معامله:</td>
                    <td className="p-2.5" colSpan={3}>{selectedReport.transactionDetails?.purposeOfTransaction || 'تجارتی / شخصی'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 3: Suspicious Indicators & Risk Factors */}
            {selectedReport.indicators && selectedReport.indicators.length > 0 && (
              <div className="mb-6 space-y-2">
                <h2 className="text-sm font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <span>بخش سوم: شاخص‌های سوءظن و علایم هشداردهنده پول‌شویی (AML Indicators)</span>
                </h2>
                <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-2 text-xs">
                  {selectedReport.indicators.map((ind, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">!</span>
                      <span className="font-bold text-slate-800">{ind}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: Compliance Officer Narrative & Analysis */}
            <div className="mb-6 space-y-2">
              <h2 className="text-sm font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-2">
                <span>بخش چهارم: شرح تفصیلی یافته‌های مسئول رعایت قوانین (Narrative Analysis)</span>
              </h2>
              <div className="p-4 bg-white border border-slate-300 rounded-xl text-xs leading-relaxed text-slate-800 min-h-[100px]">
                {selectedReport.narrativeFindings || 'شرح تفصیلی درج نگردیده است.'}
              </div>
            </div>

            {/* Section 5: Action Taken & Authority Status */}
            <div className="mb-8 space-y-2">
              <h2 className="text-sm font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-2">
                <span>بخش پنجم: اقدامات کنترلی و وضعیت ارسال به د افغانستان بانک</span>
              </h2>
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl text-xs space-y-2">
                <div><strong>اقدام انجام‌شده در صرافی: </strong>{selectedReport.actionTaken || 'تراکنش طبق مقرره DAB ثبت گردید.'}</div>
                <div><strong>مرجع نظارتی ارسال: </strong>{selectedReport.authorityTarget === 'FinTRACA' ? 'آمریت تحلیل معاملات و راپورهای مالی (FinTRACA)' : 'آمریت عمومی نظارت بر مؤسسات مالی غیربانکی'}</div>
                {selectedReport.submissionRefNo && (
                  <div className="font-mono text-emerald-800"><strong>نمبر رسیدی رسمی DAB: </strong>{selectedReport.submissionRefNo} (تاریخ: {selectedReport.submissionDate})</div>
                )}
              </div>
            </div>

            {/* Signatures & Official Seals */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-slate-900 text-center text-xs">
              <div className="space-y-12">
                <div>
                  <div className="font-black text-slate-900">محمد فهیم ولد محمد امان</div>
                  <div className="text-slate-600 font-bold">مسئول رعایت از قوانین و مقررات (Compliance Officer)</div>
                  <div className="text-[11px] text-slate-400">امضاء و تاریخ</div>
                </div>
              </div>

              <div className="space-y-12">
                <div>
                  <div className="font-black text-slate-900">برکت‌الله غفوری ولد عبدالغفور</div>
                  <div className="text-slate-600 font-bold">رئیس شرکت و سهمدار اصلی</div>
                  <div className="text-[11px] text-slate-400">امضاء، تاریخ و مهر رسمی شرکت</div>
                </div>
              </div>
            </div>

            {/* Bottom Barcode and DAB Compliance Mark */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span>DAB AML/CFT COMPLIANCE FORM — CONFIDENTIAL</span>
              <span>Barakatullah Ghafouri Money Exchange & MSP Co. (DAB/7-0965)</span>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT COMPLIANCE REPORT */}
      {isCreateReportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  ایجاد راپور جدید رعایت مقررات (DAB / FinTRACA)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ثبت رسمی معاملات مشکوک (STR)، نقدی بزرگ (LCTR) یا تفتیش داخلی
                </p>
              </div>
              <button
                onClick={() => setIsCreateReportModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Report Type & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نوعیت راپور:</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="STR">گزارش معاملات مشکوک (STR)</option>
                    <option value="LCTR">معاملات نقدی بزرگ (LCTR)</option>
                    <option value="AML_PERIODIC">تفتیش دوره‌ای مبارزه با پول‌شویی</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">شعبه صادرکننده:</label>
                  <select
                    value={formData.branchName}
                    onChange={(e) => setFormData(prev => ({ ...prev, branchName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="دفتر مرکزی — ولایت کندز">دفتر مرکزی — کندز</option>
                    <option value="نمایندگی کابل — سرای شهزاده">نمایندگی کابل</option>
                    <option value="نمایندگی ولایت تخار">نمایندگی تخار</option>
                    <option value="نمایندگی ولسوالی امام‌صاحب">نمایندگی امام‌صاحب</option>
                    <option value="نمایندگی کشم، بدخشان">نمایندگی کشم</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">مرجع ارسال در DAB:</label>
                  <select
                    value={formData.authorityTarget}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorityTarget: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="FinTRACA">آمریت FinTRACA (معاملات مشکوک و بزرگ)</option>
                    <option value="DAB_NON_BANK">آمریت عمومی نظارت بر مؤسسات مالی غیربانکی</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان رسمی گزارش:</label>
                <input
                  type="text"
                  placeholder="مثال: گزارش معامله مشکوک ارزی به ارزش ۴۵,۰۰۰ دالر آمریکایی..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                />
              </div>

              {/* Subject Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-black text-slate-900 dark:text-white">مشخصات شخص یا مشتری:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="اسم کامل شخص / شرکت"
                    value={formData.subjectDetails?.fullName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      subjectDetails: { ...(prev.subjectDetails as any), fullName: e.target.value }
                    }))}
                    className="p-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="نمبر تذکره / پاسپورت"
                    value={formData.subjectDetails?.tazkiraOrPassport}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      subjectDetails: { ...(prev.subjectDetails as any), tazkiraOrPassport: e.target.value }
                    }))}
                    className="p-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="شماره تماس"
                    value={formData.subjectDetails?.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      subjectDetails: { ...(prev.subjectDetails as any), phone: e.target.value }
                    }))}
                    className="p-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* Transaction Amount & Currency */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-black text-slate-900 dark:text-white">جزئیات مبالغ معامله:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">مبلغ:</label>
                    <input
                      type="number"
                      value={formData.transactionDetails?.amount}
                      onChange={(e) => handleAmountOrCurrencyChange(Number(e.target.value), formData.transactionDetails?.currency || 'USD')}
                      className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">نوع ارز:</label>
                    <select
                      value={formData.transactionDetails?.currency}
                      onChange={(e) => handleAmountOrCurrencyChange(formData.transactionDetails?.amount || 0, e.target.value)}
                      className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold"
                    >
                      <option value="USD">دالر آمریکایی (USD)</option>
                      <option value="AFN">افغانی (AFN)</option>
                      <option value="PKR">کلدار پاکستان (PKR)</option>
                      <option value="EUR">یورو (EUR)</option>
                      <option value="AED">درهم امارات (AED)</option>
                      <option value="IRR">تومان ایران (IRR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">معادل به افغانی (AFN):</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.transactionDetails?.amountAfnEquivalent?.toLocaleString()}
                      className="w-full p-2 rounded-xl border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono font-black text-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Narrative Findings */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  شرح تفصیلی یافته‌ها و دلایل سوءظن (Analysis & Findings):
                </label>
                <textarea
                  rows={4}
                  placeholder="دلایل سوءظن، الگوهای غیرعادی، استنکاف از ارائه اسناد یا مشاهدات مسئول رعایت..."
                  value={formData.narrativeFindings}
                  onChange={(e) => setFormData(prev => ({ ...prev, narrativeFindings: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 leading-relaxed text-xs"
                ></textarea>
              </div>

              {/* Severity & Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">سطح ریسک:</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as any, riskRating: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="normal">عادی (Normal)</option>
                    <option value="medium">متوسط (Medium)</option>
                    <option value="high">بالا (High)</option>
                    <option value="critical">بحرانی (Critical)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">اقدام صرافی:</label>
                  <input
                    type="text"
                    placeholder="مثال: تعلیق معامله، ثبت در راپور ماهوار، اطلاع به DAB..."
                    value={formData.actionTaken}
                    onChange={(e) => setFormData(prev => ({ ...prev, actionTaken: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsCreateReportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveReport}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md shadow-blue-600/20"
              >
                ذخیره و ایجاد سند رسمی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE REGULATORY DIRECTIVE */}
      {isCreateDirectiveModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                ثبت بخشنامه و متحدالمال جدید د افغانستان بانک
              </h3>
              <button onClick={() => setIsCreateDirectiveModalOpen(false)} className="text-slate-400">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">شماره متحدالمال / مصوبه:</label>
                <input
                  type="text"
                  placeholder="مثال: متحدالمال نمبر ۱۴۰۴/۱۲/۰۱"
                  value={directiveForm.directiveNo}
                  onChange={(e) => setDirectiveForm(prev => ({ ...prev, directiveNo: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">عنوان دستورالعمل:</label>
                <input
                  type="text"
                  placeholder="عنوان کامل متحدالمال یا بخشنامه..."
                  value={directiveForm.title}
                  onChange={(e) => setDirectiveForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">خلاصه ضوابط و الزامات:</label>
                <textarea
                  rows={3}
                  placeholder="شرح خلاصه الزامات نظارتی..."
                  value={directiveForm.summary}
                  onChange={(e) => setDirectiveForm(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">مهلت تطبیق:</label>
                  <input
                    type="text"
                    placeholder="مثال: ۱۴۰۴/۱۲/۲۹"
                    value={directiveForm.complianceDeadline}
                    onChange={(e) => setDirectiveForm(prev => ({ ...prev, complianceDeadline: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">وضعیت تطبیق شرکت:</label>
                  <select
                    value={directiveForm.companyComplianceStatus}
                    onChange={(e) => setDirectiveForm(prev => ({ ...prev, companyComplianceStatus: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="in_progress">در جریان اقدام</option>
                    <option value="compliant">کاملاً تطبیق شده</option>
                    <option value="action_required">نیازمند اقدام فوری</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsCreateDirectiveModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveDirective}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black"
              >
                ثبت بخشنامه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT TO AUTHORITY (DAB / FinTRACA) */}
      {isSubmitModalOpen && reportToSubmit && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    ارسال رسمی راپور به د افغانستان بانک
                  </h3>
                  <p className="text-xs text-slate-500">{reportToSubmit.reportNumber}</p>
                </div>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl text-blue-900 dark:text-blue-300 leading-relaxed font-medium">
                این عملیات شماره مکتوب صادره شرکت و شماره رسیدی رسمی در سیستم د افغانستان بانک (DAB / FinTRACA) را ایجاد و وضعیت راپور را به «ارسال‌شده» تغییر می‌دهد.
              </div>

              <div>
                <label className="block font-bold mb-1">مرجع نظارتی دریافت‌کننده:</label>
                <select
                  value={submissionForm.targetAuthority}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, targetAuthority: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="آمریت تحلیل معاملات و راپورهای مالی (FinTRACA) — د افغانستان بانک">
                    آمریت تحلیل معاملات و راپورهای مالی (FinTRACA) — د افغانستان بانک
                  </option>
                  <option value="آمریت عمومی نظارت بر مؤسسات مالی غیربانکی — د افغانستان بانک">
                    آمریت عمومی نظارت بر مؤسسات مالی غیربانکی — د افغانستان بانک
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">شماره مکتوب صادره شرکت:</label>
                  <input
                    type="text"
                    value={submissionForm.officialDispatchNo}
                    onChange={(e) => setSubmissionForm(prev => ({ ...prev, officialDispatchNo: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">روش ارسال:</label>
                  <select
                    value={submissionForm.submissionMethod}
                    onChange={(e) => setSubmissionForm(prev => ({ ...prev, submissionMethod: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="SECURE_DAB_PORTAL">پورتال الکترونیکی امن DAB</option>
                    <option value="OFFICIAL_LETTER">مکتوب رسمی کتبی</option>
                    <option value="PHYSICAL_SUBMISSION">تسلیم فیزیکی به مدیریت جوازدهی</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">ملاحظات و یادداشت ارسال:</label>
                <textarea
                  rows={2}
                  placeholder="توضیحات تکمیلی تسلیم..."
                  value={submissionForm.receiptNotes}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, receiptNotes: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmSubmission}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Send className="w-4 h-4" />
                <span>تأیید و ارسال نهایی</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
