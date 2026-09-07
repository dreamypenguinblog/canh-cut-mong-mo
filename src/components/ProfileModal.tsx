import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Shield, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, updateUserProfile, globalTheme } = useApp();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && isOpen) {
      setName(currentUser.name || '');
      setAvatar(currentUser.avatar || '');
      setCustomUrl(currentUser.avatar || '');
      setSavedSuccess(false);
      setErrorMsg(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const isDark = globalTheme === 'dark';

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    setErrorMsg(null);
    setAvatar(customUrl.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Tên hiển thị không được để trống.');
      return;
    }

    updateUserProfile({
      name: name.trim(),
      avatar: avatar.trim() || currentUser.avatar,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-2xl border-2 p-6 sm:p-8 transition-colors max-h-[90vh] overflow-y-auto no-scrollbar ${
          isDark
            ? 'bg-[#2B222C] border-[#6B5261] text-[#F3EEF0]'
            : 'bg-[#FFF9FB] border-[#E7B6C5] text-[#574D4C]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sm text-[#8F7D85] hover:text-[#1E1B1D] dark:hover:text-[#FAF5F6] p-1.5 rounded-lg transition-colors"
          aria-label="Đóng modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <span className="font-pinyon text-3xl sm:text-4xl text-[#1E1B1D] dark:text-[#FAF5F6] block">
            Cánh Cụt Mộng Mơ
          </span>
          <h3 className="font-eb-garamond text-2xl font-medium tracking-wide mt-1">
            Chỉnh Sửa Hồ Sơ Cá Nhân
          </h3>
          <p className="text-xs text-[#8F7D85] mt-1 font-light">
            Cá nhân hóa tên tác giả & avatar đại diện xuất hiện cùng mọi chương truyện và bình luận
          </p>
        </div>

        {/* Live Avatar Preview */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#D985A2] dark:border-[#F2B3C1] bg-[#FCEEF3] dark:bg-[#352936] flex items-center justify-center">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
                onError={() => setErrorMsg('Không thể tải ảnh từ đường dẫn này, vui lòng thử ảnh khác.')}
              />
            ) : (
              <ImageIcon className="w-10 h-10 text-[#8F7D85]" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-semibold font-playfair">{name || 'Chưa đặt tên'}</span>
            {currentUser.role === 'admin' ? (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FAF0F3] dark:bg-[#251E28] border border-[#DAC8CE] dark:border-[#4B3E52] text-[#8F7D85] dark:text-[#F2B3C1] flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />
                Quản Trị Viên
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#DAC8CE] dark:border-[#38323D] text-[#8F7D85]">
                Độc Giả
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#8F7D85] mt-0.5 font-mono">{currentUser.email}</span>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Display Name Input */}
          <div>
            <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase mb-1">
              Tên Hiển Thị *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Canh Cụt Mộng Mơ, Mẫn Hy..."
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white font-medium ${
                isDark ? 'bg-[#1F1C22] border-[#38323D]' : 'bg-[#FAF5F6] border-[#DED0D5]'
              }`}
            />
          </div>

          {/* Avatar URL — chỉ còn dán link ảnh, đã bỏ tính năng tải ảnh từ máy để tiết kiệm dung lượng lưu trữ */}
          <div>
            <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase mb-2 flex items-center gap-1.5">
              <LinkIcon className="w-3 h-3" />
              <span>Đường Dẫn Ảnh Đại Diện (URL)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className={`flex-1 px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-[#1E1B1D] dark:focus:border-white ${
                  isDark ? 'bg-[#1F1C22] border-[#38323D]' : 'bg-[#FAF5F6] border-[#DED0D5]'
                }`}
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-4 py-2.5 rounded-xl bg-[#FAF0F3] dark:bg-[#251E28] border border-[#DAC8CE] dark:border-[#38323D] font-semibold text-xs hover:border-[#1E1B1D] dark:hover:border-white transition-colors"
              >
                Áp dụng
              </button>
            </div>
            <p className="text-[11px] text-[#8F7D85] mt-1.5">
              Dán đường link ảnh trực tiếp từ internet rồi nhấn "Áp dụng" để xem trước.
            </p>
          </div>

          {/* Email Info (Read-only) */}
          <div>
            <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase mb-1">
              Email Tài Khoản (Cố Định)
            </label>
            <input
              type="email"
              disabled
              value={currentUser.email}
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border opacity-70 cursor-not-allowed font-mono ${
                isDark ? 'bg-[#18161B] border-[#2E2833] text-[#8F7D85]' : 'bg-[#F2ECEE] border-[#E0D4D8] text-[#6E5D65]'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ECE0E4] dark:border-[#2E2833]">
            <button
              type="button"
              onClick={onClose}
              className={`min-h-[38px] px-4 py-2 rounded-xl border text-xs font-medium transition-colors ${
                isDark
                  ? 'border-[#38323D] text-[#8F7D85] hover:text-white hover:border-white'
                  : 'border-[#DAC8CE] text-[#6B5C64] hover:text-[#1E1B1D] hover:border-[#1E1B1D]'
              }`}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className="min-h-[38px] px-6 py-2 rounded-xl bg-[#D985A2] text-white dark:bg-[#F2B3C1] dark:text-[#2B222C] font-eb-garamond text-sm uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity text-center"
            >
              {savedSuccess ? 'Đã lưu thành công!' : 'Lưu Hồ Sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};