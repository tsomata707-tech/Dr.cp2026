import React, { useState, useMemo } from 'react';
import { Play, AlertCircle, RefreshCw, Film } from 'lucide-react';
import {
  extractGoogleDriveId,
  getGoogleDriveDirectStreamUrl,
  normalizeVideoUrl,
} from '../utils/videoStorage';

interface InlineBoxVideoPlayerProps {
  url: string;
  title?: string;
  partIndex?: number;
  totalParts?: number;
  className?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export const InlineBoxVideoPlayer: React.FC<InlineBoxVideoPlayerProps> = ({
  url,
  title = 'فيديو تعليمي',
  className = '',
  autoPlay = false,
  onEnded,
}) => {
  const [streamError, setStreamError] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  const cleanUrl = (url || '').trim();

  const driveId = useMemo(() => extractGoogleDriveId(cleanUrl), [cleanUrl]);
  const isYouTube = useMemo(
    () => cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be'),
    [cleanUrl]
  );
  const isVimeo = useMemo(() => cleanUrl.includes('vimeo.com'), [cleanUrl]);

  // Is direct file (local blob, data URL, or standard mp4/webm/ogg/dropbox)
  const isLocalFile = useMemo(() => {
    return (
      cleanUrl.startsWith('blob:') ||
      cleanUrl.startsWith('data:') ||
      cleanUrl.endsWith('.mp4') ||
      cleanUrl.endsWith('.webm') ||
      cleanUrl.endsWith('.ogg')
    );
  }, [cleanUrl]);

  const dropboxDirectUrl = useMemo(() => {
    if (cleanUrl.includes('dropbox.com')) {
      return cleanUrl.replace('dl=0', 'raw=1');
    }
    return null;
  }, [cleanUrl]);

  if (!cleanUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-black text-slate-400">
        <Film className="w-8 h-8 text-slate-500 mb-1" />
        <span className="text-xs font-bold font-['Cairo']">لم يتم تعيين رابط لهذا الفيديو</span>
      </div>
    );
  }

  // 1. YouTube Player: Embedded with clean inline parameters
  if (isYouTube) {
    const embedUrl = normalizeVideoUrl(cleanUrl);
    return (
      <div className={`relative w-full h-full bg-black flex items-center justify-center ${className}`}>
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // 2. Vimeo Player
  if (isVimeo) {
    const embedUrl = normalizeVideoUrl(cleanUrl);
    return (
      <div className={`relative w-full h-full bg-black flex items-center justify-center ${className}`}>
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // 3. Google Drive Video: Play DIRECTLY in the same box using HTML5 video stream!
  // If streamError occurs (e.g. file is >100MB requiring scan or private), switch to Drive embed iframe.
  if (driveId) {
    const directStreamUrl = getGoogleDriveDirectStreamUrl(driveId);
    const drivePreviewEmbed = `https://drive.google.com/file/d/${driveId}/preview`;

    if (!useIframeFallback && !streamError) {
      return (
        <div className={`relative w-full h-full bg-black flex items-center justify-center group ${className}`}>
          <video
            controls
            playsInline
            autoPlay={autoPlay}
            preload="metadata"
            className="w-full h-full object-contain bg-black"
            src={directStreamUrl}
            onEnded={onEnded}
            onError={(e) => {
              console.error('Direct video stream error:', {
                url: directStreamUrl,
                error: e
              });
              // Gracefully switch to embedded iframe if direct stream is restricted
              setStreamError(true);
              setUseIframeFallback(true);
            }}
          />
          {/* Subtle switcher button */}
          <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setUseIframeFallback(true)}
              className="px-2 py-0.5 rounded-md bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-bold shadow flex items-center gap-1 cursor-pointer"
              title="التبديل إلى مشغل Google Drive البديل في حال واجهت مشكلة في التشغيل المباشر"
            >
              <span>مشغل بديل ⚙️</span>
            </button>
          </div>
        </div>
      );
    }

    // Google Drive Iframe Fallback
    return (
      <div className={`relative w-full h-full bg-black flex items-center justify-center group ${className}`}>
        <iframe
          src={drivePreviewEmbed}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => {
              setStreamError(false);
              setUseIframeFallback(false);
            }}
            className="px-2.5 py-1 rounded-md bg-cyan-900/90 hover:bg-cyan-800 border border-cyan-400 text-[11px] text-cyan-200 font-bold shadow flex items-center gap-1 cursor-pointer"
            title="الرجوع إلى التشغيل المباشر السلس في نفس المربع بدون شريط Google Drive"
          >
            <Play className="w-3 h-3 text-cyan-300 fill-cyan-300" />
            <span>تشغيل مباشر في نفس المربع 🎬</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Dropbox Direct Stream
  if (dropboxDirectUrl) {
    return (
      <div className={`relative w-full h-full bg-black flex items-center justify-center ${className}`}>
        <video
          controls
          playsInline
          autoPlay={autoPlay}
          preload="metadata"
          className="w-full h-full object-contain bg-black"
          src={dropboxDirectUrl}
          onEnded={onEnded}
        />
      </div>
    );
  }

  // 5. Local File / Blob / Direct MP4 or WebM
  if (isLocalFile) {
    return (
      <div className={`relative w-full h-full bg-black flex items-center justify-center ${className}`}>
        <video
          controls
          playsInline
          autoPlay={autoPlay}
          preload="metadata"
          className="w-full h-full object-contain bg-black"
          src={cleanUrl}
          onEnded={onEnded}
        />
      </div>
    );
  }

  // 6. Generic Cloud or HTTP video URL: try video first, fallback to iframe
  const normalized = normalizeVideoUrl(cleanUrl);
  return (
    <div className={`relative w-full h-full bg-black flex items-center justify-center ${className}`}>
      {!streamError ? (
        <video
          controls
          playsInline
          autoPlay={autoPlay}
          preload="metadata"
          className="w-full h-full object-contain bg-black"
          src={cleanUrl}
          onEnded={onEnded}
          onError={() => setStreamError(true)}
        />
      ) : normalized ? (
        <iframe
          src={normalized}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 p-4 text-center text-slate-400">
          <AlertCircle className="w-6 h-6 text-amber-400" />
          <span className="text-xs font-bold font-['Cairo']">تعذر تشغيل هذا الرابط</span>
        </div>
      )}
    </div>
  );
};
