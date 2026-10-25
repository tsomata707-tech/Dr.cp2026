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
        className="w-full h-full text-slate-400 opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke="#64748b"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* ==========================================================
            1. TOP LEFT: Topographic Level Map & Floating World Islands
            ========================================================== */}
        <g id="gaming-level-path-map" transform="translate(60, 40)">
          {/* Level Waypoint Path with Dotted Arcs */}
          <path
            d="M 50 140 Q 120 80, 190 120 T 320 100 T 450 150 T 560 110"
            strokeDasharray="6 6"
            strokeWidth="1.6"
          />
          {/* Level Node 1 */}
          <circle cx="50" cy="140" r="14" />
          <circle cx="50" cy="140" r="7" />
          <circle cx="50" cy="140" r="2" />
          <text x="50" y="172" fill="#64748b" stroke="none" fontSize="10" fontFamily="sans-serif" textAnchor="middle">LVL 01</text>

          {/* Level Node 2 */}
          <circle cx="190" cy="120" r="12" />
          <circle cx="190" cy="120" r="5" />
          <text x="190" y="150" fill="#64748b" stroke="none" fontSize="10" fontFamily="sans-serif" textAnchor="middle">LVL 02</text>

          {/* Level Node 3 */}
          <circle cx="320" cy="100" r="12" />
          <circle cx="320" cy="100" r="5" />
          <text x="320" y="130" fill="#64748b" stroke="none" fontSize="10" fontFamily="sans-serif" textAnchor="middle">LVL 03</text>

          {/* Level Node 4 - Castle / Boss Flag */}
          <circle cx="450" cy="150" r="15" />
          <path d="M 450 135 L 450 95 L 480 105 L 450 115" />
          <text x="450" y="180" fill="#64748b" stroke="none" fontSize="10" fontFamily="sans-serif" textAnchor="middle">BOSS</text>

          {/* Bonus Path to Secret Area */}
          <path d="M 320 100 Q 360 40, 420 30" strokeDasharray="3 4" />
          <polygon points="420,20 435,30 420,40" />

          {/* Topographic Contour Lines */}
          <path d="M 20 220 C 100 180, 220 240, 340 200 C 440 170, 520 220, 600 190" strokeDasharray="2 4" opacity="0.6" />
          <path d="M 40 250 C 120 210, 250 270, 360 230 C 460 200, 550 250, 620 220" strokeDasharray="2 4" opacity="0.4" />

          {/* Stylized 8-bit Stepped Clouds */}
          <path d="M 120 40 h 40 v -10 h 30 v -15 h 40 v 15 h 30 v 10 h 20 v 15 h -160 z" opacity="0.7" />
          <path d="M 420 60 h 25 v -8 h 20 v -12 h 30 v 12 h 20 v 8 h 15 v 10 h -110 z" opacity="0.5" />
        </g>

        {/* ==========================================================
            2. BOTTOM LEFT: Isometric Platforming & Jumping Mechanics
            ========================================================== */}
        <g id="isometric-game-platforms" transform="translate(80, 560)">
          {/* Isometric Platform 1 (Base) */}
          <g transform="translate(60, 280)">
            {/* Top face */}
            <polygon points="0,0 70,-35 140,0 70,35" />
            {/* Left face */}
            <polygon points="0,0 70,35 70,95 0,60" />
            {/* Right face */}
            <polygon points="140,0 70,35 70,95 140,60" />
            {/* Grid subdivisions on top face */}
            <line x1="35" y1="-17" x2="105" y2="17" opacity="0.5" />
            <line x1="35" y1="17" x2="105" y2="-17" opacity="0.5" />
          </g>

          {/* Jump Trajectory Arc 1 */}
          <path
            d="M 130 260 Q 180 140, 240 180"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <polygon points="236,174 242,180 234,183" fill="#64748b" />

          {/* Isometric Platform 2 (Mid-High) */}
          <g transform="translate(220, 160)">
            <polygon points="0,0 60,-30 120,0 60,30" />
            <polygon points="0,0 60,30 60,80 0,50" />
            <polygon points="120,0 60,30 60,80 120,50" />
            <line x1="30" y1="-15" x2="90" y2="15" opacity="0.5" />
            <line x1="30" y1="15" x2="90" y2="-15" opacity="0.5" />
          </g>

          {/* Jump Trajectory Arc 2 */}
          <path
            d="M 280 140 Q 340 40, 400 90"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <polygon points="396,84 402,90 394,93" fill="#64748b" />

          {/* Isometric Platform 3 (Floating High Goal) */}
          <g transform="translate(380, 70)">
            <polygon points="0,0 70,-35 140,0 70,35" />
            <polygon points="0,0 70,35 70,75 0,40" />
            <polygon points="140,0 70,35 70,75 140,40" />
            {/* Goal Beacon / Target Rings */}
            <ellipse cx="70" cy="0" rx="25" ry="12" />
            <ellipse cx="70" cy="0" rx="14" ry="7" />
            <line x1="70" y1="-30" x2="70" y2="0" />
          </g>

          {/* Stepped Ladder / Stairs Wireframe */}
          <g transform="translate(40, 360)">
            <line x1="0" y1="0" x2="100" y2="-50" />
            <line x1="15" y1="15" x2="115" y2="-35" />
            <line x1="15" y1="-7" x2="25" y2="5" />
            <line x1="35" y1="-17" x2="45" y2="-5" />
            <line x1="55" y1="-27" x2="65" y2="-15" />
            <line x1="75" y1="-37" x2="85" y2="-25" />
            <line x1="95" y1="-47" x2="105" y2="-35" />
          </g>

          {/* Pixelated Coin / Mystery Block Wireframe */}
          <g transform="translate(260, 40)">
            <rect x="0" y="0" width="36" height="36" rx="4" />
            <path d="M 14 12 h 8 v 5 h -4 v 5 h 4" />
            <circle cx="16" cy="27" r="1.5" fill="#64748b" />
          </g>
        </g>

        {/* ==========================================================
            3. TOP RIGHT: Retro Arcade Cabinet & Hardware Schematics
            ========================================================== */}
        <g id="arcade-cabinet-blueprint" transform="translate(1480, 50)">
          {/* Main Arcade Cabinet Outline */}
          <path d="M 60 40 L 160 40 L 170 120 L 140 240 L 180 260 L 170 380 L 70 380 L 60 240 L 80 120 Z" />
          {/* Marquee Header */}
          <rect x="75" y="55" width="80" height="30" rx="3" />
          <line x1="85" y1="70" x2="145" y2="70" strokeDasharray="3 3" />
          {/* CRT Screen Bezel */}
          <rect x="80" y="130" width="75" height="70" rx="6" />
          <rect x="85" y="135" width="65" height="60" rx="4" strokeDasharray="4 2" />
          {/* Game graphics on CRT screen (Pixel ship & mountains) */}
          <path d="M 95 180 L 115 155 L 125 170 L 140 150" opacity="0.6" />
          <polygon points="115,145 118,150 112,150" opacity="0.8" />

          {/* Control Panel (Tilted) */}
          <polygon points="65,235 155,235 175,260 70,260" />
          {/* Joystick Wireframe */}
          <circle cx="95" cy="248" r="5" />
          <line x1="95" y1="248" x2="95" y2="236" />
          <circle cx="95" cy="234" r="4" />
          {/* Action Buttons Wireframe (6 arcade buttons) */}
          <circle cx="118" cy="245" r="3" />
          <circle cx="128" cy="243" r="3" />
          <circle cx="138" cy="245" r="3" />
          <circle cx="118" cy="253" r="3" />
          <circle cx="128" cy="251" r="3" />
          <circle cx="138" cy="253" r="3" />

          {/* Coin Door & Rejection Slots */}
          <rect x="95" y="295" width="45" height="55" rx="3" />
          <rect x="103" y="305" width="10" height="15" rx="1" />
          <rect x="122" y="305" width="10" height="15" rx="1" />
          <line x1="108" y1="310" x2="108" y2="315" />
          <line x1="127" y1="310" x2="127" y2="315" />

          {/* Schematic Dimension Callout Lines */}
          <line x1="35" y1="40" x2="35" y2="380" strokeDasharray="3 3" opacity="0.5" />
          <line x1="30" y1="40" x2="40" y2="40" opacity="0.5" />
          <line x1="30" y1="380" x2="40" y2="380" opacity="0.5" />
          <text x="25" y="215" fill="#64748b" stroke="none" fontSize="9" fontFamily="sans-serif" textAnchor="middle" transform="rotate(-90 25 215)">H: 1750mm</text>
        </g>

        {/* ==========================================================
            4. BOTTOM RIGHT: Controller Schematics & HUD Coordinates
            ========================================================== */}
        <g id="controller-blueprint" transform="translate(1380, 580)">
          {/* Handheld Gamepad Body Outline */}
          <path
            d="M 90 120 
               C 110 80, 170 80, 220 95 
               C 270 80, 330 80, 350 120 
               C 370 160, 370 230, 330 250 
               C 300 265, 275 225, 260 215 
               C 240 210, 200 210, 180 215 
               C 165 225, 140 265, 110 250 
               C 70 230, 70 160, 90 120 Z"
          />

          {/* D-Pad Wireframe (Cross) */}
          <g transform="translate(120, 140)">
            <path d="M 12 0 h 12 v 12 h 12 v 12 h -12 v 12 h -12 v -12 h -12 v -12 h 12 z" />
            <polygon points="18,3 21,7 15,7" />
            <polygon points="18,33 21,29 15,29" />
            <polygon points="3,18 7,15 7,21" />
            <polygon points="33,18 29,15 29,21" />
          </g>

          {/* Analog Sticks (Dual Thumbsticks) */}
          <circle cx="180" cy="190" r="18" />
          <circle cx="180" cy="190" r="10" strokeDasharray="3 3" />
          <circle cx="180" cy="190" r="3" />

          <circle cx="260" cy="190" r="18" />
          <circle cx="260" cy="190" r="10" strokeDasharray="3 3" />
          <circle cx="260" cy="190" r="3" />

          {/* Action Diamond Buttons (A, B, X, Y) */}
          <g transform="translate(290, 130)">
            <circle cx="25" cy="8" r="7" />
            <circle cx="42" cy="25" r="7" />
            <circle cx="25" cy="42" r="7" />
            <circle cx="8" cy="25" r="7" />
            {/* Inner Button Labels */}
            <text x="25" y="11" fill="#64748b" stroke="none" fontSize="8" fontFamily="sans-serif" textAnchor="middle">Y</text>
            <text x="42" y="28" fill="#64748b" stroke="none" fontSize="8" fontFamily="sans-serif" textAnchor="middle">B</text>
            <text x="25" y="45" fill="#64748b" stroke="none" fontSize="8" fontFamily="sans-serif" textAnchor="middle">A</text>
            <text x="8" y="28" fill="#64748b" stroke="none" fontSize="8" fontFamily="sans-serif" textAnchor="middle">X</text>
          </g>

          {/* Center Touchpad / Menu Buttons */}
          <rect x="200" y="125" width="40" height="25" rx="4" />
          <line x1="210" y1="137" x2="216" y2="137" />
          <line x1="224" y1="137" x2="230" y2="137" />

          {/* HUD Target & Telemetry Data (Game Environment HUD) */}
          <g transform="translate(60, 290)">
            <line x1="0" y1="0" x2="350" y2="0" strokeDasharray="8 4" opacity="0.4" />
            <text x="0" y="-10" fill="#64748b" stroke="none" fontSize="10" fontFamily="monospace" opacity="0.7">
              SYS.GAMING_ENV // PROTOCOL: v2.4 // LEVEL: 04 // XP: 2400
            </text>
            <rect x="0" y="8" width="160" height="6" rx="2" strokeDasharray="2 2" />
            <rect x="2" y="10" width="110" height="2" fill="#64748b" stroke="none" opacity="0.5" />
          </g>
        </g>

        {/* ==========================================================
            5. AMBIENT GAMING WORLD ACCENTS (Sides & Grid Matrix)
            ========================================================== */}
        {/* Left Side: Pixel Health Hearts & Mana Meter Line Art */}
        <g transform="translate(40, 360)">
          {/* Heart 1 outline */}
          <path d="M 20 20 A 7 7 0 0 0 6 20 C 6 28 20 38 20 38 C 20 38 34 28 34 20 A 7 7 0 0 0 20 20 Z" />
          {/* Heart 2 outline */}
          <path d="M 55 20 A 7 7 0 0 0 41 20 C 41 28 55 38 55 38 C 55 38 69 28 69 20 A 7 7 0 0 0 55 20 Z" />
          {/* Heart 3 outline */}
          <path d="M 90 20 A 7 7 0 0 0 76 20 C 76 28 90 38 90 38 C 90 38 104 28 104 20 A 7 7 0 0 0 90 20 Z" />
          {/* Mana / Energy Bar wireframe */}
          <rect x="6" y="48" width="100" height="8" rx="2" />
          <line x1="30" y1="48" x2="30" y2="56" />
          <line x1="55" y1="48" x2="55" y2="56" />
          <line x1="80" y1="48" x2="80" y2="56" />
        </g>

        {/* Right Side: Quest Compass Rose Line Art */}
        <g transform="translate(1780, 420)">
          <circle cx="40" cy="40" r="32" strokeDasharray="2 4" />
          <circle cx="40" cy="40" r="22" />
          <polygon points="40,10 44,36 40,32 36,36" />
          <polygon points="40,70 44,44 40,48 36,44" />
          <polygon points="10,40 36,44 32,40 36,36" />
          <polygon points="70,40 44,44 48,40 44,36" />
          <text x="40" y="6" fill="#64748b" stroke="none" fontSize="8" fontFamily="sans-serif" textAnchor="middle">N</text>
        </g>
      </svg>
    </div>
  );
};
