import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  GripHorizontal,
  Minus,
  Maximize2,
  X,
  Sparkles,
  BookOpen,
  Info,
  CheckCircle,
} from 'lucide-react';

interface DraggableLevelInstructionsProps {
  levelNumber: number;
  levelTitle: string;
  instructions: string;
}

export const DraggableLevelInstructions: React.FC<DraggableLevelInstructionsProps> = ({
  levelNumber,
  levelTitle,
  instructions,
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    // Default position: top left of viewport for RTL layout so it doesn't cover main content
    return { x: 24, y: 110 };
  });

  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0,
    mouseY: 0,
    posX: 24,
    posY: 110,
  });

  const cardRef = useRef<HTMLDivElement | null>(null);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from header/handle
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  // Touch drag handlers for mobile & tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      dragStartRef.current = {
        mouseX: e.touches[0].clientX,
        mouseY: e.touches[0].clientY,
        posX: position.x,
        posY: position.y,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      const newX = Math.max(10, Math.min(window.innerWidth - 320, dragStartRef.current.posX + deltaX));
      const newY = Math.max(70, Math.min(window.innerHeight - 150, dragStartRef.current.posY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - dragStartRef.current.mouseX;
      const deltaY = e.touches[0].clientY - dragStartRef.current.mouseY;

      const newX = Math.max(10, Math.min(window.innerWidth - 280, dragStartRef.current.posX + deltaX));
      const newY = Math.max(70, Math.min(window.innerHeight - 150, dragStartRef.current.posY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const isObjectives = levelNumber === 9;

  if (!isVisible) {
    return (
      <button
        type="button"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 left-6 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(251,191,36,0.5)] border-2 border-amber-300 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
        title={isObjectives ? 'إظهار قائمة أهداف المستوى العائمة' : 'إظهار قائمة أهداف المستوى العائمة'}
      >
        <BookOpen className="w-4 h-4" />
        <span>{isObjectives ? `🎯 إظهار أهداف المستوى ${levelNumber}` : `📋 إظهار أهداف المستوى ${levelNumber}`}</span>
      </button>
    );
  }

  return (
    <div
      ref={cardRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className={`fixed z-40 select-none transition-shadow ${
        isDragging ? 'cursor-grabbing shadow-[0_0_50px_rgba(251,191,36,0.6)] opacity-95 scale-[1.02]' : 'shadow-2xl'
      } ${
        isMinimized ? 'w-64 sm:w-72' : 'w-80 sm:w-96'
      }`}
    >
      <div className="rounded-2xl sm:rounded-3xl bg-[#0d122b]/95 backdrop-blur-xl border-2 border-amber-400/90 overflow-hidden text-right font-['Cairo',_sans-serif]">
        {/* Drag Handle & Header */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="p-3 bg-gradient-to-r from-slate-900 via-[#182042] to-slate-900 border-b border-amber-500/40 cursor-grab flex items-center justify-between gap-2"
          title="اضغط مع السحب لتحريك القائمة في أي مكان"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 shrink-0">
              <GripHorizontal className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-bold block leading-none">
                {isObjectives ? 'أهداف المستوى 🎯' : 'قائمة عائمة متحركة ✋'}
              </span>
              <h4 className="text-xs sm:text-sm font-black text-white font-['Tajawal'] truncate max-w-[170px]">
                {isObjectives ? `أهداف المستوى ${levelNumber}` : `أهداف المستوى ${levelNumber}`}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title={isMinimized ? 'تكبير القائمة' : 'تصغير القائمة'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 transition cursor-pointer"
              title="إخفاء مؤقت"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body (when not minimized) */}
        {!isMinimized && (
          <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500/30">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>يمكنك تحريك هذه القائمة في أي مكان بالشاشة</span>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed font-['IBM_Plex_Sans_Arabic'] whitespace-pre-line bg-black/40 p-3 rounded-xl border border-slate-800/80">
              {instructions || (
                '1. تصفح الفيديوهات والصور التوضيحية الخاصة بالمستوى.\n2. أجب عن أسئلة المستوى التفاعلية بدقة.\n3. ارفع نشاطك الخاص بأسفل الصفحة (فيديو أو صورة أو PDF).\n4. اضغط على زر إنهاء المستوى للانتقال للمستوى التالي.'
              )}
            </div>

            <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle className="w-3 h-3" />
                <span>النشاط الخاص مطلوب لإنهاء المستوى</span>
              </span>
              <span className="text-amber-400 font-bold">المستوى {levelNumber}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
