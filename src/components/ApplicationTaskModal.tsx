import React, { useState } from 'react';
import {
  FileCheck,
  Download,
  Upload,
  CheckSquare,
  Square,
  PlayCircle,
  Sparkles,
  ArrowLeft,
  X,
  Award,
  Video,
} from 'lucide-react';
import { getVideoBySlot } from '../utils/videoStorage';

interface ApplicationTaskModalProps {
  levelNumber: number;
  stageTitle: string;
  isCollaborative: boolean;
  onCompleteTask: (bonusPoints: number) => void;
  onClose: () => void;
}

export const ApplicationTaskModal: React.FC<ApplicationTaskModalProps> = ({
  levelNumber,
  stageTitle,
  isCollaborative,
  onCompleteTask,
  onClose,
}) => {
  // Checklist steps according to Storyboard (المهمة التطبيقية)
  const taskSteps = [
    `1. فتح برنامج Adobe Captivate 2019 (64-Bit).`,
    `2. إنشاء مشروع تفاعلي جديد فارغ (Blank Project) بدقة 1024x768.`,
    `3. تطبيق خطوات ${stageTitle} وتنسيق العناصر وفق معايير التصميم التعليمي.`,
    `4. حفظ ملف العمل المصدري باسم: [Student_Captivate_Task_L${levelNumber}.cptx].`,
    `5. تصدير أو معاينة المشروع في متصفح الويب والتحقق من صحة الإجراءات التفاعلية.`,
  ];

  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [submittedFile, setSubmittedFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if admin has uploaded a video for this slot
  const taskVideo = getVideoBySlot('app-task') || getVideoBySlot(`level-${levelNumber}`);

  const handleToggle = (idx: number) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const allChecked = taskSteps.every((_, idx) => !!checkedSteps[idx]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubmittedFile(file.name);
    }
  };

  const handleSubmit = () => {
    if (!allChecked) {
      alert('يرجى التحقق من تنفيذ جميع خطوات المهمة التطبيقية المحددة في القائمة أولاً.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onCompleteTask(50); // +50 XP bonus
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn font-['Cairo',_sans-serif]">
      <div className="w-full max-w-2xl rounded-3xl bg-[#0b0e1e] border-2 border-[#ffd700] p-6 sm:p-8 text-right shadow-[0_0_50px_rgba(212,175,55,0.3)] relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-amber-950 border border-[#ffd700] text-[#ffd700] text-xs font-black">
              المهمة التطبيقية العملية (Application Task)
            </span>
            <span className="text-xs text-purple-300 font-bold">
              المرحلة {levelNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Task Title */}
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal']">
            المهمة التطبيقية: {stageTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            المطلوب منك تنفيذ الخطوات التطبيقية التالية في برنامج <strong className="text-[#ffd700]">Adobe Captivate 2019</strong> على جهازك، ثم تأكيد التسليم لحصد نقاط الإتقان:
          </p>
        </div>

        {/* Embedded Video Guide if available */}
        {taskVideo && (
          <div className="p-4 rounded-2xl bg-[#060814] border border-blue-500/40 mb-6">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5 font-['Tajawal']">
                <Video className="w-4 h-4 text-blue-400" />
                <span>فيديو شرح المهمة التطبيقية: {taskVideo.title}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{taskVideo.duration}</span>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800">
              {taskVideo.videoType === 'youtube' || taskVideo.videoUrl.includes('youtube.com') || taskVideo.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={taskVideo.videoUrl}
                  title={taskVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={taskVideo.videoUrl} controls className="w-full h-full object-contain" />
              )}
            </div>
          </div>
        )}

        {/* Checklist */}
        <div className="p-5 rounded-2xl bg-[#070914] border border-slate-800 mb-6 space-y-3">
          <h3 className="text-xs font-black text-amber-300 font-['Cairo'] flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#ffd700]" />
            <span>قائمة التحقق الإجرائية (Checklist):</span>
          </h3>

          <div className="space-y-2.5">
            {taskSteps.map((step, idx) => {
              const isChecked = !!checkedSteps[idx];
              return (
                <div
                  key={idx}
                  onClick={() => handleToggle(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isChecked
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-emerald-400 shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium leading-relaxed ${isChecked ? 'line-through opacity-85' : ''}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* File attachment & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 cursor-pointer transition-colors shrink-0">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>{submittedFile ? `الملف: ${submittedFile}` : 'إرفاق ملف المشروع (.cptx)'}</span>
              <input type="file" accept=".cptx,.zip,.pdf" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{isSubmitting ? 'جارٍ التسليم...' : 'تسليم المهمة (+50 ⭐)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
