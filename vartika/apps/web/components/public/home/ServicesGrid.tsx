"use client";

import { useState, useEffect, useMemo } from "react";
import ServiceCard from "@/components/public/shared/ServiceCard";
import { mapServices } from "@/lib/map-service";
import type { Service } from "@/lib/map-service";

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export default function ServicesGrid() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((rows) => setServices(mapServices(rows)))
      .catch(() => {});
  }, []);

  const groups = useMemo(() => chunkArray(services, 5), [services]);

  return (
    <section
      className="relative py-24 px-4 md:px-8"
      id="services"
      style={{
        backgroundImage: "url(/marble.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Our Premium Services
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Discover our range of professional cleaning and restoration services
            designed to bring elegance back to your spaces.
          </p>
        </div>

        {groups.map((group, groupIndex) => {
          const baseIndex = groupIndex * 5;
          return (
            <div key={groupIndex} className={groupIndex > 0 ? "mt-6" : ""}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.slice(0, 3).map((service, i) => (
                  <div
                    key={service.slug}
                    className="animate-slide-up"
                    style={{ animationDelay: `${(baseIndex + i) * 150}ms` }}
                  >
                    <ServiceCard service={service} onSelect={() => {}} />
                  </div>
                ))}
              </div>

              {group.length > 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
                  <div
                    className="lg:col-span-3 animate-slide-up"
                    style={{ animationDelay: `${(baseIndex + 3) * 150}ms` }}
                  >
                    <ServiceCard service={group[3]} onSelect={() => {}} />
                  </div>
                  {group.length > 4 && (
                    <div
                      className="lg:col-span-2 animate-slide-up"
                      style={{ animationDelay: `${(baseIndex + 4) * 150}ms` }}
                    >
                      <ServiceCard service={group[4]} onSelect={() => {}} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
