export interface Service {
  id: string;
  slug: string;
  name: string;
  icon: string;
  minPrice: number;
  maxPrice: number;
  pricingUnit: string;
  pricingModel: "per_sqft" | "per_unit";
  tagline: string;
  description: string;
  longDescription: string;
  whatIncluded: string[];
  processSteps: string[];
  duration: string;
  image: string;
}

export interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  what_included: string[] | null;
  process_steps: string[] | null;
  duration_hrs: string | null;
  icon: string | null;
  image_url: string | null;
  min_price: number | null;
  max_price: number | null;
  pricing_unit: string | null;
  pricing_model: string | null;
  is_active: boolean;
  sort_order: number | null;
}

export function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon || "📦",
    minPrice: row.min_price || 0,
    maxPrice: row.max_price || 0,
    pricingUnit: row.pricing_unit || "sq.ft",
    pricingModel: (row.pricing_model as "per_sqft" | "per_unit") || "per_sqft",
    tagline: row.tagline || "",
    description: row.description || "",
    longDescription: row.description || "",
    whatIncluded: row.what_included || [],
    processSteps: row.process_steps || [],
    duration: row.duration_hrs || "",
    image: row.image_url || "",
  };
}

export function mapServices(rows: ServiceRow[]): Service[] {
  return rows.map(mapService);
}
