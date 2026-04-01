import ItemDetailsClient from "@/components/guest/order/item-details/item-details-client";
import { MENU_ITEMS_MAP, MENU_ITEMS } from "@/data/menu-items";

export default async function ItemDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const item = MENU_ITEMS_MAP[id] ?? MENU_ITEMS[0];

  return <ItemDetailsClient item={item} roomNumber="304" />;
}
