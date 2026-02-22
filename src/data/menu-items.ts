import type { MenuItem } from "@/store/guest/order/cart-store";

/* ─── Extra detail used only on the Item-Details page ─── */
export type MenuItemDetail = MenuItem & {
  /** 2-3 extra gallery images besides the primary one */
  gallery?: string[];
  /** star rating 1-5 */
  rating?: number;
  /** number of reviews */
  reviewCount?: number;
  /** e.g. "25-35 min" */
  prepTime?: string;
  /** dietary / allergen labels shown as chips */
  allergens?: string[];
  /** longer description shown on the detail page */
  longDescription?: string;
  /** add-ons available for this item */
  addOns?: { id: string; label: string; price: number }[];
};

export const MENU_ITEMS: MenuItemDetail[] = [
  // ── Starters ──
  {
    id: "fish-cutlet",
    title: "Fish Cutlet",
    description:
      "Crispy deep-fried fish cutlets spiced with chilli, onion, and curry leaves.",
    longDescription:
      "Our Fish Cutlets are crafted from fresh tuna, combined with boiled potatoes and seasoned with hand-ground spices. Each cutlet is coated in breadcrumbs and fried to a perfect golden crisp. Served with a tangy lime wedge and our house-made chilli sauce.",
    priceLkr: 350,
    category: "Starters",
    tag: "POPULAR",
    imageUrl:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    ],
    rating: 4.6,
    reviewCount: 89,
    prepTime: "15-20 min",
    allergens: ["Contains Fish", "Contains Egg", "Gluten"],
    addOns: [
      { id: "extra-sauce", label: "Extra Chilli Sauce", price: 50 },
      { id: "lime-wedge", label: "Extra Lime Wedges", price: 0 },
    ],
  },
  {
    id: "isso-wade",
    title: "Isso Wade",
    description:
      "Crunchy lentil fritters topped with a whole prawn, a classic Sri Lankan snack.",
    longDescription:
      "Isso Wade is one of Sri Lanka's most beloved street foods. A crispy lentil fritter is topped with a whole marinated prawn and deep-fried until golden. The combination of crunchy dal and succulent prawn makes it an irresistible starter.",
    priceLkr: 450,
    category: "Starters",
    tag: "SPICY",
    imageUrl:
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1606491956689-2ea866880049?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?auto=format&fit=crop&w=400&q=80",
    ],
    rating: 4.7,
    reviewCount: 112,
    prepTime: "20-25 min",
    allergens: ["Contains Shellfish", "Spicy"],
    addOns: [
      { id: "extra-prawn", label: "Extra Prawn", price: 200 },
      { id: "mint-sambol", label: "Mint Sambol", price: 75 },
    ],
  },
  {
    id: "vegetable-roti",
    title: "Vegetable Roti",
    description:
      "Flaky roti stuffed with spiced vegetables, onion, and green chilli.",
    longDescription:
      "A beloved Sri Lankan snack, our Vegetable Roti features a thin, flaky godamba roti envelope filled with a fragrant mixture of potato, leeks, carrots, and green chillies, seasoned with curry powder and black pepper.",
    priceLkr: 280,
    category: "Starters",
    tag: "VEG",
    imageUrl:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=400&q=80",
    ],
    rating: 4.4,
    reviewCount: 67,
    prepTime: "15-20 min",
    allergens: ["Vegetarian", "Contains Gluten"],
    addOns: [
      { id: "cheese-fill", label: "Add Cheese", price: 150 },
      { id: "egg-fill", label: "Add Egg", price: 100 },
    ],
  },

  // ── Mains ──
  {
    id: "chicken-kottu",
    title: "Chicken Kottu Roti",
    description:
      "Chopped roti stir-fried with chicken, vegetables, egg, and aromatic spices.",
    longDescription:
      "A true Sri Lankan classic brought to your room. Our Signature Kottu Roti features godhamba roti (flatbread) chopped and stir-fried on a hot griddle with free-range chicken, egg, onions, chilies, and fresh market vegetables. Served with a side of our house-made spicy curry gravy for dipping or pouring. It's the perfect comfort food with a kick of spice.",
    priceLkr: 1200,
    category: "Mains",
    tag: "POPULAR",
    imageUrl:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80",
    ],
    rating: 4.8,
    reviewCount: 124,
    prepTime: "25-35 min",
    allergens: ["Halal", "Contains Egg", "Spicy"],
    addOns: [
      { id: "extra-chicken", label: "Extra Chicken", price: 300 },
      { id: "fried-egg", label: "Fried Egg", price: 150 },
      { id: "extra-gravy", label: "Extra Gravy", price: 0 },
      { id: "chili-paste", label: "Chili Paste (On Side)", price: 50 },
    ],
  },
  {
    id: "rice-and-curry",
    title: "Rice & Curry",
    description:
      "Steamed rice served with dhal, pol sambol, chicken curry, and three vegetables.",
    longDescription:
      "The quintessential Sri Lankan meal — fragrant steamed rice paired with creamy dhal, fiery pol sambol, slow-cooked chicken curry, and a rotating selection of seasonal vegetable curries. A complete and satisfying platter.",
    priceLkr: 950,
    category: "Mains",
    tag: "POPULAR",
    imageUrl:
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&q=80",
    ],
    rating: 4.9,
    reviewCount: 203,
    prepTime: "20-30 min",
    allergens: ["Halal", "Dairy Free"],
    addOns: [
      { id: "extra-curry", label: "Extra Chicken Curry", price: 350 },
      { id: "papadum", label: "Papadum (3 pcs)", price: 100 },
      { id: "extra-sambol", label: "Extra Pol Sambol", price: 0 },
    ],
  },
  {
    id: "egg-hoppers",
    title: "Egg Hopper Set",
    description:
      "Bowl-shaped rice flour pancakes with a fried egg, served with lunu miris and seeni sambol.",
    longDescription:
      "A set of three crispy-edged hoppers — bowl-shaped rice flour pancakes — each topped with a perfectly fried egg. Served with spicy lunu miris (chilli-onion relish) and sweet seeni sambol. A traditional Sri Lankan breakfast, available all day.",
    priceLkr: 850,
    category: "Mains",
    tag: "VEG",
    imageUrl:
      "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=400&q=80",
    ],
    rating: 4.5,
    reviewCount: 78,
    prepTime: "15-20 min",
    allergens: ["Vegetarian", "Contains Egg", "Gluten Free"],
    addOns: [
      { id: "extra-hopper", label: "Extra Hopper", price: 150 },
      { id: "katta-sambol", label: "Katta Sambol", price: 75 },
    ],
  },
  {
    id: "devilled-chicken",
    title: "Devilled Chicken",
    description:
      "Tender chicken pieces tossed with capsicum, onion, and fiery chilli paste.",
    longDescription:
      "Our Devilled Chicken is a Sri Lankan-Chinese fusion classic. Bite-sized chicken pieces are wok-tossed with capsicum, onion, tomato, and a fiery house-made chilli paste. The result is a sweet-spicy-tangy dish that pairs perfectly with steamed rice or roti.",
    priceLkr: 1400,
    category: "Mains",
    tag: "SPICY",
    imageUrl:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
    ],
    rating: 4.7,
    reviewCount: 156,
    prepTime: "20-30 min",
    allergens: ["Halal", "Spicy", "Contains Soy"],
    addOns: [
      { id: "steamed-rice", label: "Steamed Rice", price: 200 },
      { id: "extra-chilli", label: "Extra Chilli Paste", price: 50 },
      { id: "fried-rice", label: "Fried Rice (instead)", price: 300 },
    ],
  },
  {
    id: "lamprais",
    title: "Lamprais",
    description:
      "Dutch-Burgher rice parcel with meat curry, ash plantain, brinjal moju, and frikkadel.",
    longDescription:
      "A cherished Dutch-Burgher heritage dish. Ghee rice is wrapped in a banana leaf with lamb curry, ash plantain, brinjal moju (eggplant pickle), seeni sambol, and a frikkadel (meatball). The entire parcel is baked, infusing the rice with the flavours of the banana leaf.",
    priceLkr: 1600,
    category: "Mains",
    tag: "NON_VEG",
    imageUrl:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=400&q=80",
    ],
    rating: 4.6,
    reviewCount: 91,
    prepTime: "30-40 min",
    allergens: ["Contains Meat", "Contains Egg"],
    addOns: [
      { id: "extra-frikkadel", label: "Extra Frikkadel", price: 250 },
      { id: "extra-moju", label: "Extra Brinjal Moju", price: 100 },
    ],
  },
  {
    id: "string-hoppers",
    title: "String Hopper Plate",
    description:
      "Steamed rice noodle nests served with coconut milk gravy, dhal, and pol sambol.",
    longDescription:
      "Delicate steamed rice noodle nests (idiyappam) served with a rich coconut milk gravy, creamy dhal, and spicy pol sambol. A light yet satisfying meal that showcases the simplicity and elegance of Sri Lankan cuisine.",
    priceLkr: 750,
    category: "Mains",
    tag: "VEG",
    imageUrl:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=400&q=80",
    ],
    rating: 4.3,
    reviewCount: 56,
    prepTime: "15-20 min",
    allergens: ["Vegetarian", "Gluten Free", "Dairy Free"],
    addOns: [
      { id: "extra-hoppers", label: "Extra String Hoppers (5)", price: 150 },
      { id: "chicken-curry", label: "Add Chicken Curry", price: 350 },
    ],
  },

  // ── Desserts ──
  {
    id: "watalappan",
    title: "Watalappan",
    description:
      "Rich coconut custard pudding infused with jaggery, cardamom, and cashews.",
    longDescription:
      "Watalappan is a traditional Sri Lankan Malay dessert. This silky coconut custard is sweetened with kithul jaggery and perfumed with cardamom, cloves, and nutmeg. Topped with roasted cashew nuts for a delightful crunch.",
    priceLkr: 550,
    category: "Desserts",
    tag: "VEG",
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=80",
    ],
    rating: 4.8,
    reviewCount: 95,
    prepTime: "5-10 min",
    allergens: ["Vegetarian", "Contains Nuts", "Dairy Free"],
    addOns: [
      { id: "extra-cashew", label: "Extra Cashew Topping", price: 100 },
      { id: "ice-cream", label: "Vanilla Ice Cream", price: 200 },
    ],
  },
  {
    id: "kavum",
    title: "Kavum",
    description:
      "Traditional oil cake made from rice flour and treacle, deep-fried until golden.",
    longDescription:
      "Kavum is a traditional Sinhalese sweetmeat served during the New Year festival. Made from rice flour and kithul treacle, these oil cakes are deep-fried until they develop a gorgeous golden crust while remaining soft and chewy inside.",
    priceLkr: 400,
    category: "Desserts",
    tag: "POPULAR",
    imageUrl:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=80",
    ],
    rating: 4.4,
    reviewCount: 43,
    prepTime: "5-10 min",
    allergens: ["Vegetarian", "Gluten Free"],
    addOns: [
      { id: "treacle-drizzle", label: "Extra Treacle Drizzle", price: 0 },
      { id: "ice-cream-side", label: "Ice Cream on Side", price: 200 },
    ],
  },
  {
    id: "curd-and-treacle",
    title: "Curd & Treacle",
    description:
      "Creamy buffalo curd drizzled with kithul treacle — a classic Lankan finish.",
    longDescription:
      "The simplest and most beloved Sri Lankan dessert. Thick, creamy buffalo milk curd from the southern coast, drizzled generously with dark kithul treacle. Sweet, tangy, and absolutely unforgettable.",
    priceLkr: 480,
    category: "Desserts",
    tag: "VEG",
    imageUrl:
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80",
    ],
    rating: 4.7,
    reviewCount: 118,
    prepTime: "5 min",
    allergens: ["Vegetarian", "Contains Dairy"],
    addOns: [
      { id: "extra-treacle", label: "Extra Treacle", price: 0 },
      { id: "honey-drizzle", label: "Honey Drizzle", price: 50 },
    ],
  },

  // ── Beverages ──
  {
    id: "king-coconut",
    title: "King Coconut Water",
    description:
      "Refreshing thambili served straight from the shell — naturally sweet and hydrating.",
    longDescription:
      "Nothing beats the tropical heat like a fresh King Coconut (thambili). Served chilled straight from the shell, this naturally sweet and electrolyte-rich drink is the ultimate Sri Lankan refreshment.",
    priceLkr: 250,
    category: "Beverages",
    tag: "VEG",
    imageUrl:
      "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=400&q=80",
    ],
    rating: 4.9,
    reviewCount: 210,
    prepTime: "2 min",
    allergens: ["Vegan", "Nut Free", "Gluten Free"],
    addOns: [
      { id: "ice", label: "Extra Ice", price: 0 },
      { id: "lime-squeeze", label: "Lime Squeeze", price: 25 },
    ],
  },
  {
    id: "ceylon-tea",
    title: "Ceylon Milk Tea",
    description:
      "Strong black tea brewed with fresh milk and a touch of sugar — a Sri Lankan staple.",
    longDescription:
      "Brewed from premium Ceylon black tea leaves, our milk tea is made the traditional way — strong, milky, and lightly sweetened. Served piping hot, it's the perfect companion to any meal or a quiet afternoon on the veranda.",
    priceLkr: 180,
    category: "Beverages",
    tag: "POPULAR",
    imageUrl:
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80",
    ],
    rating: 4.6,
    reviewCount: 167,
    prepTime: "5 min",
    allergens: ["Contains Dairy"],
    addOns: [
      { id: "extra-sugar", label: "Extra Sugar", price: 0 },
      { id: "ginger", label: "Add Ginger", price: 25 },
      { id: "cinnamon", label: "Cinnamon Stick", price: 50 },
    ],
  },
  {
    id: "faluda",
    title: "Faluda",
    description:
      "Rose-flavoured milk drink with basil seeds, jelly noodles, and a scoop of ice cream.",
    longDescription:
      "A show-stopping layered drink! Rose-flavoured milk is combined with soaked basil seeds, colourful jelly noodles, and topped with a generous scoop of vanilla ice cream. Sweet, refreshing, and visually stunning.",
    priceLkr: 650,
    category: "Beverages",
    imageUrl:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=400&q=80",
    ],
    rating: 4.5,
    reviewCount: 73,
    prepTime: "10 min",
    allergens: ["Contains Dairy", "Contains Gluten"],
    addOns: [
      { id: "extra-ice-cream", label: "Extra Ice Cream Scoop", price: 200 },
      { id: "extra-jelly", label: "Extra Jelly Noodles", price: 50 },
    ],
  },
];

/** Lookup map by item ID */
export const MENU_ITEMS_MAP = Object.fromEntries(
  MENU_ITEMS.map((item) => [item.id, item])
) as Record<string, MenuItemDetail>;
