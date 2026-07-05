export interface Service {
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

export const SERVICES: Service[] = [
  {
    slug: "marble-diamond-polishing",
    name: "Marble Diamond Polishing",
    icon: "💎",
    minPrice: 180,
    maxPrice: 180,
    pricingUnit: "sq.ft",
    pricingModel: "per_sqft",
    tagline: "Restore the natural lustre of marble floors",
    description:
      "Professional diamond polishing that brings your marble surfaces back to life.",
    longDescription:
      "Marble floors lose their shine over time due to foot traffic, dust, and wear. Our diamond polishing process uses industrial-grade diamond abrasives to grind, hone, and polish the surface to a mirror-like finish. We then apply a high-gloss crystallisation treatment and seal the surface for long-lasting protection. Suitable for marble, granite, and natural stone floors.",
    whatIncluded: [
      "Surface inspection & scratch assessment",
      "Diamond grinding (coarse to fine grits)",
      "Crystallisation treatment",
      "High-gloss polishing",
      "Sealing for stain protection",
      "Final buffing & cleanup",
    ],
    processSteps: [
      "Inspect floor condition and identify problem areas",
      "Diamond grinding with progressively finer grits",
      "Apply crystallisation compound for gloss",
      "Buff to mirror finish",
      "Apply impregnating sealer",
      "Final walkthrough with client",
    ],
    duration: "3–6 hours per 500 sq.ft",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&h=800&q=80",
  },
  {
    slug: "facade-cleaning",
    name: "Facade Cleaning",
    icon: "🏛️",
    minPrice: 120,
    maxPrice: 120,
    pricingUnit: "sq.ft",
    pricingModel: "per_sqft",
    tagline: "Restore your building's exterior glory",
    description:
      "Pressure washing and chemical cleaning for building exteriors, facades, and cladding.",
    longDescription:
      "Over time, building facades accumulate dirt, algae, moss, and pollution stains. Our facade cleaning service uses a combination of low-pressure chemical cleaning and high-pressure rinsing to safely remove all buildup without damaging the surface. We work on all exterior materials including concrete, brick, stone, glass, and painted surfaces.",
    whatIncluded: [
      "Full facade inspection",
      "Algae & moss treatment",
      "Low-pressure chemical application",
      "High-pressure rinsing",
      "Spot stain treatment",
      "Surface protection sealant",
    ],
    processSteps: [
      "Site assessment & material identification",
      "Apply biodegradable cleaning solution",
      "Dwell time for stain breakdown",
      "Pressure wash in sections",
      "Treat stubborn stains manually",
      "Final rinse & inspection",
    ],
    duration: "1–3 days depending on building size",
    image:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=600&h=800&q=80",
  },
  {
    slug: "wooden-floor-polishing",
    name: "Wooden Floor Polishing",
    icon: "🪵",
    minPrice: 160,
    maxPrice: 160,
    pricingUnit: "sq.ft",
    pricingModel: "per_sqft",
    tagline: "Bring warmth and shine back to your wooden floors",
    description:
      "Expert sanding, polishing, and finishing for all types of wooden flooring.",
    longDescription:
      "Wooden floors require specialised care to maintain their beauty. Our wooden floor polishing service includes sanding to remove scratches and wear, applying premium wood stains or oils, and finishing with a durable protective coat. We work with all wood types including oak, teak, maple, walnut, and engineered wood.",
    whatIncluded: [
      "Floor inspection & scratch assessment",
      "Drum sanding (coarse to fine)",
      "Edge sanding for corners",
      "Wood stain or oil application",
      "Protective top coat (matte/satin/gloss)",
      "Final buffing & polishing",
    ],
    processSteps: [
      "Inspect and identify wood type",
      "Remove furniture and protect surroundings",
      "Drum sand with 3 grit progressions",
      "Edge sand for complete coverage",
      "Apply chosen stain or oil",
      "Apply 2 coats of protective finish",
      "Curing time & final polish",
    ],
    duration: "2–4 days for complete process",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&h=800&q=80",
  },
  {
    slug: "sofa-cleaning",
    name: "Sofa Cleaning",
    icon: "🛋",
    minPrice: 499,
    maxPrice: 499,
    pricingUnit: "seat",
    pricingModel: "per_unit",
    tagline: "Deep clean upholstery that feels and looks like new",
    description:
      "Steam and dry upholstery cleaning for all fabric types.",
    longDescription:
      "Sofas trap dust, allergens, stains, and odours over time. Our professional sofa cleaning uses hot water extraction (steam cleaning) combined with specialised upholstery detergents to penetrate deep into the fabric fibres, extracting embedded dirt and leaving your furniture fresh, sanitised, and revitalised. We treat all fabric types including velvet, linen, cotton, and synthetic blends.",
    whatIncluded: [
      "Fabric type assessment",
      "Pre-treatment of stains",
      "Hot water extraction (steam clean)",
      "Fabric-safe detergent application",
      "Deep dirt extraction",
      "Deodorising & sanitising",
      "Speed drying with air movers",
    ],
    processSteps: [
      "Inspect fabric and test for colourfastness",
      "Pre-vacuum to remove loose dirt",
      "Apply pre-treatment to stains",
      "Steam clean with upholstery tool",
      "Extract soiled water",
      "Apply fabric protectant (optional)",
      "Set up air movers for fast drying",
    ],
    duration: "30–60 min per seat",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&h=800&q=80",
  },
  {
    slug: "carpet-cleaning",
    name: "Carpet Cleaning",
    icon: "🧹",
    minPrice: 150,
    maxPrice: 150,
    pricingUnit: "sq.ft",
    pricingModel: "per_sqft",
    tagline: "Remove deep stains and revive your carpets",
    description:
      "Professional hot water extraction for carpets of all pile types.",
    longDescription:
      "Carpets harbour dust, allergens, pet dander, and deep-set stains that vacuuming alone cannot remove. Our hot water extraction system delivers superior cleaning power, flushing out embedded dirt and leaving your carpets fresh, sanitised, and fluffy. We handle all carpet types from plush Berber to high-pile shag.",
    whatIncluded: [
      "Carpet type & fibre assessment",
      "Dry vacuuming of entire area",
      "Pre-spray of stain remover",
      "Hot water extraction (steam cleaning)",
      "Spot treatment for stubborn stains",
      "Deodorising treatment",
      "Grooming & pile lifting",
    ],
    processSteps: [
      "Move furniture and protect legs",
      "Pre-vacuum entire carpet",
      "Apply pre-spray and agitate",
      "Hot water extraction pass 1 (cleaning)",
      "Hot water extraction pass 2 (rinsing)",
      "Spot treat any remaining stains",
      "Groom carpet pile",
      "Set up drying equipment",
    ],
    duration: "1–2 hours per room",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&h=800&q=80",
  },
];

export type ServiceSlug = (typeof SERVICES)[number]["slug"];
