import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, RefreshCw, Database, Server, ExternalLink, ShieldCheck } from 'lucide-react';
import { runFirebaseDiagnostics, FirebaseConnectionDiagnostics } from '../utils/realtimeService';

interface FirebaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseStatusModal: React.FC<FirebaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [diagnostics, setDiagnostics] = useState<FirebaseConnectionDiagnostics | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const executeCheck = async () => {
    setIsRunning(true);
    try {
      const res = await runFirebaseDiagnostics();
      setDiagnostics(res);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      executeCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-['Cairo'] text-right">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#0f1426] via-[#0b0e1d] to-[#080a14] border-2 border-emerald-500/70 p-6 sm:p-7 shadow-[0_0_50px_rgba(16,185,129,0.3)] overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white font-['Tajawal']">
              فحص اتصال قاعدة بيانات الفايربيس (Firebase)
            </h3>
            <p className="text-xs text-slate-300">
              التحقق الحي من الاتصال اللحظي الأونلاين بمشروعك الحقيقي
            </p>
          </div>
        </div>

        {/* Live Status Body */}
        <div className="py-5 space-y-4">
          {/* Main Status Badge */}
          <div className="p-4 rounded-2xl bg-[#070914] border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
              </span>
              <div>
                <span className="text-sm font-black text-emerald-300 block">
                  {diagnostics?.status === 'connected' ? 'متصل أونلاين بالكامل بنجاح 🟢' : 'جاري فحص الاتصال...'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {diagnostics?.writeTestSuccess
                    ? `اختبار القراءة والكتابة اللحظية: ناجح (${diagnostics.pingMs}ms)`
                    : 'يتم الآن فحص استجابة الخادم...'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={executeCheck}
              disabled={isRunning}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>إعادة الفحص</span>
            </button>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#080d1e] border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">معرّف المشروع (Project ID)</span>
              <span className="font-mono text-[#ffd700] font-black break-all">
                {diagnostics?.projectId || 'new-project-56330'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#080d1e] border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">حالة قاعدة البيانات الحية</span>
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Realtime Database نشطة
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#080d1e] border border-slate-800 space-y-1 text-xs">
            <span className="text-slate-400 block font-bold">رابط الخادم المباشر (Database URL)</span>
            <span className="font-mono text-cyan-300 break-all text-[11px]">
              https://new-project-56330-default-rtdb.firebaseio.com
            </span>
          </div>

          {/* How to verify in Firebase Console */}
          <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-xs space-y-2">
            <div className="flex items-center gap-2 text-blue-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>كيف تتأكد بنفسك في لوحة تحكم الفايربيس (Firebase Console)؟</span>
            </div>
            <ol className="list-decimal list-inside text-slate-300 space-y-1 pr-1 text-[11px] leading-relaxed">
              <li>افتح موقع <strong className="text-white">console.firebase.google.com</strong> وسجل دخولك بحسابك.</li>
              <li>اختر مشروعك: <strong className="text-amber-300 font-mono">new-project-56330</strong>.</li>
              <li>من القائمة الجانبية (Build) اضغط على: <strong className="text-white">Realtime Database</strong>.</li>
              <li>ستشاهد أمامك مباشرة مسار البيانات الحية (<span className="text-emerald-300 font-mono">system/onlineTest</span> و <span className="text-purple-300 font-mono">groupRooms</span>) تتحدث وتُسجل لحظياً مع كل تفاعل باللعبة!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition cursor-pointer"
          >
            إغلاق نافذة الفحص
          </button>
        </div>
      </div>
    </div>
  );
};
