"use client";

import Link from "next/link";
import Modal from "@/components/ui/Modal";
import type { Service } from "@/lib/constants/services";

interface ServiceDetailModalProps {
  service: Service | null;
  open: boolean;
  onClose: () => void;
}

export default function ServiceDetailModal({
  service,
  open,
  onClose,
}: ServiceDetailModalProps) {
  if (!service) return null;

  const priceLabel =
    service.minPrice === service.maxPrice
      ? `₹${service.minPrice}/${service.pricingUnit}`
      : `₹${service.minPrice}–${service.maxPrice}/${service.pricingUnit}`;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative h-60 sm:h-72 overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-5 left-6 right-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-white shadow-lg">
            <span>{service.icon}</span>
            {priceLabel}
          </span>
        </div>
      </div>

      <div className="px-6 pb-6 pt-5">
        <h2 className="font-heading text-2xl font-bold text-text1">
          {service.name}
        </h2>
        <p className="mt-1 text-text2">{service.tagline}</p>

        <p className="mt-4 text-sm leading-relaxed text-text1">
          {service.longDescription}
        </p>

        {service.pricingModel === "per_sqft" && (
          <div className="mt-5 rounded-12 bg-bg2 p-4">
            <p className="text-sm text-text2">
              <span className="font-semibold text-text1">Pricing:</span>{" "}
              {priceLabel} — final cost depends on the total area. Contact us
              for a free on-site measurement.
            </p>
          </div>
        )}

        <div className="mt-6">
          <h3 className="mb-3 font-heading text-lg font-semibold text-text1">
            What&apos;s Included
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {service.whatIncluded.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mt-0.5 size-5 shrink-0 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 font-heading text-lg font-semibold text-text1">
            Process
          </h3>
          <ol className="space-y-2">
            {service.processSteps.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-text1"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-12 bg-bg2 px-4 py-3 text-sm text-text2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-5 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Estimated duration: {service.duration}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/book?service=${service.slug}`}
            className="flex-1 rounded-full bg-accent px-6 py-3 text-center font-semibold text-white shadow-md transition hover:bg-accent-dark"
          >
            Book Now
          </Link>
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-gray-300 px-6 py-3 font-semibold text-text1 transition hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
