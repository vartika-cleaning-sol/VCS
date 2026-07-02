"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { STATES } from "@/lib/constants/index";
import { insertBooking } from "@/lib/supabase/queries/bookings";
import { mapServices } from "@/lib/map-service";
import type { Service } from "@/lib/map-service";

interface FormData {
  service: string;
  servicePrice: string;
  date: string;
  timeSlot: string;
  propertySize: string;
  name: string;
  phone: string;
  whatsapp: string;
  whatsappSame: boolean;
  email: string;
  state: string;
  district: string;
  pincode: string;
  address: string;
  source: string;
}

const initialForm: FormData = {
  service: "",
  servicePrice: "",
  date: "",
  timeSlot: "Morning (8–12)",
  propertySize: "",
  name: "",
  phone: "",
  whatsapp: "",
  whatsappSame: true,
  email: "",
  state: "",
  district: "",
  pincode: "",
  address: "",
  source: "",
};

function missingFields(f: FormData): string[] {
  const missing: string[] = [];
  if (!f.service) missing.push("Service");
  if (!f.date) missing.push("Preferred date");
  if (!f.name) missing.push("Full name");
  if (!f.phone) missing.push("Phone");
  if (!f.state) missing.push("State");
  if (!f.district) missing.push("District");
  if (!f.pincode || f.pincode.length !== 6) missing.push("Pincode");
  if (!f.address) missing.push("Full address");
  return missing;
}

