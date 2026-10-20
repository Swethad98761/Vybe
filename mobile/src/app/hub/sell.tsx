import { useState } from "react";
import { Alert, Image, Linking, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconBack } from "@/components/icons";
import { Card, Groove, Paper } from "@/components/surface";
import { inr, uid } from "@/lib/format";
import { pic } from "@/lib/media";
import { cleanPaperNumber, expiryDisplay, expiryDraft, paperLookup, paperVerifyHref, proofsOf } from "@/lib/papers";
import { stallPulse } from "@/lib/stall";
import { useStore } from "@/lib/store";
import { SHOP_CATEGORIES, menuSectionsFor, papersFor, stallSections } from "@/lib/tokens";
import type { Product, Shop, ShopPaperProof } from "@/lib/types";
import { c, type as t } from "@/theme";

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
const LANES = SHOP_CATEGORIES.filter((item) => item.id !== "all");

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

function PhotoPick({
  value,
  onChange,
  photos,
}: {
  value: string;
  onChange: (src: string) => void;
  photos: string[];
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {photos.map((src) => {
        const image = pic(src);
        const on = value === src;
        if (!image) return null;
        return (
          <Pressable key={src} onPress={() => onChange(src)}>
            <Image
              source={image}
              style={{
                width: 52,
                height: 52,
                borderRadius: 8,
                borderWidth: on ? 1 : 0,
                borderColor: c.ink,
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SellScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, me, saveStall, dropStall } = useStore();
  const { shop: requested } = useLocalSearchParams<{ shop?: string }>();
  const mineAll = state.shops.filter((s) => s.ownerId === me.id);
  const mine =
    requested === "new" ? undefined : requested ? mineAll.find((s) => s.id === requested) : mineAll[0];
  const mineItems = state.products.filter((p) => p.shopId === mine?.id);
  const pulse = mine ? stallPulse(state, mine.id, me.id) : null;
  const inbox = mine ? state.conversations.filter((c) => c.shopId === mine.id && c.lane === "hub") : [];
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
  const canSave = Boolean(name.trim() && items.some((x) => x.name.trim()) && proofs.length);

  const patch = (id: string, next: Partial<Product>) =>
    setItems((list) => list.map((x) => (x.id === id ? { ...x, ...next } : x)));

  return (
    <Paper>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Back">
          <IconBack size={24} />
        </Pressable>
        <Text style={[t.title, { fontSize: 18 }]}>Hub</Text>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 36 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={t.caps}>Your stall</Text>
        <Text style={[t.soft, { marginTop: 6 }]}>
          One paper per stall. You can host more than one. Enquiries sit in Hub chat.
        </Text>
        {pulse ? (
          <Card depth={1} radius={18} style={{ marginTop: 16, padding: 14 }}>
            <Text style={t.caps}>The book</Text>
            <View style={{ flexDirection: "row", marginTop: 12 }}>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "600", color: c.ink }}>{pulse.visits}</Text>
                <Text style={t.meta}>Visits</Text>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "600", color: c.ink }}>{inr(pulse.sales)}</Text>
                <Text style={t.meta}>Sales</Text>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "600", color: c.ink }}>{pulse.enquiries}</Text>
                <Text style={t.meta}>Enquiries</Text>
              </View>
            </View>
            <Text style={[t.soft, { textAlign: "center", marginTop: 10 }]}>
              {pulse.orders} paid · {pulse.followers} following · {pulse.rating} ★
            </Text>
          </Card>
        ) : null}
        {inbox.length ? (
          <View style={{ marginTop: 16 }}>
            <Text style={t.caps}>Recent</Text>
            {inbox.slice(0, 4).map((item) => {
              const last = item.messages.at(-1);
              return (
                <Pressable key={item.id} onPress={() => router.push(`/chat/${item.id}`)}>
                  <Card depth={1} radius={18} style={{ marginTop: 8, padding: 14 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: c.ink }}>{item.name || "Enquiry"}</Text>
                    <Text style={[t.soft, { marginTop: 3 }]} numberOfLines={1}>
                      {last?.text || "Open in Hub chat"}
                    </Text>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Text style={[t.caps, { marginTop: 22 }]}>Cover</Text>
        <View style={{ marginTop: 8 }}>
          <PhotoPick value={cover} onChange={setCover} photos={COVERS} />
        </View>

        <Text style={[t.caps, { marginTop: 22 }]}>Name</Text>
        <Groove style={{ marginTop: 8, paddingHorizontal: 12, height: 44, justifyContent: "center" }}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your stall"
            placeholderTextColor={c.inkGhost}
            style={{ fontSize: 16, color: c.ink }}
          />
        </Groove>

        <Text style={[t.caps, { marginTop: 22 }]}>Category</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {LANES.map((lane) => {
            const on = category === lane.id;
            return (
              <Pressable
                key={lane.id}
                onPress={() => {
                  setCategory(lane.id);
                  setProofs((list) => list.filter((p) => papersFor(lane.id).some((x) => x.id === p.id)));
                }}
              >
                {on ? (
                  <Card depth={1} radius={16} style={{ paddingHorizontal: 14, paddingVertical: 8 }}>
                    <Text style={{ fontSize: 12, color: c.ink, fontWeight: "600" }}>{lane.label}</Text>
                  </Card>
                ) : (
                  <Groove style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16 }}>
                    <Text style={{ fontSize: 12, color: c.inkSoft }}>{lane.label}</Text>
                  </Groove>
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={[t.caps, { marginTop: 22 }]}>City</Text>
        <Groove style={{ marginTop: 8, paddingHorizontal: 12, height: 44, justifyContent: "center" }}>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholderTextColor={c.inkGhost}
            style={{ fontSize: 16, color: c.ink }}
          />
        </Groove>
        <Text style={[t.caps, { marginTop: 14 }]}>Area</Text>
        <Groove style={{ marginTop: 8, paddingHorizontal: 12, height: 44, justifyContent: "center" }}>
          <TextInput
            value={area}
            onChangeText={setArea}
            placeholder="Neighbourhood"
            placeholderTextColor={c.inkGhost}
            style={{ fontSize: 16, color: c.ink }}
          />
        </Groove>
        <Text style={[t.caps, { marginTop: 14 }]}>Hours</Text>
        <Groove style={{ marginTop: 8, paddingHorizontal: 12, height: 44, justifyContent: "center" }}>
          <TextInput
            value={hours}
            onChangeText={setHours}
            placeholder="11–3 · Mon–Sat"
            placeholderTextColor={c.inkGhost}
            style={{ fontSize: 16, color: c.ink }}
          />
        </Groove>
        <Text style={[t.caps, { marginTop: 14 }]}>About</Text>
        <Groove style={{ marginTop: 8, paddingHorizontal: 12, paddingVertical: 12, minHeight: 88 }}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What you make, when you open."
            placeholderTextColor={c.inkGhost}
            multiline
            style={{ fontSize: 16, color: c.ink, minHeight: 64, textAlignVertical: "top" }}
          />
        </Groove>

        <Text style={[t.caps, { marginTop: 22 }]}>Papers</Text>
        <Text style={[t.soft, { marginTop: 6 }]}>
          Tick what you hold. Put the number and expiry. Look up opens the official Indian portal — Niji does not
          scrape it or keep the PDF. A stall needs at least one paper to open.
        </Text>
        <View style={{ marginTop: 10, gap: 10 }}>
          {papersFor(category).map((paper) => {
            const proof = proofs.find((p) => p.id === paper.id);
            const meta = paperLookup(paper.id);
            const on = Boolean(proof);
            return (
              <Card key={paper.id} depth={1} radius={18} style={{ padding: 14 }}>
                <Pressable
                  onPress={() => {
                    setProofs((list) =>
                      list.some((p) => p.id === paper.id)
                        ? list.filter((p) => p.id !== paper.id)
                        : [...list, { id: paper.id }],
                    );
                    setDateDraft((d) => (d[paper.id] !== undefined ? d : { ...d, [paper.id]: "" }));
                  }}
                >
                  {on ? (
                    <Card depth={1} radius={16} style={{ paddingHorizontal: 14, paddingVertical: 8, alignSelf: "flex-start" }}>
                      <Text style={{ fontSize: 12, color: c.ink, fontWeight: "600" }}>{paper.label}</Text>
                    </Card>
                  ) : (
                    <Groove style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16, alignSelf: "flex-start" }}>
                      <Text style={{ fontSize: 12, color: c.inkSoft }}>{paper.label}</Text>
                    </Groove>
                  )}
                </Pressable>
                {proof ? (
                  <View style={{ marginTop: 12 }}>
                    <Text style={t.caps}>Number</Text>
                    <Groove style={{ marginTop: 8, paddingHorizontal: 12, height: 44, justifyContent: "center" }}>
                      <TextInput
                        value={proof.number ?? ""}
                        onChangeText={(value) =>
                          setProofs((list) =>
                            list.map((p) =>
                              p.id === paper.id ? { ...p, number: cleanPaperNumber(paper.id, value) } : p,
                            ),
                          )
                        }
                        placeholder={meta.numberHint}
                        placeholderTextColor={c.inkGhost}
                        autoCapitalize="characters"
                        style={{ fontSize: 15, color: c.ink }}
                      />
                    </Groove>
                    <Text style={[t.caps, { marginTop: 12 }]}>Expiry</Text>
                    <Groove style={{ marginTop: 8, paddingHorizontal: 12, height: 44, justifyContent: "center" }}>
                      <TextInput
                        value={dateDraft[paper.id] ?? expiryDisplay(proof.expiresAt)}
                        onChangeText={(value) => {
                          const next = expiryDraft(value);
                          setDateDraft((d) => ({ ...d, [paper.id]: next.display }));
                          setProofs((list) =>
                            list.map((p) => (p.id === paper.id ? { ...p, expiresAt: next.iso } : p)),
                          );
                        }}
                        placeholder="31 / 03 / 2027"
                        placeholderTextColor={c.inkGhost}
                        keyboardType="number-pad"
                        style={{ fontSize: 15, color: c.ink }}
                      />
                    </Groove>
                    <Text style={[t.soft, { marginTop: 8 }]}>
                      {meta.hint}
                      {proof.number ? " We copy the number so you can paste it on that page." : ""}
                    </Text>
                    <Pressable
                      onPress={async () => {
                        if (proof.number) await Clipboard.setStringAsync(proof.number).catch(() => {});
                        Linking.openURL(paperVerifyHref(paper.id, proof.number)).catch(() => {});
                      }}
                      style={{ marginTop: 6 }}
                    >
                      <Text style={{ fontSize: 13, color: c.ink }}>Verify on {paper.label}</Text>
                    </Pressable>
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>

        <Text style={[t.caps, { marginTop: 26 }]}>Menu</Text>
        <Text style={[t.soft, { marginTop: 6 }]}>
          Cut it the way a counter does — Starters, Mains, Drinks — and pick a photo for each plate.
        </Text>
        {sections.map((section) => {
          const lane = items.filter((x) => (x.section?.trim() || "Menu") === section);
          const stocked = menuSectionsFor(category).includes(section);
          return (
            <View key={section} style={{ marginTop: 18 }}>
              <Text style={t.caps}>{section}</Text>
              {lane.map((item) => (
                <Card key={item.id} depth={1} radius={18} style={{ marginTop: 10, padding: 14 }}>
                  <Text style={[t.caps, { marginBottom: 8 }]}>Photo</Text>
                  <PhotoPick
                    value={item.image}
                    onChange={(src) => patch(item.id, { image: src })}
                    photos={ITEM_PHOTOS}
                  />
                  <Groove style={{ marginTop: 12, paddingHorizontal: 12, height: 44, justifyContent: "center" }}>
                    <TextInput
                      value={item.name}
                      onChangeText={(value) => patch(item.id, { name: value })}
                      placeholder="Item name"
                      placeholderTextColor={c.inkGhost}
                      style={{ fontSize: 15, color: c.ink }}
                    />
                  </Groove>
                  <Groove style={{ marginTop: 8, paddingHorizontal: 12, height: 44, justifyContent: "center" }}>
                    <TextInput
                      value={item.price ? String(item.price) : ""}
                      onChangeText={(value) =>
                        patch(item.id, { price: Number(value.replace(/\D/g, "")) || 0 })
                      }
                      keyboardType="number-pad"
                      placeholder="Price ₹"
                      placeholderTextColor={c.inkGhost}
                      style={{ fontSize: 15, color: c.ink }}
                    />
                  </Groove>
                  <Groove style={{ marginTop: 8, paddingHorizontal: 12, height: 44, justifyContent: "center" }}>
                    <TextInput
                      value={item.description}
                      onChangeText={(value) => patch(item.id, { description: value })}
                      placeholder="Note — spice, size, ready by"
                      placeholderTextColor={c.inkGhost}
                      style={{ fontSize: 15, color: c.ink }}
                    />
                  </Groove>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                    {sections.map((laneName) => {
                      const on = (item.section?.trim() || "Menu") === laneName;
                      return (
                        <Pressable key={laneName} onPress={() => patch(item.id, { section: laneName })}>
                          {on ? (
                            <Card depth={1} radius={16} style={{ paddingHorizontal: 12, paddingVertical: 7 }}>
                              <Text style={{ fontSize: 12, color: c.ink, fontWeight: "600" }}>{laneName}</Text>
                            </Card>
                          ) : (
                            <Groove style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 }}>
                              <Text style={{ fontSize: 12, color: c.inkSoft }}>{laneName}</Text>
                            </Groove>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 12 }}>
                    <Pressable
                      onPress={() =>
                        setItems((list) =>
                          list.map((x) => ({ ...x, special: x.id === item.id ? !x.special : false })),
                        )
                      }
                    >
                      <Text style={{ fontSize: 13, color: item.special ? c.ink : c.inkFaint }}>
                        {item.special ? "Today’s plate" : "Mark today"}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => patch(item.id, { inStock: !item.inStock })}>
                      <Text style={{ fontSize: 13, color: item.inStock ? c.ink : c.inkFaint }}>
                        {item.inStock ? "In" : "Sold"}
                      </Text>
                    </Pressable>
                    {items.length > 1 ? (
                      <Pressable onPress={() => setItems((list) => list.filter((x) => x.id !== item.id))}>
                        <Text style={{ fontSize: 13, color: c.inkFaint }}>Remove</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </Card>
              ))}
              <Pressable
                onPress={() => setItems((list) => [...list, blankItem(shopId, section, cover)])}
                style={{ marginTop: 10 }}
              >
                <Text style={{ fontSize: 13, color: c.ink }}>+ Item in {section}</Text>
              </Pressable>
              {!lane.length && !stocked ? (
                <Pressable
                  onPress={() => setExtraSections((list) => list.filter((x) => x !== section))}
                  style={{ marginTop: 8 }}
                >
                  <Text style={{ fontSize: 13, color: c.inkFaint }}>Remove section</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 20 }}>
          <Groove style={{ flex: 1, paddingHorizontal: 12, height: 44, justifyContent: "center" }}>
            <TextInput
              value={sectionDraft}
              onChangeText={setSectionDraft}
              placeholder="New section — Kids, Weekend…"
              placeholderTextColor={c.inkGhost}
              style={{ fontSize: 15, color: c.ink }}
            />
          </Groove>
          <Pressable
            onPress={() => {
              const next = sectionDraft.trim();
              if (!next || sections.includes(next)) return;
              setExtraSections((list) => [...list, next]);
              setSectionDraft("");
            }}
          >
            <Text style={{ fontSize: 13, color: c.ink }}>+ Section</Text>
          </Pressable>
        </View>

        <Pressable
          disabled={!canSave}
          onPress={() => {
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
              papers: proofs.filter((p) => papersFor(category).some((x) => x.id === p.id)).map((p) => p.id),
              paperProofs: proofs.filter((p) => papersFor(category).some((x) => x.id === p.id)),
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
            setTimeout(() => setSaved(false), 1600);
          }}
          style={{
            marginTop: 24,
            borderRadius: 16,
            backgroundColor: c.ink,
            paddingVertical: 13,
            opacity: canSave ? 1 : 0.3,
          }}
        >
          <Text style={{ textAlign: "center", fontSize: 14, fontWeight: "600", color: c.card }}>
            {saved ? "Saved" : "Save stall"}
          </Text>
        </Pressable>
        {mine ? (
          <Pressable
            onPress={() =>
              Alert.alert("Delete this stall?", "The book, menu, and papers go with it.", [
                { text: "Keep", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    dropStall(shopId);
                    router.replace("/hub");
                  },
                },
              ])
            }
            style={{ marginTop: 8, paddingVertical: 14, alignItems: "center" }}
          >
            <Text style={{ fontSize: 13, color: "#C0392B" }}>Delete this stall</Text>
          </Pressable>
        ) : null}
        <Text style={[t.meta, { textAlign: "center", marginTop: 12 }]}>
          Stay here. Enquiries land in Hub chat.
        </Text>
      </ScrollView>
    </Paper>
  );
}
