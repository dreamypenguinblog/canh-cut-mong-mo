import React, { useEffect, useState } from 'react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useApp } from '../context/AppContext';

interface SiteStats {
  today: number;
  month: number;
  year: number;
  allTime: number;
}

// Bảng màu hồng phẳng đồng bộ với NovelCard / NovelGrid / Leaderboard / Navbar / Footer.

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
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

        const ref = collection(db, 'viewEvents');
        const [today, month, year, allTime] = await Promise.all([
          getCountFromServer(query(ref, where('createdAt', '>=', todayStart))),
          getCountFromServer(query(ref, where('createdAt', '>=', monthStart))),
          getCountFromServer(query(ref, where('createdAt', '>=', yearStart))),
          getCountFromServer(query(ref)),
        ]);

        if (!cancelled) {
          setStats({
            today: today.data().count,
            month: month.data().count,
            year: year.data().count,
            allTime: allTime.data().count,
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
    <div className="pt-4 pb-2">
      <div className="max-w-4xl mx-auto px-4">
        {/* Dải trang trí nhỏ phía trên các ô số liệu — cùng ký hiệu 𝜗𝜚 dùng ở divider NovelCard,
            không thêm chữ nhãn (đã bỏ "Lượt Xem Toàn Trang" theo yêu cầu trước đó) */}
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <div
            className={`w-10 h-px ${
              isDark ? 'bg-gradient-to-r from-transparent to-[#6B5261]' : 'bg-gradient-to-r from-transparent to-[#F3C6DD]'
            }`}
          />
          <span className={`text-[9px] ${isDark ? 'text-[#7A5869]' : 'text-[#E9B8C2]'}`}>𝜗𝜚</span>
          <div
            className={`w-10 h-px ${
              isDark ? 'bg-gradient-to-l from-transparent to-[#6B5261]' : 'bg-gradient-to-l from-transparent to-[#F3C6DD]'
            }`}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {items.map((item) => (
            <div
              key={item.label}
              className={`relative overflow-hidden rounded-2xl border p-3 text-center ${
                isDark ? 'bg-[#352936] border-[#6B5261]' : 'bg-[#FFF6FB] border-[#F5D2E0]'
              }`}
            >
              {/* Sparkle nhỏ góc trên phải mỗi ô — cùng ngôn ngữ trang trí với NovelCard */}
              <span
                className={`pointer-events-none select-none absolute top-1 right-1.5 text-[7px] ${
                  isDark ? 'text-[#7A5869]/60' : 'text-[#F2C7DA]/80'
                }`}
              >
                ✧
              </span>

              {/* Số liệu — đổi từ EB Garamond sang Vollkorn (đồng bộ font tiêu đề truyện/mục lục), đậm hơn một chút */}
              <div
                style={{ fontFamily: "'Vollkorn', serif" }}
                className="not-italic font-semibold text-xl sm:text-2xl text-[#A45E78] dark:text-[#F2B3C1]"
              >
                {item.value.toLocaleString('vi-VN')}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[#8F6875] dark:text-[#D5CBD0] mt-0.5">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};