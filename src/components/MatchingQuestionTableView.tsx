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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="relative z-10 max-w-3xl w-full bg-white rounded-3xl border-2 border-slate-300 shadow-2xl p-6 sm:p-10 text-center space-y-6">
            {/* Top Badge: مهمة التوصيل */}
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-200 border-2 border-slate-300 text-slate-900 font-['Cairo'] font-black text-sm sm:text-base shadow-sm">
              <Sparkles className="w-5 h-5 text-slate-700" />
              <span>مهمة التوصيل والمزاوجة التفاعلية • السؤال #{questionNumber}</span>
              <Sparkles className="w-5 h-5 text-slate-700" />
            </div>

            {/* Giant Title: قم بترتيب الاجابه الصحيح */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 font-['Cairo'] leading-tight">
                قم بترتيب الاجابه الصحيح
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-700 font-bold max-w-xl mx-auto leading-relaxed">
                اسحب الصور غير المرتبة وضع كل صورة أمام الجملة والخطوة الصحيحة المقابلة لها في الجدول
              </p>
            </div>

            {/* Visual Preview / Steps hint */}
            <div className="flex flex-wrap items-center justify-center gap-3 py-2">
              <div className="px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-300 text-xs sm:text-sm text-slate-900 font-bold flex items-center gap-2 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-slate-200 border border-slate-400 text-slate-950 flex items-center justify-center font-black">1</span>
                <span>قراءة العبارة بالجداول</span>
              </div>
              <div className="text-slate-500 text-lg font-bold">⬅️</div>
              <div className="px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-300 text-xs sm:text-sm text-slate-900 font-bold flex items-center gap-2 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-slate-200 border border-slate-400 text-slate-950 flex items-center justify-center font-black">2</span>
                <span>تحريك الصورة المقابلة</span>
              </div>
              <div className="text-slate-500 text-lg font-bold">⬅️</div>
              <div className="px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-300 text-xs sm:text-sm text-slate-900 font-bold flex items-center gap-2 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-slate-200 border border-slate-400 text-slate-950 flex items-center justify-center font-black">3</span>
                <span>تأكيد الترتيب والاعتماد</span>
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  playSound('intro');
                  setShowIntroBanner(false);
                }}
                className="w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-['Cairo'] font-black text-base sm:text-lg shadow-lg border-2 border-sky-400 flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all transform hover:scale-105 active:scale-95"
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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="relative z-10 max-w-3xl w-full bg-white rounded-3xl border-2 border-slate-300 shadow-2xl p-6 sm:p-10 text-center space-y-6">
            {/* Top Success Badge */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-200 border-2 border-slate-300 text-slate-900 font-['Cairo'] font-black text-sm sm:text-base shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>تم إنجاز سؤال التوصيل!</span>
              </div>
              {mode === 'post' && isImmediate && (
                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border-2 font-['Cairo'] font-black text-sm shadow-sm ${
                  matchingScore === 1
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                    : 'bg-rose-100 border-rose-400 text-rose-950'
                }`}>
                  <span>النتيجة: {matchingScore === 1 ? '1/1 ✓' : '0/1 ✗'}</span>
                </div>
              )}
            </div>

            {/* Giant Outro Text */}
            <div className="space-y-3">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 font-['Cairo'] leading-tight">
                انتهينا من التوصيل اكمل باقي الاختبار بنفس الشكل والنمط المتفق عليه
              </h1>
              <p className="text-sm sm:text-base text-slate-700 font-bold max-w-xl mx-auto leading-relaxed">
                رائع جداً! نعود الآن فوراً إلى مضمار سيارة السباق لمتابعة بقية الأسئلة بالنمط المعتاد 🏎️
              </p>
            </div>

            {/* Action Continue Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleProceedAfterOutro}
                className="w-full sm:w-auto min-w-[300px] px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-['Cairo'] font-black text-base sm:text-lg shadow-lg border-2 border-emerald-400 flex items-center justify-center gap-3 mx-auto cursor-pointer transition-all transform hover:scale-105 active:scale-95"
              >
                <span>متابعة باقي أسئلة الاختبار بالسيارة 🏎️</span>
                <ArrowLeft className="w-5 h-5 stroke-[3]" />
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
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-300 shadow-lg relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-200 border border-slate-300 text-slate-900 font-['Cairo'] font-black text-xs sm:text-sm">
                ⭐ سؤال توصيل وترتيب تفاعلي #{questionNumber}
              </span>
              <span className="text-xs font-bold text-slate-600">
                من إجمالي {totalQuestions} سؤال
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetPlacements}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                title="إعادة تعيين الصور الموزعة"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة تعيين 🔄</span>
              </button>
            </div>
          </div>

          {/* Question Prompt Title */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-relaxed font-['Cairo'] text-right">
            {question.question}
          </h2>

          <div className="mt-3 p-3 rounded-xl bg-slate-100 border border-slate-300">
            <p className="text-xs sm:text-sm text-slate-800 font-bold">
              💡 <strong>طريقة الإجابة:</strong> اسحب الصورة المناسبة وضعها أمام الجملة في الجدول، أو انقر على الصورة ثم انقر على خانة الجدول المقابلة لها.
            </p>
          </div>
        </div>

        {/* 2-COLUMN TABLE OF PHRASES & MATCHING SLOTS */}
        <div className="rounded-3xl bg-white border-2 border-slate-300 p-4 sm:p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs sm:text-sm font-bold text-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span className="font-['Cairo'] font-black text-slate-900">جدول العبارات والخطوات</span>
            </div>
            <span className="text-slate-700 text-xs font-bold bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              تم توصيل: <strong className="text-slate-900 font-black">{placedCount}</strong> من{' '}
              <strong className="text-slate-900 font-black">{defaultPairs.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-900 text-xs sm:text-sm font-black font-['Cairo'] border-b-2 border-slate-300">
                  <th className="p-3 text-right w-12 sm:w-16">#</th>
                  <th className="p-3 text-right">العبارة / الجملة في السؤال</th>
                  <th className="p-3 text-center w-48 sm:w-64">مكان وضع الصورة المناسبة 🖼️</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {defaultPairs.map((pair, rowIdx) => {
                  const placedCard = rowPlacements[rowIdx];
                  const isHoveredDrop = dragOverRow === rowIdx;
                  const isRowTargetForSelected = selectedImageId !== null && !placedCard;

                  return (
                    <tr
                      key={rowIdx}
                      className={`transition-colors ${
                        placedCard
                          ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                          : isHoveredDrop || isRowTargetForSelected
                          ? 'bg-sky-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Row Index */}
                      <td className="p-3 align-middle text-center">
                        <span className="w-7 h-7 rounded-xl bg-slate-200 border border-slate-300 text-slate-900 font-['Cairo'] font-black text-xs flex items-center justify-center mx-auto">
                          {rowIdx + 1}
                        </span>
                      </td>

                      {/* Phrase / Sentence */}
                      <td className="p-3 align-middle text-right">
                        <p className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-relaxed font-['Cairo']">
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
                              ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                              : isHoveredDrop
                              ? 'border-sky-500 bg-sky-100/70 scale-[1.02] shadow-md'
                              : isRowTargetForSelected
                              ? 'border-sky-500 border-dashed bg-sky-50 animate-pulse'
                              : 'border-dashed border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          {placedCard ? (
                            <div className="relative group/slot w-full flex flex-col items-center">
                              {/* Placed Image Preview */}
                              <div
                                onClick={() => setZoomedImageUrl(placedCard.imageUrl)}
                                className="w-full h-20 sm:h-24 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-1 cursor-zoom-in shadow-sm"
                                title="اضغط لتكبير الصورة"
                              >
                                <img
                                  src={placedCard.imageUrl}
                                  alt="صورة التوصيل"
                                  className="max-h-full max-w-full object-contain rounded-lg"
                                />
                              </div>

                              <div className="mt-1.5 flex items-center justify-between w-full text-[11px] text-slate-800 px-1 font-bold font-['Cairo']">
                                <span className="text-emerald-700 flex items-center gap-1 font-black">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>تم التوصيل</span>
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveFromRow(rowIdx, e)}
                                  className="text-rose-600 hover:text-rose-800 font-bold hover:underline flex items-center gap-0.5"
                                  title="إرجاع الصورة إلى المعرض"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>إرجاع</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-2 space-y-1">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mx-auto border border-slate-300">
                                <ArrowDown className="w-4 h-4 text-slate-700" />
                              </div>
                              <span className="text-[11px] font-bold text-slate-700 block font-['Cairo']">
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
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-300 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-200 border border-slate-300 text-slate-900 font-['Cairo'] font-black text-sm sm:text-base">
                🖼️ معرض صور التوصيل (غير مرتبة)
              </span>
              <span className="text-xs font-bold text-slate-600">
                (متبقي {poolCards.length} صورة لوضعها)
              </span>
            </div>

            <span className="text-xs font-bold text-slate-600">
              💡 يمكنك السحب والإفلات أو النقر على الصورة ثم النقر على خانة الجدول
            </span>
          </div>

          {poolCards.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-black text-emerald-950 font-['Cairo']">
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
                    className={`rounded-2xl p-2.5 border-2 transition-all duration-200 cursor-grab active:cursor-grabbing flex flex-col items-center justify-between bg-slate-50 hover:bg-white hover:scale-[1.02] shadow-sm relative ${
                      isSelected
                        ? 'border-sky-600 ring-2 ring-sky-400 bg-sky-50 shadow-md'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-sky-600 text-white font-['Cairo'] font-black text-[10px] shadow-sm">
                        محددة
                      </div>
                    )}

                    {/* Image Preview */}
                    <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-white border border-slate-200 p-1 flex items-center justify-center shadow-inner">
                      <img
                        src={card.imageUrl}
                        alt="صورة خيار"
                        className="max-h-full max-w-full object-contain rounded-lg"
                        loading="lazy"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between w-full text-[11px] font-bold text-slate-800 font-['Cairo']">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Move className="w-3 h-3 text-slate-500" />
                        <span>اسحب للجدول</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedImageUrl(card.imageUrl);
                        }}
                        className="text-sky-700 hover:text-sky-900 p-1 rounded-md hover:bg-slate-200"
                        title="تكبير الصورة"
                      >
                        <Eye className="w-4 h-4" />
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
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-100 border border-slate-300">
            <span className="text-xs sm:text-sm text-slate-900 font-black font-['Cairo']">النتيجة المقدرة لسؤال التوصيل:</span>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-xl font-['Cairo'] font-black text-xs border ${
                matchingScore === 1
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                  : 'bg-slate-200 text-slate-900 border-slate-300'
              }`}>
                {matchingScore === 1 ? '1/1' : '0/1'}
              </span>
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-300 text-xs sm:text-sm text-slate-800 font-bold font-['Cairo']">
            <span className="font-black text-slate-900">سؤال التوصيل التفاعلي</span>
            <span className="text-emerald-700 font-black">
              {placedCount === defaultPairs.length ? 'اكتمل التوصيل ✓' : `${placedCount}/${defaultPairs.length} مكتمل`}
            </span>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-slate-700 font-bold font-['Cairo']">
            {isAllPlaced ? (
              <span className="text-emerald-700 font-black flex items-center gap-1.5">
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
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-['Cairo'] font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              isAllPlaced
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-400 transform hover:-translate-y-0.5'
                : 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed opacity-70'
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setZoomedImageUrl(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full pb-3 border-b border-slate-200 mb-3 text-slate-900">
              <span className="text-sm sm:text-base font-black font-['Cairo'] text-slate-900">معاينة صورة التوصيل بالتفصيل</span>
              <button
                type="button"
                onClick={() => setZoomedImageUrl(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full flex items-center justify-center max-h-[75vh] overflow-hidden rounded-xl bg-slate-50 border border-slate-200 p-2">
              <img
                src={zoomedImageUrl}
                alt="معاينة مكبرة"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
