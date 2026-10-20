"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SHOP_CATEGORIES, menuSectionsFor, orderedMenu, papersFor, stallSections } from "@/lib/tokens";
import {
  cleanPaperNumber,
  expiryDisplay,
  expiryDraft,
  paperExpiryLabel,
  paperExpiryTone,
  paperLookup,
  paperNumberOk,
  paperVerifyHref,
  proofsOf,
} from "@/lib/papers";
import { compact, inr, uid } from "@/lib/format";
import { useHorizontalPager } from "@/lib/pager";
import { rankShops, stallPulse } from "@/lib/stall";
import { nijiHubShareText, nijiHubUri, nijiWebHubUri } from "@/lib/niji-link";
import { useStore } from "@/lib/store";
import { NijiPaper } from "@/components/niji/niji-paper";
import { Person } from "@/components/niji/person";
import { Chip, Groove, Raised } from "@/components/niji/chrome";
import { useAppNav } from "@/components/web/use-app-nav";
import type { Product, Shop, ShopPaperProof } from "@/lib/types";

export function HubScreen() {
  const { state, me, toggleFollowShop } = useStore();
  const appNav = useAppNav();
  const pager = useHorizontalPager(SHOP_CATEGORIES.length);
  const cat = SHOP_CATEGORIES[pager.index]?.id ?? "all";
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const pull = useRef<{ y: number; top: number } | null>(null);
  const mineAll = state.shops.filter((s) => s.ownerId === me.id);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-paper">
      <div className="flex items-center justify-end px-4 pt-3">
        <button type="button" onClick={() => appNav.toHubSell("new")} className="text-[13px] text-[#17171A]">
          {mineAll.length ? "Host another" : "Host a stall"}
        </button>
      </div>
      {mineAll.length ? (
        <div className="mx-4 mt-2 mb-1 space-y-2">
          {mineAll.map((mine) => {
            const pulse = stallPulse(state, mine.id, me.id);
            return (
              <button
                key={mine.id}
                type="button"
                onClick={() => appNav.toHubSell(mine.id)}
                className="block w-full text-left"
              >
                <Raised className="px-3.5 py-3">
                  <p className="text-[10px] tracking-caps uppercase text-[#9B9AA0]">Your stall</p>
                  <p className="mt-1 text-[15px] font-medium text-[#17171A]">{mine.name}</p>
                  <p className="mt-0.5 text-[13px] text-[#65656B]">{mine.category} · {mine.area || mine.city}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[15px] font-medium text-[#17171A]">{pulse.visits}</p>
                      <p className="text-[10px] text-[#9B9AA0]">Visits</p>
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-[#17171A]">{inr(pulse.sales)}</p>
                      <p className="text-[10px] text-[#9B9AA0]">Sales</p>
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-[#17171A]">{pulse.enquiries}</p>
                      <p className="text-[10px] text-[#9B9AA0]">Enquiries</p>
                    </div>
                  </div>
                  <p className="mt-2 text-center text-[11px] text-[#9B9AA0]">
                    {pulse.followers} following · {pulse.rating} ★ · {pulse.orders} orders
                  </p>
                </Raised>
              </button>
            );
          })}
        </div>
      ) : null}
      {searchOpen ? (
        <div className="px-5 pb-3">
          <Groove className="flex items-center">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="h-11 flex-1 bg-transparent text-[15px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
            />
            <button
              type="button"
              aria-label="Close search"
              className="px-1 text-[13px] text-[#9B9AA0]"
              onClick={() => {
                setSearchOpen(false);
                setQ("");
              }}
            >
              Done
            </button>
          </Groove>
        </div>
      ) : null}
      <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-2 no-scrollbar">
        {SHOP_CATEGORIES.map((item, i) => (
          <button key={item.id} type="button" onClick={() => pager.goTo(i)}>
            <Chip on={cat === item.id}>{item.label}</Chip>
          </button>
        ))}
      </div>
      <div
        ref={pager.ref}
        onPointerDown={(e) => {
          pager.onPointerDown(e);
          const scroller = (e.target as HTMLElement).closest("[data-hub-lane]");
          pull.current = {
            y: e.clientY,
            top: scroller instanceof HTMLElement ? scroller.scrollTop : 0,
          };
        }}
        onPointerMove={pager.onPointerMove}
        onPointerUp={(e) => {
          pager.onPointerUp(e);
          if (!pull.current) return;
          const dy = e.clientY - pull.current.y;
          const fromTop = pull.current.top <= 8;
          pull.current = null;
          if (fromTop && dy > 48) setSearchOpen(true);
          if (dy < -48) {
            setSearchOpen(false);
            setQ("");
          }
        }}
        onPointerCancel={pager.onPointerCancel}
        onScroll={pager.onScroll}
        onClickCapture={pager.onClickCapture}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden no-scrollbar"
      >
        {SHOP_CATEGORIES.map((item) => (
          <HubLane
            key={item.id}
            shops={rankShops(
              state.shops.filter((s) => {
                const okCat = item.id === "all" || s.category === item.id;
                const needle = q.trim().toLowerCase();
                const okQ = !needle || s.name.toLowerCase().includes(needle) || s.area.toLowerCase().includes(needle);
                return okCat && okQ;
              }),
              { reviews: state.shopReviews ?? [], blockedShopIds: state.blockedShopIds ?? [] },
            )}
            following={state.followingShops}
            blocked={state.blockedShopIds ?? []}
            onFollow={toggleFollowShop}
          />
        ))}
      </div>
    </div>
  );
}

function HubLane({
  shops,
  following,
  blocked,
  onFollow,
}: {
  shops: Shop[];
  following: string[];
  blocked: string[];
  onFollow: (id: string) => void;
}) {
  const appNav = useAppNav();
  return (
    <div
      data-hub-lane
      className="min-h-0 w-full shrink-0 basis-full snap-start overflow-y-auto no-scrollbar px-4 pb-4"
    >
      {shops.length === 0 ? (
        <Raised className="px-6 py-10 text-center">
          <p className="text-[16px] font-medium text-[#17171A]">Nothing in this lane yet.</p>
          <p className="mt-2 text-sm text-[#9B9AA0]">Swipe for another category, or search.</p>
        </Raised>
      ) : (
        shops.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => appNav.toHubShop(s.id)}
            className="mb-2.5 block w-full text-left"
          >
            <Raised className="px-3.5 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.cover} alt="" className="h-36 w-full rounded-[14px] object-cover bg-[#E1E1E3]" />
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-[#17171A]">{s.name}</p>
                  <p className="mt-0.5 text-[13px] text-[#65656B]">{s.description}</p>
                  <p className="mt-1 text-[11px] text-[#9B9AA0]">
                    {blocked.includes(s.id) ? "Blocked · " : ""}
                    {s.hours ? `${s.hours} · ` : ""}
                    {s.area} · {s.km} km · {s.rating} ★ · {compact(s.followerCount)} · {s.visits ?? 0} visits
                  </p>
                </div>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFollow(s.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      onFollow(s.id);
                    }
                  }}
                >
                  <Chip on={following.includes(s.id)}>{following.includes(s.id) ? "Following" : "Follow"}</Chip>
                </span>
              </div>
            </Raised>
          </button>
        ))
      )}
    </div>
  );
}

