"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WA_TEMPLATES } from "@/lib/constants/messages";

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
    morning: "Morning (8–12)",
    afternoon: "Afternoon (12–4)",
    evening: "Evening (4–8)",
  };
  return map[slot] || slot;
}

interface DetailBooking {
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

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<DetailBooking | null>(null);
  const [services, setServices] = useState<{ slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      Promise.all([
        fetch(`/api/bookings?id=${params.id}`).then((r) => r.json()),
        fetch("/api/services").then((r) => r.json()),
      ])
        .then(([bookingRes, svcRows]) => {
          setServices(svcRows.map((s: { slug: string; name: string }) => ({ slug: s.slug, name: s.name })));
          if (bookingRes.data) {
            setBooking(bookingRes.data);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [params.id]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const json = await res.json();
    if (json.data) {
      setBooking((prev) => prev ? { ...prev, status: json.data.status } : prev);
    }
  };

  const handleApprove = () => {
    if (!booking) return;
    updateStatus(booking.id, "confirmed");
  };

  const handleReject = () => {
    if (!booking) return;
    updateStatus(booking.id, "cancelled");
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-4 w-16 bg-white/5 rounded-8" />
          <div className="h-5 w-40 bg-white/5 rounded-8" />
        </div>
        <div className="bg-[#161714] border border-white/6 rounded-12 p-6 max-w-2xl">
          <div className="grid grid-cols-2 gap-4 mb-6 max-md:grid-cols-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i}>
                <div className="h-3 w-20 bg-white/5 rounded-8 mb-2" />
                <div className="h-4 w-32 bg-white/5 rounded-8" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="h-9 w-36 bg-white/5 rounded-full" />
            <div className="h-9 w-36 bg-white/5 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-16 text-white/20 text-sm">
        Booking not found.
      </div>
    );
  }

  const svc = getServiceName(booking.service_slug, services);
  const customerPhone = booking.whatsapp || booking.phone;
  const waMessage = WA_TEMPLATES.appointment_confirmed(
    booking.customer_name,
    svc,
    formatDate(booking.preferred_date),
    formatTime(booking.time_slot)
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button
          className="text-white/30 hover:text-white/60 text-sm cursor-pointer"
          onClick={() => router.push("/admin/bookings")}
        >
          ← Back
        </button>
        <h2 className="text-lg font-semibold text-white/85">
          Booking #{booking.id.slice(0, 8)}
        </h2>
      </div>

      <div className="bg-[#161714] border border-white/6 rounded-12 p-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-4 mb-6 max-md:grid-cols-1">
          {[
            { label: "Customer", value: booking.customer_name },
            { label: "Phone", value: booking.phone },
            { label: "WhatsApp", value: booking.whatsapp || "—" },
            { label: "Email", value: booking.email || "—" },
            { label: "Service", value: svc },
            { label: "Property Type", value: booking.property_type || "—" },
            { label: "Area (sq.ft)", value: booking.area_sqft ? `${booking.area_sqft}` : "—" },
            { label: "Date", value: formatDate(booking.preferred_date) },
            { label: "Time", value: formatTime(booking.time_slot) },
            { label: "State", value: booking.state || "—" },
            { label: "District", value: booking.district || "—" },
            { label: "Pincode", value: booking.pincode || "—" },
            { label: "Source", value: booking.source || "—" },
            {
              label: "Status",
              value: (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border ${
                    STATUS_STYLES[booking.status] || ""
                  }`}
                >
                  {STATUS_LABEL[booking.status] || booking.status}
                </span>
              ),
            },
          ].map((field) => (
            <div key={field.label}>
              <div className="text-[10px] tracking-widest uppercase text-white/25 mb-1">
                {field.label}
              </div>
              <div className="text-sm text-white/70">{field.value}</div>
            </div>
          ))}
        </div>

        {booking.address && (
          <div className="mb-6">
            <div className="text-[10px] tracking-widest uppercase text-white/25 mb-1">
              Address
            </div>
            <p className="text-sm text-white/50">
              {[booking.address, booking.district, booking.state, booking.pincode].filter(Boolean).join(", ")}
            </p>
          </div>
        )}

        {booking.notes && (
          <div className="mb-6">
            <div className="text-[10px] tracking-widest uppercase text-white/25 mb-1">
              Notes
            </div>
            <p className="text-sm text-white/50">{booking.notes}</p>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {booking.status === "new" && (
            <>
              <button
                className="px-4 py-2 bg-accent text-white rounded-full text-xs font-medium hover:bg-accent2 transition-all cursor-pointer"
                onClick={handleApprove}
              >
                Approve Booking
              </button>
              <button
                className="px-4 py-2 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#EF4444] rounded-full text-xs font-medium hover:bg-[rgba(239,68,68,0.12)] transition-all cursor-pointer"
                onClick={handleReject}
              >
                Reject Booking
              </button>
            </>
          )}
          {booking.status === "contacted" && (
            <>
              <button
                className="px-4 py-2 bg-accent text-white rounded-full text-xs font-medium hover:bg-accent2 transition-all cursor-pointer"
                onClick={handleApprove}
              >
                Approve Booking
              </button>
              <button
                className="px-4 py-2 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#EF4444] rounded-full text-xs font-medium hover:bg-[rgba(239,68,68,0.12)] transition-all cursor-pointer"
                onClick={handleReject}
              >
                Reject Booking
              </button>
            </>
          )}
          {booking.status === "confirmed" && (
            <button
              className="px-4 py-2 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#EF4444] rounded-full text-xs font-medium hover:bg-[rgba(239,68,68,0.12)] transition-all cursor-pointer"
              onClick={handleReject}
            >
              Reject Booking
            </button>
          )}
          <button
            className="px-4 py-2 bg-[rgba(37,211,102,0.1)] border border-[rgba(37,211,102,0.2)] text-[#25D366] rounded-full text-xs font-medium hover:bg-[rgba(37,211,102,0.15)] transition-all cursor-pointer"
            onClick={() => window.open(buildWhatsAppUrl(waMessage, customerPhone), "_blank")}
          >
            Send WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
