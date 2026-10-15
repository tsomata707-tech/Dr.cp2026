import React, { useState, useEffect } from 'react';
import {
  Target,
  Star,
  Award,
  TrendingUp,
  CheckCircle,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Shield,
  HelpCircle,
  Compass,
  Gamepad2,
  Home,
} from 'lucide-react';
import { getSiteInstructionsConfig, SiteInstructionsConfig } from '../utils/instructionsStorage';

interface InstructionsScreenProps {
  onGotIt: () => void;
  onBackToHome?: () => void;
  onBackToWelcome?: () => void;
  actionButtonText?: string;
}

export const InstructionsScreen: React.FC<InstructionsScreenProps> = ({
  onGotIt,
  onBackToHome,
  onBackToWelcome,
  actionButtonText,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const [config] = useState<SiteInstructionsConfig>(() => getSiteInstructionsConfig());
  const [activeTab, setActiveTab] = useState<string>('all');

  const getCardIcon = (iconKey: string) => {
    switch (iconKey) {
      case 'pretest':
        return <Gamepad2 className="w-6 h-6 text-amber-400" />;
      case 'goals':
        return <Target className="w-6 h-6 text-blue-400" />;
      case 'points':
        return <Star className="w-6 h-6 text-[#ffd700]" />;
      case 'badges':
        return <Award className="w-6 h-6 text-purple-400" />;
      case 'levels':
        return <TrendingUp className="w-6 h-6 text-emerald-400" />;
      default:
        return <BookOpen className="w-6 h-6 text-cyan-400" />;
    }
  };

  const filteredCards = activeTab === 'all' ? config.cards : config.cards.filter((c) => c.id === activeTab);

  return (
    <div className="relative w-full max-w-5xl mx-auto z-10 font-['Cairo',_sans-serif] text-right py-4 animate-fadeIn">
      {/* Background Ambient Glow */}
      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-500/15 blur-xl opacity-70 pointer-events-none" />

      {/* Main Glass Container */}
      <div className="relative rounded-3xl bg-[#0b0e1e]/95 backdrop-blur-2xl border-2 border-blue-500/40 p-6 sm:p-10 shadow-[0_0_40px_rgba(37,99,235,0.2)] overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/50 text-blue-300 text-xs font-bold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                دليل قواعد ومعايير البيئة التعليمية
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Tajawal'] tracking-tight">
              {config.siteTitle}
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              {config.siteDescription}
            </p>
          </div>

          {/* Quick tab switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#070914] border border-slate-800 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل
            </button>
            {config.cards.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveTab(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === c.id
                    ? c.id === 'pretest'
                      ? 'bg-[#ffd700] text-slate-950 font-black'
                      : 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {c.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* GUIDANCE NOTICE BANNER (Prominent requirement) */}
        <div className="my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-yellow-950/50 to-slate-950 border-2 border-[#ffd700] shadow-[0_0_30px_rgba(255,215,0,0.25)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ffd700] to-amber-500 flex items-center justify-center text-slate-950 shrink-0 shadow-lg">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-black text-[#ffd700] block mb-1">
              خطوة البداية:
            </span>
            <p className="text-sm sm:text-base font-black text-white font-['Tajawal'] leading-relaxed">
              {config.guidanceNotice}
            </p>
          </div>
        </div>

        {/* The Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-6">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-2xl bg-gradient-to-br ${card.bgColor} border-2 ${card.borderColor} p-6 shadow-lg flex flex-col justify-between hover:scale-[1.01] transition-transform`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow">
                      {getCardIcon(card.iconKey)}
                    </div>
                    <h3 className="text-lg font-black text-white font-['Tajawal']">{card.title}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${card.tagColor}`}>
                    {card.tag}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4 font-medium">
                  {card.text}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  {card.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action Button: الانتقال إلى بيئة الألعاب */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            id="btn-instructions-start-learning"
            onClick={onGotIt}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] border-2 border-emerald-400/60 hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
          >
            <Gamepad2 className="w-5 h-5 text-[#ffd700]" />
            <span>{actionButtonText || 'الانتقال إلى بيئة الألعاب 🎮'}</span>
            <ArrowLeft className="w-5 h-5" />
          </button>

          {(onBackToHome || onBackToWelcome) && (
            <button
              type="button"
              id="btn-instructions-back-to-home"
              onClick={onBackToHome || onBackToWelcome}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#0e1329] hover:bg-[#161d3d] text-amber-200 hover:text-[#ffd700] font-bold text-sm sm:text-base border-2 border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-lg shadow-black/40"
            >
              <Home className="w-5 h-5 text-[#ffd700]" />
              <span>العودة للرئيسية 🏠</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
