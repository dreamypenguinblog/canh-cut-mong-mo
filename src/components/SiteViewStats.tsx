import React, { useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / Navbar / Footer.
//
// Đổi hướng hoàn toàn so với bản trước: KHÔNG còn đọc một collection
// `siteStats` riêng nữa (day/month/year/allTime). Lý do — những document đó
// bắt đầu đếm từ 0 kể từ lúc tính năng được thêm vào, nên "Tổng" hiển thị
// bị lệch hẳn so với lượt xem thật đã tích lũy từ trước (nhìn như bị
// "reset"). Thay vào đó, 3 số ở đây được cộng thẳng từ field
// `totalViews` / `totalHearts` đã có sẵn trên từng novel — dữ liệu này
// chưa từng bị đụng vào, luôn phản ánh đúng số liệu thật, và không tốn
// thêm bất kỳ lần đọc Firestore nào ngoài việc đảm bảo danh sách novels đã
// được tải đủ (ensureNovelsLoaded tự cache, gọi lại ở trang đã tải rồi thì
// không tốn thêm read nào).
export const SiteViewStats: React.FC = () => {
  const { globalTheme, novels, ensureNovelsLoaded } = useApp();
  const isDark = globalTheme === 'dark';

  // SiteViewStats can render on pages that only ever loaded a single novel
  // (Reader, Novel Detail) — this guarantees the full catalog is in memory
  // before summing, regardless of which page the footer happens to be on.
  useEffect(() => {
    void ensureNovelsLoaded();
  }, []);

  const stats = useMemo(() => {
    return novels.reduce(
      (acc, n) => ({
        novelCount: acc.novelCount + 1,
        totalHearts: acc.totalHearts + (n.totalHearts || 0),
        totalViews: acc.totalViews + (n.totalViews || 0),
      }),
      { novelCount: 0, totalHearts: 0, totalViews: 0 }
    );
  }, [novels]);

  const items = [
    { label: 'Truyện', value: stats.novelCount },
    { label: 'Yêu thích', value: stats.totalHearts },
    { label: 'Lượt xem', value: stats.totalViews },
  ];

  return (
    <div className="pt-5 pb-3">
      <div className="max-w-3xl mx-auto px-4">
        <div
          className={`relative overflow-hidden rounded-[24px] border px-4 py-4 sm:px-6 sm:py-5 transition-colors ${
            isDark
              ? 'bg-gradient-to-b from-[#2B222C] via-[#241D26] to-[#2B222C] border-[#6B5261]'
              : 'bg-gradient-to-b from-white via-[#FFF8FB] to-white border-[#F5DFE7]'
          }`}
        >
          {/* Sparkle góc — cùng ngôn ngữ trang trí NovelCard/Leaderboard */}
          <div
            className={`pointer-events-none select-none absolute top-2.5 right-3.5 text-[8px] leading-[1.6] hidden sm:block ${
              isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/70'
            }`}
          >
            ✧　⋆
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {items.map((item, idx) => (
              <div
                key={item.label}
                className={`relative text-center ${
                  idx > 0 ? (isDark ? 'border-l border-[#453640]' : 'border-l border-[#F3E0E9]') : ''
                }`}
              >
                <div
                  style={{ fontFamily: "'Vollkorn', serif" }}
                  className={`not-italic font-semibold text-base sm:text-xl ${
                    isDark ? 'text-[#F2B3C1]' : 'text-[#A45E78]'
                  }`}
                >
                  {item.value.toLocaleString('vi-VN')}
                </div>
                <div
                  className={`text-[9px] sm:text-[10px] uppercase tracking-wider mt-0.5 ${
                    isDark ? 'text-[#D5CBD0]' : 'text-[#8F6875]'
                  }`}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* Dấu trang trí góc dưới — cùng ngôn ngữ NovelCard/Leaderboard */}
          <span className="pointer-events-none select-none absolute -bottom-1 -right-1 text-[11px] text-[#E9B8C2] dark:text-[#7A5869]">
            𝜗𝜚
          </span>
        </div>
      </div>
    </div>
  );
};