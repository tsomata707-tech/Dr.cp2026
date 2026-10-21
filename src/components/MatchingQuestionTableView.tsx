import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Eye,
  Check,
  X,
  ArrowLeft,
  Move,
  Trophy,
  ArrowDown,
  Layers,
} from 'lucide-react';
import { PreTestQuestion } from '../types';

interface MatchingQuestionTableViewProps {
  question: PreTestQuestion;
  questionNumber: number;
  totalQuestions: number;
  soundEnabled: boolean;
  onFinishMatching: (isCorrectAll: boolean, matchesMap: Record<number, number>) => void;
  onBackToHome?: () => void;
  mode?: 'pre' | 'post';
  isImmediate?: boolean;
}

interface ImageCardItem {
  id: string;
  originalIndex: number;
  imageUrl: string;
  label?: string;
}

export const MatchingQuestionTableView: React.FC<MatchingQuestionTableViewProps> = ({
  question,
  questionNumber,
  totalQuestions,
  soundEnabled,
  onFinishMatching,
  onBackToHome,
  mode = 'pre',
  isImmediate = true,
}) => {
  // Extract pairs: text & matching image
  const defaultPairs = useMemo(() => {
    if (question.matchingPairs && question.matchingPairs.length > 0) {
      return question.matchingPairs.map((p, idx) => ({
        index: idx,
        text: p.text,
        imageUrl: p.imageUrl,
      }));
    }
    // Fallback to options and optionImages
    return (question.options || []).map((opt, idx) => ({
      index: idx,
      text: opt,
      imageUrl: question.optionImages?.[idx] || '',
    }));
  }, [question]);

  // Fullscreen Intro & Outro Banner states requested by user
  const [showIntroBanner, setShowIntroBanner] = useState(true);
  const [showOutroBanner, setShowOutroBanner] = useState(false);

  // Placements: row index (0..n-1) -> ImageCardItem placed in that row
  const [rowPlacements, setRowPlacements] = useState<Record<number, ImageCardItem | null>>({});

  // Active selected image for click-to-place on mobile/touch screens
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Modal zoom for inspecting images
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  // Dragging state
  const [draggedCard, setDraggedCard] = useState<ImageCardItem | null>(null);
  const [dragOverRow, setDragOverRow] = useState<number | null>(null);
  const [matchingScore, setMatchingScore] = useState<number | null>(null);

  // Sound effects
  const playSound = (type: 'intro' | 'place' | 'success' | 'click' | 'reset') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'place' || type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'success' || type === 'intro') {
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          g.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.25);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(ctx.currentTime + idx * 0.08);
          o.stop(ctx.currentTime + idx * 0.08 + 0.25);
        });
      } else if (type === 'reset') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // Audio might be constrained by browser
    }
  };

  // Initial Shuffled Image Cards
  const allCards = useMemo<ImageCardItem[]>(() => {
    const list = defaultPairs.map((p, idx) => ({
      id: `card-${question.id}-${idx}`,
      originalIndex: idx,
      imageUrl: p.imageUrl,
      label: `صورة رقم ${idx + 1}`,
    }));
    // Deterministic shuffle based on question ID
    return [...list].sort((a, b) => {
      const hashA = (a.id + question.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const hashB = (b.id + question.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return (hashA % 7) - (hashB % 7);
    });
  }, [defaultPairs, question.id]);

  // Determine unplaced cards currently in the image pool
  const placedCardIds = useMemo(() => {
    const set = new Set<string>();
    Object.values(rowPlacements).forEach((c) => {
      if (c) set.add(c.id);
    });
    return set;
  }, [rowPlacements]);

  const poolCards = useMemo(() => {
    return allCards.filter((c) => !placedCardIds.has(c.id));
  }, [allCards, placedCardIds]);

  // Reset all placements back to pool
  const handleResetPlacements = () => {
    playSound('reset');
    setRowPlacements({});
    setSelectedImageId(null);
  };

  // Select card from pool
  const handleSelectPoolCard = (card: ImageCardItem) => {
    playSound('click');
    if (selectedImageId === card.id) {
      setSelectedImageId(null);
    } else {
      setSelectedImageId(card.id);
    }
  };

  // Place card in row slot (via click or drop)
  const placeCardInRow = (rowIndex: number, card: ImageCardItem) => {
    playSound('place');
    setRowPlacements((prev) => {
      const next = { ...prev };
      // If card was in another row, remove it from that row
      Object.keys(next).forEach((rKey) => {
        const r = Number(rKey);
        if (next[r]?.id === card.id) {
          next[r] = null;
        }
      });
      // If target row already had a card, we swap or replace
      next[rowIndex] = card;
      return next;
    });
    setSelectedImageId(null);
  };

  // Remove card from row slot back to pool
  const handleRemoveFromRow = (rowIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    setRowPlacements((prev) => {
      const next = { ...prev };
      next[rowIndex] = null;
      return next;
    });
  };

  // Drag handlers
  const handleDragStart = (card: ImageCardItem, e: React.DragEvent) => {
    setDraggedCard(card);
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (rowIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverRow(rowIndex);
  };

  const handleDragLeave = () => {
    setDragOverRow(null);
  };

  const handleDrop = (rowIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverRow(null);
    if (!draggedCard) return;
    placeCardInRow(rowIndex, draggedCard);
    setDraggedCard(null);
  };

  // Check completion & evaluation
  const placedCount = Object.values(rowPlacements).filter(Boolean).length;
  const isAllPlaced = placedCount === defaultPairs.length;

  const handleConfirmMatching = () => {
    playSound('success');
    // Calculate how many were placed correctly
    let correctMatches = 0;
    const matchesMap: Record<number, number> = {};

    defaultPairs.forEach((pair, rowIdx) => {
      const placed = rowPlacements[rowIdx];
      if (placed) {
        matchesMap[rowIdx] = placed.originalIndex;
        if (placed.originalIndex === rowIdx) {
          correctMatches++;
        }
      } else {
        matchesMap[rowIdx] = -1;
      }
    });

    const isCorrectAll = correctMatches === defaultPairs.length;
    setMatchingScore(isCorrectAll ? 1 : 0);
    if (isCorrectAll) {
      playSound('success');
    }

    // Show the requested fullscreen outro message:
    // "انتهينا من التوصيل اكمل باقي الاختبار بنفس الشكل والنمط المتفق عليه"
    setShowOutroBanner(true);
  };

  const handleProceedAfterOutro = () => {
    let correctMatches = 0;
    const matchesMap: Record<number, number> = {};
    defaultPairs.forEach((pair, rowIdx) => {
      const placed = rowPlacements[rowIdx];
      if (placed) {
        matchesMap[rowIdx] = placed.originalIndex;
        if (placed.originalIndex === rowIdx) {
          correctMatches++;
        }
      } else {
        matchesMap[rowIdx] = -1;
      }
    });
    const isCorrectAll = correctMatches === defaultPairs.length;
    onFinishMatching(isCorrectAll, matchesMap);
  };

  return (
    <div className="relative min-h-[600px] w-full font-['Cairo'] text-right select-none">
      {/* ========================================================================= */}
      {/* 1. FULLSCREEN INTRO BANNER: "قم بترتيب الاجابه الصحيح" (يملا كامل الشاشة) */}
      {/* ========================================================================= */}
      {showIntroBanner && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-fadeIn">
          {/* Neon Glow Aura */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/25 via-purple-900/20 to-black pointer-events-none" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-[#ffd700]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl w-full text-center space-y-8 py-10">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/15 border-2 border-[#ffd700] text-amber-300 font-black text-sm sm:text-base shadow-[0_0_30px_rgba(255,215,0,0.35)] animate-bounce">
              <Sparkles className="w-5 h-5 text-[#ffd700]" />
              <span>مهمة التوصيل والمزاوجة التفاعلية • السؤال #{questionNumber}</span>
              <Sparkles className="w-5 h-5 text-[#ffd700]" />
            </div>

            {/* Giant Title Filling Screen as explicitly requested: قم بترتيب الاجابه الصحيح */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-[#ffd700] to-yellow-200 font-['Tajawal'] tracking-wide drop-shadow-[0_10px_25px_rgba(255,215,0,0.4)] leading-tight">
                قم بترتيب الاجابه الصحيح
              </h1>
              <p className="text-base sm:text-xl md:text-2xl text-slate-200 font-bold max-w-2xl mx-auto leading-relaxed">
                اسحب الصور غير المرتبة وضع كل صورة أمام الجملة والخطوة الصحيحة المقابلة لها في الجدول
              </p>
            </div>

            {/* Visual Preview / Steps hint */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-2">
              <div className="px-5 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center font-bold">1</span>
                <span>قراءة العبارة بالجداول</span>
              </div>
              <div className="text-amber-400 text-xl font-bold">⬅️</div>
              <div className="px-5 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold">2</span>
                <span>تحريك الصورة المقابلة</span>
              </div>
              <div className="text-amber-400 text-xl font-bold">⬅️</div>
              <div className="px-5 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center font-bold">3</span>
                <span>تأكيد الترتيب والاعتماد</span>
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  playSound('intro');
                  setShowIntroBanner(false);
                }}
                className="w-full sm:w-auto min-w-[280px] px-10 py-5 rounded-3xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-lg sm:text-xl shadow-[0_0_40px_rgba(255,215,0,0.5)] border-3 border-amber-200 flex items-center justify-center gap-3 mx-auto cursor-pointer transition-all transform hover:scale-105 active:scale-95"
              >
                <span>ابدأ الترتيب والتوصيل الآن 🚀</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FULLSCREEN OUTRO BANNER: "انتهينا من التوصيل اكمل باقي الاختبار بنفس الشكل والنمط المتفق عليه" */}
      {/* ========================================================================= */}
      {showOutroBanner && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-fadeIn">
          {/* Neon Confetti / Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-blue-900/20 to-black pointer-events-none" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-emerald-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl w-full text-center space-y-8 py-10">
            {/* Top Success & Score Badge */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 font-black text-sm sm:text-base shadow-[0_0_30px_rgba(16,185,129,0.35)] animate-pulse">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span>تم إنجاز سؤال التوصيل!</span>
              </div>
              {mode === 'post' && isImmediate && (
                <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 font-black text-sm sm:text-base shadow-xl ${
                  matchingScore === 1
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300'
                    : 'bg-rose-950/90 border-rose-500 text-rose-300'
                }`}>
                  <span>النتيجة: {matchingScore === 1 ? '1/1 ✓' : '0/1 ✗'}</span>
                </div>
              )}
            </div>

            {/* Giant Outro Text filling screen as explicitly requested */}
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-[#ffd700] to-teal-200 font-['Tajawal'] tracking-wide drop-shadow-[0_10px_25px_rgba(16,185,129,0.4)] leading-tight">
                انتهينا من التوصيل اكمل باقي الاختبار بنفس الشكل والنمط المتفق عليه
              </h1>
              <p className="text-base sm:text-xl text-slate-200 font-bold max-w-2xl mx-auto leading-relaxed">
                رائع جداً! نعود الآن فوراً إلى مضمار سيارة السباق لمتابعة بقية الأسئلة بالنمط المعتاد 🏎️
              </p>
            </div>

            {/* Action Continue Button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={handleProceedAfterOutro}
                className="w-full sm:w-auto min-w-[320px] px-10 py-5 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-lg sm:text-xl shadow-[0_0_40px_rgba(16,185,129,0.5)] border-3 border-emerald-200 flex items-center justify-center gap-3 mx-auto cursor-pointer transition-all transform hover:scale-105 active:scale-95"
              >
                <span>متابعة باقي أسئلة الاختبار بالسيارة 🏎️</span>
                <ArrowLeft className="w-6 h-6 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN MATCHING TABLE & IMAGE POOL WORKSPACE */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* Question Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#110e28] via-[#0d0a20] to-[#080614] border-2 border-amber-500/80 shadow-[0_0_35px_rgba(245,158,11,0.25)] relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-[#ffd700] text-amber-300 font-bold text-xs sm:text-sm">
                ⭐ سؤال توصيل وترتيب تفاعلي #{questionNumber}
              </span>
              <span className="text-xs text-slate-400">
                من إجمالي {totalQuestions} سؤال
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetPlacements}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                title="إعادة تعيين الصور الموزعة"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة تعيين 🔄</span>
              </button>
            </div>
          </div>

          {/* Question Prompt Title */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-relaxed font-['Tajawal'] text-right">
            {question.question}
          </h2>

          <p className="text-xs sm:text-sm text-amber-300 font-semibold mt-2">
            💡 أهداف: اسحب الصورة المناسبة وضعها أمام الجملة في الجدول، أو انقر على الصورة ثم انقر على خانة الجدول لوضعها.
          </p>
        </div>

        {/* 2-COLUMN TABLE OF PHRASES & MATCHING SLOTS */}
        <div className="rounded-3xl bg-[#0b0f19] border-2 border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs sm:text-sm font-bold text-slate-300">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>جدول العبارات والخطوات</span>
            </div>
            <span className="text-slate-400 text-xs">
              تم توصيل: <strong className="text-amber-400 font-mono">{placedCount}</strong> من{' '}
              <strong className="text-white font-mono">{defaultPairs.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-300 text-xs sm:text-sm font-bold border-b border-slate-800">
                  <th className="p-3 text-right w-12 sm:w-16">#</th>
                  <th className="p-3 text-right">العبارة / الجملة في السؤال</th>
                  <th className="p-3 text-center w-48 sm:w-64">مكان وضع الصورة المناسبة 🖼️</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {defaultPairs.map((pair, rowIdx) => {
                  const placedCard = rowPlacements[rowIdx];
                  const isHoveredDrop = dragOverRow === rowIdx;
                  const isRowTargetForSelected = selectedImageId !== null && !placedCard;

                  return (
                    <tr
                      key={rowIdx}
                      className={`transition-colors ${
                        placedCard
                          ? 'bg-slate-900/40 hover:bg-slate-900/70'
                          : isHoveredDrop || isRowTargetForSelected
                          ? 'bg-amber-950/30'
                          : 'hover:bg-slate-900/20'
                      }`}
                    >
                      {/* Row Index */}
                      <td className="p-3 align-middle text-center">
                        <span className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-mono font-bold text-xs flex items-center justify-center mx-auto">
                          {rowIdx + 1}
                        </span>
                      </td>

                      {/* Phrase / Sentence */}
                      <td className="p-3 align-middle text-right">
                        <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-relaxed font-['Cairo']">
                          {pair.text}
                        </p>
                      </td>

                      {/* Drop Target / Placed Image Slot */}
                      <td className="p-3 align-middle text-center">
                        <div
                          onDragOver={(e) => handleDragOver(rowIdx, e)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(rowIdx, e)}
                          onClick={() => {
                            if (selectedImageId) {
                              const found = allCards.find((c) => c.id === selectedImageId);
                              if (found) placeCardInRow(rowIdx, found);
                            }
                          }}
                          className={`min-h-[105px] w-full rounded-2xl border-2 transition-all duration-200 p-2 flex flex-col items-center justify-center relative cursor-pointer ${
                            placedCard
                              ? 'border-emerald-500/80 bg-[#09151c] shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                              : isHoveredDrop
                              ? 'border-amber-400 bg-amber-950/60 scale-[1.02] shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                              : isRowTargetForSelected
                              ? 'border-amber-400/90 border-dashed bg-amber-950/40 animate-pulse'
                              : 'border-dashed border-slate-700 bg-slate-950/60 hover:border-slate-500 hover:bg-slate-900/60'
                          }`}
                        >
                          {placedCard ? (
                            <div className="relative group/slot w-full flex flex-col items-center">
                              {/* Placed Image Preview */}
                              <div
                                onClick={() => setZoomedImageUrl(placedCard.imageUrl)}
                                className="w-full h-20 sm:h-24 rounded-xl overflow-hidden bg-black/60 border border-slate-700 flex items-center justify-center p-1 cursor-zoom-in"
                                title="اضغط لتكبير الصورة"
                              >
                                <img
                                  src={placedCard.imageUrl}
                                  alt="صورة التوصيل"
                                  className="max-h-full max-w-full object-contain rounded-lg"
                                />
                              </div>

                              <div className="mt-1.5 flex items-center justify-between w-full text-[10px] text-slate-300 px-1">
                                <span className="font-bold text-emerald-400 flex items-center gap-1">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>تم التوصيل</span>
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveFromRow(rowIdx, e)}
                                  className="text-rose-400 hover:text-rose-300 font-bold hover:underline flex items-center gap-0.5"
                                  title="إرجاع الصورة إلى المعرض"
                                >
                                  <X className="w-3 h-3" />
                                  <span>إرجاع</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-2 space-y-1">
                              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
                                <ArrowDown className="w-4 h-4 text-slate-400" />
                              </div>
                              <span className="text-[11px] font-bold text-slate-400 block">
                                {isRowTargetForSelected ? 'اضغط هنا لوضع الصورة المحددة' : 'اسحب أو ضع الصورة هنا'}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* POOL OF UNORDERED IMAGES (صور غير مرتبة) */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-2 border-slate-800 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-[#ffd700] font-['Tajawal']">
                🖼️ معرض صور التوصيل (غير مرتبة)
              </span>
              <span className="text-xs text-slate-400">
                (متبقي {poolCards.length} صورة لوضعها)
              </span>
            </div>

            <span className="text-[11px] text-slate-400">
              💡 يمكنك السحب والإفلات أو النقر على الصورة ثم النقر على خانة الجدول
            </span>
          </div>

          {poolCards.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-emerald-300">
                رائع! قمت بوضع جميع الصور في الجدول. راجع ترتيبك ثم اضغط على زر التأكيد أدناه.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {poolCards.map((card) => {
                const isSelected = selectedImageId === card.id;

                return (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(card, e)}
                    onClick={() => handleSelectPoolCard(card)}
                    className={`rounded-2xl p-2.5 border-2 transition-all duration-200 cursor-grab active:cursor-grabbing flex flex-col items-center justify-between bg-black/70 hover:scale-[1.02] shadow-lg relative ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/60 bg-amber-950/40 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                        : 'border-slate-700/80 hover:border-slate-500'
                    }`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] shadow-md animate-pulse">
                        محددة
                      </div>
                    )}

                    {/* Image Preview */}
                    <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-black/80 border border-slate-700/60 p-1 flex items-center justify-center">
                      <img
                        src={card.imageUrl}
                        alt="صورة خيار"
                        className="max-h-full max-w-full object-contain rounded-lg"
                        loading="lazy"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between w-full text-[11px] font-bold text-slate-300">
                      <span className="flex items-center gap-1">
                        <Move className="w-3 h-3 text-slate-400" />
                        <span>اسحب للجدول</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedImageUrl(card.imageUrl);
                        }}
                        className="text-amber-400 hover:text-amber-300 p-1 rounded-md hover:bg-slate-800"
                        title="تكبير الصورة"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CONFIRMATION SUBMISSION BUTTON */}
        {/* Post-Test Score Indicator on Matching Card */}
        {mode === 'post' && isImmediate ? (
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="text-xs text-slate-300 font-bold">النتيجة المقدرة لسؤال التوصيل:</span>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-lg font-mono font-black text-xs border ${
                matchingScore === 1
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                  : 'bg-slate-900 text-amber-300 border-slate-700'
              }`}>
                {matchingScore === 1 ? '1/1' : '0/1'}
              </span>
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between px-4 py-2 rounded-xl bg-slate-950/60 text-xs text-slate-400">
            <span>سؤال التوصيل التفاعلي (التغذية الراجعة مرجأة)</span>
            <span className="font-mono text-amber-300 font-bold">
              {placedCount === defaultPairs.length ? 'تم الرصد والترتيب ✓' : `${placedCount}/${defaultPairs.length} مكتمل`}
            </span>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {isAllPlaced ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>اكتمل وضع جميع الصور في الجدول. جاهز للاعتماد!</span>
              </span>
            ) : (
              <span>
                يجب وضع جميع الصور بالجدول ({placedCount}/{defaultPairs.length}) لتأكيد الترتيب والتوصيل
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!isAllPlaced}
            onClick={handleConfirmMatching}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl ${
              isAllPlaced
                ? 'bg-gradient-to-r from-emerald-500 via-[#ffd700] to-emerald-500 hover:from-emerald-400 hover:to-yellow-300 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.4)] border-2 border-emerald-300 transform hover:-translate-y-0.5'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>تأكيد وحفظ الترتيب والتوصيل ✓</span>
          </button>
        </div>
      </div>

      {/* IMAGE ZOOM MODAL */}
      {zoomedImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setZoomedImageUrl(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 border-2 border-amber-400 rounded-3xl p-4 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full pb-3 border-b border-slate-800 mb-3 text-slate-200">
              <span className="text-sm font-bold text-amber-300">معاينة صورة التوصيل بالتفصيل</span>
              <button
                type="button"
                onClick={() => setZoomedImageUrl(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full flex items-center justify-center max-h-[75vh] overflow-hidden rounded-xl bg-black p-2">
              <img
                src={zoomedImageUrl}
                alt="معاينة مكبرة"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
