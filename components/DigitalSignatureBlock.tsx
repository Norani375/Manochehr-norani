'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Stamp, Edit3, Trash2, Check, RefreshCw, Upload, ShieldCheck, 
  QrCode, Key, Calendar, Building2, CheckCircle2, Lock, FileCheck
} from 'lucide-react';

interface DigitalSignatureBlockProps {
  documentTitle?: string;
  defaultSignatoryName?: string;
  defaultSignatoryTitle?: string;
  documentCode?: string;
  customLogo?: string | null;
  onOpenLogoModal?: () => void;
  storageKey?: string;
}

export default function DigitalSignatureBlock({
  documentTitle = 'سند رسمی صرافی برکت‌الله غفوری',
  defaultSignatoryName = 'برکت‌الله ولد عبدالغفور',
  defaultSignatoryTitle = 'رئیس شرکت صرافی و خدمات پولی برکت‌الله غفوری',
  documentCode = 'DAB/7-0965-SEC',
  customLogo = null,
  onOpenLogoModal,
  storageKey = 'bg_dab_digital_signature'
}: DigitalSignatureBlockProps) {
  const [signatoryName, setSignatoryName] = useState<string>(defaultSignatoryName);
  const [signatoryTitle, setSignatoryTitle] = useState<string>(defaultSignatoryTitle);
  const [signDate, setSignDate] = useState<string>('۱۴۰۴/۰۱/۱۵');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [showOfficialStamp, setShowOfficialStamp] = useState<boolean>(true);
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>('#0b2545'); // Deep navy ink
  const [penWidth, setPenWidth] = useState<number>(2.5);
  const [isSigned, setIsSigned] = useState<boolean>(true);
  const [isEditingMeta, setIsEditingMeta] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Derive verification hash deterministically / smoothly
  const verificationHash = React.useMemo(() => {
    const codePart = (documentCode || 'DAB-001').replace(/[^a-zA-Z0-9]/g, '');
    const namePart = (signatoryName || 'DAB').substring(0, 6).toUpperCase();
    return `DAB-VERIFY-${codePart}-${namePart}-965`;
  }, [documentCode, signatoryName]);

  // Save changes to localStorage
  const saveSignatureData = React.useCallback((newImg: string | null) => {
    if (typeof window !== 'undefined') {
      try {
        const payload = {
          signatureImage: newImg,
          signatoryName,
          signatoryTitle,
          signDate,
          showOfficialStamp,
          showQrCode,
          verificationHash,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch (e) {
        console.error('Failed to save signature:', e);
      }
    }
  }, [storageKey, signatoryName, signatoryTitle, signDate, showOfficialStamp, showQrCode, verificationHash]);

  // Generate standard cursive digital signature sample
  const generateSampleSignature = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw stylized signature curves
    ctx.beginPath();
    ctx.moveTo(30, 70);
    ctx.bezierCurveTo(70, 20, 110, 110, 150, 40);
    ctx.bezierCurveTo(180, 10, 220, 90, 260, 50);
    ctx.stroke();

    // Underline decorative loop
    ctx.beginPath();
    ctx.moveTo(20, 85);
    ctx.quadraticCurveTo(150, 105, 280, 80);
    ctx.stroke();

    // Small dot/accent
    ctx.beginPath();
    ctx.arc(265, 35, 3, 0, Math.PI * 2);
    ctx.fillStyle = penColor;
    ctx.fill();

    const dataUrl = canvas.toDataURL('image/png');
    setSignatureImage(dataUrl);
    setIsSigned(true);
    saveSignatureData(dataUrl);
  }, [penColor, saveSignatureData]);

  // Load persisted signature from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.signatureImage) setSignatureImage(parsed.signatureImage);
            if (parsed.signatoryName) setSignatoryName(parsed.signatoryName);
            if (parsed.signatoryTitle) setSignatoryTitle(parsed.signatoryTitle);
            if (parsed.signDate) setSignDate(parsed.signDate);
            if (parsed.showOfficialStamp !== undefined) setShowOfficialStamp(parsed.showOfficialStamp);
            if (parsed.showQrCode !== undefined) setShowQrCode(parsed.showQrCode);
          } else {
            // Generate default sample signature on canvas if empty
            generateSampleSignature();
          }
        } catch (e) {
          console.error('Failed to load saved signature:', e);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [storageKey, generateSampleSignature]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e.nativeEvent as MouseEvent).offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e.nativeEvent as MouseEvent).offsetY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        setSignatureImage(dataUrl);
        setIsSigned(true);
        saveSignatureData(dataUrl);
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignatureImage(null);
    setIsSigned(false);
    saveSignatureData(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSignatureImage(result);
        setIsSigned(true);
        saveSignatureData(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t-2 border-slate-900 dir-rtl print:border-slate-800">
      
      {/* Interactive Controls Header (hidden during print) */}
      <div className="bg-slate-900 text-white p-3 sm:p-4 rounded-xl mb-4 print:hidden shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-amber-300">ماژول امضا و مهر دیجیتالی رسمی (DAB Verified)</span>
            <p className="text-[11px] text-slate-300 mt-0.5">ثبت امضا، مهر اختصاصی و کد احراز هویت الکترونیکی جهت افزایش اعتبار حقوقی سند</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditingMeta(!isEditingMeta)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer transition-all"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
            <span>{isEditingMeta ? 'بستن ویرایش مشخصات' : 'ویرایش مشخصات امضاءکننده'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>آپلود تصویر امضا/مهر</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={generateSampleSignature}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg flex items-center gap-1.5 font-bold cursor-pointer transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ایجاد امضای دیجیتال نمونه</span>
          </button>

          <button
            type="button"
            onClick={clearCanvas}
            className="px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-100 border border-red-700/50 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>پاکسازی امضاء</span>
          </button>
        </div>
      </div>

      {/* Editable Metadata Panel (hidden in print) */}
      {isEditingMeta && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl mb-4 text-xs text-slate-800 space-y-3 print:hidden">
          <div className="font-bold text-amber-950 text-sm flex items-center gap-2 mb-2">
            <Edit3 className="w-4 h-4 text-amber-700" />
            تنظیمات مشخصات امضاءکننده و مهر رسمی:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold mb-1 text-slate-700">نام و ولد امضاءکننده:</label>
              <input
                type="text"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-slate-700">سمت و عنوان سازمانی:</label>
              <input
                type="text"
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-slate-700">تاریخ صدور امضاء:</label>
              <input
                type="text"
                value={signDate}
                onChange={(e) => setSignDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono text-center"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-amber-200">
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={showOfficialStamp}
                onChange={(e) => setShowOfficialStamp(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span>نمایش مهر اختصاصی رسمی شرکت (Stamp)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={showQrCode}
                onChange={(e) => setShowQrCode(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span>نمایش بارکد QR و کد هَش امنیتی verification</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="font-bold">رنگ قلم امضا:</span>
              <button
                type="button"
                onClick={() => setPenColor('#0b2545')}
                className={`w-5 h-5 rounded-full bg-[#0b2545] border-2 ${penColor === '#0b2545' ? 'border-amber-500 scale-110' : 'border-white'}`}
                title="آبی تیره سرمه‌ای"
              />
              <button
                type="button"
                onClick={() => setPenColor('#0033aa')}
                className={`w-5 h-5 rounded-full bg-[#0033aa] border-2 ${penColor === '#0033aa' ? 'border-amber-500 scale-110' : 'border-white'}`}
                title="آبی کلاسیک"
              />
              <button
                type="button"
                onClick={() => setPenColor('#111827')}
                className={`w-5 h-5 rounded-full bg-[#111827] border-2 ${penColor === '#111827' ? 'border-amber-500 scale-110' : 'border-white'}`}
                title="مشکی"
              />
            </div>
          </div>
        </div>
      )}

      {/* Official Signature and Stamp Security Block (Printable & Exportable) */}
      <div className="bg-slate-50 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs print:bg-white print:border-slate-900 print:shadow-none">
        
        {/* Security Guilloche Watermark Accent */}
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full border-12 border-blue-900/5 pointer-events-none flex items-center justify-center">
          <ShieldCheck className="w-24 h-24 text-blue-900/10" />
        </div>

        {/* Top Header line of Signature Block */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-300 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-900 text-white rounded-lg flex items-center justify-center font-bold">
              <Stamp className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">بخش تأییدیه، امضاء و مهر الکترونیکی د افغانستان بانک</h4>
              <p className="text-[11px] text-slate-600 font-semibold">صادره توسط شرکت صرافی و خدمات پولی برکت‌الله غفوری (سهامی خاص)</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-1 rounded-full text-xs font-bold font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>دیجیتالی ثبت گردید • DAB DIGI-SIGNED</span>
          </div>
        </div>

        {/* Main Grid: Signature Canvas, Official Seal, and Verification QR */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Column 1: Signatory Details & Signature Drawing Pad (6 cols) */}
          <div className="md:col-span-6 bg-white border border-slate-300 rounded-xl p-3.5 shadow-2xs relative">
            <div className="text-xs font-bold text-slate-900 mb-1 flex items-center justify-between">
              <span>{signatoryTitle}</span>
              <span className="text-[10px] text-slate-500 font-mono">تاریخ: {signDate}</span>
            </div>
            <div className="text-sm font-extrabold text-blue-950 mb-2">
              مقام امضاءکننده: {signatoryName}
            </div>

            {/* Interactive Drawing Pad or Loaded Image Preview */}
            <div className="relative border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50 min-h-[100px] flex items-center justify-center overflow-hidden">
              {signatureImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={signatureImage}
                  alt="Digital Signature"
                  className="max-h-24 object-contain py-1"
                />
              ) : (
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={90}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-24 cursor-crosshair touch-none"
                  title="برای ثبت امضاء با ماوس یا لمس در این باکس ترسیم کنید"
                />
              )}

              {!isSigned && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-bold">
                  محل ترسیم یا درج امضاء دیجیتالی...
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono pt-1 border-t border-slate-200">
              <span>وضعیت امضاء: {isSigned ? '✓ تأیید شده' : 'در انتظار امضا'}</span>
              <span>کد سند: {documentCode}</span>
            </div>
          </div>

          {/* Column 2: Official Seal / Stamp Emblem (3 cols) */}
          {showOfficialStamp && (
            <div className="md:col-span-3 flex flex-col items-center justify-center text-center p-2 bg-white border border-slate-300 rounded-xl min-h-[140px] relative">
              <div className="relative w-28 h-28 border-4 border-double border-blue-900 rounded-full p-1.5 flex flex-col items-center justify-center bg-blue-50/30 text-blue-950 shadow-2xs">
                {/* Stamp Outer Ring Text */}
                <div className="text-[8px] font-extrabold tracking-tighter text-blue-900 uppercase">
                  د افغانستان بانک • DAB
                </div>

                {customLogo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={customLogo} alt="Logo" className="w-8 h-8 object-contain my-0.5" />
                ) : (
                  <Building2 className="w-7 h-7 text-blue-900 my-0.5" />
                )}

                <div className="text-[9px] font-black text-slate-900 leading-none">
                  برکت‌الله غفوری
                </div>
                <div className="text-[7px] font-bold text-blue-800 mt-0.5">
                  جواز DAB/7-0965
                </div>
                <div className="text-[7px] font-mono font-bold text-amber-700 border-t border-blue-900/30 pt-0.5 mt-0.5">
                  مهر رسمی و معتبر
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1">مهر اختصاصی ثبت شرکت</span>
            </div>
          )}

          {/* Column 3: Security Verification QR & Serial Hash (3 cols) */}
          {showQrCode && (
            <div className="md:col-span-3 bg-white border border-slate-300 rounded-xl p-3 flex flex-col items-center justify-center text-center min-h-[140px]">
              <div className="w-16 h-16 bg-slate-900 text-white p-1 rounded-lg flex items-center justify-center shadow-xs">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-white">
                  <path d="M0,0 h35 v35 h-35 z M10,10 h15 v15 h-15 z M65,0 h35 v35 h-35 z M75,10 h15 v15 h-15 z M0,65 h35 v35 h-35 z M10,75 h15 v15 h-15 z" />
                  <path d="M45,10 h10 v10 h-10 z M45,30 h10 v10 h-10 z M10,45 h10 v10 h-10 z M30,45 h20 v10 h-20 z M60,45 h10 v10 h-10 z M80,45 h20 v10 h-20 z" />
                  <path d="M45,65 h10 v20 h-10 z M65,65 h20 v10 h-20 z M65,85 h35 v15 h-35 z M85,75 h15 v10 h-15 z" />
                </svg>
              </div>

              <div className="text-[9px] font-mono font-bold text-slate-700 mt-2 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 break-all max-w-full">
                {verificationHash}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold mt-0.5">کد استعلام اعتبار در DAB</span>
            </div>
          )}

        </div>

        {/* Dedicated Logo and Authenticity Footer line */}
        <div className="mt-3 pt-2 border-t border-slate-300/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 font-semibold">
          <div className="flex items-center gap-2">
            {customLogo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={customLogo} alt="Dedicated Form Logo" className="w-5 h-5 object-contain bg-white rounded border border-slate-200 p-0.5" />
            ) : (
              <Building2 className="w-4 h-4 text-blue-900" />
            )}
            <span>لوگوی اختصاصی فرم: شرکت صرافی و خدمات پولی برکت‌الله غفوری</span>
          </div>

          <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
            <Lock className="w-3 h-3 text-amber-600" />
            <span>تأیید صلاحیت رسمی د افغانستان بانک (Da Afghanistan Bank)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
