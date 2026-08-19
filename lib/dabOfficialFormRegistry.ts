/**
 * Registry for the official DAB licensing forms for exchange and money-service companies.
 *
 * Source: Da Afghanistan Bank, Licensing Instructions and Forms.
 * The registry stores the official form names and source references.
 * It does not claim that a custom UI is the official DAB document.
 */

export type DabOfficialFormCategory =
  | 'licensing'
  | 'company'
  | 'representative'
  | 'renewal'
  | 'compliance'
  | 'change'
  | 'suspension'
  | 'closure'
  | 'commencement';

export interface DabOfficialFormDefinition {
  id: string;
  title: string;
  category: DabOfficialFormCategory;
  sourceTitle: string;
  sourceUrl: string;
  official: true;
  printNotice: string;
}

const SOURCE_URL = 'https://www.dab.gov.af/dr/node/1949';

const make = (
  id: string,
  title: string,
  category: DabOfficialFormCategory,
): DabOfficialFormDefinition => ({
  id,
  title,
  category,
  sourceTitle: 'دستورالعمل ها و فورمه های جواز دهی — د افغانستان بانک',
  sourceUrl: SOURCE_URL,
  official: true,
  printNotice:
    'این نسخه دیجیتال برای جمع‌آوری و مدیریت معلومات است. نسخه چاپی رسمی باید با آخرین سند منتشرشده د افغانستان بانک تطبیق شود.',
});

export const DAB_OFFICIAL_FORMS: DabOfficialFormDefinition[] = [
  make('license-application', 'فورم درخواستی جواز فعالیت شرکت صرافی و خدمات پولی', 'licensing'),
  make('shareholder-employee-profile', 'شهرت سهمدار / کارمند شرکت صرافی و خدمات پولی', 'company'),
  make('articles', 'اساسنامه شرکت صرافی و خدمات پولی', 'company'),
  make('agency-establishment', 'فورم ایجاد نماینده گی و معرفی نماینده با صلاحیت برای نماینده گی شرکت صرافی و خدمات پولی', 'representative'),
  make('agency-renewal', 'فورم تمدید نماینده گی شرکت صرافی و خدمات پولی', 'renewal'),
  make('shareholder-guarantee', 'فورم تضمین سر سهمدار / سهمداران شرکت صرافی و خدمات پولی', 'compliance'),
  make('license-renewal', 'فورم درخواستی تمديد جواز شرکت صرافی و خدمات پولی', 'renewal'),
  make('aml-cft-policy', 'پالیسی مبارزه با پولشویی و تمویل تروریزم', 'compliance'),
  make('agency-closure-permit', 'فورم درخواستی ترک پیشه اجازه نامه نمایندگی شرکت صرافی و خدمات پولی', 'closure'),
  make('agency-change', 'فورم تغییرات نماینده گی شرکت های صرافی و خدمات پولی', 'change'),
  make('ownership-transfer', 'فورم درخواستی انتقال مالکیت شرکت صرافی و خدمات پولی', 'change'),
  make('name-change', 'فورم درخواستی تغییر نام شرکت صرافی و خدمات پولی', 'change'),
  make('location-change', 'فورم تغییر موقعیت شرکت های صرافی و خدمات پولی', 'change'),
  make('license-suspension', 'فورمه درخواستی تعلیق جواز شرکت صرافی و خدمات پولی', 'suspension'),
  make('agency-suspension', 'فورم درخواستی تعلیق اجازه نامه نمایندگی شرکت صرافی و خدمات پولی', 'suspension'),
  make('license-closure', 'فورم درخواستی ترک پیشه جواز فعالیت شرکت صرافی و خدمات پولی', 'closure'),
  make('agency-closure', 'فورم درخواستی ترک پیشه اجازه نامه نمایندگی شرکت صرافی و خدمات پولی', 'closure'),
  make('commencement-letter', 'مکتوب آغاز فعالیت', 'commencement'),
];

export const DAB_OFFICIAL_FORM_BY_ID = Object.fromEntries(
  DAB_OFFICIAL_FORMS.map((form) => [form.id, form]),
) as Record<string, DabOfficialFormDefinition>;

export const DAB_RENEWAL_FORM_ID = 'license-renewal';

export const DAB_RENEWAL_REQUIRED_DOCUMENTS = [
  {
    key: 'originalLicense',
    title: 'اصل جواز فعالیت',
    required: true,
    legalBasis: 'ماده ۱۵، فقره (۱)، جزء ۱',
  },
  {
    key: 'renewalFeeReceipt',
    title: 'سند پرداخت فیس درخواست تمدید جواز',
    required: true,
    legalBasis: 'ماده ۱۵، فقره (۱)، جزء ۲',
  },
  {
    key: 'taxPaymentOrClearance',
    title: 'رسید پرداخت مالیات یا تصدیق عدم باقی‌داری مالیاتی',
    required: true,
    legalBasis: 'ماده ۱۵، فقره (۱)، جزء ۳',
  },
  {
    key: 'criminalClearance',
    title: 'تصدیق عدم مسئولیت جنایی مالک و کارمندان رسمی مشمول',
    required: true,
    legalBasis: 'ماده ۱۵، فقره (۱)، جزء ۴',
  },
  {
    key: 'applicantPhotos',
    title: 'عکس درخواست‌دهنده',
    required: true,
    quantity: 3,
    legalBasis: 'ماده ۱۵، فقره (۱)، جزء ۵',
  },
  {
    key: 'updatedInitialApplicationInformation',
    title: 'معلومات و مدارک به‌روزشده درخواست اولیه در صورت تغییرات عمده',
    required: false,
    legalBasis: 'ماده ۱۵، فقره (۱)، جزء ۶',
  },
  {
    key: 'otherDabRequestedInformation',
    title: 'سایر معلومات مورد مطالبه د افغانستان بانک',
    required: false,
    legalBasis: 'ماده ۱۵، فقره (۱)، جزء ۷',
  },
] as const;
