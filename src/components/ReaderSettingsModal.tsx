import React from 'react';
import { useApp } from '../context/AppContext';
import { ReadingFont, ReadingTheme, ReadingWidth } from '../types';
import { SlidersHorizontal, X } from 'lucide-react';

// Đồng bộ lại toàn bộ khung Cài Đặt Đọc Truyện theo đúng ngôn ngữ thị giác của
// web: khung ngoài giờ cùng kiểu bo góc + viền với khung "Danh Sách Chương"
// (rounded-[26px], viền mảnh #F5DFE7/#6B5261 thay vì border-2), font tiêu đề
// đổi sang Vollkorn cho khớp mọi tiêu đề khác trên site, và mọi trạng thái
// "đang chọn" (font/độ rộng trang) đổi từ màu đen tuyệt đối (#1E1B1D/bg-black)
// sang tông ACCENT hồng đang dùng xuyên suốt (NovelCard/Leaderboard/nút Đọc).
// Thuần giao diện — không đổi bất kỳ state hay logic cập nhật readerSettings nào.
const ACCENT = '#F0A8C8';
const ACCENT_DARK = '#EDA3B4';
const ACCENT_TEXT_DARK = '#2B222C';
const BORDER = '#F0C7DE';
const BORDER_SOFT = '#F5DFE7';

export const ReaderSettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { readerSettings, updateReaderSettings, globalTheme } = useApp();

  if (!isOpen) return null;

  const isDark = globalTheme === 'dark';

  // Đã thêm 'vollkorn' vào danh sách phông chữ. Vollkorn dùng inline style
  // (không có class Tailwind sẵn có "font-vollkorn"), nên field "class" ở
  // đây là optional — riêng Vollkorn sẽ dùng field "style" để set font-family
  // trực tiếp, đồng nhất với cách headline toàn site đang dùng Vollkorn.
  const fonts: { id: ReadingFont; name: string; class?: string; style?: React.CSSProperties }[] = [
    { id: 'lora', name: 'Lora', class: 'font-lora' },
    { id: 'playfair', name: 'Playfair Display', class: 'font-playfair' },
    { id: 'cormorant', name: 'Cormorant Garamond', class: 'font-cormorant' },
    { id: 'alegreya', name: 'Alegreya', class: 'font-alegreya' },
    { id: 'sans', name: 'Sans-serif', class: 'font-luxury-sans' },
    { id: 'vollkorn', name: 'Vollkorn', style: { fontFamily: "'Vollkorn', serif" } },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F0A8C8]/20 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-[26px] border p-5 sm:p-6 transition-colors ${
          isDark ? 'bg-[#2B222C] border-[#6B5261] text-[#F3EEF0]' : 'bg-white border-[#F5DFE7] text-[#574D4C]'
        }`}
      >
        {/* Sparkle trang trí góc — cùng ngôn ngữ trang trí NovelCard/Danh Sách Chương */}
        <div
          className={`pointer-events-none select-none absolute top-4 right-12 text-[9px] leading-[1.6] hidden sm:block ${
            isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
          }`}
        >
          ✧　⋆
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: isDark ? '#6B5261' : '#F0D9E3' }}>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#8F7D85] dark:text-[#D5CBD0]" />
            <h3
              style={{ fontFamily: "'Vollkorn', serif" }}
              className="not-italic font-medium text-xl text-[#8B5D71] dark:text-[#F7E4EC]"
            >
              Cài Đặt Đọc Truyện
            </h3>
          </div>
          <button
            onClick={onClose}
            className="min-h-[28px] min-w-[28px] rounded-full flex items-center justify-center text-[#B79AA6] hover:text-[#A45E78] dark:hover:text-white transition-colors"
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
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${f.class || ''}`}
                  style={
                    readerSettings.font === f.id
                      ? {
                          ...f.style,
                          borderColor: isDark ? ACCENT_DARK : ACCENT,
                          background: isDark ? '#3A2935' : '#FFF0F7',
                          color: isDark ? '#F2B3C1' : '#A45E78',
                          fontWeight: 700,
                        }
                      : {
                          ...f.style,
                          borderColor: isDark ? '#453640' : '#F0D9E3',
                          background: isDark ? '#352936' : '#FFF9FB',
                          color: isDark ? '#FAF5F6' : '#5C4F55',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (readerSettings.font !== f.id) e.currentTarget.style.borderColor = isDark ? ACCENT_DARK : ACCENT;
                  }}
                  onMouseLeave={(e) => {
                    if (readerSettings.font !== f.id) e.currentTarget.style.borderColor = isDark ? '#453640' : '#F0D9E3';
                  }}
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
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${t.bg} ${t.border} ${
                    readerSettings.theme === t.id ? 'ring-2 ring-[#F0A8C8] shadow-sm' : 'opacity-80 hover:opacity-100'
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
          <div className="space-y-3 pt-1 border-t" style={{ borderColor: isDark ? '#453640' : '#F0D9E3' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8F7D85] dark:text-[#D5CBD0] uppercase">Cỡ chữ: {readerSettings.fontSize}px</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateReaderSettings({ fontSize: Math.max(14, readerSettings.fontSize - 1) })}
                  className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-medium transition-colors"
                  style={{ borderColor: isDark ? '#453640' : BORDER, color: isDark ? '#FAF5F6' : '#A45E78' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = isDark ? ACCENT_DARK : ACCENT)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = isDark ? '#453640' : BORDER)}
                >
                  -
                </button>
                <button
                  onClick={() => updateReaderSettings({ fontSize: Math.min(28, readerSettings.fontSize + 1) })}
                  className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-medium transition-colors"
                  style={{ borderColor: isDark ? '#453640' : BORDER, color: isDark ? '#FAF5F6' : '#A45E78' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = isDark ? ACCENT_DARK : ACCENT)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = isDark ? '#453640' : BORDER)}
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
                    className="px-2.5 py-1 rounded-full text-[11px] border transition-colors"
                    style={
                      readerSettings.maxWidth === w.id
                        ? { background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF', borderColor: isDark ? ACCENT_DARK : ACCENT }
                        : { borderColor: isDark ? '#453640' : BORDER_SOFT, color: isDark ? '#D5CBD0' : '#8F7D85' }
                    }
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-5 pt-3 border-t" style={{ borderColor: isDark ? '#453640' : '#F0D9E3' }}>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity"
            style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
          >
            Đóng Cài Đặt
          </button>
        </div>
      </div>
    </div>
  );
};