/*
 * The initial catalogue, loaded by `pnpm db:seed`. Edit the database (or
 * this file and re-seed) to change products; the storefront reads Postgres.
 * Imagery is from Unsplash; prices are in cents (USD).
 */
import { unsplash, unsplashDetail } from "../lib/unsplash";
import type { Picture } from "./schema/catalog";

export const seedCategories = [
  { slug: "outerwear", name: "Outerwear" },
  { slug: "knitwear", name: "Knitwear" },
  { slug: "trousers", name: "Trousers" },
  { slug: "bags", name: "Bags" },
  { slug: "shoes", name: "Shoes" },
  { slug: "jewelry", name: "Jewelry" },
] as const;

type SeedProduct = {
  slug: string;
  name: string;
  color: string;
  price: number;
  category: (typeof seedCategories)[number]["slug"];
  badge?: "New" | "Exclusive";
  description: string;
  details: string[];
  composition: string;
  /* In display order. */
  stock: { size: string; quantity: number }[];
  images: Picture[];
};

const apparelSizes = ["XS", "S", "M", "L", "XL"];

function sized(quantities: number[]) {
  return apparelSizes.map((size, i) => ({ size, quantity: quantities[i] ?? 0 }));
}

export const seedProducts: SeedProduct[] = [
  {
    slug: "leather-biker-jacket",
    name: "Leather biker jacket",
    color: "Black",
    price: 245000,
    category: "outerwear",
    badge: "New",
    description:
      "A biker jacket cut close to the body in supple lambskin, with an asymmetric zip, notched lapels and snap-down collar points. It softens and takes on its wearer's shape over years of use.",
    details: [
      "Asymmetric front zip",
      "Zipped and snap-flap pockets",
      "Snap-fastening lapels, cuffs and hem tabs",
      "Fully lined",
      "Made in Italy",
    ],
    composition:
      "100% lambskin leather. Lining: 100% cupro. Specialist leather clean only.",
    stock: sized([0, 2, 4, 1, 0]),
    images: [
      {
        src: unsplash("1727515546577-f7d82a47b51d", 1200),
        alt: "Black leather biker jacket on a hanger, laid on black silk",
      },
      {
        src: unsplash("1727515192207-3dc860bfd773", 1200),
        alt: "Front of the black leather biker jacket showing the asymmetric zip and pockets",
      },
      {
        src: unsplash("1727518154538-59e7dc479f8f", 1200),
        alt: "Close-up of the zip, snap collar and flap pocket of the black leather jacket",
      },
    ],
  },
  {
    slug: "silk-bomber-jacket",
    name: "Silk bomber jacket",
    color: "Rust",
    price: 118000,
    category: "outerwear",
    badge: "New",
    description:
      "A relaxed bomber in washed silk twill with a soft sheen, finished with ribbed collar, cuffs and hem. Light enough to layer under a coat as the weather turns.",
    details: [
      "Two-way front zip",
      "Welt side pockets",
      "Rib-knit trims",
      "Relaxed fit",
    ],
    composition:
      "100% silk. Trims: 95% wool, 5% elastane. Dry clean only.",
    stock: sized([3, 6, 8, 5, 2]),
    images: [
      {
        src: unsplash("1591047139829-d91aecb6caea", 1200),
        alt: "Rust silk bomber jacket held up on a hanger",
      },
      {
        src: unsplashDetail("1591047139829-d91aecb6caea", 0.3, 0.75, 2.4),
        alt: "Close-up of the ribbed cuff and hem of the rust bomber jacket",
      },
    ],
  },
  {
    slug: "selvedge-denim-jacket",
    name: "Selvedge denim jacket",
    color: "Indigo",
    price: 69000,
    category: "outerwear",
    description:
      "A trucker jacket in rigid Japanese selvedge denim, with a corduroy collar and a brushed flannel lining. The indigo fades with wear to match the way you move.",
    details: [
      "Button front",
      "Two flap chest pockets",
      "Corduroy collar",
      "Flannel lined",
      "Made in Japan",
    ],
    composition:
      "100% cotton. Lining: 100% cotton flannel. Wash cold, inside out.",
    stock: sized([0, 0, 0, 0, 0]),
    images: [
      {
        src: unsplash("1611312449408-fcece27cdbb7", 1200),
        alt: "Indigo denim jacket with a corduroy collar on a hanger",
      },
      {
        src: unsplashDetail("1611312449408-fcece27cdbb7", 0.35, 0.6, 2.4),
        alt: "Close-up of the contrast topstitching on the indigo denim",
      },
    ],
  },
  {
    slug: "crochet-cotton-poncho",
    name: "Crochet cotton poncho",
    color: "Ecru",
    price: 54000,
    category: "knitwear",
    badge: "Exclusive",
    description:
      "Hand-crocheted in an open mesh of undyed organic cotton, with a V-neck and a long fringed hem. Each piece takes a single maker two days to complete.",
    details: ["V-neck", "Fringed hem", "Hand crocheted", "Made in Peru"],
    composition: "100% organic cotton. Hand wash cold and dry flat.",
    stock: [{ size: "One size", quantity: 7 }],
    images: [
      {
        src: unsplash("1434389677669-e08b4cac3105", 1200),
        alt: "Ecru crochet poncho with a fringed hem on a wooden hanger",
      },
      {
        src: unsplashDetail("1434389677669-e08b4cac3105", 0.5, 0.5, 2.4),
        alt: "Close-up of the open crochet stitch on the ecru poncho",
      },
      {
        src: unsplashDetail("1434389677669-e08b4cac3105", 0.5, 0.85, 2.2),
        alt: "Close-up of the fringed hem of the ecru poncho",
      },
    ],
  },
  {
    slug: "satin-jogger-trousers",
    name: "Satin jogger trousers",
    color: "Blush",
    price: 62000,
    category: "trousers",
    description:
      "Fluid trousers in heavy crêpe-back satin, with patch pockets, a soft elasticated waist and gathered cuffs that sit just above the ankle.",
    details: [
      "Elasticated waist",
      "Patch pockets",
      "Gathered ankle cuffs",
      "Mid rise",
    ],
    composition: "100% viscose. Dry clean only.",
    stock: sized([2, 4, 3, 2, 1]),
    images: [
      {
        src: unsplash("1594633312681-425c7b97ccd1", 1200),
        alt: "Model wearing blush satin trousers with cuffed ankles",
      },
      {
        src: unsplashDetail("1594633312681-425c7b97ccd1", 0.5, 0.3, 2.2),
        alt: "Close-up of the patch pockets on the blush satin trousers",
      },
      {
        src: unsplashDetail("1594633312681-425c7b97ccd1", 0.5, 0.75, 2.2),
        alt: "Close-up of the gathered ankle cuffs on the blush satin trousers",
      },
    ],
  },
  {
    slug: "structured-top-handle-bag",
    name: "Structured top handle bag",
    color: "Scarlet",
    price: 290000,
    category: "bags",
    badge: "New",
    description:
      "A structured bag in polished calf leather with a rolled top handle and a polished metal clasp. Inside, a suede-lined compartment and a slip pocket keep everyday things in order.",
    details: [
      "Rolled top handle",
      "Detachable shoulder strap",
      "Suede lining with slip pocket",
      "W 24 × H 19 × D 11 cm",
      "Made in Italy",
    ],
    composition:
      "Calf leather. Lining: goat suede. Store stuffed in the dust bag provided.",
    stock: [{ size: "One size", quantity: 2 }],
    images: [
      {
        src: unsplash("1584917865442-de89df76afd3", 1200),
        alt: "Scarlet leather top handle bag with a silver clasp",
      },
      {
        src: unsplashDetail("1584917865442-de89df76afd3", 0.5, 0.2, 2.4),
        alt: "Close-up of the rolled top handle of the scarlet bag",
      },
    ],
  },
  {
    slug: "floral-jacquard-pump",
    name: "Floral jacquard pump",
    color: "Azure",
    price: 78000,
    category: "shoes",
    description:
      "A pointed pump on a slender 100 mm heel, covered in a floral jacquard woven in Como. A leather sole and padded insole make it easier to wear than it looks.",
    details: [
      "100 mm heel",
      "Pointed toe",
      "Leather sole",
      "Padded leather insole",
      "Made in Italy",
    ],
    composition: "Upper: viscose jacquard. Lining and sole: leather.",
    stock: ["36", "37", "38", "39", "40", "41"].map((size, i) => ({
      size,
      quantity: [1, 3, 0, 4, 2, 1][i],
    })),
    images: [
      {
        src: unsplash("1543163521-1bf539c55dd2", 1200),
        alt: "Pair of blue floral stiletto pumps on a white plinth",
      },
      {
        src: unsplashDetail("1543163521-1bf539c55dd2", 0.6, 0.75, 2.4),
        alt: "Side view of the blue floral pump showing the stiletto heel",
      },
    ],
  },
  {
    slug: "crystal-drop-earrings",
    name: "Crystal drop earrings",
    color: "Sapphire",
    price: 46000,
    category: "jewelry",
    description:
      "Statement drops of baguette and pear-cut crystals set around a sapphire-blue stone, in a rhodium-plated brass frame. Clip-on backs make them comfortable through an evening.",
    details: [
      "Clip-on fastening",
      "Length 6.5 cm",
      "Rhodium-plated brass",
      "Presented in a gift box",
    ],
    composition:
      "Rhodium-plated brass, glass crystal. Keep away from water and perfume.",
    stock: [{ size: "One size", quantity: 12 }],
    images: [
      {
        src: unsplash("1535632066927-ab7c9ab60908", 1200),
        alt: "Crystal drop earrings with sapphire stones resting on a leaf",
      },
      {
        src: unsplashDetail("1535632066927-ab7c9ab60908", 0.45, 0.4, 2.2),
        alt: "Close-up of the pear-cut sapphire stone framed by crystals",
      },
    ],
  },
];
