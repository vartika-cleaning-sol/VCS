"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatTime(slot: string) {
  const map: Record<string, string> = {
    morning: "AM",
    afternoon: "PM",
    evening: "EV",
  };
  return map[slot] || slot;
}

function getStatusStyle(status: string) {
  const map: Record<string, string> = {
    new: "bg-[rgba(200,217,200,0.08)] border-[rgba(200,217,200,0.2)] text-accent2",
    contacted: "bg-[rgba(96,165,250,0.08)] border-[rgba(96,165,250,0.2)] text-[#60A5FA]",
    confirmed: "bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.2)] text-[#22C55E]",
    completed: "bg-[rgba(148,163,184,0.08)] border-[rgba(148,163,184,0.2)] text-[#94A3B8]",
    cancelled: "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)] text-[#EF4444]",
  };
  return map[status] || "";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const svcMap = new Map(
    (services || []).map((s) => [s.slug, s.name])
  );
  const priceMap = new Map(
    (services || []).map((s) => [s.slug, { basePrice: s.base_price || 0, model: s.pricing_model || "per_sqft" }])
  );
  const total = bookings?.length || 0;
  const pendingCount = bookings?.filter((b) => b.status === "new").length || 0;
  const confirmedCount = bookings?.filter((b) => b.status === "confirmed").length || 0;
  const completedCount = bookings?.filter((b) => b.status === "completed").length || 0;

  const estRevenue = (bookings || [])
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => {
      const pricing = priceMap.get(b.service_slug);
      if (!pricing) return sum;
      return sum + (pricing.basePrice * (b.area_sqft || 0));
    }, 0);

  const recent = bookings?.slice(0, 5) || [];

  const stats = [
    { val: String(total), label: "Total Bookings", chg: `${completedCount} completed`, color: "var(--color-accent2)" },
    { val: String(pendingCount), label: "Pending Review", chg: pendingCount > 0 ? `⚠ ${pendingCount} urgent` : "None pending", color: pendingCount > 0 ? "#F59E0B" : "#22C55E" },
    { val: String(confirmedCount), label: "Confirmed", chg: "Awaiting service", color: "#22C55E" },
    { val: `₹${estRevenue.toLocaleString("en-IN")}`, label: "Est. Revenue", chg: `From ${confirmedCount + completedCount} confirmed/completed`, color: "var(--color-accent2)" },
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-4 gap-3.5 mb-5 max-md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#161714] border border-white/6 rounded-12 p-[22px] h-[120px]" />
          ))}
        </div>
        <div className="bg-[#161714] border border-white/6 rounded-12 p-5 h-64" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-3.5 mb-5 max-md:grid-cols-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#161714] border border-white/6 rounded-12 p-[22px] relative"
          >
            <div className="font-mono max-md:text-xl text-[32px] text-white font-medium mb-1 leading-none truncate">
              {stat.val}
            </div>
            <div className="text-xs text-white/35 uppercase tracking-wide mb-2">
              {stat.label}
            </div>
            <div className="text-[11px] flex items-center gap-1" style={{ color: stat.chg.includes("⚠") ? "#F59E0B" : "#22C55E" }}>
              {stat.chg}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#161714] border border-white/6 rounded-12 overflow-hidden mb-3.5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/4">
          <span className="text-sm font-semibold text-white/85">
            Recent Bookings
          </span>
          <Link href="/admin/bookings" className="text-xs text-accent2 cursor-pointer">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recent.length === 0 ? (
            <div className="text-center py-12 text-white/20 text-sm">
              No bookings yet.
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black/20 border-b border-white/4">
                  {["Customer", "Service", "Date", "Status"].map((h) => (
                    <th
                      key={h}
                      className="text-[10px] tracking-widest uppercase text-white/25 px-5 py-2.5 text-left whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/3 hover:bg-white/[0.04] transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/bookings/${row.id}`)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {getInitials(row.customer_name)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm text-white/75 block truncate max-w-[160px]">
                            {row.customer_name}
                          </span>
                          <span className="text-[11px] text-white/30 block truncate max-w-[160px]">
                            {row.phone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="bg-white/5 border border-white/6 rounded px-2 py-0.5 text-[11px] text-white/50 truncate max-w-[120px] inline-block align-middle">
                        {svcMap.get(row.service_slug) || row.service_slug}
                      </span>
                    </td>
                    <td className="font-mono text-[11px] text-white/40 px-5 whitespace-nowrap">
                      {formatDate(row.preferred_date)} · {formatTime(row.time_slot)}
                    </td>
                    <td className="px-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border ${getStatusStyle(row.status)}`}
                      >
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </>
  );
}