export default function BookingForm({
  initialService,
}: {
  initialService?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [error, setError] = useState("");
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((rows) => {
        const mapped = mapServices(rows);
        setServices(mapped);
        if (mapped.length > 0 && !initialService) {
          setForm((prev) => ({
            ...prev,
            service: mapped[0].name,
            servicePrice: priceLabel(mapped[0]),
          }));
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialService && services.length > 0) {
      const match = services.find((s) => s.slug === initialService);
      if (match) {
        setForm((prev) => ({
          ...prev,
          service: match.name,
          servicePrice: priceLabel(match),
        }));
      }
    }
  }, [initialService, services]);

  function priceLabel(svc: Service) {
    return svc.pricingModel === "per_sqft"
      ? `₹${svc.basePrice}/${svc.pricingUnit}`
      : `₹${svc.basePrice}/${svc.pricingUnit}`;
  }

  const today = new Date().toISOString().split("T")[0];

  function computeTotal(
    svc: Service | undefined,
    propertySize: string,
    szUnit: "sq.ft" | "sq.m"
  ): number | null {
    if (!svc || !propertySize) return null;
    const size = Number(propertySize);
    if (size <= 0) return null;
    if (svc.pricingModel === "per_sqft") {
      const sqft = szUnit === "sq.m" ? size * 10.764 : size;
      return svc.basePrice * sqft;
    }
    return svc.basePrice * size;
  }

  function formatINR(n: number): string {
    return "₹" + n.toLocaleString("en-IN");
  }

  const selectedService = services.find((s) => s.name === form.service);
  const isAreaPriced = selectedService?.pricingModel === "per_sqft";
  const [sizeUnit, setSizeUnit] = useState<"sq.ft" | "sq.m">("sq.ft");
  const total = computeTotal(selectedService, form.propertySize, sizeUnit);

  const selectedState = STATES.find((s) => s.name === form.state);
  const districts = selectedState?.districts || [];

  const propertyUnit = isAreaPriced ? sizeUnit : "seats";
  const propertyLabel = isAreaPriced ? "Area" : "Number of Seats";
  const propertyPlaceholder = isAreaPriced ? "e.g. 500" : "e.g. 3";

  const update = (key: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (form.whatsappSame) {
      update("whatsapp", form.phone);
    }
  }, [form.phone, form.whatsappSame]);

  const handleServiceSelect = (svc: Service) => {
    update("service", svc.name);
    update("servicePrice", priceLabel(svc));
    update("propertySize", "");
  };

  const timeSlotMap: Record<string, string> = {
    "Morning (8–12)": "morning",
    "Afternoon (12–4)": "afternoon",
    "Evening (4–8)": "evening",
  };

  const sourceMap: Record<string, string> = {
    "Google Search": "google",
    WhatsApp: "whatsapp",
    "Friend / Referral": "friend",
    Instagram: "social",
    Other: "other",
  };

  const handleNextToDetails = () => {
    if (step === 2) {
      if (!form.date) {
        setError("Please select a preferred date");
        return;
      }
      if (new Date(form.date) < new Date(today)) {
        setError("Date must be today or in the future");
        return;
      }
      if (!form.name || !form.phone) {
        setError("Please fill in your name and phone");
        return;
      }
    }
    setError("");
    setStep((s) => s + 1);
  };

  const handleNextToConfirm = () => {
    const missing = missingFields(form);
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    setError("");
    setStep(4);
  };

  const handleSubmit = async () => {
    const svc = services.find((s) => s.name === form.service);
    const payload = {
      customer_name: form.name,
      phone: form.phone,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      service_slug: svc?.slug || "",
      property_type: "home" as const,
      area_sqft: form.propertySize ? Number(form.propertySize) : null,
      preferred_date: form.date,
      time_slot: timeSlotMap[form.timeSlot] || "morning",
      state: form.state,
      district: form.district,
      pincode: form.pincode,
      address: form.address,
      notes: null,
      source: sourceMap[form.source] || "other",
    };
    const { error: insertError } = await insertBooking(payload);
    if (insertError) {
      setError("Booking failed — please try again or contact us.");
    } else {
      await fetch("/api/send-booking-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    router.push("/thank-you");
  };

  const StepDot = ({ num, label }: { num: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all relative z-[1] ${
          num <= step
            ? "bg-accent text-white border-accent"
            : "bg-bg3 text-ink4 border-[1.5px] border-bd2"
        }`}
      >
        {num}
      </div>
      <div
        className={`text-[11px] tracking-widest uppercase mt-1.5 text-center whitespace-nowrap ${
          num <= step ? "text-accent" : "text-ink4"
        }`}
      >
        {label}
      </div>
    </div>
  );

  const StepLine = ({ active }: { active: boolean }) => (
    <div
      className={`w-20 h-[1.5px] transition-all max-md:w-10 ${active ? "bg-accent" : "bg-bd2"}`}
      style={{ marginTop: "-18px" }}
    />
  );

  return (
    <>
      <div className="flex items-center justify-center mb-14">
        <StepDot num={1} label="Service" />
        <StepLine active={step > 1} />
        <StepDot num={2} label="Schedule" />
        <StepLine active={step > 2} />
        <StepDot num={3} label="Details" />
        <StepLine active={step > 3} />
        <StepDot num={4} label="Confirm" />
      </div>

      {error && (
        <div className="max-w-[700px] mx-auto mb-6 px-5 py-3 rounded-12 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-sm text-[#EF4444]">
          {error}
        </div>
      )}

      <div className="flex gap-8 items-start max-md:flex-col">
        <div className="flex-1">
          {step === 1 && (
            <div>
              <h3 className="font-serif text-[28px] font-normal text-ink mb-8">
                Choose your service
              </h3>
              <div className="grid grid-cols-4 gap-3.5 mb-9 max-md:grid-cols-2">
                {services.map((svc) => (
                  <button
                    key={svc.slug}
                    className={`border-[1.5px] rounded-12 p-5 cursor-pointer transition-all text-left bg-bg ${
                      form.service === svc.name
                        ? "border-accent bg-[rgba(61,89,72,0.07)]"
                        : "border-bd2 hover:border-accent hover:bg-[rgba(61,89,72,0.07)]"
                    }`}
                    onClick={() => handleServiceSelect(svc)}
                  >
                    <div className="text-2xl mb-2.5">{svc.icon}</div>
                    <div className="text-sm font-semibold text-ink mb-1">
                      {svc.name}
                    </div>
                    <div className="font-mono text-sm text-accent">
                      from {priceLabel(svc)}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  className="btn inline-flex items-center gap-2 bg-accent text-white px-7 py-3.5 rounded-full text-sm font-medium tracking-wide shadow-[0_4px_20px_rgba(61,89,72,0.2)] hover:bg-accent2 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(61,89,72,0.3)] transition-all"
                  onClick={() => setStep(2)}
                >
                  Next: Schedule →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-serif text-[28px] font-normal text-ink mb-8">
                Choose date &amp; time
              </h3>
              <div className="mb-5">
                <label className="block text-xs tracking-widest uppercase text-ink3 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  min={today}
                  className="w-full h-12 bg-bg border border-bd2 rounded-8 px-4 text-[15px] text-ink outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(61,89,72,0.1)]"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  style={{ colorScheme: "light" }}
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs tracking-widest uppercase text-ink3 mb-2">
                  Time Slot
                </label>
                <div className="flex gap-2 flex-wrap">
                  {["Morning (8–12)", "Afternoon (12–4)", "Evening (4–8)"].map(
                    (slot) => (
                      <button
                        key={slot}
                        className={`px-5 py-2.5 border-[1.5px] rounded-full text-sm cursor-pointer transition-all ${
                          form.timeSlot === slot
                            ? "bg-accent text-white border-accent"
                            : "border-bd2 text-ink2 hover:bg-accent hover:text-white hover:border-accent"
                        }`}
                        onClick={() => update("timeSlot", slot)}
                      >
                        {slot}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-xs tracking-widest uppercase text-ink3 mb-2">
                  {propertyLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder={propertyPlaceholder}
                    className="flex-1 h-12 bg-bg border border-bd2 rounded-8 px-4 text-[15px] text-ink outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(61,89,72,0.1)] placeholder:text-ink4"
                    value={form.propertySize}
                    onChange={(e) => update("propertySize", e.target.value)}
                  />
                  {isAreaPriced && (
                    <div className="flex gap-1 shrink-0">
                      {(["sq.ft", "sq.m"] as const).map((unit) => (
                        <button
                          key={unit}
                          className={`h-12 px-4 border-[1.5px] rounded-8 text-sm font-medium cursor-pointer transition-all ${
                            sizeUnit === unit
                              ? "bg-accent text-white border-accent"
                              : "border-bd2 text-ink2 hover:border-accent"
                          }`}
                          onClick={() => setSizeUnit(unit)}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-9">
                <button
                  className="btn inline-flex items-center gap-2 bg-transparent text-ink px-7 py-3.5 rounded-full text-sm font-medium tracking-wide border border-bd2 hover:border-accent hover:text-accent transition-all"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
                <button
                  className="btn inline-flex items-center gap-2 bg-accent text-white px-7 py-3.5 rounded-full text-sm font-medium tracking-wide shadow-[0_4px_20px_rgba(61,89,72,0.2)] hover:bg-accent2 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(61,89,72,0.3)] transition-all"
                  onClick={() => {
                    if (!form.date) {
                      setError("Please select a preferred date");
                      return;
                    }
                    setError("");
                    setStep(3);
                  }}
                >
                  Next: Your Details →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="font-serif text-[28px] font-normal text-ink mb-8">
                Your contact &amp; address
              </h3>
              <div className="mb-5">
                <label className="block text-xs tracking-widest uppercase text-ink3 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Priya Malhotra"
                  className="w-full h-12 bg-bg border border-bd2 rounded-8 px-4 text-[15px] text-ink outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(61,89,72,0.1)] placeholder:text-ink4"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs tracking-widest uppercase text-ink3 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full h-12 bg-bg border border-bd2 rounded-8 px-4 text-[15px] text-ink outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(61,89,72,0.1)] placeholder:text-ink4"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2.5 mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.whatsappSame}
                  onChange={(e) => update("whatsappSame", e.target.checked)}
                  className="size-4 accent-accent"
                />
                <span className="text-sm text-ink3">Same as WhatsApp number</span>
              </label>
              {!form.whatsappSame && (
                <div className="mb-5">
                  <label className="block text-xs tracking-widest uppercase text-ink3 mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full h-12 bg-bg border border-bd2 rounded-8 px-4 text-[15px] text-ink outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(61,89,72,0.1)] placeholder:text-ink4"
                    value={form.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                  />
                </div>
              )}
              <div className="mb-5">
                <label className="block text-xs tracking-widest uppercase text-ink3 mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  className="w-full h-12 bg-bg border border-bd2 rounded-8 px-4 text-[15px] text-ink outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(61,89,72,0.1)] placeholder:text-ink4"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs tracking-widest uppercase text-ink3 mb-2">
                  How did you hear about us?
                </label>
                <select
                  className="w-full h-12 bg-bg border border-bd2 rounded-8 px-4 text-[15px] text-ink outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(61,89,72,0.1)]"
                  value={form.source}
                  onChange={(e) => update("source", e.target.value)}
                >
                  <option value="" disabled>
                    Select...
                  </option>
                  <option>Google Search</option>
                  <option>WhatsApp</option>
                  <option>Friend / Referral</option>
                  <option>Instagram</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Address section */}
              <div className="border-t border-bd pt-5 mt-5">
                <h4 className="text-sm font-semibold text-ink mb-4">
                  📍 Service Address *
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                    <div>
                      <label className="block text-xs tracking-widest uppercase text-ink3 mb-2">
                        State *
                      </label>
                      <select
                        className="w-full h-12 bg-bg border border-bd2 rounded-8 px-4 text-[15px] text-ink outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(61,89,72,0.1)]"
                        value={form.state}
                        onChange={(e) => {
                          update("state", e.target.value);
                          update("district", "");
                        }}
                      >
                        <option value="" disabled>
                          Select state...
                        </option>
                        {STATES.map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs tracking-widest uppercase text-ink3 mb-2">
                        District *
                      </label>
                      <select
                        className="w-full h-12 bg-bg border border-bd2 rounded-8 px-4 text-[15px] text-ink outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(61,89,72,0.1)] disabled:opacity-40"
                        value={form.district}
                        onChange={(e) => update("district", e.target.value)}
                        disabled={!form.state}
                      >
                        <option value="" disabled>
                          Select district...
                        </option>
                        {districts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                    <div>
                      <label className="block text-xs tracking-widest uppercase text-ink3 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="e.g. 110001"
                        className="w-full h-12 bg-bg border border-bd2 rounded-8 px-4 text-[15px] text-ink outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(61,89,72,0.1)] placeholder:text-ink4"
                        value={form.pincode}
                        onChange={(e) =>
                          update("pincode", e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-ink3 mb-2">
                      Full Address *
                    </label>
                    <textarea
                      placeholder="Street, building name, landmark, area..."
                      className="w-full bg-bg border border-bd2 rounded-8 px-4 py-3.5 text-[15px] text-ink outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(61,89,72,0.1)] placeholder:text-ink4 resize-vertical min-h-[80px]"
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-9">
                <button
                  className="btn inline-flex items-center gap-2 bg-transparent text-ink px-7 py-3.5 rounded-full text-sm font-medium tracking-wide border border-bd2 hover:border-accent hover:text-accent transition-all"
                  onClick={() => setStep(2)}
                >
                  ← Back
                </button>
                <button
                  className="btn inline-flex items-center gap-2 bg-accent text-white px-7 py-3.5 rounded-full text-sm font-medium tracking-wide shadow-[0_4px_20px_rgba(61,89,72,0.2)] hover:bg-accent2 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(61,89,72,0.3)] transition-all"
                  onClick={handleNextToConfirm}
                >
                  Review Booking →
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="font-serif text-[28px] font-normal text-ink mb-8">
                Confirm your booking
              </h3>
              <div className="bg-bg2 rounded-16 p-7 border border-bd mb-6">
                <div className="flex justify-between py-2.5 border-b border-bd text-sm">
                  <span className="text-ink3">Service</span>
                  <span className="text-ink font-medium">{form.service}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-bd text-sm">
                  <span className="text-ink3">Date</span>
                  <span className="text-ink font-medium">
                    {form.date
                      ? new Date(form.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-bd text-sm">
                  <span className="text-ink3">Time</span>
                  <span className="text-ink font-medium">{form.timeSlot}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-bd text-sm">
                  <span className="text-ink3">{propertyLabel}</span>
                  <span className="text-ink font-medium">
                    {form.propertySize
                      ? `${form.propertySize} ${propertyUnit}`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-bd text-sm">
                  <span className="text-ink3">Phone</span>
                  <span className="text-ink font-medium">
                    {form.phone || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-bd text-sm">
                  <span className="text-ink3">Name</span>
                  <span className="text-ink font-medium">
                    {form.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-bd text-sm">
                  <span className="text-ink3">Email</span>
                  <span className="text-ink font-medium">
                    {form.email || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 text-sm">
                  <span className="text-ink3">Address</span>
                  <span className="text-ink font-medium text-right max-w-[200px]">
                    {[form.address, form.district, form.state, form.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
                {total !== null && (
                  <div className="flex justify-between py-2.5 border-t border-bd text-sm font-semibold">
                    <span className="text-ink3">Total</span>
                    <span className="text-accent font-mono">{formatINR(total)}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-ink3 leading-relaxed mb-2">
                By submitting, our team will contact you within 2 hours to
                confirm the appointment. No payment is required at this stage.
              </p>
              <p className="text-xs text-ink4">
                🔒 Your information is secure and will never be shared.
              </p>
              <div className="flex justify-between mt-5">
                <button
                  className="btn inline-flex items-center gap-2 bg-transparent text-ink px-7 py-3.5 rounded-full text-sm font-medium tracking-wide border border-bd2 hover:border-accent hover:text-accent transition-all"
                  onClick={() => setStep(3)}
                >
                  ← Edit Details
                </button>
              </div>
              <button
                className="w-full h-13 bg-accent text-white rounded-full text-[15px] font-semibold mt-9 hover:bg-accent2 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(61,89,72,0.3)] transition-all cursor-pointer"
                onClick={handleSubmit}
              >
                Confirm Booking Request
              </button>
            </div>
          )}
        </div>

        <div className="flex-[0_0_300px] bg-bg2 rounded-16 p-7 border border-bd sticky top-[100px] max-md:flex-none max-md:w-full max-md:relative max-md:top-auto">
          <div className="font-serif text-lg text-ink mb-5">
            Booking Summary
          </div>
          <div className="flex justify-between py-2.5 border-b border-bd text-sm">
            <span className="text-ink3">Service</span>
            <span className="text-ink font-medium">{form.service}</span>
          </div>
          <div className="flex justify-between py-2.5 border-b border-bd text-sm">
            <span className="text-ink3">Date</span>
            <span className="text-ink font-medium">
              {form.date
                ? new Date(form.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Not selected"}
            </span>
          </div>
          <div className="flex justify-between py-2.5 border-b border-bd text-sm">
            <span className="text-ink3">{propertyLabel}</span>
            <span className="text-ink font-medium">
              {form.propertySize
                ? `${form.propertySize} ${propertyUnit}`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between py-2.5 border-b border-bd text-sm">
            <span className="text-ink3">Confirmation</span>
            <span className="text-ink font-medium">Within 2 hrs</span>
          </div>
          <div className="flex justify-between pt-4 border-t-[1.5px] border-bd2 mt-2">
            <span className="text-xs tracking-widest uppercase text-ink3">
              Estimate
            </span>
            <span className="font-mono text-xl text-accent font-medium">
              {total !== null ? formatINR(total) : form.servicePrice}
            </span>
          </div>
          {total !== null && (
            <div className="text-[11px] text-ink4 mt-1 text-right">
              {form.servicePrice} × {form.propertySize} {propertyUnit}
            </div>
          )}
          <p className="text-[11px] text-ink4 mt-3 leading-relaxed">
            {isAreaPriced
              ? "Final price is calculated based on the area provided. You&apos;ll receive a confirmed quote before service begins."
              : "Final price depends on the number of seats. You&apos;ll receive a confirmed quote before service begins."}
          </p>
        </div>
      </div>
    </>
  );
}
