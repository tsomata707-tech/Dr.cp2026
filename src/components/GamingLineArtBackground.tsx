import React from 'react';

/**
 * GamingLineArtBackground
 * 
 * Delicate, subtle architectural vector line-art depicting an authentic gaming environment:
 * - Isometric floating level platforms & jumping trajectory arcs
 * - Retro arcade cabinet & controller schematic blueprint wireframes
 * - Topographic adventure world map with level path nodes & flags
 * - Pixel landscape contour hills & stylized gaming clouds
 * 
 * Drawn strictly in very faint light gray lines (بخط رصاصي خفيف جدا وليست أيقونات).
 * Pure stroke, no fill, zero interference with cards or text.
 */
export const GamingLineArtBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
      id="gaming-line-art-bg"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full text-sky-600 opacity-25"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke="#0284c7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* ==========================================================
            1. TOP LEFT: Friendly AI Gaming Robot (روبوت ذكي)
            ========================================================== */}
        <g id="gaming-robot-left" transform="translate(120, 100)">
          {/* Robot Antenna & Signal Waves */}
          <line x1="60" y1="0" x2="60" y2="25" strokeWidth="2" />
          <circle cx="60" cy="-5" r="6" fill="#0284c7" opacity="0.3" />
          <path d="M 45 10 Q 60 2, 75 10" strokeDasharray="3 3" />
          
          {/* Robot Head (Rounded Square) */}
          <rect x="25" y="25" width="70" height="55" rx="12" fill="#f4f7fb" fillOpacity="0.5" strokeWidth="2" />
          {/* Robot Eyes (Glowing LED circles) */}
          <circle cx="45" cy="50" r="8" fill="#0284c7" fillOpacity="0.4" />
          <circle cx="75" cy="50" r="8" fill="#0284c7" fillOpacity="0.4" />
          <circle cx="47" cy="48" r="3" fill="#ffffff" />
          <circle cx="77" cy="48" r="3" fill="#ffffff" />
          {/* Robot Smile / Mouth */}
          <path d="M 48 65 Q 60 73 72 65" strokeWidth="2" />
          
          {/* Robot Neck */}
          <rect x="52" y="80" width="16" height="12" rx="3" />

          {/* Robot Body / Torso */}
          <path d="M 15 92 h 90 a 10 10 0 0 1 10 10 v 60 a 15 15 0 0 1 -15 15 h -90 a 15 15 0 0 1 -15 -15 v -60 a 10 10 0 0 1 10 -10 z" fill="#f4f7fb" fillOpacity="0.4" strokeWidth="2" />
          
          {/* Chest Screen / AI Core */}
          <rect x="40" y="108" width="40" height="30" rx="6" strokeDasharray="3 3" />
          <circle cx="60" cy="123" r="6" fill="#38bdf8" fillOpacity="0.5" />

          {/* Robotic Arms holding a mini gamepad */}
          <path d="M 15 110 Q -10 120 5 150" strokeWidth="3" />
          <path d="M 105 110 Q 130 120 115 150" strokeWidth="3" />

          {/* Robot Label Tag */}
          <text x="60" y="195" fill="#0284c7" stroke="none" fontSize="11" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">AI GAMING BOT v2</text>
        </g>

        {/* ==========================================================
            2. BOTTOM LEFT: Isometric Platforming & Gaming World
            ========================================================== */}
        <g id="isometric-game-platforms" transform="translate(80, 620)">
          {/* Isometric Platform (Base) */}
          <g transform="translate(60, 200)">
            <polygon points="0,0 70,-35 140,0 70,35" fill="#e0f2fe" fillOpacity="0.3" />
            <polygon points="0,0 70,35 70,95 0,60" fill="#bae6fd" fillOpacity="0.2" />
            <polygon points="140,0 70,35 70,95 140,60" fill="#7dd3fc" fillOpacity="0.1" />
          </g>

          {/* Pixelated Coin / Mystery Block */}
          <g transform="translate(240, 20)">
            <rect x="0" y="0" width="40" height="40" rx="6" fill="#fef08a" fillOpacity="0.3" stroke="#eab308" strokeWidth="2" />
            <text x="20" y="27" fill="#854d0e" stroke="none" fontSize="22" fontWeight="bold" fontFamily="'Cairo', sans-serif" textAnchor="middle">?</text>
          </g>
        </g>

        {/* ==========================================================
            3. TOP RIGHT: Detailed PlayStation / Game Controller (ذراع تحكم ألعاب)
            ========================================================== */}
        <g id="playstation-controller-right" transform="translate(1420, 80)">
          {/* Modern Gamepad Outer Shell */}
          <path
            d="M 100 130 
               C 120 70, 200 60, 260 80
               C 320 60, 400 70, 420 130
               C 450 190, 430 280, 380 300
               C 340 315, 310 260, 290 240
               C 270 230, 250 230, 230 240
               C 210 260, 180 315, 140 300
               C 90 280, 70 190, 100 130 Z"
            fill="#f4f7fb"
            fillOpacity="0.4"
            strokeWidth="2.5"
          />

          {/* D-Pad (Left Side) */}
          <g transform="translate(140, 160)">
            <path d="M 14 0 h 16 v 16 h 16 v 16 h -16 v 16 h -16 v -16 h -16 v -16 h 16 z" fill="#0284c7" fillOpacity="0.2" />
          </g>

          {/* Dual Analog Sticks (Thumbsticks with glowing rings) */}
          <circle cx="190" cy="230" r="24" fill="#0284c7" fillOpacity="0.15" strokeWidth="2" />
          <circle cx="190" cy="230" r="12" strokeDasharray="3 3" />
          
          <circle cx="330" cy="230" r="24" fill="#0284c7" fillOpacity="0.15" strokeWidth="2" />
          <circle cx="330" cy="230" r="12" strokeDasharray="3 3" />

          {/* Action Buttons (Triangle, Circle, Cross, Square - Right Side) */}
          <g transform="translate(330, 150)">
            <circle cx="25" cy="0" r="10" fill="#38bdf8" fillOpacity="0.3" />
            <text x="25" y="4" fill="#0284c7" stroke="none" fontSize="10" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">▲</text>

            <circle cx="50" cy="25" r="10" fill="#f43f5e" fillOpacity="0.3" />
            <text x="50" y="29" fill="#e11d48" stroke="none" fontSize="11" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">◯</text>

            <circle cx="25" cy="50" r="10" fill="#3b82f6" fillOpacity="0.3" />
            <text x="25" y="54" fill="#2563eb" stroke="none" fontSize="11" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">✕</text>

            <circle cx="0" cy="25" r="10" fill="#a855f7" fillOpacity="0.3" />
            <text x="0" y="29" fill="#9333ea" stroke="none" fontSize="11" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">◼</text>
          </g>

          {/* Center Touchpad / Lightbar */}
          <rect x="210" y="110" width="100" height="40" rx="8" fill="#0284c7" fillOpacity="0.1" strokeWidth="2" />
          <line x1="230" y1="130" x2="290" y2="130" stroke="#38bdf8" strokeWidth="2" />

          <text x="260" y="340" fill="#0284c7" stroke="none" fontSize="11" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">PLAYSTATION / GAMEPAD WIREFRAME</text>
        </g>

        {/* ==========================================================
            4. BOTTOM RIGHT: Cartoon Gaming Stars & Floating Elements
            ========================================================== */}
        <g id="cartoon-stars-right" transform="translate(1500, 680)">
          {/* Cartoon Star 1 */}
          <path d="M 40 0 L 52 28 L 80 32 L 60 52 L 65 80 L 40 65 L 15 80 L 20 52 L 0 32 L 28 28 Z" fill="#fef08a" fillOpacity="0.4" stroke="#eab308" strokeWidth="2" />
          
          {/* Floating Circle Bubbles */}
          <circle cx="-60" cy="40" r="12" fill="#38bdf8" fillOpacity="0.2" stroke="#0284c7" strokeWidth="2" />
          <circle cx="-90" cy="-30" r="18" fill="#c084fc" fillOpacity="0.2" stroke="#a855f7" strokeWidth="2" />
          <circle cx="110" cy="-60" r="14" fill="#4ade80" fillOpacity="0.2" stroke="#22c55e" strokeWidth="2" />
        </g>

        {/* ==========================================================
            5. AMBIENT BACKGROUND ACCENTS & HUD GRIDS
            ========================================================== */}
        {/* Left Side Health Hearts */}
        <g transform="translate(50, 420)">
          <path d="M 25 25 A 10 10 0 0 0 5 25 C 5 40 25 55 25 55 C 25 55 45 40 45 25 A 10 10 0 0 0 25 25 Z" fill="#f43f5e" fillOpacity="0.3" stroke="#e11d48" strokeWidth="2" />
          <path d="M 80 25 A 10 10 0 0 0 60 25 C 60 40 80 55 80 55 C 80 55 100 40 100 25 A 10 10 0 0 0 80 25 Z" fill="#f43f5e" fillOpacity="0.3" stroke="#e11d48" strokeWidth="2" />
        </g>

        {/* Right Side HUD System Data */}
        <g transform="translate(1450, 520)">
          <text x="0" y="0" fill="#0284c7" stroke="none" fontSize="10" fontWeight="bold" fontFamily="'Cairo', sans-serif" opacity="0.6">
            AI_GAMING_ENVIRONMENT // READY
          </text>
          <rect x="0" y="8" width="220" height="6" rx="3" fill="#0284c7" fillOpacity="0.1" />
          <rect x="2" y="10" width="160" height="2" fill="#0284c7" fillOpacity="0.6" stroke="none" />
        </g>
      </svg>
    </div>
  );
};
