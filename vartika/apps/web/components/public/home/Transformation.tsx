"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Transformation() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);

  const setSliderPos = useCallback(
    (clientX: number) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      const pct = Math.min(Math.max(((clientX - r.left) / r.width) * 100, 2), 98);
      setPos(pct);
    },
    []
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onDown = (e: MouseEvent) => setSliderPos(e.clientX);
    const onMove = (e: MouseEvent) => {
      if (e.buttons !== 1) return;
      setSliderPos(e.clientX);
    };

    const onTouch = (e: TouchEvent) => {
      setSliderPos(e.touches[0].clientX);
    };

    wrap.addEventListener("mousedown", onDown);
    document.addEventListener("mousemove", onMove);
    wrap.addEventListener("touchstart", onTouch, { passive: true });
    document.addEventListener("touchmove", onTouch as EventListener, {
      passive: true,
    });

    return () => {
      wrap.removeEventListener("mousedown", onDown);
      document.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("touchstart", onTouch as EventListener);
      document.removeEventListener("touchmove", onTouch as EventListener);
    };
  }, [setSliderPos]);

  useEffect(() => {
    if (afterRef.current) {
      afterRef.current.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
    }
    if (dividerRef.current) dividerRef.current.style.left = `${pos}%`;
    if (handleRef.current) {
      handleRef.current.style.left = `${pos}%`;
      handleRef.current.style.transform = "translate(-50%,-50%)";
    }
  }, [pos]);

  return (
    <section className="bg-ink overflow-hidden relative">
      <div className="flex items-end justify-between gap-10 flex-wrap pt-20 px-12 pb-10 max-md:px-5">
        <div>
          <div className="section-eyebrow" style={{ color: "var(--color-accent3)" }}>
            The Transformation
          </div>
          <h2 className="font-serif text-[clamp(36px,5vw,60px)] font-light text-white leading-tight">
            Before. During.<br />
            <em className="italic text-accent3 not-italic">After.</em>
          </h2>
        </div>
        <p className="text-sm text-white/45 max-w-[380px] leading-relaxed">
          Drag the slider to witness the dramatic difference a professional
          Vartika cleaning makes.
        </p>
      </div>

      <div
        ref={wrapRef}
        className="relative h-[520px] overflow-hidden cursor-ew-resize select-none"
      >
        <div className="absolute inset-0">
          <Image
            src="/shining2.png"
            alt="Before cleaning"
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div ref={afterRef} className="absolute inset-0">
          <Image
            src="/dull2.png"
            alt="After cleaning"
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-accent/15" />
        </div>
        <span className="absolute top-6 left-6 text-[11px] tracking-widest uppercase font-semibold px-3.5 py-1.5 rounded-full bg-black/60 text-white/70 z-[5] pointer-events-none">
          Before
        </span>
        <span className="absolute top-6 right-6 text-[11px] tracking-widest uppercase font-semibold px-3.5 py-1.5 rounded-full bg-accent text-white z-[5] pointer-events-none">
          After
        </span>
        <div
          ref={dividerRef}
          className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
          style={{ left: "50%" }}
        />
        <div
          ref={handleRef}
          className="absolute top-1/2 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center z-11 text-sm text-ink2"
          style={{ left: "50%" }}
        >
          ⟺
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4 px-12 py-9 max-md:px-5">
        <span className="text-sm text-white/40">
          Floor polishing service — Noida residential property
        </span>
        <Link
          href="/gallery"
          className="btn inline-flex items-center gap-2 bg-transparent text-white/50 px-7 py-3 rounded-full text-sm tracking-wide border border-white/15 hover:border-accent hover:text-accent transition-all"
        >
          View Full Gallery
        </Link>
      </div>
    </section>
  );
}
