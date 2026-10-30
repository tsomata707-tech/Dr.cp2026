import React, { useState, useEffect } from 'react';
import {
  Video,
  Play,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  HardDrive,
  Globe,
  Film,
} from 'lucide-react';
import { EducationalVideo } from '../types';

interface MultiPartVideoPlayerProps {
  videos: EducationalVideo[];
  title?: string;
  className?: string;
  showHeader?: boolean;
  onSeek?: () => void;
}

export const MultiPartVideoPlayer: React.FC<MultiPartVideoPlayerProps> = ({
  videos,
  title,
  className = '',
  showHeader = true,
  onSeek,
}) => {
  const [selectedPartIndex, setSelectedPartIndex] = useState<number>(0);

  // Keep selectedPartIndex in bounds if videos change
  useEffect(() => {
    if (selectedPartIndex >= videos.length) {
      setSelectedPartIndex(Math.max(0, videos.length - 1));
    }
  }, [videos.length, selectedPartIndex]);

  if (!videos || videos.length === 0) {
    return (
      <div className={`p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 space-y-2 ${className}`}>
        <Video className="w-10 h-10 text-slate-600 mx-auto" />
        <p className="text-sm font-bold">لا يوجد فيديوهات مرفوعة حالياً لهذا العنوان.</p>
      </div>
    );
  }

  const currentVideo = videos[selectedPartIndex] || videos[0];
  const hasMultipleParts = videos.length > 1;

  const handleNextPart = () => {
    if (selectedPartIndex < videos.length - 1) {
      setSelectedPartIndex(selectedPartIndex + 1);
    }
  };

  const handlePrevPart = () => {
    if (selectedPartIndex > 0) {
      setSelectedPartIndex(selectedPartIndex - 1);
    }
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-[#0c0f24] via-[#090b1c] to-[#060814] border-2 border-blue-500/50 shadow-2xl overflow-hidden font-['Cairo',_sans-serif] text-right transition-all ${className}`}
    >
      {/* 1. Header Bar: Title, Part Indicator & Actual Duration */}
      {showHeader && (
        <div className="p-3.5 sm:p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/25 border border-blue-400/50 text-blue-300 flex items-center justify-center shrink-0 shadow-sm">
              <Film className="w-4 h-4 stroke-[2.2]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white font-['Tajawal']">
                  {title || currentVideo.title}
                </span>

                {hasMultipleParts && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[10px] font-bold">
                    {currentVideo.partCustomTitle || (currentVideo.partNumber ? `الجزء ${currentVideo.partNumber}` : `الجزء ${selectedPartIndex + 1}`)}
                  </span>
                )}

                {currentVideo.videoType === 'file' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">
                    ملف من الجهاز 🟢
                  </span>
                )}
              </div>

              {hasMultipleParts && (
                <p className="text-[11px] text-slate-300 mt-0.5 font-bold">
                  {currentVideo.partCustomTitle ? `${currentVideo.partCustomTitle}: ${currentVideo.title}` : (currentVideo.partTitle || currentVideo.title)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentVideo.duration && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-300 text-xs font-bold ">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>المدة الفعلية: {currentVideo.duration}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 2. Responsive Video Player Container (16:9 on all devices) */}
      <div className="relative aspect-video w-full bg-black border-y border-slate-900/60 overflow-hidden shadow-inner flex items-center justify-center">
        {currentVideo.videoType === 'youtube' ||
        currentVideo.videoUrl.includes('youtube.com') ||
        currentVideo.videoUrl.includes('youtu.be') ? (
          <iframe
            key={currentVideo.id}
            src={currentVideo.videoUrl}
            title={currentVideo.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            key={currentVideo.id}
            src={currentVideo.videoUrl}
            controls
            preload="metadata"
            className="w-full h-full object-contain"
            onSeeking={() => onSeek?.()}
          />
        )}
      </div>

      {/* 3. Multi-Parts Interactive Bar (تنسيق الشاشة أوتوماتيك للعمل على جميع الأجهزة) */}
      {hasMultipleParts && (
        <div className="p-3.5 sm:p-4 bg-slate-950/90 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Layers className="w-4 h-4" />
              <span>أجزاء الشرح المتاحة (بحد أقصى ٥ أجزاء):</span>
            </div>

            <div className="text-[11px] text-slate-400 ">
              اختر الجزء للمشاهدة المباشرة
            </div>
          </div>

          {/* Responsive Parts Grid / Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {videos.map((vid, idx) => {
              const isSelected = idx === selectedPartIndex;
              const partLabel = vid.partCustomTitle || (vid.partNumber ? `الجزء ${vid.partNumber}` : `الجزء ${idx + 1}`);

              return (
                <button
                  key={vid.id || idx}
                  type="button"
                  onClick={() => setSelectedPartIndex(idx)}
                  className={`p-2.5 rounded-xl border-2 transition-all flex flex-col justify-between gap-1 text-right cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/30 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] ring-1 ring-blue-400'
                      : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black font-['Tajawal'] flex items-center gap-1">
                      <Play className={`w-3 h-3 ${isSelected ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                      <span className="truncate">{partLabel}</span>
                    </span>

                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                    )}
                  </div>

                  <p className="text-[10px] text-slate-300 line-clamp-1 truncate w-full font-bold">
                    {vid.title}
                  </p>

                  {vid.duration && (
                    <span className="text-[10px]  text-amber-300/90 bg-black/40 px-1.5 py-0.5 rounded w-fit mt-0.5">
                      ⏱️ {vid.duration}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Prev / Next Parts Navigation Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
            <button
              type="button"
              disabled={selectedPartIndex === 0}
              onClick={handlePrevPart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              <span>الجزء السابق</span>
            </button>

            <span className="text-[11px] text-slate-300 font-bold">
              {currentVideo.partCustomTitle || `الجزء ${selectedPartIndex + 1}`} ({selectedPartIndex + 1} من {videos.length})
            </span>

            <button
              type="button"
              disabled={selectedPartIndex >= videos.length - 1}
              onClick={handleNextPart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <span>الجزء التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
