// High-fidelity SVG illustration data URIs for Matching Questions (Adobe Captivate 2019)

function encodeSvg(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export const MATCHING_ASSETS_Q4 = {
  step1_preferences: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
      <defs>
        <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <linearGradient id="accent1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#818cf8"/>
        </linearGradient>
      </defs>
      <rect width="320" height="200" rx="16" fill="url(#bg1)" stroke="#38bdf8" stroke-width="2"/>
      <!-- Menu bar mockup -->
      <rect x="20" y="20" width="280" height="28" rx="6" fill="#0f172a" stroke="#334155"/>
      <text x="35" y="38" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold">File</text>
      <rect x="70" y="23" width="45" height="22" rx="4" fill="#38bdf8" fill-opacity="0.2"/>
      <text x="78" y="38" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">Edit</text>
      <text x="125" y="38" fill="#94a3b8" font-family="sans-serif" font-size="12">Insert</text>
      <text x="170" y="38" fill="#94a3b8" font-family="sans-serif" font-size="12">Window</text>
      <!-- Dropdown menu -->
      <g filter="drop-shadow(0 8px 16px rgba(0,0,0,0.5))">
        <rect x="70" y="52" width="160" height="125" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="85" y="74" fill="#64748b" font-family="sans-serif" font-size="11">Undo (Ctrl+Z)</text>
        <text x="85" y="96" fill="#64748b" font-family="sans-serif" font-size="11">Redo (Ctrl+Y)</text>
        <line x1="80" y1="108" x2="220" y2="108" stroke="#334155"/>
        <!-- Highlighted Preferences -->
        <rect x="76" y="116" width="148" height="32" rx="6" fill="#0284c7" stroke="#38bdf8"/>
        <circle cx="94" cy="132" r="8" fill="#bae6fd"/>
        <path d="M94 127 v10 M89 132 h10" stroke="#0369a1" stroke-width="2" stroke-linecap="round"/>
        <text x="110" y="137" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold">Preferences...</text>
      </g>
      <rect x="236" y="146" width="64" height="24" rx="12" fill="#ffd700" stroke="#f59e0b"/>
      <text x="246" y="162" fill="#020617" font-family="sans-serif" font-size="11" font-weight="bold">الخطوة 1</text>
    </svg>
  `),

  step2_category: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
      <defs>
        <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#141a2e"/>
          <stop offset="100%" stop-color="#0b101e"/>
        </linearGradient>
      </defs>
      <rect width="320" height="200" rx="16" fill="url(#bg2)" stroke="#a855f7" stroke-width="2"/>
      <!-- Preferences Dialog Window -->
      <rect x="20" y="20" width="280" height="160" rx="10" fill="#0f172a" stroke="#475569"/>
      <rect x="20" y="20" width="280" height="26" rx="10" fill="#1e293b"/>
      <circle cx="34" cy="33" r="4" fill="#ef4444"/>
      <circle cx="46" cy="33" r="4" fill="#f59e0b"/>
      <circle cx="58" cy="33" r="4" fill="#10b981"/>
      <text x="100" y="37" fill="#e2e8f0" font-family="sans-serif" font-size="11" font-weight="bold">Preferences Dialog</text>
      <!-- Sidebar Categories -->
      <rect x="28" y="54" width="105" height="116" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="35" y="70" fill="#a855f7" font-family="sans-serif" font-size="10" font-weight="bold">▼ Category</text>
      <!-- Selected General Settings -->
      <rect x="32" y="78" width="97" height="26" rx="4" fill="#9333ea" stroke="#c084fc"/>
      <text x="38" y="95" fill="#ffffff" font-family="sans-serif" font-size="10.5" font-weight="bold">General settings</text>
      <text x="38" y="122" fill="#64748b" font-family="sans-serif" font-size="10">Project</text>
      <text x="38" y="142" fill="#64748b" font-family="sans-serif" font-size="10">Publish Settings</text>
      <!-- Right panel -->
      <rect x="140" y="54" width="150" height="116" rx="6" fill="#0b1329" stroke="#334155"/>
      <text x="150" y="74" fill="#94a3b8" font-family="sans-serif" font-size="10">Global Options:</text>
      <line x1="150" y1="88" x2="275" y2="88" stroke="#334155" stroke-dasharray="3"/>
      <line x1="150" y1="108" x2="275" y2="108" stroke="#334155" stroke-dasharray="3"/>
      <rect x="236" y="146" width="64" height="24" rx="12" fill="#ffd700" stroke="#f59e0b"/>
      <text x="246" y="162" fill="#020617" font-family="sans-serif" font-size="11" font-weight="bold">الخطوة 2</text>
    </svg>
  `),

  step3_indicComposer: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
      <defs>
        <linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#042f2e"/>
          <stop offset="100%" stop-color="#091b1a"/>
        </linearGradient>
      </defs>
      <rect width="320" height="200" rx="16" fill="url(#bg3)" stroke="#10b981" stroke-width="2"/>
      <!-- Checkbox container -->
      <rect x="25" y="35" width="270" height="110" rx="12" fill="#0f172a" stroke="#059669" stroke-width="1.5"/>
      <!-- Checked box -->
      <g transform="translate(42, 60)">
        <rect width="36" height="36" rx="8" fill="#10b981" stroke="#34d399" stroke-width="2"/>
        <path d="M10 18 L16 25 L27 11" fill="none" stroke="#022c22" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <text x="90" y="74" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold">Requires an Indic composer</text>
      <text x="90" y="96" fill="#6ee7b7" font-family="sans-serif" font-size="11">✓ تفعيل معالج النصوص العربية والشرقية</text>
      <!-- Arabic letter badge -->
      <rect x="230" y="55" width="45" height="45" rx="10" fill="#065f46" stroke="#34d399"/>
      <text x="245" y="86" fill="#ffd700" font-family="Cairo, sans-serif" font-size="24" font-weight="bold">ض</text>
      <rect x="236" y="152" width="64" height="24" rx="12" fill="#ffd700" stroke="#f59e0b"/>
      <text x="246" y="168" fill="#020617" font-family="sans-serif" font-size="11" font-weight="bold">الخطوة 3</text>
    </svg>
  `),

  step4_restart: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
      <defs>
        <linearGradient id="bg4" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#31102b"/>
          <stop offset="100%" stop-color="#18081a"/>
        </linearGradient>
      </defs>
      <rect width="320" height="200" rx="16" fill="url(#bg4)" stroke="#f43f5e" stroke-width="2"/>
      <!-- Restart Prompt Window -->
      <rect x="30" y="30" width="260" height="120" rx="12" fill="#1e1124" stroke="#e11d48" stroke-width="1.5"/>
      <!-- Captivate Logo Symbol -->
      <rect x="50" y="50" width="46" height="46" rx="10" fill="#f43f5e" stroke="#fb7185"/>
      <text x="60" y="82" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="bold">Cp</text>
      <!-- Restart text -->
      <text x="110" y="68" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold">Restart Captivate</text>
      <text x="110" y="88" fill="#fda4af" font-family="sans-serif" font-size="11">حفظ التغييرات وإعادة التشغيل</text>
      <!-- Buttons -->
      <rect x="180" y="106" width="90" height="28" rx="6" fill="#f43f5e"/>
      <text x="195" y="124" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold">OK & Restart</text>
      <rect x="236" y="156" width="64" height="24" rx="12" fill="#ffd700" stroke="#f59e0b"/>
      <text x="246" y="172" fill="#020617" font-family="sans-serif" font-size="11" font-weight="bold">الخطوة 4</text>
    </svg>
  `),
};

