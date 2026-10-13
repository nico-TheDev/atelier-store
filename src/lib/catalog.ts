/*
 * Storefront types and editorial content. Products, categories and stock
 * live in Postgres; read them through `@/db/queries/catalog`.
 * Prices are in cents (USD).
 */
import type { Picture } from "@/db/schema/catalog";
import { unsplash } from "@/lib/unsplash";

export type { Picture };

export type Product = {
  id: number;
  slug: string;
  name: string;
  color: string;
  price: number;
  badge: "New" | "Exclusive" | null;
  categoryId: number;
  category: { slug: string; name: string };
  description: string;
  details: string[];
  composition: string;
  /* One entry per size, in display order; one-size items have a single "One size" entry. */
  stock: { size: string; quantity: number }[];
  /* The first image is the listing image. */
  images: Picture[];
};

export type StockState =
  | { status: "in-stock"; label: string }
  | { status: "low-stock"; label: string }
  | { status: "sold-out"; label: string };

export type Collection = {
  slug: string;
  title: string;
  description?: string;
  image: Picture;
};

export type NavLink = {
  label: string;
  href: string;
};

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(cents: number) {
  return priceFormat.format(cents / 100);
}

export const primaryNav: NavLink[] = [
  { label: "New In", href: "/collections/new-in" },
  { label: "Women", href: "/collections/women" },
  { label: "Men", href: "/collections/men" },
  { label: "Bags", href: "/collections/bags" },
  { label: "Shoes", href: "/collections/shoes" },
  { label: "Jewelry", href: "/collections/jewelry" },
];

export const hero = {
  eyebrow: "Autumn–Winter 2026",
  title: "The Quiet Season",
  images: [
    {
      src: unsplash("1581044777550-4cfa60707c03", 2000),
      alt: "Model in a sheer pink ruffled blouse standing in a golden field, holding sunglasses",
    },
    {
      src: unsplash("1552374196-1ab2a1c593e8", 2000),
      alt: "Model in a camel wool coat and ivory trousers seated on a wooden stool",
    },
  ] satisfies Picture[],
};

export const lowStockThreshold = 3;

export function getStockState(product: Product): StockState {
  const total = product.stock.reduce((sum, s) => sum + s.quantity, 0);
  if (total === 0) return { status: "sold-out", label: "Sold out" };
  if (total <= lowStockThreshold) {
    return { status: "low-stock", label: `Only ${total} left` };
  }
  return { status: "in-stock", label: "In stock" };
}

export const campaign = {
  eyebrow: "The Knitwear Edit",
  title: "Soft Architecture",
  body: "Undyed wool, cashmere and alpaca, knitted in small runs in the Scottish Borders.",
  href: "/collections/knitwear",
  image: {
    src: unsplash("1558769132-cb1aea458c5e", 2400),
    alt: "Rail of cream, oatmeal and camel knitwear beside dried pampas grass",
  },
};

export const genderCollections: Collection[] = [
  {
    slug: "women",
    title: "Women",
    image: {
      src: unsplash("1483985988355-763728e1935b"),
      alt: "Model in a burgundy wool coat and sunglasses carrying shopping bags",
    },
  },
  {
    slug: "men",
    title: "Men",
    image: {
      src: unsplash("1487222477894-8943e31ef7b2"),
      alt: "Model in a tan leather jacket, shirt and tie wearing round sunglasses",
    },
  },
];

export const categories: Collection[] = [
  {
    slug: "outerwear",
    title: "Outerwear",
    image: {
      src: unsplash("1520975954732-35dd22299614", 1200),
      alt: "Model in a black leather jacket crouching on a brick ledge",
    },
  },
  {
    slug: "knitwear",
    title: "Knitwear",
    image: {
      src: unsplash("1475180098004-ca77a66827be", 1200),
      alt: "Model in a chevron knit sweater on a rocky shoreline",
    },
  },
  {
    slug: "dresses",
    title: "Dresses",
    image: {
      src: unsplash("1496747611176-843222e1e57c", 1200),
      alt: "Floral print wrap dress moving in the wind beside the sea",
    },
  },
  {
    slug: "tailoring",
    title: "Tailoring",
    image: {
      src: unsplash("1617137968427-85924c800a22", 1200),
      alt: "Model in a navy two-piece suit walking past a glass facade",
    },
  },
];

export const journalStory = {
  eyebrow: "The Journal",
  title: "Notes from Milan",
  body: "Between fittings and the first rain of the season, the studio walked the city that shaped this collection: its powder blues, its long coats and its unhurried pace.",
  href: "/journal/notes-from-milan",
  image: {
    src: unsplash("1539109136881-3be0616acf4b"),
    alt: "Model in a powder blue coat with a blush leather belt bag in front of Milan Cathedral",
  },
};

export const services = [
  {
    title: "Complimentary shipping",
    body: "Express delivery on every order, wrapped in our signature box.",
  },
  {
    title: "Returns within 30 days",
    body: "Send pieces back free of charge, collected from your door.",
  },
  {
    title: "Made to last",
    body: "Free repairs for the first two years on outerwear and leather goods.",
  },
  {
    title: "Client advisors",
    body: "Styling and sizing advice by phone, chat or appointment.",
  },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Client Services",
    links: [
      { label: "Contact us", href: "/client-services/contact" },
      { label: "Shipping", href: "/client-services/shipping" },
      { label: "Returns", href: "/client-services/returns" },
      { label: "Size guide", href: "/client-services/size-guide" },
      { label: "Repairs and care", href: "/client-services/care" },
    ],
  },
  {
    title: "The House",
    links: [
      { label: "About Sartoria", href: "/about" },
      { label: "Journal", href: "/journal" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Terms of sale", href: "/legal/terms" },
      { label: "Accessibility", href: "/legal/accessibility" },
    ],
  },
];
