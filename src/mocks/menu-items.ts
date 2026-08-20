import type { MenuItem } from "@/store/guest/ordering/cart.store";

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

/** Hardcoded menu items have been removed. Menu data should be fetched from the API. */
export const MENU_ITEMS: MenuItemDetail[] = [];

/** Lookup map by item ID - generated from MENU_ITEMS */
export const MENU_ITEMS_MAP = Object.fromEntries(
  MENU_ITEMS.map((item) => [item.id, item])
) as Record<string, MenuItemDetail>;

