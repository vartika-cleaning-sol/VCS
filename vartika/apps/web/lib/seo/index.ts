import type { Metadata } from "next";
import { createServerSupabase } from "@/lib/supabase/server";
import type { SeoSettingsRow, ServiceSeoRow, LocationSeoRow, FaqItem } from "@/lib/types/seo";

const SITE_NAME = "Vartika Cleaning Solutions";
const SITE_URL = "https://www.vartikacleaningsolutions.in";
const DEFAULT_OG_IMAGE = "/og-image.jpg";

interface BuildMetadataOptions {
  pageSlug?: string;
  serviceSlug?: string;
  locationSlug?: string;
  title?: string;
  description?: string;
  noIndex?: boolean;
}

export async function buildMetadata(opts: BuildMetadataOptions): Promise<Metadata> {
  const { pageSlug, serviceSlug, locationSlug, title, description, noIndex } = opts;

  const supabase = await createServerSupabase();

  let seo: SeoSettingsRow | null = null;
  let serviceSeo: ServiceSeoRow | null = null;
  let locationSeo: LocationSeoRow | null = null;

  if (pageSlug) {
    const { data } = await supabase
      .from("seo_settings")
      .select("*")
      .eq("page_slug", pageSlug)
      .maybeSingle();
    seo = data as SeoSettingsRow | null;
  }

  if (serviceSlug) {
    const { data: svc } = await supabase
      .from("services")
      .select("id")
      .eq("slug", serviceSlug)
      .single();
    if (svc) {
      const { data } = await supabase
        .from("service_seo")
        .select("*")
        .eq("service_id", svc.id)
        .maybeSingle();
      serviceSeo = data as ServiceSeoRow | null;
    }
  }

  if (locationSlug) {
    const { data } = await supabase
      .from("location_seo")
      .select("*")
      .eq("slug", locationSlug)
      .maybeSingle();
    locationSeo = data as LocationSeoRow | null;
  }

  const metaTitle = title || seo?.meta_title || serviceSeo?.seo_title || locationSeo?.seo_title || "";
  const metaDesc = description || seo?.meta_desc || serviceSeo?.seo_description || locationSeo?.seo_description || "";
  const ogTitle = seo?.og_title || serviceSeo?.og_title || metaTitle;
  const ogDesc = seo?.og_description || serviceSeo?.og_description || metaDesc;
  const ogImage = seo?.og_image || serviceSeo?.og_image || DEFAULT_OG_IMAGE;
  const twitterTitle = seo?.twitter_title || ogTitle;
  const twitterDesc = seo?.twitter_description || ogDesc;
  const twitterImage = seo?.twitter_image || ogImage;
  const keywords = seo?.keywords || serviceSeo?.keywords || locationSeo?.keywords || [];
  const canonical = seo?.canonical_url || (pageSlug ? `${SITE_URL}/${pageSlug === "home" ? "" : pageSlug}` : undefined);
  const noindex = noIndex || seo?.no_index || false;
  const nofollow = seo?.no_follow || false;

  const metadata: Metadata = {
    title: metaTitle,
    description: metaDesc,
    keywords: keywords.length ? keywords : undefined,
    ...((noindex || nofollow) && {
      robots: {
        index: !noindex,
        follow: !nofollow,
      },
    }),
    ...(canonical && {
      alternates: { canonical },
    }),
    openGraph: {
      title: ogTitle || metaTitle,
      description: ogDesc || metaDesc,
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
      siteName: SITE_NAME,
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle || ogTitle || metaTitle,
      description: twitterDesc || ogDesc || metaDesc,
      ...(twitterImage && { images: [twitterImage] }),
    },
  };

  return metadata;
}

export async function buildServiceMetadata(slug: string): Promise<Metadata> {
  return buildMetadata({ serviceSlug: slug });
}

export async function buildLocationMetadata(slug: string): Promise<Metadata> {
  return buildMetadata({ locationSlug: slug });
}

export async function getJsonLd(supabase: Awaited<ReturnType<typeof createServerSupabase>>, pageType?: string) {
  const schemas: Record<string, unknown>[] = [];

  const { data: biz } = await supabase
    .from("local_business_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (biz) {
    const hours: { day: string; open: string; close: string }[] = (biz.business_hours as any[]) || [];
    const openingHours = hours.map(
      (h) => `${h.day} ${h.open}-${h.close}`
    );

    schemas.push({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: biz.business_name || SITE_NAME,
      ...(biz.phone && { telephone: biz.phone }),
      ...(biz.address && { address: { "@type": "PostalAddress", streetAddress: biz.address } }),
      ...(biz.coordinates && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: (biz.coordinates as any).lat,
          longitude: (biz.coordinates as any).lng,
        },
      }),
      ...(openingHours.length && { openingHoursSpecification: hours.map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${h.day}`,
        opens: h.open,
        closes: h.close,
      })) }),
      url: SITE_URL,
      image: DEFAULT_OG_IMAGE,
    });
  } else {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    });
  }

  if (pageType === "FAQ" || pageType === "faq") {
    const faqs = await getPageFaqs(supabase);
    if (faqs.length) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f: FaqItem) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      });
    }
  }

  if (pageType === "Breadcrumb" || pageType === "breadcrumb") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [],
    });
  }

  if (pageType === "Service" || pageType === "service") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: SITE_NAME,
      provider: { "@type": "Organization", name: SITE_NAME },
    });
  }

  return schemas;
}

async function getPageFaqs(supabase: Awaited<ReturnType<typeof createServerSupabase>>): Promise<FaqItem[]> {
  return [];
}

export { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE };
