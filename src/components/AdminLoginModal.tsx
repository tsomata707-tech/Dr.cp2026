import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, X, ArrowLeft, KeyRound, AlertTriangle } from 'lucide-react';
import { getAdminSettings } from '../utils/adminStorage';
import { CpLogo } from './CpLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAuthenticated: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onAdminAuthenticated,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const settings = getAdminSettings();
    const correctPassword = settings.adminPasswordHash || 'admin123';

    if (!password) {
      setError('يرجى كتابة كلمة مرور الأدمن');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (password === correctPassword) {
        onAdminAuthenticated();
        setPassword('');
        onClose();
      } else {
        setError('كلمة مرور الأدمن غير صحيحة. يرجى المحاولة مرة أخرى.');
      }
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      id="modal-admin-login"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#0e0c19] border-2 border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.3)] p-6 sm:p-8 text-right overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#fff0a8] rounded-tr-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#fff0a8] rounded-bl-3xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center pb-5 border-b border-[#d4af37]/20">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-purple-600/20 to-amber-400/30 border border-[#d4af37] flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <KeyRound className="w-6 h-6 text-[#ffd700]" />
          </div>
          <h2 className="text-xl font-extrabold text-white font-['Cairo'] flex items-center gap-2">
            <span>دخول لوحة تحكم الأدمن</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            أدخل كلمة المرور الخاصة بالمشرف للوصول إلى إعدادات النظام
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="input-admin-password"
              className="block text-xs font-bold text-amber-200/90 font-['Cairo']"
            >
              باسوورد الأدمن (Admin Password)
            </label>
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="input-admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل باسوورد الأدمن الخاص..."
                className="w-full h-12 pr-11 pl-11 rounded-xl bg-[#090812] text-white text-sm placeholder:text-slate-500 border-2 border-[#d4af37]/75 hover:border-[#d4af37] focus:border-[#ffd700] focus:ring-2 focus:ring-[#d4af37]/30 focus:outline-none transition-all shadow-[0_0_15px_rgba(212,175,55,0.08)] text-right"
                autoFocus
              />
              <div className="absolute top-1/2 -translate-y-1/2 right-3 w-7 h-7 rounded-lg bg-[#19152b] border border-[#d4af37]/40 flex items-center justify-center text-amber-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 -translate-y-1/2 left-3 p-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                title={showPassword ? 'إخفاء' : 'إظهار'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              * كلمة المرور الافتراضية الأولية للأدمن هي: <code className="text-amber-300 bg-black/40 px-1.5 py-0.5 rounded border border-[#d4af37]/30 font-mono">admin123</code> (يمكنك تغييرها من داخل اللوحة).
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            id="btn-confirm-admin-login"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#e6be44] via-[#d4af37] to-[#b38e22] hover:from-[#f3ca52] hover:via-[#e6be44] text-slate-950 font-black text-sm tracking-wide shadow-[0_4px_20px_rgba(212,175,55,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>تأكيد والدخول للوحة المشرف</span>
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
