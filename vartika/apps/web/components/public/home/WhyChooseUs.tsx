"use client";

const reasons = [
  {
    icon: "🛡️",
    title: "Verified Professionals",
    desc: "Every technician is background-verified, uniformed, and certified through our training programme.",
  },
  {
    icon: "🌿",
    title: "Eco-Friendly Products",
    desc: "We use only certified eco-safe chemicals — safe for children, pets, and the environment.",
  },
  {
    icon: "💎",
    title: "Transparent Pricing",
    desc: "No hidden charges. Get a clear quote before we begin. What we say is what you pay.",
  },
  {
    icon: "⌚",
    title: "On-Time Service",
    desc: "We respect your time. Our team arrives within the confirmed window, every single visit.",
  },
  {
    icon: "🌟",
    title: "Satisfaction Guarantee",
    desc: "Not satisfied? We re-clean the affected area within 24 hours — completely free of charge.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-ink px-12 py-[120px] relative overflow-hidden max-md:px-5 max-md:py-20">
      <div
        className="absolute inset-0 opacity-[0.06] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=60')",
        }}
      />
      <div className="max-w-[1100px] mx-auto relative z-[1]">
        <div className="text-center mb-16">
          <div
            className="section-eyebrow"
            style={{ color: "var(--color-accent3)" }}
          >
            Why Vartika
          </div>
          <h2 className="section-title text-white">
            Five promises.<br />
            <em>Every service.</em>
          </h2>
          <p className="section-sub mx-auto text-white/45">
            Not just a cleaning company. A standard of excellence delivered with
            care, precision, and pride.
          </p>
        </div>

        <div className="grid grid-cols-5 gap-4 max-md:grid-cols-3 max-sm:grid-cols-2">
          {reasons.map((r, i) => (
            <div
              key={r.title}
              className="bg-white/4 border border-white/7 rounded-16 px-6 py-9 text-center backdrop-blur-[12px] hover:bg-white/7 hover:border-accent3/15 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.3)] transition-all max-md:px-4 max-md:py-7"
            >
              <div className="w-13 h-13 rounded-12 bg-accent3/10 flex items-center justify-center mx-auto mb-5 text-[22px]">
                {r.icon}
              </div>
              <div className="font-serif text-lg text-white mb-2.5 font-normal">
                {r.title}
              </div>
              <p className="text-sm text-white/45 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