export function ShopDetail({ id }: { id: string }) {
  const router = useRouter();
  const appNav = useAppNav();
  const {
    state,
    me,
    userById,
    addCart,
    setQty,
    sendOrder,
    messageSeller,
    visitShop,
    reviewShop,
    toggleBlockShop,
    shareShop,
    dropStall,
  } = useStore();
  const shop = state.shops.find((s) => s.id === id);
  const products = state.products.filter((p) => p.shopId === id);
  const cart = state.cartByShop[id] ?? [];
  const total = cart.reduce((sum, i) => {
    const p = products.find((x) => x.id === i.productId);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);
  const [shareOpen, setShareOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const proofs = shop ? proofsOf(shop) : [];
  const reviews = (state.shopReviews ?? []).filter((r) => r.shopId === id);
  const blocked = (state.blockedShopIds ?? []).includes(id);
  const mine = shop?.ownerId === me.id;
  const pulse = shop ? stallPulse(state, shop.id, me.id) : null;

  useEffect(() => {
    if (shop) visitShop(shop.id);
    // one visit per opening this stall
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!shop) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-paper px-8 py-16">
        <Raised className="px-6 py-10 text-center">
          <p className="text-[16px] font-medium text-[#17171A]">This stall closed.</p>
        </Raised>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-paper">
      <header className="flex items-center justify-between px-5 pt-4 pb-3">
        <button type="button" onClick={() => appNav.toHub()} className="text-[15px] text-[#65656B]">
          ‹ Hub
        </button>
        <div className="flex gap-4 text-[13px] text-[#17171A]">
          <button type="button" onClick={() => setQrOpen(true)}>
            QR
          </button>
          <button type="button" onClick={() => setShareOpen(true)}>
            Share
          </button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-4 pb-28">
        <Raised className="mb-3 px-3.5 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shop.cover}
            alt=""
            className="h-40 w-full rounded-[14px] object-cover bg-[#E1E1E3]"
          />
          <h1 className="mt-3 text-[18px] font-semibold tracking-tight text-[#17171A]">{shop.name}</h1>
          <p className="mt-1 text-[13px] text-[#65656B]">{shop.description}</p>
          {shop.hours ? <p className="mt-1 text-[13px] text-[#65656B]">{shop.hours}</p> : null}
          <p className="mt-2 text-[11px] text-[#9B9AA0]">
            {shop.area} · {shop.km} km · {shop.rating} ★ · {shop.visits ?? 0} visits · {compact(shop.followerCount)} following
          </p>
        </Raised>

        <Raised className="mb-3 px-3.5 py-3">
          <p className="text-[10px] tracking-caps uppercase text-[#9B9AA0]">Papers</p>
          <p className="mt-1 text-[12px] text-[#65656B]">
            Look these up on the official portal. Niji does not hold the PDF or confirm the licence.
          </p>
          {proofs.length === 0 ? (
            <p className="mt-3 text-[13px] text-[#9B9AA0]">No papers on the wall yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {proofs.map((proof) => {
                const meta = paperLookup(proof.id);
                const tone = paperExpiryTone(proof.expiresAt);
                return (
                  <div key={proof.id} className="border-t border-black/5 pt-3 first:border-t-0 first:pt-0">
                    <p className="text-[14px] font-medium text-[#17171A]">{meta.label}</p>
                    {proof.number ? (
                      <p className="mt-0.5 text-[13px] text-[#65656B]">{proof.number}</p>
                    ) : (
                      <p className="mt-0.5 text-[13px] text-[#9B9AA0]">No number on the wall</p>
                    )}
                    <p className={`mt-0.5 text-[12px] ${tone === "expired" ? "text-[#C0392B]" : "text-[#9B9AA0]"}`}>
                      {paperExpiryLabel(proof.expiresAt)}
                      {proof.number && !paperNumberOk(proof.id, proof.number) ? " · number looks short" : ""}
                    </p>
                    <button
                      type="button"
                      className="mt-1 inline-block text-[13px] text-[#17171A]"
                      onClick={async () => {
                        if (proof.number) {
                          try {
                            await navigator.clipboard.writeText(proof.number);
                          } catch {
                            /* paste on the portal */
                          }
                        }
                        window.open(paperVerifyHref(proof.id, proof.number), "_blank", "noreferrer");
                      }}
                    >
                      Verify on {meta.label === "GST" ? "GST portal" : meta.label}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Raised>

        {mine && pulse ? (
          <Raised className="mb-3 px-3.5 py-3">
            <p className="text-[10px] tracking-caps uppercase text-[#9B9AA0]">The book</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[15px] font-medium text-[#17171A]">{pulse.visits}</p>
                <p className="text-[10px] text-[#9B9AA0]">Visits</p>
              </div>
              <div>
                <p className="text-[15px] font-medium text-[#17171A]">{inr(pulse.sales)}</p>
                <p className="text-[10px] text-[#9B9AA0]">Sales</p>
              </div>
              <div>
                <p className="text-[15px] font-medium text-[#17171A]">{pulse.enquiries}</p>
                <p className="text-[10px] text-[#9B9AA0]">Enquiries</p>
              </div>
            </div>
            <p className="mt-2 text-center text-[12px] text-[#65656B]">
              {pulse.customers} customers · {pulse.orders} orders · {pulse.followers} following
            </p>
          </Raised>
        ) : null}

        <Raised className="mb-3 px-3.5 py-3">
          <p className="text-[10px] tracking-caps uppercase text-[#9B9AA0]">Feedback</p>
          <p className="mt-1 text-[12px] text-[#65656B]">Stars and a line. This is what ranks the stall.</p>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setStars(n)}>
                <Chip on={stars >= n}>{n} ★</Chip>
              </button>
            ))}
          </div>
          <Groove className="mt-3 py-2">
            <input
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="How was the stall"
              className="h-11 w-full bg-transparent px-1 text-[15px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
            />
          </Groove>
          <button
            type="button"
            className="mt-3 text-[13px] text-[#17171A]"
            onClick={() => {
              reviewShop(shop.id, stars, review);
              setReviewed(true);
              setReview("");
            }}
          >
            {reviewed ? "Saved" : "Leave feedback"}
          </button>
          <div className="mt-4 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-[13px] text-[#9B9AA0]">No comments yet.</p>
            ) : (
              reviews.map((item) => {
                const author = userById(item.authorId);
                return (
                  <div key={item.id}>
                    <p className="text-[13px] font-medium text-[#17171A]">
                      {author?.name ?? "Someone"} · {item.stars} ★
                    </p>
                    {item.body ? <p className="mt-0.5 text-[13px] text-[#65656B]">{item.body}</p> : null}
                  </div>
                );
              })
            )}
          </div>
        </Raised>

        {!mine ? (
          <button
            type="button"
            className="mb-4 w-full text-center text-[13px] text-[#9B9AA0]"
            onClick={() => toggleBlockShop(shop.id)}
          >
            {blocked ? "Unblock this stall" : "Block this stall"}
          </button>
        ) : (
          <button
            type="button"
            className="mb-4 w-full text-center text-[13px] text-[#C0392B]"
            onClick={() => {
              if (!window.confirm("Delete this stall? The book, menu, and papers go with it.")) return;
              dropStall(shop.id);
              appNav.toHub();
            }}
          >
            Delete this stall
          </button>
        )}

        {qrOpen ? (
          <NijiPaper
            nijiId={userById(shop.ownerId)?.nijiId ?? me.nijiId}
            name={shop.name}
            subtitle={shop.name}
            uri={nijiHubUri(shop.id)}
            kicker={`A seal that finds ${shop.name}.`}
            shareText={nijiHubShareText(
              shop.id,
              shop.name,
              typeof window !== "undefined" ? nijiWebHubUri(window.location.origin, shop.id) : undefined,
            )}
            shareLabel="Share stall"
            onClose={() => setQrOpen(false)}
          />
        ) : null}
        {shareOpen ? (
          <PeopleShareSheet
            onClose={() => setShareOpen(false)}
            onSend={(ids) => {
              shareShop(shop.id, ids);
              setShareOpen(false);
            }}
          />
        ) : null}

        {orderedMenu(products, shop.category).map(({ key, items }) => (
          <div key={key} className="mt-4">
            <p className="px-1 text-[10px] tracking-caps uppercase text-[#9B9AA0]">{key}</p>
            {items.map((p) => {
              const qty = cart.find((i) => i.productId === p.id)?.qty ?? 0;
              return (
                <Raised key={p.id} className="mt-2 px-3.5 py-3">
                  <div className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt="" className="size-20 rounded-[14px] object-cover bg-[#E1E1E3]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[15px] font-medium text-[#17171A]">{p.name}</p>
                        {p.special ? <span className="shrink-0 text-[10px] uppercase tracking-caps text-[#65656B]">Today</span> : null}
                      </div>
                      {p.description ? <p className="mt-0.5 text-[12px] text-[#9B9AA0]">{p.description}</p> : null}
                      <p className="mt-1 text-[13px] text-[#65656B]">{inr(p.price)}</p>
                      <div className="mt-2 flex gap-2">
                        {!p.inStock ? (
                          <Chip>Sold</Chip>
                        ) : qty === 0 ? (
                          <button type="button" onClick={() => addCart(shop.id, p.id)}>
                            <Chip on>Add</Chip>
                          </button>
                        ) : (
                          <Groove className="flex items-center gap-3 py-1 text-[13px] text-[#17171A]">
                            <button type="button" onClick={() => setQty(shop.id, p.id, qty - 1)}>
                              −
                            </button>
                            {qty}
                            <button type="button" onClick={() => setQty(shop.id, p.id, qty + 1)}>
                              +
                            </button>
                          </Groove>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const cid = messageSeller(p);
                            appNav.toChat(cid);
                          }}
                        >
                          <Chip>Enquire</Chip>
                        </button>
                      </div>
                    </div>
                  </div>
                </Raised>
              );
            })}
          </div>
        ))}
      </div>
      {cart.length > 0 ? (
        <div className="bg-paper px-4 pb-4">
          <button
            type="button"
            onClick={() => {
              const cid = sendOrder(shop.id);
              if (cid) appNav.toChat(cid);
            }}
            className="w-full"
          >
            <Raised className="flex h-12 items-center justify-center text-[13px] font-semibold tracking-[0.16em] text-[#17171A] uppercase">
              Send order · {inr(total)}
            </Raised>
          </button>
        </div>
      ) : null}
    </div>
  );
}

const COVERS = [
  "/media/posts/food.jpg",
  "/media/posts/fashion.jpg",
  "/media/posts/coffee.jpg",
  "/media/posts/dining.jpg",
  "/media/posts/workshop.jpg",
  "/media/posts/store.jpg",
];
const ITEM_PHOTOS = [
  "/media/posts/food.jpg",
  "/media/posts/dining.jpg",
  "/media/posts/coffee.jpg",
  "/media/posts/desert.jpg",
  "/media/posts/fashion.jpg",
  "/media/posts/workshop.jpg",
  "/media/products/bag.jpg",
  "/media/products/bottle.jpg",
  "/media/products/ceramic.jpg",
  "/media/products/lamp.jpg",
  "/media/products/watch.jpg",
  "/media/products/camera.jpg",
];
const LANES = SHOP_CATEGORIES.filter((c) => c.id !== "all");

function blankItem(shopId: string, section: string, image: string): Product {
  return {
    id: uid("prd"),
    shopId,
    name: "",
    price: 0,
    image,
    description: "",
    inStock: true,
    section,
  };
}

function PhotoPick({ value, onChange, photos }: { value: string; onChange: (src: string) => void; photos: string[] }) {
  return (
    <div className="grid grid-cols-6 gap-1.5">
      {photos.map((src) => (
        <button
          key={src}
          type="button"
          onClick={() => onChange(src)}
          className={value === src ? "ring-1 ring-[#17171A]" : ""}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="aspect-square object-cover" />
        </button>
      ))}
    </div>
  );
}

export function SellScreen({ shopId: shopIdProp }: { shopId?: string } = {}) {
  const router = useRouter();
  const appNav = useAppNav();
  const { state, me, saveStall, dropStall } = useStore();
  const params = useSearchParams();
  const requested = shopIdProp ?? params.get("shop");
  const mineAll = state.shops.filter((s) => s.ownerId === me.id);
  const mine =
    requested === "new" ? undefined : requested ? mineAll.find((s) => s.id === requested) : mineAll[0];
  const mineItems = state.products.filter((p) => p.shopId === mine?.id);
  const pulse = mine ? stallPulse(state, mine.id, me.id) : null;
  const inbox = mine
    ? state.conversations.filter((c) => c.shopId === mine.id && c.lane === "hub")
    : [];
  const [shopId] = useState(mine?.id ?? `shop-${me.id}-${uid("s")}`);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(mine?.name ?? "");
  const [category, setCategory] = useState(mine?.category ?? "food");
  const [city, setCity] = useState(mine?.city ?? me.city ?? "");
  const [area, setArea] = useState(mine?.area ?? "");
  const [hours, setHours] = useState(mine?.hours ?? "");
  const [description, setDescription] = useState(mine?.description ?? "");
  const [cover, setCover] = useState(mine?.cover ?? COVERS[0]);
  const [proofs, setProofs] = useState<ShopPaperProof[]>(mine ? proofsOf(mine) : []);
  const [dateDraft, setDateDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries((mine ? proofsOf(mine) : []).map((p) => [p.id, expiryDisplay(p.expiresAt)])),
  );
  const [sectionDraft, setSectionDraft] = useState("");
  const [extraSections, setExtraSections] = useState<string[]>([]);
  const [items, setItems] = useState<Product[]>(
    mineItems.length ? mineItems : [blankItem(shopId, menuSectionsFor("food")[0], ITEM_PHOTOS[0])],
  );
  const sections = stallSections(category, items, extraSections);

  const patch = (id: string, next: Partial<Product>) =>
    setItems((list) => list.map((x) => (x.id === id ? { ...x, ...next } : x)));

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-paper">
      <header className="flex items-center justify-between px-5 pt-4 pb-3">
        <button type="button" onClick={() => appNav.toHub()} className="text-[15px] text-[#65656B]">
          ‹ Hub
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
        <p className="px-1 text-[11px] tracking-caps uppercase text-[#9B9AA0]">Your stall</p>
        <p className="mt-1 px-1 text-[13px] text-[#65656B]">
          One paper per stall. You can host more than one. Enquiries sit in Hub chat.
        </p>
        {mineAll.length > 1 || requested === "new" ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {mineAll.map((s) => (
              <button key={s.id} type="button" onClick={() => appNav.toHubSell(s.id)}>
                <Chip on={shopId === s.id}>{s.name}</Chip>
              </button>
            ))}
            <button type="button" onClick={() => appNav.toHubSell("new")}>
              <Chip on={requested === "new"}>New stall</Chip>
            </button>
          </div>
        ) : null}

        {pulse ? (
          <Raised className="mt-4 px-3.5 py-3">
            <p className="text-[10px] tracking-caps uppercase text-[#9B9AA0]">The book</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[18px] font-medium text-[#17171A]">{pulse.visits}</p>
                <p className="text-[11px] text-[#9B9AA0]">Visits</p>
              </div>
              <div>
                <p className="text-[18px] font-medium text-[#17171A]">{inr(pulse.sales)}</p>
                <p className="text-[11px] text-[#9B9AA0]">Sales</p>
              </div>
              <div>
                <p className="text-[18px] font-medium text-[#17171A]">{pulse.enquiries}</p>
                <p className="text-[11px] text-[#9B9AA0]">Enquiries</p>
              </div>
            </div>
            <p className="mt-3 text-center text-[12px] text-[#65656B]">
              {pulse.orders} paid · {pulse.sold} items · {pulse.followers} following · {pulse.rating} ★
            </p>
          </Raised>
        ) : null}

        {inbox.length ? (
          <div className="mt-4">
            <p className="px-1 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Recent</p>
            <div className="mt-2 space-y-2">
              {inbox.slice(0, 4).map((c) => {
                const last = c.messages.at(-1);
                return (
                  <button key={c.id} type="button" onClick={() => appNav.toChat(c.id)} className="block w-full text-left">
                    <Raised className="px-3.5 py-3">
                      <p className="truncate text-[14px] font-medium text-[#17171A]">{c.name || "Enquiry"}</p>
                      <p className="mt-0.5 truncate text-[13px] text-[#65656B]">{last?.text || "Open in Hub chat"}</p>
                    </Raised>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <p className="mt-5 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Cover</p>
        <div className="mt-2">
          <PhotoPick value={cover} onChange={setCover} photos={COVERS} />
        </div>

        <p className="mt-5 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Name</p>
        <Groove className="mt-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your stall"
            className="h-11 w-full bg-transparent px-1 text-[16px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
          />
        </Groove>

        <p className="mt-5 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Category</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANES.map((lane) => (
            <button key={lane.id} type="button" onClick={() => {
              setCategory(lane.id);
              setProofs((list) => list.filter((p) => papersFor(lane.id).some((x) => x.id === p.id)));
            }}>
              <Chip on={category === lane.id}>{lane.label}</Chip>
            </button>
          ))}
        </div>

        <p className="mt-5 text-[10px] tracking-caps uppercase text-[#9B9AA0]">City</p>
        <Groove className="mt-2">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-11 w-full bg-transparent px-1 text-[16px] text-[#17171A] outline-none"
          />
        </Groove>
        <p className="mt-3 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Area</p>
        <Groove className="mt-2">
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="Neighbourhood"
            className="h-11 w-full bg-transparent px-1 text-[16px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
          />
        </Groove>
        <p className="mt-3 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Hours</p>
        <Groove className="mt-2">
          <input
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="11–3 · Mon–Sat"
            className="h-11 w-full bg-transparent px-1 text-[16px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
          />
        </Groove>
        <p className="mt-3 text-[10px] tracking-caps uppercase text-[#9B9AA0]">About</p>
        <Groove className="mt-2 py-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What you make, when you open."
            className="h-20 w-full resize-none bg-transparent px-1 text-[16px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
          />
        </Groove>

        <p className="mt-5 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Papers</p>
        <p className="mt-1 px-1 text-[13px] text-[#65656B]">
          Tick what you hold. Put the number and expiry. Look up opens the official Indian portal — Niji does not
          scrape it or keep the PDF. A stall needs at least one paper to open.
        </p>
        <div className="mt-2 space-y-3">
          {papersFor(category).map((paper) => {
            const proof = proofs.find((p) => p.id === paper.id);
            const meta = paperLookup(paper.id);
            const on = Boolean(proof);
            return (
              <Raised key={paper.id} className="px-3.5 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setProofs((list) =>
                      list.some((p) => p.id === paper.id)
                        ? list.filter((p) => p.id !== paper.id)
                        : [...list, { id: paper.id }],
                    );
                    setDateDraft((d) =>
                      d[paper.id] !== undefined ? d : { ...d, [paper.id]: "" },
                    );
                  }}
                >
                  <Chip on={on}>{paper.label}</Chip>
                </button>
                {proof ? (
                  <div className="mt-3">
                    <p className="text-[10px] tracking-caps uppercase text-[#9B9AA0]">Number</p>
                    <Groove className="mt-1">
                      <input
                        value={proof.number ?? ""}
                        onChange={(e) =>
                          setProofs((list) =>
                            list.map((p) =>
                              p.id === paper.id
                                ? { ...p, number: cleanPaperNumber(paper.id, e.target.value) }
                                : p,
                            ),
                          )
                        }
                        placeholder={meta.numberHint}
                        className="h-11 w-full bg-transparent px-1 text-[15px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
                      />
                    </Groove>
                    <p className="mt-3 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Expiry</p>
                    <Groove className="mt-1">
                      <input
                        inputMode="numeric"
                        value={dateDraft[paper.id] ?? expiryDisplay(proof.expiresAt)}
                        onChange={(e) => {
                          const next = expiryDraft(e.target.value);
                          setDateDraft((d) => ({ ...d, [paper.id]: next.display }));
                          setProofs((list) =>
                            list.map((p) => (p.id === paper.id ? { ...p, expiresAt: next.iso } : p)),
                          );
                        }}
                        placeholder="31 / 03 / 2027"
                        className="h-11 w-full bg-transparent px-1 text-[15px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
                      />
                    </Groove>
                    <p className="mt-2 text-[12px] text-[#9B9AA0]">
                      {meta.hint}
                      {proof.number ? " We copy the number so you can paste it on that page." : ""}
                    </p>
                    <button
                      type="button"
                      className="mt-1 inline-block text-[13px] text-[#17171A]"
                      onClick={async () => {
                        if (proof.number) {
                          try {
                            await navigator.clipboard.writeText(proof.number);
                          } catch {
                            /* paste on the portal */
                          }
                        }
                        window.open(paperVerifyHref(paper.id, proof.number), "_blank", "noreferrer");
                      }}
                    >
                      Verify on {paper.label}
                    </button>
                  </div>
                ) : null}
              </Raised>
            );
          })}
        </div>

        <p className="mt-6 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Menu</p>
        <p className="mt-1 px-1 text-[13px] text-[#65656B]">
          Cut it the way a counter does — Starters, Mains, Drinks — and pick a photo for each plate.
        </p>
        <div className="mt-3 space-y-5">
          {sections.map((section) => {
            const lane = items.filter((x) => (x.section?.trim() || "Menu") === section);
            const stocked = menuSectionsFor(category).includes(section);
            return (
              <div key={section}>
                <p className="px-1 text-[10px] tracking-caps uppercase text-[#9B9AA0]">{section}</p>
                <div className="mt-2 space-y-2.5">
                  {lane.map((item) => (
                    <Raised key={item.id} className="px-3.5 py-3">
                      <p className="mb-2 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Photo</p>
                      <PhotoPick
                        value={item.image}
                        onChange={(src) => patch(item.id, { image: src })}
                        photos={ITEM_PHOTOS}
                      />
                      <Groove className="mt-3">
                        <input
                          value={item.name}
                          onChange={(e) => patch(item.id, { name: e.target.value })}
                          placeholder="Item name"
                          className="h-11 w-full bg-transparent px-1 text-[15px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
                        />
                      </Groove>
                      <Groove className="mt-2">
                        <input
                          inputMode="numeric"
                          value={item.price || ""}
                          onChange={(e) =>
                            patch(item.id, { price: Number(e.target.value.replace(/\D/g, "")) || 0 })
                          }
                          placeholder="Price ₹"
                          className="h-11 w-full bg-transparent px-1 text-[15px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
                        />
                      </Groove>
                      <Groove className="mt-2 py-2">
                        <input
                          value={item.description}
                          onChange={(e) => patch(item.id, { description: e.target.value })}
                          placeholder="Note — spice, size, ready by"
                          className="h-10 w-full bg-transparent px-1 text-[15px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
                        />
                      </Groove>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {sections.map((laneName) => (
                          <button
                            key={laneName}
                            type="button"
                            onClick={() => patch(item.id, { section: laneName })}
                          >
                            <Chip on={(item.section?.trim() || "Menu") === laneName}>{laneName}</Chip>
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px]">
                        <button
                          type="button"
                          className={item.special ? "text-[#17171A]" : "text-[#9B9AA0]"}
                          onClick={() =>
                            setItems((list) =>
                              list.map((x) => ({ ...x, special: x.id === item.id ? !x.special : false })),
                            )
                          }
                        >
                          {item.special ? "Today’s plate" : "Mark today"}
                        </button>
                        <button
                          type="button"
                          className={item.inStock ? "text-[#17171A]" : "text-[#9B9AA0]"}
                          onClick={() => patch(item.id, { inStock: !item.inStock })}
                        >
                          {item.inStock ? "In" : "Sold"}
                        </button>
                        {items.length > 1 ? (
                          <button
                            type="button"
                            className="text-[#9B9AA0]"
                            onClick={() => setItems((list) => list.filter((x) => x.id !== item.id))}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </Raised>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-2 text-[13px] text-[#17171A]"
                  onClick={() => setItems((list) => [...list, blankItem(shopId, section, cover)])}
                >
                  + Item in {section}
                </button>
                {!lane.length && !stocked ? (
                  <button
                    type="button"
                    className="ml-4 mt-2 text-[13px] text-[#9B9AA0]"
                    onClick={() => setExtraSections((list) => list.filter((x) => x !== section))}
                  >
                    Remove section
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex gap-2">
          <Groove className="flex-1">
            <input
              value={sectionDraft}
              onChange={(e) => setSectionDraft(e.target.value)}
              placeholder="New section — Kids, Weekend…"
              className="h-11 w-full bg-transparent px-1 text-[15px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
            />
          </Groove>
          <button
            type="button"
            className="text-[13px] text-[#17171A]"
            onClick={() => {
              const next = sectionDraft.trim();
              if (!next || sections.includes(next)) return;
              setExtraSections((list) => [...list, next]);
              setSectionDraft("");
            }}
          >
            + Section
          </button>
        </div>

        <button
          type="button"
          disabled={!name.trim() || items.every((x) => !x.name.trim()) || !proofs.length}
          onClick={() => {
            const kept = proofs.filter((p) => papersFor(category).some((x) => x.id === p.id));
            const shop: Shop = {
              id: shopId,
              ownerId: me.id,
              name: name.trim(),
              category,
              city: city.trim(),
              area: area.trim(),
              description: description.trim(),
              cover,
              hours: hours.trim(),
              papers: kept.map((p) => p.id),
              paperProofs: kept,
              verified: false,
              rating: mine?.rating ?? 5,
              km: mine?.km ?? 0.2,
              followerCount: mine?.followerCount ?? 0,
              visits: mine?.visits ?? 0,
              blockCount: mine?.blockCount ?? 0,
              reviewCount: mine?.reviewCount ?? 0,
            };
            const products = items
              .filter((x) => x.name.trim())
              .map((x) => ({ ...x, shopId, image: x.image || cover }));
            saveStall(shop, products);
            setSaved(true);
            window.setTimeout(() => setSaved(false), 1600);
          }}
          className="mt-6 mb-4 w-full rounded-2xl bg-[#17171A] py-3 text-[14px] font-medium text-[#F7F7F8] disabled:opacity-30"
        >
          {saved ? "Saved" : "Save stall"}
        </button>
        {mine ? (
          <button
            type="button"
            className="mb-2 w-full py-3 text-[13px] text-[#C0392B]"
            onClick={() => {
              if (!window.confirm("Delete this stall? The book, menu, and papers go with it.")) return;
              dropStall(shopId);
              appNav.toHub();
            }}
          >
            Delete this stall
          </button>
        ) : null}
        <p className="px-1 pb-6 text-center text-[12px] text-[#9B9AA0]">
          Stay here. Enquiries land in Hub chat.
        </p>
      </div>
    </div>
  );
}

function PeopleShareSheet({ onClose, onSend }: { onClose: () => void; onSend: (ids: string[]) => void }) {
  const { state, me } = useStore();
  const [picked, setPicked] = useState<string[]>([]);
  return (
    <div className="fixed inset-0 z-50 bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#F7F7F8] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">Share stall to chat</p>
        <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
          {state.users
            .filter((u) => u.id !== me.id && u.id !== "mist" && !u.id.startsWith("veil-"))
            .map((u) => {
              const on = picked.includes(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setPicked((p) => (on ? p.filter((x) => x !== u.id) : [...p, u.id]))}
                  className="flex w-16 shrink-0 flex-col items-center gap-1"
                >
                  <div className={on ? "rounded-full ring-2 ring-neutral-900" : ""}>
                    <Person user={u} size="md" />
                  </div>
                  <span className="truncate text-[10px]">{u.name.split(" ")[0]}</span>
                </button>
              );
            })}
        </div>
        <button
          type="button"
          disabled={!picked.length}
          onClick={() => onSend(picked)}
          className="mt-5 w-full rounded-2xl bg-[#17171A] py-3 text-[14px] font-medium text-[#F7F7F8] disabled:opacity-30"
        >
          Send
        </button>
      </div>
    </div>
  );
}
