import React from 'react';

interface CpLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const CpLogo: React.FC<CpLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8', text: 'text-sm', title: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'w-11 h-11', text: 'text-lg', title: 'text-base', sub: 'text-[10px]' },
    lg: { box: 'w-16 h-16', text: 'text-2xl', title: 'text-xl', sub: 'text-xs' },
    xl: { box: 'w-24 h-24', text: 'text-4xl', title: 'text-2xl', sub: 'text-sm' },
  };

  const current = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      id="cp-permanent-logo"
    >
      {/* Visual Hexagon / Rounded Icon Badge with Golden Border */}
      <div className="relative group">
        {/* Glow halo behind icon */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#d4af37]/40 via-[#9333ea]/30 to-[#00f2fe]/30 blur-md opacity-75 group-hover:opacity-100 transition-opacity" />

        {/* Icon Frame */}
        <div
          className={`${current.box} relative rounded-2xl bg-gradient-to-br from-[#181428] via-[#0d0a17] to-[#05040a] p-[2px] border-2 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.35)] flex items-center justify-center`}
        >
          {/* Subtle Cyber Inner Texture */}
          <div className="w-full h-full rounded-[12px] bg-slate-950/80 flex items-center justify-center overflow-hidden relative">
            <svg
              className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
              viewBox="0 0 100 100"
              fill="none"
              stroke="#d4af37"
              strokeWidth="1.5"
            >
              <circle cx="50" cy="50" r="42" strokeDasharray="4 6" />
              <path d="M10 50h80M50 10v80" strokeOpacity="0.3" />
            </svg>

            {/* "Cp" Monogram: C first (Capital), p second (small) */}
            <div
              dir="ltr"
              className="relative z-10 flex flex-row items-baseline justify-center font-black tracking-normal select-none"
            >
              <span className="bg-gradient-to-r from-[#ffd700] via-[#ff9a3c] to-[#ff6b8b] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(255,215,0,0.5)] font-['Outfit'] leading-none">
                C
              </span>
              <span className="bg-gradient-to-r from-[#00f2fe] via-[#4facfe] to-[#b06ab3] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(79,172,254,0.5)] font-['Outfit'] leading-none ml-0.5">
                p
              </span>
            </div>
          </div>
        </div>

        {/* Small Golden Corner Accent */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#f6d365] shadow-[0_0_6px_#f6d365]" />
      </div>

      {/* Accompanying Label */}
      {showText && (
        <div className="flex flex-col text-right leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              dir="ltr"
              className={`${current.title} font-black tracking-wide text-white font-['Outfit']`}
            >
              Cp
            </span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 text-amber-300 font-semibold font-['Cairo']">
              سي بي
            </span>
          </div>
          <span className={`${current.sub} text-slate-400/80 font-['Cairo'] font-medium`}>
            بوابة الأنظمة الذكية
          </span>
        </div>
      )}
    </div>
  );
};
