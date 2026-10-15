import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      // Clear session if corrupted
      localStorage.removeItem('cp_active_session_username_v1');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07060c] text-white flex flex-col items-center justify-center p-6 text-center font-['Cairo',_sans-serif]">
          <div className="max-w-md w-full bg-[#11162b] border border-amber-500/40 rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-amber-300 mb-2">حدث تنبيه في تحميل الصفحة</h1>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              يرجى إعادة تحميل التطبيق للمتابعة واستعادة الاتصال السلس.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل التطبيق</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800/60 text-slate-400 hover:text-white font-medium text-xs transition-all cursor-pointer"
              >
                <span>العودة لصفحة البداية الرئيسية</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
