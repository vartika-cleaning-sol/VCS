import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { buildServiceMetadata, getJsonLd } from "@/lib/seo";
import { mapService } from "@/lib/map-service";
import type { ServiceSeoRow } from "@/lib/types/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return buildServiceMetadata(slug);
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data: row } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!row) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg pt-[68px]">
        <div className="text-center">
          <h1 className="section-title">Service not found</h1>
          <Link
            href="/"
            className="btn inline-flex items-center gap-2 bg-accent text-white px-7 py-3.5 rounded-full text-sm font-medium tracking-wide mt-4"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const service = mapService(row);

  const { data: seoData } = await supabase
    .from("service_seo")
    .select("*")
    .eq("service_id", row.id)
    .maybeSingle();
  const seo = seoData as ServiceSeoRow | null;
  const faqs = seo?.faqs?.filter((f) => f.question && f.answer) || [];

  const schemas = await getJsonLd(supabase);
  if (faqs.length) {
    schemas.push(...await getJsonLd(supabase, "FAQ"));
    schemas.push(...await getJsonLd(supabase, "Service"));
  }

  const priceLabel =
    service.minPrice === service.maxPrice
      ? `₹${service.minPrice}/${service.pricingUnit}`
      : `₹${service.minPrice}–${service.maxPrice}/${service.pricingUnit}`;

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
    <div className="min-h-screen pt-[120px] pb-20 px-12 bg-bg max-md:px-5">
      <div className="max-w-[800px] mx-auto">
        <Link
          href="/services"
          className="text-sm text-ink3 hover:text-accent transition-colors mb-8 inline-block"
        >
          ← All Services
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <span className="px-4 py-1 text-sm font-semibold text-accent">{priceLabel}</span>
        </div>
        <h1 className="section-title">{service.name}</h1>
        <p className="section-sub max-w-none mb-8">{service.tagline}</p>

        {service.image && (
          <div className="aspect-[16/9] rounded-24 overflow-hidden mb-10 shadow-lg">
            <img
              src={service.image}
              alt={service.name}
              className="size-full object-cover"
            />
          </div>
        )}

        {seo?.seo_description && (
          <p className="text-[16px] text-ink3 leading-relaxed mb-6 italic border-l-2 border-accent/30 pl-4">
            {seo.seo_description}
          </p>
        )}

        <p className="text-[16px] text-ink3 leading-relaxed mb-8">
          {service.longDescription}
        </p>

        {service.whatIncluded.length > 0 && (
          <div className="mb-8">
            <h2 className="font-heading text-xl font-semibold text-text1 mb-4">
              What&apos;s Included
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
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
        )}

        {service.processSteps.length > 0 && (
          <div className="mb-8">
            <h2 className="font-heading text-xl font-semibold text-text1 mb-4">
              Process
            </h2>
            <ol className="space-y-3">
              {service.processSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text1">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {service.duration && (
          <div className="mb-8 flex items-center gap-2 rounded-12 bg-bg2 px-4 py-3 text-sm text-ink3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5 text-accent shrink-0"
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
        )}

        <Link
          href={`/book?service=${service.slug}`}
          className="btn inline-flex items-center gap-2 bg-accent text-white px-7 py-3.5 rounded-full text-sm font-medium tracking-wide shadow-[0_4px_20px_rgba(61,89,72,0.2)] hover:bg-accent2 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(61,89,72,0.3)] transition-all"
        >
          Book {service.name} →
        </Link>

        {faqs.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading text-xl font-semibold text-text1 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-bg2 rounded-16 p-6 border border-bd">
                  <h3 className="font-medium text-ink mb-2">{faq.question}</h3>
                  <p className="text-sm text-ink3">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
