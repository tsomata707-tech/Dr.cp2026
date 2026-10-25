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
  // Increased font sizes by +2 and enlarged frames for superior visibility
  const sizeMap = {
    sm: { box: 'w-10 h-10', text: 'text-lg', title: 'text-base', sub: 'text-[10px]' },
    md: { box: 'w-14 h-14', text: 'text-2xl', title: 'text-lg', sub: 'text-xs' },
    lg: { box: 'w-20 h-20', text: 'text-4xl', title: 'text-2xl', sub: 'text-sm' },
    xl: { box: 'w-28 h-28', text: 'text-6xl', title: 'text-3xl', sub: 'text-base' },
  };

  const current = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      id="cp-permanent-logo"
    >
      {/* Visual Tech Icon Badge in White & Sky Blue Palette */}
      <div className="relative group">
        {/* Soft Sky & Cyan Ambient Glow */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-sky-400/30 via-cyan-300/30 to-blue-400/30 blur-md opacity-80 group-hover:opacity-100 transition-opacity" />

        {/* Icon Frame: Crisp White & Sky Tint with Sky-400 Border */}
        <div
          className={`${current.box} relative rounded-2xl bg-gradient-to-br from-white via-sky-50 to-cyan-50 p-[2.5px] border-2 border-sky-400 shadow-[0_4px_16px_rgba(2,132,199,0.25)] flex items-center justify-center transition-transform hover:scale-105 duration-300`}
        >
          {/* Inner Badge Surface */}
          <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-white via-sky-50/90 to-sky-100/70 flex items-center justify-center overflow-hidden relative shadow-inner">
            {/* Subtle Tech Blueprint Circles (Sky Blue) */}
            <svg
              className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
              viewBox="0 0 100 100"
              fill="none"
              stroke="#0284c7"
              strokeWidth="1.5"
            >
              <circle cx="50" cy="50" r="42" strokeDasharray="4 6" />
              <path d="M10 50h80M50 10v80" strokeOpacity="0.35" />
            </svg>

            {/* "Cp" Monogram:
                - Enlarged font size (+2) via current.text
                - Letter 'C' in warm golden-amber (#d97706)
                - Letter 'p' in deep vibrant sky-blue (#0284c7)
                - Solid, permanent colors with inline styles so 'p' is NEVER white or invisible!
            */}
            <div
              dir="ltr"
              className={`relative z-10 flex flex-row items-baseline justify-center font-black tracking-normal select-none ${current.text}`}
            >
              <span
                className="cp-letter-c font-['Outfit'] font-black leading-none drop-shadow-[0_1px_3px_rgba(217,119,6,0.35)]"
                style={{
                  color: '#d97706',
                  WebkitTextFillColor: '#d97706',
                  background: 'none',
                  textShadow: '0 1px 2px rgba(217,119,6,0.25)',
                }}
              >
                C
              </span>
              <span
                className="cp-letter-p font-['Outfit'] font-black leading-none ml-0.5 drop-shadow-[0_1px_3px_rgba(2,132,199,0.35)]"
                style={{
                  color: '#0284c7',
                  WebkitTextFillColor: '#0284c7',
                  background: 'none',
                  textShadow: '0 1px 2px rgba(2,132,199,0.25)',
                }}
              >
                p
              </span>
            </div>
          </div>
        </div>

        {/* Small Golden Corner Accent Gem */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white shadow-[0_0_8px_#f59e0b]" />
      </div>

      {/* Accompanying Label (for Navbar & Headers) */}
      {showText && (
        <div className="flex flex-col text-right leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              dir="ltr"
              className={`${current.title} font-black tracking-wide text-sky-950 font-['Outfit']`}
            >
              Cp
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-sky-300 bg-sky-100/90 text-sky-800 font-bold font-['Cairo'] shadow-xs">
              سي بي
            </span>
          </div>
          <span className={`${current.sub} text-sky-700 font-['Cairo'] font-bold`}>
            بوابة الأنظمة الذكية
          </span>
        </div>
      )}
    </div>
  );
};
