import React, { useState, useEffect } from 'react';
import { getAdminSettings } from '../utils/adminStorage';

interface WhatsAppSupportProps {
  className?: string;
}

export const WhatsAppSupport: React.FC<WhatsAppSupportProps> = ({
  className = '',
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('+201000000000');
  const [defaultMessage, setDefaultMessage] = useState<string>('مرحباً، أحتاج مساعدة بخصوص تسجيل الدخول في بوابة Cp');

  // Load current configured WhatsApp number from storage
  useEffect(() => {
    const updateFromStorage = () => {
      const settings = getAdminSettings();
      setPhoneNumber(settings.whatsappNumber || '+201000000000');
      setDefaultMessage(settings.whatsappDefaultMessage || 'مرحباً، أحتاج مساعدة بخصوص تسجيل الدخول في بوابة Cp');
    };

    updateFromStorage();
    // Listen to custom or storage events if admin modifies it in another tab or component
    window.addEventListener('storage', updateFromStorage);
    window.addEventListener('cp_settings_updated', updateFromStorage);
    return () => {
      window.removeEventListener('storage', updateFromStorage);
      window.removeEventListener('cp_settings_updated', updateFromStorage);
    };
  }, []);

  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(defaultMessage);
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} id="cp-whatsapp-icon-wrapper">
      {/* WhatsApp Icon Only Button */}
      <button
        type="button"
        onClick={handleOpenWhatsApp}
        id="btn-whatsapp-icon-direct"
        className="group relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
        title="التواصل الفوري عبر الواتساب"
        aria-label="التواصل عبر الواتساب"
      >
        {/* Ambient Pulsing Glow behind icon */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#25D366] via-emerald-400 to-[#128C7E] opacity-70 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-300 animate-pulse" />

        {/* Outer Golden/Green Accent Ring */}
        <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-br from-[#ffd700] via-[#25D366] to-[#128C7E] shadow-[0_0_20px_rgba(37,211,102,0.4)]" />

        {/* Inner Button Circle with WhatsApp Official SVG Icon */}
        <div className="relative w-full h-full rounded-full bg-[#0a1b14] hover:bg-[#072418] flex items-center justify-center overflow-hidden transition-colors">
          {/* Subtle glossy sheen */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-full" />

          {/* Official WhatsApp Vector Logo */}
          <svg
            className="w-7 h-7 text-[#25D366] fill-current drop-shadow-[0_2px_8px_rgba(37,211,102,0.6)] transform group-hover:scale-105 transition-transform"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </div>
      </button>

      {/* Direct hint below the icon */}
      <span className="text-[11px] font-medium text-emerald-400/90 mt-2 tracking-wide font-['Cairo'] group-hover:text-emerald-300">
        تواصل فوري
      </span>
    </div>
  );
};