export const MATCHING_ASSETS_Q8 = {
  step1_newProject: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
      <defs>
        <linearGradient id="bg8_1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#064e3b"/>
          <stop offset="100%" stop-color="#022c22"/>
        </linearGradient>
      </defs>
      <rect width="320" height="200" rx="16" fill="url(#bg8_1)" stroke="#34d399" stroke-width="2"/>
      <!-- Blank Project Canvas Mockup -->
      <rect x="35" y="30" width="180" height="120" rx="10" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
      <rect x="50" y="45" width="150" height="90" rx="6" fill="#1e293b" stroke="#334155" stroke-dasharray="4"/>
      <circle cx="125" cy="85" r="18" fill="#10b981" fill-opacity="0.2"/>
      <path d="M125 75 v20 M115 85 h20" stroke="#34d399" stroke-width="3" stroke-linecap="round"/>
      <text x="96" y="122" fill="#a7f3d0" font-family="sans-serif" font-size="11" font-weight="bold">Blank Project</text>
      <!-- Shortcut badge -->
      <g transform="translate(225, 45)">
        <rect width="70" height="34" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
        <text x="12" y="22" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="bold">Ctrl+N</text>
      </g>
      <rect x="225" y="90" width="70" height="60" rx="8" fill="#042f2e" stroke="#059669"/>
      <text x="235" y="115" fill="#a7f3d0" font-family="sans-serif" font-size="11" font-weight="bold">مشروع</text>
      <text x="235" y="135" fill="#ffd700" font-family="sans-serif" font-size="12" font-weight="bold">جديد 📄</text>
    </svg>
  `),

  step2_openProject: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
      <defs>
        <linearGradient id="bg8_2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e3a8a"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="320" height="200" rx="16" fill="url(#bg8_2)" stroke="#60a5fa" stroke-width="2"/>
      <!-- Open folder icon -->
      <g transform="translate(45, 40)">
        <path d="M10 25 L10 95 L110 95 L110 35 L55 35 L45 25 Z" fill="#1e40af" stroke="#60a5fa" stroke-width="2"/>
        <path d="M20 45 L125 45 L105 95 L5 95 Z" fill="#3b82f6" stroke="#93c5fd" stroke-width="2"/>
        <!-- File inside -->
        <rect x="35" y="20" width="60" height="50" rx="4" fill="#f8fafc" stroke="#94a3b8"/>
        <text x="45" y="45" fill="#1e293b" font-family="sans-serif" font-size="10" font-weight="bold">.CPTX</text>
      </g>
      <!-- Shortcut badge -->
      <g transform="translate(195, 45)">
        <rect width="90" height="34" rx="8" fill="#1e293b" stroke="#60a5fa" stroke-width="1.5"/>
        <text x="18" y="22" fill="#93c5fd" font-family="sans-serif" font-size="13" font-weight="bold">Ctrl+O</text>
      </g>
      <g transform="translate(195, 90)">
        <rect width="90" height="60" rx="8" fill="#172554" stroke="#2563eb"/>
        <text x="16" y="25" fill="#bfdbfe" font-family="sans-serif" font-size="11" font-weight="bold">فتح مشروع</text>
        <text x="16" y="45" fill="#ffd700" font-family="sans-serif" font-size="12" font-weight="bold">موجود 📂</text>
      </g>
    </svg>
  `),

  step3_saveProject: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
      <defs>
        <linearGradient id="bg8_3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#4c1d95"/>
          <stop offset="100%" stop-color="#1e1138"/>
        </linearGradient>
      </defs>
      <rect width="320" height="200" rx="16" fill="url(#bg8_3)" stroke="#c084fc" stroke-width="2"/>
      <!-- Floppy disk icon -->
      <g transform="translate(45, 35)">
        <rect width="100" height="105" rx="10" fill="#3b0764" stroke="#c084fc" stroke-width="2"/>
        <rect x="18" y="10" width="64" height="42" rx="4" fill="#f8fafc"/>
        <rect x="52" y="16" width="16" height="26" rx="2" fill="#1e1b4b"/>
        <rect x="22" y="65" width="56" height="30" rx="4" fill="#a855f7"/>
        <text x="32" y="84" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold">.CPTX</text>
      </g>
      <!-- Shortcut badge -->
      <g transform="translate(190, 45)">
        <rect width="95" height="34" rx="8" fill="#1e1138" stroke="#c084fc" stroke-width="1.5"/>
        <text x="22" y="22" fill="#e9d5ff" font-family="sans-serif" font-size="13" font-weight="bold">Ctrl+S</text>
      </g>
      <g transform="translate(190, 90)">
        <rect width="95" height="60" rx="8" fill="#2e1065" stroke="#7e22ce"/>
        <text x="18" y="25" fill="#f3e8ff" font-family="sans-serif" font-size="11" font-weight="bold">حفظ الملف</text>
        <text x="18" y="45" fill="#ffd700" font-family="sans-serif" font-size="12" font-weight="bold">والتعديل 💾</text>
      </g>
    </svg>
  `),

  step4_previewBrowser: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
      <defs>
        <linearGradient id="bg8_4" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#7c2d12"/>
          <stop offset="100%" stop-color="#2a0e05"/>
        </linearGradient>
      </defs>
      <rect width="320" height="200" rx="16" fill="url(#bg8_4)" stroke="#fb923c" stroke-width="2"/>
      <!-- Browser window with play button -->
      <g transform="translate(35, 30)">
        <rect width="135" height="115" rx="8" fill="#0f172a" stroke="#f97316" stroke-width="2"/>
        <rect width="135" height="22" rx="8" fill="#1e293b"/>
        <circle cx="14" cy="11" r="3.5" fill="#ef4444"/>
        <circle cx="25" cy="11" r="3.5" fill="#f59e0b"/>
        <circle cx="36" cy="11" r="3.5" fill="#10b981"/>
        <rect x="50" y="5" width="70" height="12" rx="4" fill="#334155"/>
        <!-- Play symbol inside browser -->
        <circle cx="67" cy="68" r="22" fill="#f97316"/>
        <polygon points="62,56 78,68 62,80" fill="#ffffff"/>
      </g>
      <!-- Shortcut badge -->
      <g transform="translate(190, 45)">
        <rect width="95" height="34" rx="8" fill="#1c0f0a" stroke="#fb923c" stroke-width="1.5"/>
        <text x="32" y="22" fill="#fed7aa" font-family="sans-serif" font-size="13" font-weight="bold">F11</text>
      </g>
      <g transform="translate(190, 90)">
        <rect width="95" height="60" rx="8" fill="#431407" stroke="#ea580c"/>
        <text x="14" y="25" fill="#ffedd5" font-family="sans-serif" font-size="11" font-weight="bold">معاينة بالمتصفح</text>
        <text x="14" y="45" fill="#ffd700" font-family="sans-serif" font-size="12" font-weight="bold">Preview 🌐</text>
      </g>
    </svg>
  `),
};
