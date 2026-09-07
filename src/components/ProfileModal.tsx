import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Shield, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / Navbar.
const ACCENT = '#F0A8C8';
const ACCENT_DARK = '#EDA3B4';
const ACCENT_TEXT_DARK = '#2B222C';

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
        className={`relative w-full max-w-lg rounded-[28px] border p-6 sm:p-8 transition-colors max-h-[90vh] overflow-y-auto no-scrollbar overflow-visible ${
          isDark
            ? 'bg-gradient-to-b from-[#2B222C] via-[#241D26] to-[#2B222C] border-[#6B5261] text-[#F3EEF0]'
            : 'bg-gradient-to-b from-white via-[#FFF8FB] to-white border-[#F5DFE7] text-[#574D4C]'
        }`}
      >
        {/* Sparkle decoration – góc trên phải khung tổng, cùng ngôn ngữ trang trí với NovelCard */}
        <div
          className={`pointer-events-none select-none absolute top-4 right-5 text-[10px] leading-[1.7] hidden sm:block ${
            isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
          }`}
        >
          ✧　⋆<br />
          ⋆　✿
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sm text-[#8F7D85] hover:text-[#1E1B1D] dark:hover:text-[#FAF5F6] p-1.5 rounded-full transition-colors z-10"
          aria-label="Đóng modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 relative z-10">
          <span
            style={{ fontFamily: "'Vollkorn', serif" }}
            className="not-italic text-2xl sm:text-3xl font-semibold text-[#6B4A57] dark:text-white block"
          >
            Cánh Cụt Mộng Mơ
          </span>

          {/* Dải phân cách có ký hiệu 𝜗𝜚 — đồng bộ NovelCard */}
          <div className="flex items-center justify-center gap-1.5 mt-1.5 mb-1">
            <div
              className={`w-6 h-px ${
                isDark ? 'bg-gradient-to-r from-transparent to-[#6B5261]' : 'bg-gradient-to-r from-transparent to-[#F3C6DD]'
              }`}
            />
            <span className={`text-[9px] ${isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'}`}>𝜗𝜚</span>
            <div
              className={`w-6 h-px ${
                isDark ? 'bg-gradient-to-l from-transparent to-[#6B5261]' : 'bg-gradient-to-l from-transparent to-[#F3C6DD]'
              }`}
            />
          </div>

          <h3
            style={{ fontFamily: "'Vollkorn', serif" }}
            className="not-italic text-xl font-medium tracking-wide text-[#8B5D71] dark:text-[#F7E4EC]"
          >
            Chỉnh Sửa Hồ Sơ Cá Nhân
          </h3>
          <p className="text-xs text-[#8F7D85] dark:text-[#D5CBD0] mt-1 font-light">
            Cá nhân hóa tên tác giả & avatar đại diện xuất hiện cùng mọi chương truyện và bình luận
          </p>
        </div>

        {/* Live Avatar Preview — khung "lồng khung" giống bìa truyện của NovelCard */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div
            className={`relative p-1.5 rounded-[22px] border ${
              isDark
                ? 'bg-gradient-to-b from-[#352936] to-[#2B222C] border-[#6B5261]'
                : 'bg-gradient-to-b from-[#FFFAFD] to-white border-[#F5DFE7]'
            }`}
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#FCEEF3] dark:bg-[#241D26] flex items-center justify-center">
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
            <span className="pointer-events-none select-none absolute -bottom-1 -right-1 text-[11px] text-[#E9B8C2] dark:text-[#7A5869]">
              𝜗𝜚
            </span>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span
              style={{ fontFamily: "'Vollkorn', serif" }}
              className="not-italic text-xs font-semibold text-[#6B4A57] dark:text-white"
            >
              {name || 'Chưa đặt tên'}
            </span>
            {currentUser.role === 'admin' ? (
              <span
                className="text-[9px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1"
                style={
                  isDark
                    ? { background: '#3A2E3D', color: '#F2B3C1', borderColor: '#6B5261' }
                    : { background: '#FCE9F2', color: '#A45E78', borderColor: '#F3D0E4' }
                }
              >
                <Shield className="w-2.5 h-2.5" />
                Quản Trị Viên
              </span>
            ) : (
              <span
                className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isDark ? 'border-[#38323D] text-[#D5CBD0]' : 'border-[#F0D9E3] text-[#8F7D85]'
                }`}
              >
                Độc Giả
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#8F7D85] dark:text-[#D5CBD0] mt-0.5 font-mono">{currentUser.email}</span>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Display Name Input */}
          <div>
            <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase tracking-wide mb-1.5">
              Tên Hiển Thị *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Canh Cụt Mộng Mơ, Mẫn Hy..."
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none font-medium transition-colors ${
                isDark
                  ? 'bg-[#1F1C22] border-[#38323D] focus:border-[#F2B3C1] text-white'
                  : 'bg-[#FAF5F6] border-[#DED0D5] focus:border-[#E79FC3]'
              }`}
            />
          </div>

          {/* Avatar URL — chỉ còn dán link ảnh, đã bỏ tính năng tải ảnh từ máy để tiết kiệm dung lượng lưu trữ */}
          <div>
            <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <LinkIcon className="w-3 h-3" />
              <span>Đường Dẫn Ảnh Đại Diện (URL)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className={`flex-1 px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-[#1F1C22] border-[#38323D] focus:border-[#F2B3C1] text-white'
                    : 'bg-[#FAF5F6] border-[#DED0D5] focus:border-[#E79FC3]'
                }`}
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className={`px-4 py-2.5 rounded-xl border font-semibold text-xs transition-colors ${
                  isDark
                    ? 'bg-[#3A2935] border-[#7A5869] text-[#F2B3C1] hover:border-[#F2B3C1]'
                    : 'bg-[#FFF6FB] border-[#F0C7DE] text-[#B4587E] hover:border-[#E79FC3]'
                }`}
              >
                Áp dụng
              </button>
            </div>
            <p className="text-[11px] text-[#8F7D85] dark:text-[#D5CBD0] mt-1.5">
              Dán đường link ảnh trực tiếp từ internet rồi nhấn "Áp dụng" để xem trước.
            </p>
          </div>

          {/* Email Info (Read-only) */}
          <div>
            <label className="block text-[#8F7D85] dark:text-[#D5CBD0] font-semibold uppercase tracking-wide mb-1.5">
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

          {/* Divider nơ — thay cho border-t phẳng, đồng bộ dải phân cách 𝜗𝜚 dùng khắp site */}
          <div className="flex items-center gap-1.5 pt-1">
            <div
              className={`flex-1 h-px ${
                isDark ? 'bg-gradient-to-r from-transparent to-[#6B5261]' : 'bg-gradient-to-r from-transparent to-[#F3C6DD]'
              }`}
            />
            <span className={`text-[9px] ${isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'}`}>𝜗𝜚</span>
            <div
              className={`flex-1 h-px ${
                isDark ? 'bg-gradient-to-l from-transparent to-[#6B5261]' : 'bg-gradient-to-l from-transparent to-[#F3C6DD]'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className={`min-h-[38px] px-4 py-2 rounded-full border text-xs font-medium transition-colors ${
                isDark
                  ? 'border-[#6B5261] text-[#D5CBD0] hover:border-[#F2B3C1] hover:text-white'
                  : 'border-[#F0C7DE] text-[#B4587E] hover:border-[#E79FC3]'
              }`}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className="min-h-[38px] px-6 py-2 rounded-full font-semibold text-xs uppercase tracking-wider transition-opacity hover:opacity-90 text-center"
              style={{ background: isDark ? ACCENT_DARK : ACCENT, color: isDark ? ACCENT_TEXT_DARK : '#FFFFFF' }}
            >
              {savedSuccess ? 'Đã lưu thành công!' : 'Lưu Hồ Sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};