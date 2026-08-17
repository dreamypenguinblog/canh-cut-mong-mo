import React from 'react';
import { useApp } from '../context/AppContext';
import { ReadingFont, ReadingTheme, ReadingWidth } from '../types';
import { SlidersHorizontal, X } from 'lucide-react';

export const ReaderSettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { readerSettings, updateReaderSettings, globalTheme } = useApp();

  if (!isOpen) return null;

  const isDark = globalTheme === 'dark';

  const fonts: { id: ReadingFont; name: string; class: string }[] = [
    { id: 'lora', name: 'Lora', class: 'font-lora' },
    { id: 'playfair', name: 'Playfair Display', class: 'font-playfair' },
    { id: 'cormorant', name: 'Cormorant Garamond', class: 'font-cormorant' },
    { id: 'alegreya', name: 'Alegreya', class: 'font-alegreya' },
    { id: 'sans', name: 'Sans-serif', class: 'font-luxury-sans' },
  ];

  const themes: { id: ReadingTheme; name: string; bg: string; text: string; border: string }[] = [
    { id: 'light-rose', name: 'Hồng Nhạt', bg: 'bg-[#FAF4F6]', text: 'text-[#1E1B1D]', border: 'border-[#EADCE1]' },
    { id: 'pure-white', name: 'Trắng Sáng', bg: 'bg-[#FFFFFF]', text: 'text-[#1A1A1A]', border: 'border-[#E0E0E0]' },
    { id: 'cool-gray', name: 'Xám Mát', bg: 'bg-[#F3F4F6]', text: 'text-[#1F2937]', border: 'border-[#E5E7EB]' },
    { id: 'noir-luxury', name: 'Đen Tối', bg: 'bg-[#121113]', text: 'text-[#F3EEF0]', border: 'border-[#332E38]' },
    { id: 'midnight', name: 'Xanh Đen', bg: 'bg-[#0F172A]', text: 'text-[#F8FAFC]', border: 'border-[#1E293B]' },
  ];

  const widths: { id: ReadingWidth; label: string }[] = [
    { id: 'compact', label: 'Gọn (640px)' },
    { id: 'standard', label: 'Chuẩn (768px)' },
    { id: 'wide', label: 'Rộng (900px)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl border p-5 sm:p-6 transition-colors ${
          isDark ? 'bg-[#18161B] border-[#38323D] text-[#F3EEF0]' : 'bg-[#FFFFFF] border-[#EADCE1] text-[#1E1B1D]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EADCE1] dark:border-[#2F2935] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#8F7D85] dark:text-[#D5CBD0]" />
            <h3 className="font-playfair font-semibold text-base text-[#1E1B1D] dark:text-[#FAF5F6]">Cài Đặt Đọc Truyện</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8F7D85] hover:text-black dark:hover:text-white"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Font Selection */}
          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#8F7D85] dark:text-[#D5CBD0] uppercase mb-2">
              Phông Chữ
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => updateReaderSettings({ font: f.id })}
                  className={`p-2.5 rounded-lg border text-xs text-left transition-all ${f.class} ${
                    readerSettings.font === f.id
                      ? 'border-[#1E1B1D] dark:border-white bg-[#FAF0F3] dark:bg-[#201C25] font-bold text-[#1E1B1D] dark:text-white'
                      : isDark
                      ? 'border-[#332E38] bg-[#1E1B22] text-[#FAF5F6] hover:border-white'
                      : 'border-[#EAE0E4] bg-[#FAF5F6] text-[#5C4F55] hover:border-[#1E1B1D]'
                  }`}
                >
                  <span className="block text-sm leading-tight">{f.name}</span>
                  <span className="text-[10px] opacity-75">Aa Bb Cc 123</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Canvas Selection */}
          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#8F7D85] dark:text-[#D5CBD0] uppercase mb-2">
              Màu Nền Đọc
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateReaderSettings({ theme: t.id })}
                  className={`p-2 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${t.bg} ${t.border} ${
                    readerSettings.theme === t.id ? 'ring-2 ring-[#E0A8B6] shadow-sm' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md ${t.bg} border ${t.border} flex items-center justify-center text-[10px] ${t.text}`}>
                    Aa
                  </div>
                  <span className={`text-[10px] font-medium leading-tight text-center ${t.text}`}>
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size & Line Height */}
          <div className="space-y-3 pt-1 border-t border-[#EADCE1] dark:border-[#2F2935]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8F7D85] dark:text-[#D5CBD0] uppercase">Cỡ chữ: {readerSettings.fontSize}px</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateReaderSettings({ fontSize: Math.max(14, readerSettings.fontSize - 1) })}
                  className="w-7 h-7 rounded-md border border-[#DAC8CE] dark:border-[#38323D] flex items-center justify-center text-xs font-medium hover:border-[#1E1B1D] dark:hover:border-white text-[#1E1B1D] dark:text-[#FAF5F6]"
                >
                  -
                </button>
                <button
                  onClick={() => updateReaderSettings({ fontSize: Math.min(28, readerSettings.fontSize + 1) })}
                  className="w-7 h-7 rounded-md border border-[#DAC8CE] dark:border-[#38323D] flex items-center justify-center text-xs font-medium hover:border-[#1E1B1D] dark:hover:border-white text-[#1E1B1D] dark:text-[#FAF5F6]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8F7D85] dark:text-[#D5CBD0] uppercase">Độ rộng trang</span>
              <div className="flex items-center gap-1.5">
                {widths.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => updateReaderSettings({ maxWidth: w.id })}
                    className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                      readerSettings.maxWidth === w.id
                        ? 'bg-[#1E1B1D] text-white dark:bg-white dark:text-black border-transparent'
                        : 'border-[#DAC8CE] dark:border-[#38323D] text-[#8F7D85] dark:text-[#D5CBD0] hover:border-[#1E1B1D] dark:hover:border-white'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-5 pt-3 border-t border-[#EADCE1] dark:border-[#2F2935]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-[#1E1B1D] text-[#FAF5F6] dark:bg-[#FAF5F6] dark:text-[#121113] text-xs uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity"
          >
            Đóng Cài Đặt
          </button>
        </div>
      </div>
    </div>
  );
};
