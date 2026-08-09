'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { Building2, UserCheck, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { loginAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGuestLogin = async () => {
    setError(null);
    setGuestLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.warn('Firebase signInAnonymously failed, using client guest session:', err);
      loginAsGuest();
    } finally {
      setGuestLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      try {
        localStorage.removeItem('bg_user_logged_out');
      } catch (_) {}
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('ایمیل یا رمز عبور اشتباه است.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('این ایمیل قبلا ثبت شده است.');
      } else if (err.code === 'auth/weak-password') {
        setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      } else {
        setError('خطایی رخ داد. لطفا دوباره تلاش کنید.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 font-vazirmatn dir-rtl">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-8 text-center bg-amber-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
          <div className="w-16 h-16 mx-auto bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">سامانه مدیریت شرکت‌ها</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">لطفاً برای ورود به سامانه وارد شوید</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 text-sm font-semibold text-red-700 bg-red-100 dark:bg-red-500/10 dark:text-red-400 rounded-lg text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">ایمیل</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:text-white text-left outline-none transition-all"
              placeholder="example@mail.com"
              required
              dir="ltr"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:text-white text-left outline-none transition-all"
              placeholder="••••••••"
              required
              dir="ltr"
            />
          </div>
          
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading || guestLoading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'در حال پردازش...' : isRegistering ? 'ثبت نام' : 'ورود'}
            </button>

            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading || guestLoading}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold rounded-xl border border-slate-200 dark:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span>{guestLoading ? 'در حال ورود مهمان...' : 'ورود سریع به عنوان مهمان (پیش‌نمایش سامانه)'}</span>
            </button>
          </div>
          
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm font-bold text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 transition-colors cursor-pointer"
            >
              {isRegistering ? 'قبلاً ثبت نام کرده‌اید؟ ورود' : 'حساب کاربری ندارید؟ ثبت نام کنید'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
