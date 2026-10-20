import { useEffect, useState } from "react";
import { Alert, Image, Linking, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { IconBack } from "@/components/icons";
import { Avatar } from "@/components/avatar";
import { NijiPaper } from "@/components/niji-paper";
import { Card, Groove, Paper } from "@/components/surface";
import { compact, inr } from "@/lib/format";
import { pic } from "@/lib/media";
import { nijiHubShareText, nijiHubUri } from "@/lib/niji-link";
import { paperExpiryLabel, paperLookup, paperVerifyHref, proofsOf } from "@/lib/papers";
import { stallPulse } from "@/lib/stall";
import { useStore } from "@/lib/store";
import { orderedMenu } from "@/lib/tokens";
import { c, type as t } from "@/theme";

export default function ShopScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [shareOpen, setShareOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  const shop = state.shops.find((s) => s.id === id);
  const products = state.products.filter((p) => p.shopId === id);
  const cart = state.cartByShop[id ?? ""] ?? [];
  const total = cart.reduce((sum, i) => {
    const p = products.find((x) => x.id === i.productId);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);

  useEffect(() => {
    if (id) visitShop(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!shop) {
    return (
      <Paper>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={t.body}>This stall has closed.</Text>
        </View>
      </Paper>
    );
  }

  const cover = pic(shop.cover);
  const proofs = proofsOf(shop);
  const reviews = (state.shopReviews ?? []).filter((r) => r.shopId === shop.id);
  const blocked = (state.blockedShopIds ?? []).includes(shop.id);
  const mine = shop.ownerId === me.id;
  const pulse = stallPulse(state, shop.id, me.id);

  return (
    <Paper>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + (cart.length ? 88 : 30) }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {cover ? (
            <Image
              source={cover}
              style={{ width: "100%", height: 220, backgroundColor: c.paperDeep }}
              resizeMode="cover"
            />
          ) : null}
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={{ position: "absolute", left: 14, top: insets.top + 8 }}
          >
            <Card
              depth={2}
              radius={20}
              style={{ width: 38, height: 38, alignItems: "center", justifyContent: "center" }}
            >
              <IconBack size={22} />
            </Card>
          </Pressable>
        </View>

        <View style={{ padding: 20 }}>
          <Text style={t.title}>{shop.name}</Text>
          <Text style={[t.meta, { marginTop: 5 }]}>
            {shop.area} · {shop.city} · ★ {shop.rating} · {shop.visits ?? 0} visits · {compact(shop.followerCount)} following
          </Text>
          {shop.hours ? <Text style={[t.soft, { marginTop: 8 }]}>{shop.hours}</Text> : null}
          <Text style={[t.body, { marginTop: 12, color: c.inkSoft }]}>{shop.description}</Text>
          <View style={{ flexDirection: "row", gap: 16, marginTop: 14 }}>
            <Pressable onPress={() => setQrOpen(true)}>
              <Text style={{ fontSize: 13, color: c.ink }}>QR</Text>
            </Pressable>
            <Pressable onPress={() => setShareOpen(true)}>
              <Text style={{ fontSize: 13, color: c.ink }}>Share</Text>
            </Pressable>
          </View>

          <Card depth={1} radius={18} style={{ marginTop: 18, padding: 14 }}>
            <Text style={t.caps}>Papers</Text>
            <Text style={[t.soft, { marginTop: 6 }]}>
              Look these up on the official portal. Niji does not hold the PDF or confirm the licence.
            </Text>
            {proofs.length === 0 ? (
              <Text style={[t.meta, { marginTop: 10 }]}>No papers on the wall yet.</Text>
            ) : (
              proofs.map((proof) => {
                const meta = paperLookup(proof.id);
                return (
                  <View key={proof.id} style={{ marginTop: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: c.ink }}>{meta.label}</Text>
                    <Text style={[t.soft, { marginTop: 2 }]}>{proof.number || "No number on the wall"}</Text>
                    <Text style={[t.meta, { marginTop: 2 }]}>{paperExpiryLabel(proof.expiresAt)}</Text>
                    <Pressable
                      onPress={async () => {
                        if (proof.number) await Clipboard.setStringAsync(proof.number).catch(() => {});
                        Linking.openURL(paperVerifyHref(proof.id, proof.number)).catch(() => {});
                      }}
                      style={{ marginTop: 4 }}
                    >
                      <Text style={{ fontSize: 13, color: c.ink }}>
                        Verify on {meta.label === "GST" ? "GST portal" : meta.label}
                      </Text>
                    </Pressable>
                  </View>
                );
              })
            )}
          </Card>

          {mine ? (
            <Card depth={1} radius={18} style={{ marginTop: 12, padding: 14 }}>
              <Text style={t.caps}>The book</Text>
              <View style={{ flexDirection: "row", marginTop: 12 }}>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: c.ink }}>{pulse.visits}</Text>
                  <Text style={t.meta}>Visits</Text>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: c.ink }}>{inr(pulse.sales)}</Text>
                  <Text style={t.meta}>Sales</Text>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: c.ink }}>{pulse.enquiries}</Text>
                  <Text style={t.meta}>Enquiries</Text>
                </View>
              </View>
            </Card>
          ) : null}

          <Card depth={1} radius={18} style={{ marginTop: 12, padding: 14 }}>
            <Text style={t.caps}>Feedback</Text>
            <Text style={[t.soft, { marginTop: 6 }]}>Stars and a line. This is what ranks the stall.</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => setStars(n)}>
                  <Text style={{ fontSize: 14, color: stars >= n ? c.ink : c.inkFaint }}>{n} ★</Text>
                </Pressable>
              ))}
            </View>
            <Groove style={{ marginTop: 10, paddingHorizontal: 12, height: 44, justifyContent: "center" }}>
              <TextInput
                value={review}
                onChangeText={setReview}
                placeholder="How was the stall"
                placeholderTextColor={c.inkGhost}
                style={{ fontSize: 15, color: c.ink }}
              />
            </Groove>
            <Pressable
              onPress={() => {
                reviewShop(shop.id, stars, review);
                setReview("");
              }}
              style={{ marginTop: 10 }}
            >
              <Text style={{ fontSize: 13, color: c.ink }}>Leave feedback</Text>
            </Pressable>
            {reviews.map((item) => {
              const author = userById(item.authorId);
              return (
                <View key={item.id} style={{ marginTop: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: c.ink }}>
                    {author?.name ?? "Someone"} · {item.stars} ★
                  </Text>
                  {item.body ? <Text style={[t.soft, { marginTop: 2 }]}>{item.body}</Text> : null}
                </View>
              );
            })}
          </Card>

          {!mine ? (
            <Pressable onPress={() => toggleBlockShop(shop.id)} style={{ marginTop: 16, alignItems: "center" }}>
              <Text style={{ fontSize: 13, color: c.inkFaint }}>
                {blocked ? "Unblock this stall" : "Block this stall"}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() =>
                Alert.alert("Delete this stall?", "The book, menu, and papers go with it.", [
                  { text: "Keep", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                      dropStall(shop.id);
                      router.replace("/hub");
                    },
                  },
                ])
              }
              style={{ marginTop: 16, alignItems: "center" }}
            >
              <Text style={{ fontSize: 13, color: "#C0392B" }}>Delete this stall</Text>
            </Pressable>
          )}

          {orderedMenu(products, shop.category).map(({ key, items }) => (
            <View key={key} style={{ marginTop: 22 }}>
              <Text style={t.caps}>{key}</Text>
              {items.map((p) => {
                const image = pic(p.image);
                const qty = cart.find((i) => i.productId === p.id)?.qty ?? 0;
                return (
                  <Card key={p.id} depth={1} radius={18} style={{ marginTop: 12, padding: 12 }}>
                    <View style={{ flexDirection: "row", gap: 13 }}>
                      {image ? (
                        <Image
                          source={image}
                          style={{
                            width: 74,
                            height: 74,
                            borderRadius: 13,
                            backgroundColor: c.paperDeep,
                          }}
                          resizeMode="cover"
                        />
                      ) : null}
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                          <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink, flex: 1 }}>{p.name}</Text>
                          {p.special ? <Text style={t.caps}>Today</Text> : null}
                        </View>
                        {p.description ? (
                          <Text style={[t.soft, { marginTop: 3 }]} numberOfLines={2}>
                            {p.description}
                          </Text>
                        ) : null}
                        <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink, marginTop: 8 }}>
                          {inr(p.price)}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 9 }}>
                          {!p.inStock ? (
                            <Text style={{ fontSize: 12, color: c.inkFaint }}>Sold</Text>
                          ) : qty === 0 ? (
                            <Pressable
                              onPress={() => {
                                Haptics.selectionAsync().catch(() => {});
                                addCart(shop.id, p.id);
                              }}
                            >
                              <Card depth={1} radius={18} style={{ paddingHorizontal: 15, paddingVertical: 8 }}>
                                <Text style={{ fontSize: 12, color: c.ink, fontWeight: "600" }}>Add</Text>
                              </Card>
                            </Pressable>
                          ) : (
                            <Groove
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 12,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                              }}
                            >
                              <Pressable onPress={() => setQty(shop.id, p.id, qty - 1)}>
                                <Text style={{ fontSize: 15, color: c.ink }}>−</Text>
                              </Pressable>
                              <Text style={{ fontSize: 13, color: c.ink }}>{qty}</Text>
                              <Pressable onPress={() => setQty(shop.id, p.id, qty + 1)}>
                                <Text style={{ fontSize: 15, color: c.ink }}>+</Text>
                              </Pressable>
                            </Groove>
                          )}
                          <Pressable
                            onPress={() => {
                              Haptics.selectionAsync().catch(() => {});
                              const convoId = messageSeller(p);
                              router.push(`/chat/${convoId}`);
                            }}
                          >
                            <Card depth={1} radius={18} style={{ paddingHorizontal: 15, paddingVertical: 8 }}>
                              <Text style={{ fontSize: 12, color: c.ink, fontWeight: "600" }}>Enquire</Text>
                            </Card>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
      {qrOpen ? (
        <Modal visible animationType="fade" onRequestClose={() => setQrOpen(false)}>
          <NijiPaper
            nijiId={userById(shop.ownerId)?.nijiId ?? me.nijiId}
            name={shop.name}
            subtitle={shop.name}
            uri={nijiHubUri(shop.id)}
            kicker={`A seal that finds ${shop.name}.`}
            shareText={nijiHubShareText(shop.id, shop.name)}
            shareLabel="Share stall"
            onClose={() => setQrOpen(false)}
          />
        </Modal>
      ) : null}
      <Modal visible={shareOpen} transparent animationType="slide" onRequestClose={() => setShareOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.28)" }} onPress={() => setShareOpen(false)} />
        <View
          style={{
            backgroundColor: c.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 20,
            paddingBottom: insets.bottom + 18,
          }}
        >
          <Text style={[t.caps, { textAlign: "center" }]}>Share stall to chat</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
            {state.users
              .filter((u) => u.id !== me.id && u.id !== "mist" && !u.id.startsWith("veil-"))
              .map((u) => {
                const on = picked.includes(u.id);
                return (
                  <Pressable
                    key={u.id}
                    onPress={() => setPicked((p) => (on ? p.filter((x) => x !== u.id) : [...p, u.id]))}
                    style={{ width: 64, alignItems: "center", marginRight: 12 }}
                  >
                    <View style={on ? { borderRadius: 40, borderWidth: 2, borderColor: c.ink } : undefined}>
                      <Avatar user={u} size={52} />
                    </View>
                    <Text style={{ fontSize: 10, color: c.ink, marginTop: 4 }} numberOfLines={1}>
                      {u.name.split(" ")[0]}
                    </Text>
                  </Pressable>
                );
              })}
          </ScrollView>
          <Pressable
            disabled={!picked.length}
            onPress={() => {
              shareShop(shop.id, picked);
              setShareOpen(false);
              setPicked([]);
            }}
            style={{
              marginTop: 16,
              backgroundColor: c.ink,
              borderRadius: 16,
              paddingVertical: 12,
              opacity: picked.length ? 1 : 0.3,
            }}
          >
            <Text style={{ textAlign: "center", color: c.card, fontWeight: "600" }}>Send</Text>
          </Pressable>
        </View>
      </Modal>
      {cart.length > 0 ? (
        <View
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: insets.bottom + 12,
          }}
        >
          <Pressable
            onPress={() => {
              const cid = sendOrder(shop.id);
              if (cid) router.push(`/chat/${cid}`);
            }}
          >
            <Card
              depth={2}
              radius={16}
              style={{ height: 48, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", letterSpacing: 1.4, color: c.ink }}>
                SEND ORDER · {inr(total)}
              </Text>
            </Card>
          </Pressable>
        </View>
      ) : null}
    </Paper>
  );
}
