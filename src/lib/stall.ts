import type { AppState, Shop, ShopReview } from "./types";

export function stallPulse(state: AppState, shopId: string, meId: string) {
  const shop = state.shops.find((s) => s.id === shopId);
  const convos = state.conversations.filter((c) => c.shopId === shopId && c.lane === "hub");
  const people = new Set<string>();
  let enquiries = 0;
  for (const convo of convos) {
    for (const id of convo.participantIds) {
      if (id !== meId) people.add(id);
    }
    enquiries += convo.messages.filter((m) => m.senderId !== meId).length;
  }
  const shopOrders = state.orders.filter((o) => o.shopId === shopId);
  const sales = shopOrders.reduce((n, o) => n + o.total, 0);
  const sold = shopOrders.reduce((n, o) => n + o.items.reduce((a, i) => a + i.qty, 0), 0);
  const reviews = (state.shopReviews ?? []).filter((r) => r.shopId === shopId);
  return {
    sales,
    customers: people.size,
    enquiries,
    orders: shopOrders.length,
    sold,
    visits: shop?.visits ?? 0,
    followers: shop?.followerCount ?? 0,
    rating: shop?.rating ?? 0,
    reviews: reviews.length,
    blocks: shop?.blockCount ?? 0,
  };
}

export function shopRank(
  shop: Shop,
  ctx: { reviews: ShopReview[]; blockedByMe: boolean },
) {
  const mine = ctx.reviews.filter((r) => r.shopId === shop.id);
  const avg =
    mine.length > 0 ? mine.reduce((n, r) => n + r.stars, 0) / mine.length : shop.rating || 0;
  const blocks = shop.blockCount ?? 0;
  let score =
    avg * 18 +
    Math.log10(mine.length + 1) * 14 +
    Math.log10((shop.followerCount || 0) + 1) * 8 +
    Math.log10((shop.visits || 0) + 1) * 7 -
    blocks * 22;
  if (ctx.blockedByMe) score -= 1000;
  return score;
}

export function rankShops(
  shops: Shop[],
  ctx: { reviews: ShopReview[]; blockedShopIds: string[] },
) {
  return [...shops].sort((a, b) => {
    const da = shopRank(a, {
      reviews: ctx.reviews,
      blockedByMe: ctx.blockedShopIds.includes(a.id),
    });
    const db = shopRank(b, {
      reviews: ctx.reviews,
      blockedByMe: ctx.blockedShopIds.includes(b.id),
    });
    if (db !== da) return db - da;
    return a.km - b.km;
  });
}
