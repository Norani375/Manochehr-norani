import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">۴۰۴ - صفحه پیدا نشد</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8">متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد.</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
      >
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}
