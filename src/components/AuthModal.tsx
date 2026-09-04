import React from 'react';
import { useApp } from '../context/AppContext';
import { LogIn } from 'lucide-react';

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
      <div className={`relative w-full max-w-md rounded-2xl border-2 p-6 sm:p-8 ${
        isDark ? 'bg-[#2B222C] border-[#6B5261] text-[#F3EEF0]' : 'bg-[#FFF9FB] border-[#E7B6C5] text-[#574D4C]'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sm text-[#8F7D85] hover:text-[#1E1B1D] dark:hover:text-[#FAF5F6] p-1.5"
          aria-label="Đóng"
        >✕</button>

        <div className="text-center mb-7">
          <span className="font-pinyon text-4xl text-[#1E1B1D] dark:text-[#FAF5F6] block">Cánh Cụt Mộng Mơ</span>
          <h3 className="font-eb-garamond text-2xl font-medium tracking-wide mt-1 text-[#574D4C] dark:text-[#FAF5F6]">Đăng nhập</h3>
          <p className="text-xs text-[#8F7D85] mt-2 leading-relaxed">
            Đăng nhập bằng Google để đồng bộ tủ sách, lịch sử đọc, bình luận và lượt thích trên mọi thiết bị.
          </p>
        </div>

        <button
          onClick={handleGoogle}
          className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border font-medium text-sm transition-all ${
            isDark
              ? 'bg-[#F2B3C1] text-[#2B222C] border-[#F2B3C1] hover:bg-[#F7C5D2]'
              : 'bg-[#FFFFFF] text-[#574D4C] border-[#E8B8C5] hover:border-[#D985A2]'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <span className="font-bold text-[#4285F4]">G</span>
          </span>
          Tiếp tục với Google
        </button>

        <div className={`mt-5 p-3 rounded-xl text-[11px] leading-relaxed ${
          isDark ? 'bg-[#352936] text-[#CFC5CA]' : 'bg-[#FFF1F5] text-[#75686E]'
        }`}>
          Bạn có thể đọc truyện và tương tác mà không cần đăng nhập. Đăng nhập Google chỉ cần thiết khi bạn muốn đồng bộ dữ liệu cá nhân trên nhiều thiết bị.
        </div>
      </div>
    </div>
  );
};
