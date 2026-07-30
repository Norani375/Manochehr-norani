'use client';

import React, { useState } from 'react';
import { Printer, Download, BookOpen, Edit2, Check, ShieldCheck } from 'lucide-react';

interface CompanyArticlesProps {
  customLogo?: string | null;
}

export default function CompanyArticles({ customLogo }: CompanyArticlesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [companyName, setCompanyName] = useState('شرکت صرافی و خدمات پولی برکت الله غفوری');
  const [address, setAddress] = useState('دوکان (301) منزل (دوم) مارکیت (مؤمند) ناحیه (3) ولایت (کندز) زون (شمالشرق)');
  const [dateStr, setDateStr] = useState('جوزا ۱۴۰۵');
  const [capital, setCapital] = useState('۳۰,۰۰۰,۰۰۰');
  const [shareholderName, setShareholderName] = useState('برکت‌الله غفوری');
  const [tazkiraId, setTazkiraId] = useState('1399-1104-55522');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 dir-rtl">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">اساسنامه شرکت صرافی و خدمات پولی</h2>
            <p className="text-xs text-slate-500">متن رسمی اساسنامه شرکت صرافی و خدمات پولی</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
              isEditing
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {isEditing ? 'ذخیره تغییرات' : 'ویرایش متن اساسنامه'}
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ و پی‌دی‌اف</span>
          </button>
        </div>
      </div>

      {/* A4 Printable Document Container */}
      <div className="bg-white text-slate-900 shadow-2xl rounded-2xl p-8 sm:p-14 border border-slate-200 print:shadow-none print:border-none print:p-0 print:w-full font-serif leading-relaxed text-sm">
        
        {/* Header / Emblem */}
        <div className="text-center space-y-3 pb-8 border-b-2 border-slate-900">
          <div className="flex items-center justify-center gap-4">
            {customLogo ? (
              <img src={customLogo} alt="Logo" className="w-16 h-16 object-contain rounded-xl shadow-md border" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
                ب.غ
              </div>
            )}
          </div>

          <div>
            {isEditing ? (
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="text-xl sm:text-2xl font-black text-center w-full border-b border-blue-500 bg-blue-50/50 py-1"
              />
            ) : (
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{companyName}</h1>
            )}
          </div>

          <div className="pt-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-700">اساسنامه شرکت صرافی و خدمات پولی برکت‌الله غفوری</h2>
          </div>

          <div className="text-xs text-slate-600 pt-2 flex flex-wrap items-center justify-center gap-4 font-sans">
            {isEditing ? (
              <div className="flex items-center gap-2 w-full max-w-xl">
                <span className="font-bold">آدرس:</span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="flex-1 border-b border-slate-400 bg-slate-50 px-2 py-0.5 text-xs"
                />
              </div>
            ) : (
              <span>آدرس دفتر مرکزی: {address}</span>
            )}
            <span className="font-semibold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              {dateStr}
            </span>
          </div>
        </div>

        {/* Document Body */}
        <div className="space-y-6 pt-6 text-justify">
          
          {/* الفصل الاول */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 bg-slate-100 p-2 rounded-lg border-r-4 border-blue-900">
              فصل اول: احکام عمومی
            </h3>

            <div className="space-y-2 pr-4">
              <p>
                <strong className="text-slate-900">ماده اول (مبنی):</strong>{' '}
                این اساسنامه به منظور تنظیم فعالیت شرکت صرافی و خدمات پولی برکت‌الله غفوری وضع گردیده است.
              </p>
              <p>
                <strong className="text-slate-900">ماده دوم (شخصیت حقوقی):</strong>{' '}
                شرکت دارای شخصیت حکمی بوده، وجایب و صلاحیت‌های آن مطابق احکام قانون بخش صرافان و خدمات پولی و این اساسنامه تنظیم می‌گردد.
              </p>
              <p>
                <strong className="text-slate-900">ماده سوم (هدف):</strong>{' '}
                هدف شرکت ارایه خدمات باکیفیت برای مشتریان در زمینه تبادله اسعار و انتقال پول می‌باشد.
              </p>
            </div>
          </div>

          {/* الفصل دوم */}
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-bold text-slate-900 bg-slate-100 p-2 rounded-lg border-r-4 border-blue-900">
              فصل دوم: تشکیلات، مسئولیت‌ها و صلاحیت‌ها
            </h3>

            <div className="space-y-3 pr-4">
              <p>
                <strong className="text-slate-900">ماده چهارم (تشکیلات):</strong>{' '}
                ساختار تشکیلاتی شرکت، متشکل از مجمع عمومی سهمداران، هیئت نظار، هیئت عامل / مسئول عملیاتی و مسئول رعایت و پیروی از قوانین و مقررات (Compliance) می‌باشد.
              </p>
              <p>
                <strong className="text-slate-900">ماده پنجم (مجمع عمومی سهمداران):</strong>{' '}
                مجمع عمومی سهمداران بلندترین مرجع تصمیم‌گیری در شرکت می‌باشد که مطابق وظایف و صلاحیت‌های تفویض‌شده حسب قانون و طرزالعمل مربوطه، اجراآت می‌نمایند.
              </p>
              <p>
                <strong className="text-slate-900">ماده ششم (تدویر جلسات مجمع عمومی سهمداران):</strong>{' '}
                جلسات مجمع عمومی سهمداران در اخیر هر سال صورت می‌گیرد. اما نظر به لزوم‌دید هیئت نظار به منظور حل چالش‌های شرکت، جلسات مجمع عمومی سهمداران دایر شده می‌تواند.
              </p>
              
              <div>
                <strong className="text-slate-900 block mb-2">ماده هفتم (سهام):</strong>
                <p className="mb-2">سهام شرکت به ترتیب ذیل توسط شرکای آتی تأمین می‌گردد:</p>
                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-center border-collapse text-xs font-sans">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                        <th className="p-2 border-l border-slate-300">شماره</th>
                        <th className="p-2 border-l border-slate-300">اسم</th>
                        <th className="p-2 border-l border-slate-300">ولد</th>
                        <th className="p-2 border-l border-slate-300">فیصدی سهم</th>
                        <th className="p-2 border-l border-slate-300">مقدار سرمایه (افغانی)</th>
                        <th className="p-2 border-l border-slate-300">نمبر تذکره</th>
                        <th className="p-2">امضا / شصت</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 border-l border-slate-200">۱</td>
                        <td className="p-2 border-l border-slate-200 font-bold">
                          {isEditing ? (
                            <input
                              type="text"
                              value={shareholderName}
                              onChange={(e) => setShareholderName(e.target.value)}
                              className="w-full border px-1 text-center"
                            />
                          ) : (
                            shareholderName
                          )}
                        </td>
                        <td className="p-2 border-l border-slate-200">عبدالغفور</td>
                        <td className="p-2 border-l border-slate-200 font-bold text-blue-800">100%</td>
                        <td className="p-2 border-l border-slate-200">
                          {isEditing ? (
                            <input
                              type="text"
                              value={capital}
                              onChange={(e) => setCapital(e.target.value)}
                              className="w-full border px-1 text-center"
                            />
                          ) : (
                            capital
                          )}
                        </td>
                        <td className="p-2 border-l border-slate-200 font-mono">
                          {isEditing ? (
                            <input
                              type="text"
                              value={tazkiraId}
                              onChange={(e) => setTazkiraId(e.target.value)}
                              className="w-full border px-1 text-center font-mono"
                            />
                          ) : (
                            tazkiraId
                          )}
                        </td>
                        <td className="p-2 h-10"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="pt-2">
                <strong className="text-slate-900">ماده هشتم (هیئت نظار، هیئت عامل / مسئول عملیاتی):</strong>{' '}
                وظایف و مسئولیت‌های هیئت نظار، عامل / مسئول عملیاتی در اسناد تقنینی شرکت‌های صرافی و خدمات پولی مشخص گردیده است و کارکنان مربوطه مکلف به تطبیق آن می‌باشند.
              </p>
            </div>
          </div>

          {/* الفصل سوم */}
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-bold text-slate-900 bg-slate-100 p-2 rounded-lg border-r-4 border-blue-900">
              فصل سوم: امور مالی
            </h3>

            <div className="space-y-3 pr-4">
              <p>
                <strong className="text-slate-900">ماده نهم (حسابداری و تنظیم امور مالی):</strong>
              </p>
              <ul className="list-decimal list-inside space-y-1.5 pr-4 text-xs sm:text-sm">
                <li>سال مالی شرکت از اول ماه حمل الی آخر ماه حوت سال هجری شمسی می‌باشد.</li>
                <li>امور مالی شرکت بصورت مرکزی اداره و ذریعه بیلانس مشخص مطابق معیارهای قبول‌شده، با در نظرداشت سیستم، تنظیم می‌گردد.</li>
                <li>امور مالی در صورت ضرورت شرکت صرافی و خدمات پولی از طرف یک نهاد خصوصی بی‌طرف مطابق معیارهای قبول‌شده بررسی می‌گردد. تعیین و توظیف چنین مؤسسه حسابی توسط هیأت نظار شرکت صورت می‌گیرد.</li>
                <li>منابع مالی شرکت سرمایه شخصی سهمدار / سهمداران می‌باشد.</li>
              </ul>

              <p className="pt-1">
                <strong className="text-slate-900">ماده دهم (امور حسابی):</strong>
              </p>
              <ul className="list-decimal list-inside space-y-1.5 pr-4 text-xs sm:text-sm">
                <li>به منظور حسابدهی معیاری، شرکت دارای صورت‌حساب‌های مالی (بیلانس شیت، حساب مفاد و ضرر) می‌باشد؛</li>
                <li>دوره حسابی حداقل بصورت دوره‌ای و حداکثر یک‌سال می‌باشد. جهت شفافیت معاملات و حسابدهی دقیق؛ این شرکت دارای سیستم الکترونیکی مرکزی که با نمایندگی‌ها وصل است، می‌باشد.</li>
                <li>حفظ و نگهداری اسناد و دفاتر مطابق معیارهای قبول‌شده صورت می‌گیرد.</li>
                <li>در غیاب رئیس / مسئول عملیاتی، مسئول رعایت و پیروی از قوانین و مقررات به حیث آمر اعطا، مطابق صلاحیت و حدود تعیین‌شده عمل می‌کند.</li>
                <li>برداشت و انتقال پول از حسابات بانکی به امضا سهمدار / سهمداران و یا نماینده باصلاحیت آن که کارمند شرکت می‌باشد، صورت می‌گیرد.</li>
              </ul>

              <p className="pt-1">
                <strong className="text-slate-900">ماده یازدهم (شرایط انحلال و تزریق سرمایه):</strong>{' '}
                سهمدار / سهمداران شرکت صرافی و خدمات پولی مکلف‌اند طبق شرایط اسناد تقنینی بخش صرافی و خدمات پولی در قسمت انحلال، تعلیق، تزریق سرمایه و سایر امور مربوطه اجراآت لازم را مرعی بدارند.
              </p>
            </div>
          </div>

          {/* الفصل چهارم */}
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-bold text-slate-900 bg-slate-100 p-2 rounded-lg border-r-4 border-blue-900">
              فصل چهارم: احکام متفرقه
            </h3>

            <div className="space-y-3 pr-4">
              <p>
                <strong className="text-slate-900">ماده دوازدهم (احکام متفرقه):</strong>
              </p>
              <ul className="list-decimal list-inside space-y-1.5 pr-4 text-xs sm:text-sm">
                <li>اوقات کار و رخصتی‌های کارمندان اداری و کارگران شرکت، مطابق قانون کار افغانستان در پالیسی منابع بشری تشریح می‌گردد.</li>
                <li>مسئول رعایت و پیروی از قوانین و مقررات / شخص مسئول، جرایم مشهود را که در داخل شرکت اتفاق می‌افتد، به مراجع ذیربط اطلاع دهند.</li>
                <li>هرگاه اشخاص، شرکت‌ها و مؤسسات ثالث علیه شرکت عارض گردند، نخست به مذاکره و حل مسالمت‌آمیز مسئله از طریق اتحادیه مربوطه پرداخته می‌شود و در صورت عدم حل، موضوع به ادارات عدلی و قضایی ارسال می‌گردد.</li>
                <li>شرکت مهر و نشان خاص دارد که از جانب هیئت نظار تصویب شده و نزد مسئول عملیاتی نگهداری می‌شود.</li>
              </ul>

              <p className="pt-2 text-justify">
                این اساسنامه در صورت تغییرات در ساختار شرکت حسب ضرورت و لزوم‌دید تعدیل می‌گردد و بعد از منظوری سهمداران به د افغانستان بانک ارسال می‌گردد.
              </p>
            </div>
          </div>

          {/* Signatures & Stamps Footer */}
          <div className="pt-12 mt-8 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-6">
              <p className="font-bold text-slate-800">تأیید و امضای سهمدار / رئیس شرکت</p>
              <div className="pt-4 border-b border-dashed border-slate-400 pb-2">
                <span className="font-bold text-slate-900">{shareholderName}</span>
              </div>
              <p className="text-slate-500 font-sans">تذکره: {tazkiraId}</p>
            </div>

            <div className="space-y-6">
              <p className="font-bold text-slate-800">مهر و امضای هیئت نظار / د افغانستان بانک</p>
              <div className="pt-4 border-b border-dashed border-slate-400 pb-2">
                <span className="text-slate-400">(مهر و امضا)</span>
              </div>
              <p className="text-slate-500 font-sans">تاریخ: {dateStr}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
