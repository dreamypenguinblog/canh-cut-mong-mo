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
          <div className="h-px w-8 bg-[#DAC8CE] dark:bg-[#38323D]" />
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8F7D85] dark:text-[#D5CBD0]">
            Lượt Xem Toàn Trang
          </span>
          <div className="h-px w-8 bg-[#DAC8CE] dark:bg-[#38323D]" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`rounded-xl border p-3 text-center ${isDark ? 'bg-[#18161B] border-[#332E38]' : 'bg-white border-[#EADCE1]'}`}>
                <Icon className="w-4 h-4 mx-auto mb-1 text-[#8F7D85]" />
                <div className="font-playfair font-semibold text-lg">{item.value.toLocaleString('vi-VN')}</div>
                <div className="text-[10px] text-[#8F7D85]">{item.label}</div>
                <div className="text-[9px] text-[#A99BA1] mt-0.5">{item.sublabel}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};