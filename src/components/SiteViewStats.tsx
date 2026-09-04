import React, { useEffect, useState } from 'react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useApp } from '../context/AppContext';
import { Eye, Calendar, TrendingUp, Globe } from 'lucide-react';

interface SiteStats {
  today: number;
  month: number;
  year: number;
  allTime: number;
}

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
    { label: 'Hôm nay', sublabel: 'Lượt xem thực', value: stats.today, icon: Eye },
    { label: 'Tháng này', sublabel: 'Lượt xem thực', value: stats.month, icon: Calendar },
    { label: 'Năm này', sublabel: 'Lượt xem thực', value: stats.year, icon: TrendingUp },
    { label: 'Toàn thời gian', sublabel: 'Lượt xem thực', value: stats.allTime, icon: Globe },
  ];

  return (
    <div className="pt-4 pb-2">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#E8A0B8]" />
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#B5798D] dark:text-[#E8B8C5]">
            Lượt Xem Toàn Trang
          </span>
          <span className="w-2 h-2 rounded-full bg-[#E8A0B8]" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`rounded-2xl border-2 p-3 text-center ${isDark ? 'bg-[#352936] border-[#6B5261]' : 'bg-[#FFF9FB] border-[#E8B8C5]'}`}>
                <Icon className="w-4 h-4 mx-auto mb-1 text-[#D985A2] dark:text-[#F2B3C1]" />
                <div className="font-eb-garamond font-medium text-xl text-[#A45E78] dark:text-[#F2B3C1]">{item.value.toLocaleString('vi-VN')}</div>
                <div className="text-[10px] text-[#8F6875] dark:text-[#D5CBD0]">{item.label}</div>
                <div className="text-[9px] text-[#B58B98] dark:text-[#8F7D85] mt-0.5">{item.sublabel}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};