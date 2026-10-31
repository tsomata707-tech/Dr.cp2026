import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Trophy,
  Star,
  Award,
  Layers,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Shield,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import {
  getStudentProgress,
  updateStudentAvatar,
  updateStudentCustomPhoto,
} from '../utils/gameStorage';
import { getGroupByUsername, getStudentByUsername } from '../data/studentAccounts';
import { CARTOON_AVATARS, GAME_LEVELS_DATA } from '../data/gameLevelsData';

interface ProfileScreenProps {
  username: string;
  onNavigateToMap: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ username, onNavigateToMap }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const [progress, setProgress] = useState(() => getStudentProgress(username));
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const studentInfo = getStudentByUsername(username);
  const groupMeta = getGroupByUsername(username);

  const currentAvatar =
    CARTOON_AVATARS.find((a) => a.id === progress.avatarId) || CARTOON_AVATARS[0];

  const completedCount = Object.keys(progress.completedLevels).length;
  const currentLevelBase = (progress.currentLevel - 1) * 100;
  const levelProgressScore = Math.max(0, progress.totalScore - currentLevelBase);
  const levelProgressPercentage = Math.min(100, Math.round((levelProgressScore / 100) * 100));

  const handleSelectAvatar = (avatarId: string) => {
    // If student chooses a preset cartoon avatar, also clear custom photo
    const updated = updateStudentAvatar(username, avatarId);
    if (progress.customPhotoUrl) {
      updateStudentCustomPhoto(username, null);
    }
    setProgress(getStudentProgress(username));
    setShowAvatarModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 320;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          const updated = updateStudentCustomPhoto(username, dataUrl);
          setProgress(updated);
          setShowAvatarModal(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    const updated = updateStudentCustomPhoto(username, null);
    setProgress(updated);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto z-10 font-['Cairo',_sans-serif] text-right py-4 animate-fadeIn">
      {/* Hidden Device File Input for Profile Photo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Ambient Glow */}
      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-amber-500/20 blur-xl opacity-70 pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative rounded-3xl bg-[#0b0e1e]/95 backdrop-blur-2xl border-2 border-blue-500/40 p-6 sm:p-10 shadow-[0_0_40px_rgba(37,99,235,0.2)] overflow-hidden">
        {/* Top Profile Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
            {/* Avatar with Change Action */}
            <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-blue-500/30 to-purple-600/30 border-2 border-[#ffd700] flex items-center justify-center text-5xl sm:text-6xl shadow-[0_0_25px_rgba(255,215,0,0.35)] group-hover:scale-105 transition-all overflow-hidden relative">
                {progress.customPhotoUrl && progress.customPhotoUrl.trim() ? (
                  <img
                    src={progress.customPhotoUrl.trim()}
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{currentAvatar.emoji}</span>
                )}
                {/* Overlay camera hint on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-7 h-7 text-[#ffd700]" />
                </div>
              </div>

              <button
                type="button"
                className="absolute -bottom-2 -left-1 px-2.5 py-1 rounded-full bg-[#ffd700] hover:bg-amber-300 text-slate-950 font-black text-xs shadow flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
              >
                <Camera className="w-3 h-3" />
                <span>تغيير الصورة</span>
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="px-3 py-0.5 rounded-full bg-blue-950 border border-blue-500/50 text-blue-300 text-xs font-bold ">
                  {username}
                </span>
                {groupMeta && (
                  <span className="px-3.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/60 text-purple-200 text-xs sm:text-sm font-bold shadow-sm">
                    {groupMeta.name}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white font-['Tajawal'] ">
                {username}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
                {progress.customPhotoUrl
                  ? 'صورة الطالب الشخصية'
                  : `${currentAvatar.name} - ${currentAvatar.description}`}
              </p>

              {/* Direct Buttons to upload photo or remove */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صورتي من جهازي</span>
                </button>

                {progress.customPhotoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                    title="حذف الصورة والعودة للشخصية الكرتونية"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف صورتي</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToMap}
            className="w-full md:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>العودة للرئيسية 🏠</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Detailed Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#070914] border border-[#ffd700]/40 text-center shadow-inner">
            <span className="text-xs text-slate-400 block font-bold mb-1">إجمالي النقاط الذهبية</span>
            <span className="text-3xl font-black text-[#ffd700] font-['Outfit']">
              {progress.totalScore} <span className="text-sm text-amber-200">⭐ XP</span>
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#070914] border border-purple-500/40 text-center shadow-inner">
            <span className="text-xs text-slate-400 block font-bold mb-1">الشارات والأوسمة المكتملة</span>
            <span className="text-3xl font-black text-purple-300 font-['Outfit']">
              {(progress.badges || []).length} <span className="text-sm text-purple-200">🏅</span>
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#070914] border border-emerald-500/40 text-center shadow-inner">
            <span className="text-xs text-slate-400 block font-bold mb-1">المراحل المكتملة</span>
            <span className="text-3xl font-black text-emerald-300 font-['Outfit']">
              {completedCount} <span className="text-sm text-slate-400">/ 10</span>
            </span>
          </div>
        </div>

        {/* Progress to Next Level Bar */}
        <div className="p-5 rounded-2xl bg-[#0d1224] border border-blue-500/30 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-white font-['Tajawal'] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#ffd700]" />
              <span>تقدمك للمستوى التالي (L{Math.min(10, progress.currentLevel + 1)}):</span>
            </span>
            <span className="text-xs  font-bold text-amber-300">
              {levelProgressPercentage}% مكتمل
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-[#ffd700] transition-all duration-700 rounded-full"
              style={{ width: `${levelProgressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 ">
            <span>المستوى الحالي: L{progress.currentLevel}</span>
            <span>المستوى التالي: L{Math.min(10, progress.currentLevel + 1)}</span>
          </div>
        </div>

        {/* Badges Earned Section */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-black text-white font-['Tajawal']">
                الشارات التي حصلت عليها (الأوسمة التخصصية)
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-bold">
              {(progress.badges || []).length} من أصل 10 أوسمة
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {GAME_LEVELS_DATA.map((lvl) => {
              const isEarned =
                (progress.badges || []).includes(lvl.badgeName) ||
                !!(progress.completedLevels || {})[lvl.levelNumber];
              return (
                <div
                  key={lvl.levelNumber}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                    isEarned
                      ? 'bg-gradient-to-br from-purple-950/40 to-slate-950 border-[#ffd700]/70 shadow-[0_0_15px_rgba(255,215,0,0.2)]'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-1.5 filter drop-shadow">
                    {isEarned ? lvl.badgeEmoji : '🔒'}
                  </div>
                  <span
                    className={`text-xs font-black font-['Tajawal'] ${
                      isEarned ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {lvl.badgeName}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 ">
                    L{lvl.levelNumber}: {lvl.shortTitle}
                  </span>
                  <span
                    className={`text-[9px] mt-1.5 px-2 py-0.5 rounded-full font-bold ${
                      isEarned
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {isEarned ? 'تم الحصول عليها' : 'قيد الإنجاز'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Avatar / Photo Change Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0d1022] border-2 border-[#ffd700] p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-lg font-black text-white font-['Tajawal'] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ffd700]" />
                <span>تعديل الصورة الشخصية أو الأفاتار</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            {/* Custom Device Photo Upload Option Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#0d1c1a] to-slate-950 border-2 border-emerald-500/60 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white font-['Tajawal']">
                    رفع صورتك الشخصية الحقيقية من جهازك
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    اختر صورة من هاتفك أو جهاز الكمبيوتر لتعيينها كصورة شخصية رسمية لك
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>اختيار صورة من الجهاز</span>
                </button>

                {progress.customPhotoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-red-400 border border-red-500/40 text-xs font-bold cursor-pointer"
                    title="حذف الصورة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mb-3 text-xs font-bold text-slate-400">
              أو اختر شخصيتك الكرتونية المفضلة:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1">
              {CARTOON_AVATARS.map((av) => {
                const isSelected = !progress.customPhotoUrl && av.id === progress.avatarId;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => handleSelectAvatar(av.id)}
                    className={`p-4 rounded-2xl border-2 text-right flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/50 border-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 flex items-center justify-center text-3xl shrink-0">
                      {av.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white font-['Tajawal']">
                          {av.name}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-[#ffd700] text-slate-950 text-[9px] font-black">
                            الحالي
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#ffd700] font-bold block">{av.title}</span>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {av.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

