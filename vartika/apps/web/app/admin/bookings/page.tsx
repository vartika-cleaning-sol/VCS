"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WA_TEMPLATES } from "@/lib/constants/messages";

const TABS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "cancelled", label: "Rejected" },
  { key: "confirmed", label: "Confirmed" },
  { key: "contacted", label: "Contacted" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  new: "bg-[rgba(200,217,200,0.08)] border-[rgba(200,217,200,0.2)] text-accent2",
  contacted: "bg-[rgba(96,165,250,0.08)] border-[rgba(96,165,250,0.2)] text-[#60A5FA]",
  confirmed: "bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.2)] text-[#22C55E]",
  completed: "bg-[rgba(148,163,184,0.08)] border-[rgba(148,163,184,0.2)] text-[#94A3B8]",
  cancelled: "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)] text-[#EF4444]",
};

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Rejected",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getServiceName(slug: string, svcList: { slug: string; name: string }[]) {
  return svcList.find((s) => s.slug === slug)?.name || slug;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(slot: string) {
  const map: Record<string, string> = {
    morning: "8–12 AM",
    afternoon: "12–4 PM",
    evening: "4–8 PM",
  };
  return map[slot] || slot;
}

interface CardBooking {
  id: string;
  customer_name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  service_slug: string;
  property_type?: string;
  area_sqft?: number;
  preferred_date: string;
  time_slot: string;
  state?: string;
  district?: string;
  pincode?: string;
  address?: string;
  notes?: string;
  source?: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [bookings, setBookings] = useState<CardBooking[]>([]);
  const [services, setServices] = useState<{ slug: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
    ])
      .then(([bookingsRes, svcRows]) => {
        setServices(svcRows.map((s: { slug: string; name: string }) => ({ slug: s.slug, name: s.name })));
        if (bookingsRes.data) {
          setBookings(bookingsRes.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const byTab = activeTab === "all"
      ? bookings
      : bookings.filter((b) => b.status === activeTab);

    if (!searchQuery) return byTab;

    const q = searchQuery.toLowerCase();
    return byTab.filter(
      (b) =>
        b.customer_name.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.id.toLowerCase().includes(q)
    );
  }, [bookings, activeTab, searchQuery]);

  const counts = Object.fromEntries(
    TABS.map((t) => [
      t.key,
      t.key === "all"
        ? bookings.length
        : bookings.filter((b) => b.status === t.key).length,
    ])
  );

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const json = await res.json();
    if (json.data) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    }
  };

  const handleApprove = (id: string) => updateStatus(id, "confirmed");
  const handleReject = (id: string) => updateStatus(id, "cancelled");

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-24 bg-white/5 rounded-8 mb-5" />
        <div className="flex gap-2 mb-6 flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 bg-white/5 rounded-full" />
          ))}
        </div>
        <div className="grid gap-3.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-[#161714] border border-white/6 rounded-12 p-5 flex items-center gap-5 max-md:flex-col max-md:items-start">
              <div className="w-10 h-10 rounded-full bg-white/5 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-white/5 rounded-8" />
                <div className="h-3 w-24 bg-white/5 rounded-8" />
              </div>
              <div className="h-6 w-20 bg-white/5 rounded-full" />
              <div className="h-6 w-16 bg-white/5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-white/85 mb-5">Bookings</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`relative px-4 py-1.5 rounded-full text-xs cursor-pointer transition-all ${
              activeTab === tab.key
                ? "bg-accent text-white"
                : "bg-white/5 text-white/40 border border-white/6 hover:text-white/70"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span
              className={`ml-1.5 text-[10px] ${
                activeTab === tab.key ? "text-white/60" : "text-white/20"
              }`}
            >
              ({counts[tab.key]})
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/20 text-sm">
          No bookings found.
        </div>
      ) : (
        <div className="grid gap-3.5">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="bg-[#161714] border border-white/6 rounded-12 p-5 flex items-center gap-5 max-md:flex-col max-md:items-start cursor-pointer hover:border-white/15 transition-colors"
              onClick={() => router.push(`/admin/bookings/${booking.id}`)}
            >
              {/* Avatar */}
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {getInitials(booking.customer_name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_auto_auto] gap-x-6 gap-y-1 items-center max-md:grid-cols-2 max-md:w-full">
                {/* Name + Phone */}
                <div className="min-w-0">
                  <div className="text-sm text-white/75 truncate flex items-center gap-1.5">
                    {booking.customer_name}
                  </div>
                  <a
                    href={`tel:${booking.phone}`}
                    className="text-[11px] text-white/30 truncate hover:text-accent2 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {booking.phone}
                  </a>
                </div>

                {/* Service */}
                <span className="bg-white/5 border border-white/6 rounded px-2 py-0.5 text-[11px] text-white/50 whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                  {getServiceName(booking.service_slug, services)}
                </span>

                {/* Date */}
                <span className="font-mono text-[11px] text-white/40 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis">
                  {formatDate(booking.preferred_date)}
                </span>

                {/* Time */}
                <span className="font-mono text-[11px] text-white/40 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis">
                  {formatTime(booking.time_slot)}
                </span>

                {/* Address (if present) */}
                {booking.address && (
                  <span className="text-[10px] text-white/25 col-span-full truncate">
                    📍 {[booking.address, booking.district, booking.state, booking.pincode].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>

              {/* Status badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border shrink-0 ${
                  STATUS_STYLES[booking.status] || ""
                }`}
              >
                {STATUS_LABEL[booking.status] || booking.status}
              </span>

              {/* Actions */}
              <div className="flex gap-1.5 shrink-0 flex-wrap">
                {booking.status === "new" && (
                  <>
                    <button
                      className="px-3 py-1.5 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[#22C55E] rounded-full text-[11px] font-medium hover:bg-[rgba(34,197,94,0.15)] transition-all cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); handleApprove(booking.id); }}
                    >
                      Approve
                    </button>
                    <button
                      className="px-3 py-1.5 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#EF4444] rounded-full text-[11px] font-medium hover:bg-[rgba(239,68,68,0.12)] transition-all cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); handleReject(booking.id); }}
                    >
                      Reject
                    </button>
                    <button
                      className="px-3 py-1.5 bg-[rgba(37,211,102,0.1)] border border-[rgba(37,211,102,0.2)] text-[#25D366] rounded-full text-[11px] font-medium hover:bg-[rgba(37,211,102,0.15)] transition-all cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookings((prev) =>
                          prev.map((b) => (b.id === booking.id ? { ...b, status: "contacted" } : b))
                        );
                        fetch("/api/bookings", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: booking.id, status: "contacted" }),
                        });
                        const svc = getServiceName(booking.service_slug, services);
                        const msg = WA_TEMPLATES.appointment_confirmed(
                          booking.customer_name,
                          svc,
                          formatDate(booking.preferred_date),
                          formatTime(booking.time_slot)
                        );
                        const customerPhone = booking.whatsapp || booking.phone;
                        window.open(buildWhatsAppUrl(msg, customerPhone), "_blank");
                      }}
                    >
                      WhatsApp
                    </button>
                  </>
                )}
                {booking.status === "contacted" && (
                  <>
                    <button
                      className="px-3 py-1.5 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[#22C55E] rounded-full text-[11px] font-medium hover:bg-[rgba(34,197,94,0.15)] transition-all cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); handleApprove(booking.id); }}
                    >
                      Approve
                    </button>
                    <button
                      className="px-3 py-1.5 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#EF4444] rounded-full text-[11px] font-medium hover:bg-[rgba(239,68,68,0.12)] transition-all cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); handleReject(booking.id); }}
                    >
                      Reject
                    </button>
                  </>
                )}
                {booking.status !== "new" && booking.status !== "confirmed" && booking.status !== "contacted" && (
                  <span className="text-[11px] text-white/20 px-2 py-1.5">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
