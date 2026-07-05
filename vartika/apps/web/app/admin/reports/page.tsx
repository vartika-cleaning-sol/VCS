"use client";

import { useEffect, useState, useMemo } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TODAY = new Date();

function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export default function AdminReportsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(TODAY.getMonth());
  const [selectedYear, setSelectedYear] = useState(TODAY.getFullYear());

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
    ]).then(([bookingsRes, svcRows]) => {
      setBookings(bookingsRes.data || []);
      setServices(svcRows || []);
      setLoading(false);
    });
  }, []);

  const years = useMemo(() => {
    const yrs = new Set<number>();
    bookings.forEach((b) => yrs.add(new Date(b.created_at).getFullYear()));
    yrs.add(TODAY.getFullYear());
    return Array.from(yrs).sort((a, b) => b - a);
  }, [bookings]);

  const priceMap = useMemo(
    () =>
      new Map(
        (services || []).map((s) => [
          s.slug,
          { minPrice: s.min_price || 0, maxPrice: s.max_price || 0 },
        ])
      ),
    [services]
  );

  const svcMap = useMemo(
    () => new Map((services || []).map((s: any) => [s.slug, s.name])),
    [services]
  );

  const monthBookings = useMemo(
    () =>
      (bookings || []).filter((b) => {
        const d = new Date(b.created_at);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      }),
    [bookings, selectedMonth, selectedYear]
  );

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const dailyData = useMemo(
    () =>
      Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dayBookings = monthBookings.filter(
          (b) => new Date(b.created_at).getDate() === day
        );
        const revenue = dayBookings.reduce((sum, b) => {
          const pricing = priceMap.get(b.service_slug);
          return sum + (pricing?.minPrice || 0) * (b.area_sqft || 0);
        }, 0);
        return { day, count: dayBookings.length, revenue };
      }),
    [monthBookings, daysInMonth, priceMap]
  );

  const maxCount = Math.max(...dailyData.map((d) => d.count), 1);
  const totalMonthBookings = monthBookings.length;
  const totalMonthRevenue = dailyData.reduce((sum, d) => sum + d.revenue, 0);

  const svcCounts: Record<string, number> = {};
  (bookings || []).forEach((b) => {
    svcCounts[b.service_slug] = (svcCounts[b.service_slug] || 0) + 1;
  });
  const totalBookings = (bookings || []).length;
  const svcPct = Object.entries(svcCounts)
    .map(([slug, count]) => ({
      name: svcMap.get(slug) || slug,
      pct: Math.round((count / totalBookings) * 100),
    }))
    .sort((a, b) => b.pct - a.pct);

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-24 bg-white/5 rounded-8 mb-5" />
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <div className="bg-[#161714] border border-white/6 rounded-12 p-6 h-[260px]" />
          <div className="bg-[#161714] border border-white/6 rounded-12 p-6 h-[260px]" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-white/85 mb-5">Reports</h2>

      {totalBookings === 0 ? (
        <div className="text-center py-16 text-white/20 text-sm">
          No booking data yet.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 text-xs cursor-pointer transition-all"
            >
              ◀
            </button>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-black/20 border border-white/6 rounded-8 px-3 py-1.5 text-sm text-white/70 outline-none focus:border-accent2/40 cursor-pointer"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-black/20 border border-white/6 rounded-8 px-3 py-1.5 text-sm text-white/70 outline-none focus:border-accent2/40 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 text-xs cursor-pointer transition-all"
            >
              ▶
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div className="bg-[#161714] border border-white/6 rounded-12 p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-sm font-medium text-white/65">
                  Daily Sales — {MONTHS[selectedMonth]} {selectedYear}
                </h3>
                <div className="text-xs text-white/30 space-x-4">
                  <span>{totalMonthBookings} bookings</span>
                  <span>{formatINR(totalMonthRevenue)} est.</span>
                </div>
              </div>
              <div className="flex items-end gap-[2px] h-[180px] pt-2">
                {dailyData.map((d) => {
                  const pct = Math.max(
                    (d.count / maxCount) * 100,
                    d.count > 0 ? 6 : 0
                  );
                  return (
                    <div
                      key={d.day}
                      className="flex-1 rounded-t-[2px] relative bg-accent/30 hover:bg-accent/50 transition-all cursor-default"
                      style={{ height: `${pct}%` }}
                      title={`Day ${d.day}: ${d.count} booking${d.count !== 1 ? "s" : ""}${d.revenue > 0 ? `, ${formatINR(d.revenue)}` : ""}`}
                    >
                      {(daysInMonth <= 14 ||
                        d.day === 1 ||
                        d.day === daysInMonth ||
                        d.day % 5 === 0) && (
                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-white/20 whitespace-nowrap">
                          {d.day}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#161714] border border-white/6 rounded-12 p-6">
              <h3 className="text-sm font-medium text-white/65 mb-4">
                Bookings by Service
              </h3>
              {svcPct.length === 0 ? (
                <p className="text-white/20 text-sm">No data</p>
              ) : (
                svcPct.map((svc) => (
                  <div key={svc.name} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">{svc.name}</span>
                      <span className="text-white/30">{svc.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${svc.pct}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
