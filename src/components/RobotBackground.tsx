import React from 'react';

export const RobotBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" id="robot-bg-container">
      {/* Base Canvas White & Sky Blue Tone */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-cyan-100" />

      {/* Main Artwork with soft light overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 sm:opacity-40 filter contrast-110 brightness-110 transition-opacity duration-1000"
        style={{
          backgroundImage: `url('/ai_cyber_conflict_bg.jpg')`,
        }}
      />

      {/* Dynamic Cybernetic Ambient Sky & Cyan Flares */}
      <div className="absolute -top-24 -right-24 w-[650px] h-[650px] rounded-full bg-cyan-400/25 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-[650px] h-[650px] rounded-full bg-sky-400/30 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] rounded-full bg-cyan-300/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-sky-300/25 blur-[130px] pointer-events-none" />

      {/* Cybernetic High-Tech HUD & Warfare Reticles (Pure Visual SVG Layer - Cyan Accents) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-45"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="cyberGridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="laserBeam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </linearGradient>

          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Top Left: Cybernetic Radar Circle */}
        <g transform="translate(140, 140)" stroke="#0284c7" strokeWidth="1.2" fill="none">
          <circle cx="0" cy="0" r="70" strokeDasharray="6 4" opacity="0.5" />
          <circle cx="0" cy="0" r="45" opacity="0.6" />
          <circle cx="0" cy="0" r="20" stroke="#06b6d4" strokeWidth="1.8" />
          <line x1="-80" y1="0" x2="80" y2="0" opacity="0.4" />
          <line x1="0" y1="-80" x2="0" y2="80" opacity="0.4" />
          <circle cx="30" cy="-25" r="3" fill="#0284c7" filter="url(#cyanGlow)" />
          <circle cx="-20" cy="35" r="2.5" fill="#06b6d4" />
        </g>

        {/* Top Right: AI Tactical Matrix */}
        <g transform="translate(1300, 140)" stroke="#06b6d4" strokeWidth="1.2" fill="none">
          <circle cx="0" cy="0" r="60" strokeDasharray="4 6" opacity="0.5" />
          <polygon points="0,-50 43,25 -43,25" stroke="#0284c7" opacity="0.6" />
          <circle cx="0" cy="0" r="14" stroke="#0284c7" strokeWidth="1.8" />
          <circle cx="0" cy="0" r="4" fill="#0284c7" />
          <line x1="-70" y1="0" x2="70" y2="0" opacity="0.4" />
        </g>

        {/* Tactical Crosshairs on 4 corners */}
        <g stroke="#0284c7" strokeWidth="1" opacity="0.5" fill="none">
          <g transform="translate(60, 60)">
            <line x1="-15" y1="0" x2="15" y2="0" />
            <line x1="0" y1="-15" x2="0" y2="15" />
            <circle cx="0" cy="0" r="8" />
          </g>
          <g transform="translate(1380, 60)">
            <line x1="-15" y1="0" x2="15" y2="0" />
            <line x1="0" y1="-15" x2="0" y2="15" />
            <circle cx="0" cy="0" r="8" />
          </g>
          <g transform="translate(60, 840)">
            <line x1="-15" y1="0" x2="15" y2="0" />
            <line x1="0" y1="-15" x2="0" y2="15" />
            <circle cx="0" cy="0" r="8" />
          </g>
          <g transform="translate(1380, 840)">
            <line x1="-15" y1="0" x2="15" y2="0" />
            <line x1="0" y1="-15" x2="0" y2="15" />
            <circle cx="0" cy="0" r="8" />
          </g>
        </g>

        {/* Laser Scanning Grid Lines */}
        <line x1="0" y1="450" x2="1440" y2="450" stroke="url(#laserBeam)" strokeWidth="1.5" opacity="0.6" />
      </svg>

      {/* Soft Light Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(240,249,255,0.4)_50%,rgba(224,242,254,0.85)_100%)]" />

      {/* Cybernetic Sky-Blue Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0284c7 1.5px, transparent 1.5px)`,
          backgroundSize: '28px 28px',
        }}
      />
    </div>
  );
};
