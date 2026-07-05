"use client";

import { useState } from "react";
import ServiceDetailModal from "@/components/public/shared/ServiceDetailModal";
import type { Service } from "@/lib/map-service";

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

export default function ServiceCard({ service, onSelect }: ServiceCardProps) {
  const [open, setOpen] = useState(false);

  const priceLabel =
    service.minPrice === service.maxPrice
      ? `₹${service.minPrice}/${service.pricingUnit}`
      : `₹${service.minPrice}–${service.maxPrice}/${service.pricingUnit}`;

  return (
    <>
      <div className="group relative w-full max-w-2xl rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white">
        {/* Background Image */}
        <div className="relative h-[500px] overflow-hidden">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          {/* Sophisticated Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="absolute bottom-0 left-0 right-0 p-10">
          {/* Title - Professional Serif Font */}
          <h2 className="font-serif text-5xl font-light text-white mb-3 tracking-wide">
            {service.name}
          </h2>

          {/* Description - Clean Sans-Serif */}
          <p className="text-slate-200 text-base mb-8 max-w-xl leading-relaxed font-light">
            {service.tagline}
          </p>

          {/* Bottom Section - Price and Button */}
          <div className="flex flex-wrap items-end gap-6">
            {/* Minimalist Price Display */}
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-[0.15em] mb-2">
                Starting From
              </span>
              <span className="font-serif text-white text-5xl font-light">
                {priceLabel}
              </span>
            </div>

            {/* Professional CTA Button */}
            <button
              onClick={() => setOpen(true)}
              className="group/btn relative ml-auto"
            >
              <div className="absolute text-white inset-0 bg-accent/20 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300 rounded-lg" />
              <div className="relative text-white flex items-center gap-3 bg-accent text-slate-900 font-medium text-sm px-8 py-4 rounded-lg transition-all duration-300 border border-white group-hover/btn:bg-transparent group-hover/btn:text-white tracking-wide">
                Explore Service
                <svg
                  className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      <ServiceDetailModal
        service={service}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
