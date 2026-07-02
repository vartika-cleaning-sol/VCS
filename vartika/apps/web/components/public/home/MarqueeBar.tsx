const items = [
  "Floor Polishing", "Deep Cleaning", "Facade Cleaning", "Sofa Restoration",
  "Post-Construction", "Office Cleaning", "Move-In Ready", "Eco-Friendly",
];

export default function MarqueeBar() {
  return (
    <div
      className="bg-accent text-white py-3.5 overflow-hidden whitespace-nowrap"
      aria-hidden="true"
    >
      <div className="inline-flex w-max gap-0 animate-[marquee_22s_linear_infinite] motion-reduce:animate-none">
        {[...Array(2)].map((_, i) => (
          <span key={i} className="inline-flex">
            {items.map((item, j) => (
              <span key={j}>
                <span className="text-xs tracking-widest uppercase font-medium px-10">
                  {item}
                </span>
                <span className="opacity-40 px-1">·</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
