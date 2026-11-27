export type Product = {
  id: number;
  name: string;
  category: "Acid Wash" | "Hoodies" | "Sweatshirts" | "Bottoms";
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  colors: string[];
  sizes: string[];
  description: string;
  stock: number;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Tiger Acid Wash Tee",
    category: "Acid Wash",
    price: 999,
    oldPrice: 1299,
    image: "/images/products/tiger-acid-wash-tee.jpeg",
    badge: "BEST SELLER",
    colors: ["#7a1024"],
    sizes: ["M", "L", "XL", "XXL"],
    description: "240 GSM loopknit cotton drop-shoulder tee with a bold tiger back print.",
    stock: 18,
  },
  {
    id: 2,
    name: "Union Fire Vintage Crew",
    category: "Sweatshirts",
    price: 1499,
    oldPrice: 1899,
    image: "/images/products/union-fire-brown-sweatshirt.jpeg",
    badge: "NEW DROP",
    colors: ["#6e4934"],
    sizes: ["M", "L", "XL"],
    description: "Heavyweight washed crewneck with front-and-back Union Fire artwork.",
    stock: 9,
  },
  {
    id: 3,
    name: "Nightmarch Stone Crew",
    category: "Sweatshirts",
    price: 1499,
    image: "/images/products/nightmarch-stone-sweatshirt.jpeg",
    colors: ["#b7a998"],
    sizes: ["M", "L", "XL"],
    description: "Muted stone wash, relaxed fit and oversized graphic detailing.",
    stock: 12,
  },
  {
    id: 4,
    name: "Dragon Crest Crew",
    category: "Sweatshirts",
    price: 1499,
    image: "/images/products/dragon-green-sweatshirt.jpeg",
    badge: "LIMITED",
    colors: ["#234d43"],
    sizes: ["M", "L", "XL"],
    description: "Forest acid wash sweatshirt featuring a detailed dragon crest.",
    stock: 6,
  },
  {
    id: 5,
    name: "Cross Blue Acid Crew",
    category: "Sweatshirts",
    price: 1499,
    image: "/images/products/cross-blue-sweatshirt.jpeg",
    colors: ["#294e7b"],
    sizes: ["M", "L", "XL"],
    description: "Blue mineral wash crew with a large gothic cross illustration.",
    stock: 11,
  },
  {
    id: 6,
    name: "Union Fire Wide Joggers",
    category: "Bottoms",
    price: 1299,
    image: "/images/products/union-fire-joggers.jpeg",
    badge: "NEW DROP",
    colors: ["#333333"],
    sizes: ["M", "L", "XL"],
    description: "Wide-leg washed joggers with a strong vertical Union Fire print.",
    stock: 15,
  },
  {
    id: 7,
    name: "Crossroads Cloud Hoodie",
    category: "Hoodies",
    price: 1799,
    image: "/images/products/crossroads-hoodie.jpeg",
    colors: ["#b5a846"],
    sizes: ["M", "L", "XL"],
    description: "Brushed hoodie in a yellow-and-olive cloud wash with dual-side artwork.",
    stock: 7,
  },
  {
    id: 8,
    name: "Through The Darkness Hoodie",
    category: "Hoodies",
    price: 1799,
    image: "/images/products/through-darkness-hoodie.jpeg",
    badge: "HOT",
    colors: ["#6d4b87"],
    sizes: ["M", "L", "XL"],
    description: "Purple acid-wash hoodie with angel back graphic and heavyweight feel.",
    stock: 4,
  },
  {
    id: 9,
    name: "Chrome Hearts Blue Hoodie",
    category: "Hoodies",
    price: 1799,
    image: "/images/products/chrome-blue-hoodie.jpeg",
    colors: ["#2255a0"],
    sizes: ["M", "L", "XL"],
    description: "Cobalt tie-dye hoodie with oversized back print.",
    stock: 8,
  },
  {
    id: 10,
    name: "Dragon Ash Hoodie",
    category: "Hoodies",
    price: 1799,
    image: "/images/products/dragon-ash-hoodie.jpeg",
    colors: ["#61717a"],
    sizes: ["M", "L", "XL"],
    description: "Ash blue wash and striking dragon graphic for colder nights.",
    stock: 10,
  },
  {
    id: 11,
    name: "Nirvana Olive Hoodie",
    category: "Hoodies",
    price: 1799,
    image: "/images/products/nirvana-olive-hoodie.jpeg",
    colors: ["#596046"],
    sizes: ["M", "L", "XL"],
    description: "Olive camo wash hoodie with bold Nirvana angel graphic.",
    stock: 5,
  },
  {
    id: 12,
    name: "Phantom Grey Hoodie",
    category: "Hoodies",
    price: 1799,
    image: "/images/products/phantom-grey-hoodie.jpeg",
    badge: "LOW STOCK",
    colors: ["#4b4b4b"],
    sizes: ["M", "L", "XL"],
    description: "Charcoal cloud wash hoodie with high-contrast phantom print.",
    stock: 3,
  },
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
