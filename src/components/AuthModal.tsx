import React from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / NovelDetailView / Navbar.
const ACCENT = '#F0A8C8';
const ACCENT_DARK = '#EDA3B4';
const ACCENT_TEXT_DARK = '#2B222C';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { quickGoogleLogin, globalTheme } = useApp();
  if (!isOpen) return null;
  const isDark = globalTheme === 'dark';

  const handleGoogle = () => {
    quickGoogleLogin('', '');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#A45E78]/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md rounded-[28px] border overflow-visible p-6 sm:p-8 transition-colors ${
          isDark
            ? 'bg-gradient-to-b from-[#2B222C] via-[#241D26] to-[#2B222C] border-[#6B5261] text-[#F3EEF0]'
            : 'bg-gradient-to-b from-white via-[#FFF8FB] to-white border-[#F5DFE7] text-[#574D4C]'
        }`}
      >
        {/* Sparkle decoration – góc trên phải khung tổng, cùng ngôn ngữ trang trí với các modal khác */}
        <div
          className={`pointer-events-none select-none absolute top-4 right-14 text-[11px] leading-[1.7] hidden sm:block ${
            isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
          }`}
        >
          ✧　⋆
        </div>

        {/* Close Button — icon X trên nền ACCENT, đồng bộ NovelDetailModal/ReaderSettingsModal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-7 space-y-1.5">
          <span className={`text-[9px] block ${isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'}`}>𝜗𝜚</span>
          <span className="font-pinyon text-4xl block text-[#D88AB3] dark:text-[#F2B3C1]">Cánh Cụt Mộng Mơ</span>
          <h3
            style={{ fontFamily: "'Vollkorn', serif" }}
            className="not-italic text-2xl font-semibold tracking-wide mt-1 text-[#6B4A57] dark:text-white"
          >
            Đăng nhập
          </h3>
          <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] mt-2 leading-relaxed">
            Đăng nhập bằng Google để đồng bộ tủ sách, lịch sử đọc, bình luận và lượt thích trên mọi thiết bị.
          </p>
        </div>

        <button
          onClick={handleGoogle}
          className={`w-full min-h-[48px] flex items-center justify-center gap-3 py-3.5 px-4 rounded-full border font-medium text-sm transition-colors ${
            isDark
              ? 'bg-[#352936] text-[#FAF5F6] border-[#6B5261] hover:border-[#D79BAD]'
              : 'bg-white text-[#574D4C] border-[#F0C7DE] hover:border-[#E79FC3]'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center border border-[#F0D9E3]">
            <span className="font-bold text-[#4285F4] text-xs">G</span>
          </span>
          <span>Tiếp tục với Google</span>
        </button>

        <div
          className={`relative mt-5 p-3.5 rounded-2xl text-[11px] leading-relaxed border ${
            isDark ? 'bg-[#352936] border-[#6B5261] text-[#D5CBD0]' : 'bg-[#FFF6FB] border-[#F5D2E0] text-[#8F7D85]'
          }`}
        >
          Bạn có thể đọc truyện và tương tác mà không cần đăng nhập. Đăng nhập Google chỉ cần thiết khi bạn muốn đồng bộ dữ liệu cá nhân trên nhiều thiết bị.
          <span className="pointer-events-none select-none absolute -bottom-1 -right-1 text-[10px] text-[#E9B8C2] dark:text-[#7A5869]">
            𝜗𝜚
          </span>
        </div>
      </div>
    </div>
  );
};