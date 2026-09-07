import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useApp } from '../context/AppContext';

interface SiteStats {
  today: number;
  month: number;
  year: number;
  allTime: number;
}

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / Navbar / Footer.
// Đọc từ các document đếm sẵn trong `siteStats` (được AppContext.recordView cập nhật
// mỗi khi có 1 view thật) — 4 getDoc cố định thay vì 4 aggregation query quét cả
// collection viewEvents, nên chi phí không tăng theo thời gian nữa.
//
// Giao diện: gộp lại thành 1 khung gradient duy nhất (thay vì 4 ô rời trước đây),
// chia 4 cột bằng đường kẻ mảnh — gọn và dịu hơn, dùng đúng ngôn ngữ trang trí
// (gradient nền, sparkle ✧⋆, dải 𝜗𝜚, font Vollkorn) như NovelCard/Leaderboard.

export const SiteViewStats: React.FC = () => {
  const { globalTheme } = useApp();
  const isDark = globalTheme === 'dark';
  const [stats, setStats] = useState<SiteStats>({ today: 0, month: 0, year: 0, allTime: 0 });

  // Loads exactly once per page load/tab open. No timer, no re-fetch on tab
  // focus — this footer widget is decorative, so it only needs to reflect
  // whatever the numbers were when the reader opened the site, not stay
  // continuously live for as long as a tab happens to stay open.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const now = new Date();
        const dayKey = now.toISOString().slice(0, 10);
        const monthKey = dayKey.slice(0, 7);
        const yearKey = dayKey.slice(0, 4);

        const [daySnap, monthSnap, yearSnap, allTimeSnap] = await Promise.all([
          getDoc(doc(db, 'siteStats', `day-${dayKey}`)),
          getDoc(doc(db, 'siteStats', `month-${monthKey}`)),
          getDoc(doc(db, 'siteStats', `year-${yearKey}`)),
          getDoc(doc(db, 'siteStats', 'allTime')),
        ]);

        if (!cancelled) {
          setStats({
            today: daySnap.data()?.count || 0,
            month: monthSnap.data()?.count || 0,
            year: yearSnap.data()?.count || 0,
            allTime: allTimeSnap.data()?.count || 0,
          });
        }
      } catch (error) {
        console.error('Không thể tải thống kê view:', error);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const items = [
    { label: 'Ngày', value: stats.today },
    { label: 'Tháng', value: stats.month },
    { label: 'Năm', value: stats.year },
    { label: 'Tổng', value: stats.allTime },
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

          {/* Dải phân cách nhỏ phía trên các ô số liệu — ký hiệu 𝜗𝜚 như divider NovelCard */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <div
              className={`w-8 h-px ${
                isDark ? 'bg-gradient-to-r from-transparent to-[#6B5261]' : 'bg-gradient-to-r from-transparent to-[#F3C6DD]'
              }`}
            />
            <span className={`text-[9px] ${isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'}`}>𝜗𝜚</span>
            <div
              className={`w-8 h-px ${
                isDark ? 'bg-gradient-to-l from-transparent to-[#6B5261]' : 'bg-gradient-to-l from-transparent to-[#F3C6DD]'
              }`}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3">
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