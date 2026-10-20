import { useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconLock } from "@/components/icons";
import { Card, Groove, Paper } from "@/components/surface";
import { compact, inr } from "@/lib/format";
import { pic } from "@/lib/media";
import { rankShops, stallPulse } from "@/lib/stall";
import { useStore } from "@/lib/store";
import { SHOP_CATEGORIES } from "@/lib/tokens";
import type { Shop } from "@/lib/types";
import { c, type as t } from "@/theme";

export default function HubScreen() {
  const { state, me, toggleFollowShop } = useStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mineAll = state.shops.filter((s) => s.ownerId === me.id);
  const pager = useRef<ScrollView>(null);
  const [page, setPage] = useState({ w: 0, h: 0 });
  const [cat, setCat] = useState<(typeof SHOP_CATEGORIES)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const goTo = (id: (typeof SHOP_CATEGORIES)[number]["id"]) => {
    setCat(id);
    const i = SHOP_CATEGORIES.findIndex((item) => item.id === id);
    if (page.w) pager.current?.scrollTo({ x: i * page.w, animated: true });
  };

  const onMomentum = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!page.w) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / page.w);
    const next = SHOP_CATEGORIES[i]?.id;
    if (next && next !== cat) setCat(next);
  };

  return (
    <Paper>
      <View style={{ paddingTop: insets.top + 8 }} />
      <View style={{ paddingHorizontal: 16, alignItems: "flex-end", marginBottom: 4 }}>
        <Pressable onPress={() => router.push("/hub/sell?shop=new")} hitSlop={8}>
          <Text style={{ fontSize: 13, color: c.ink }}>{mineAll.length ? "Host another" : "Host a stall"}</Text>
        </Pressable>
      </View>
      {mineAll.map((mine) => {
        const pulse = stallPulse(state, mine.id, me.id);
        return (
        <Pressable key={mine.id} onPress={() => router.push(`/hub/sell?shop=${mine.id}`)} style={{ marginHorizontal: 16, marginBottom: 8 }}>
          <Card depth={1} radius={18} style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
            <Text style={t.caps}>Your stall</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink, marginTop: 4 }}>{mine.name}</Text>
            <Text style={[t.soft, { marginTop: 2 }]}>
              {mine.category} · {mine.area || mine.city}
            </Text>
            {pulse ? (
              <View style={{ flexDirection: "row", marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: c.ink }}>{pulse.visits}</Text>
                  <Text style={t.meta}>Visits</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: c.ink }}>{inr(pulse.sales)}</Text>
                  <Text style={t.meta}>Sales</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: c.ink }}>{pulse.enquiries}</Text>
                  <Text style={t.meta}>Enquiries</Text>
                </View>
              </View>
            ) : null}
          </Card>
        </Pressable>
        );
      })}
      {searchOpen ? (
        <View style={{ paddingHorizontal: 18, marginBottom: 10 }}>
          <Groove
            style={{
              height: 44,
              justifyContent: "center",
              paddingHorizontal: 16,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TextInput
              autoFocus
              value={q}
              onChangeText={setQ}
              placeholder="Search"
              placeholderTextColor={c.inkGhost}
              style={{ flex: 1, fontSize: 15, color: c.ink }}
            />
            <Pressable
              onPress={() => {
                setSearchOpen(false);
                setQ("");
              }}
              hitSlop={8}
            >
              <Text style={{ fontSize: 13, color: c.inkFaint }}>Done</Text>
            </Pressable>
          </Groove>
        </View>
      ) : null}
      <View style={{ paddingBottom: 10 }}>
        <FlatList
          horizontal
          data={SHOP_CATEGORIES}
          keyExtractor={(x) => x.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18, gap: 9 }}
          renderItem={({ item }) => {
            const on = cat === item.id;
            return (
              <Pressable onPress={() => goTo(item.id)}>
                {on ? (
                  <Card depth={1} radius={16} style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                    <Text style={{ fontSize: 12, color: c.ink, fontWeight: "600" }}>{item.label}</Text>
                  </Card>
                ) : (
                  <Groove style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: 16 }}>
                    <Text style={{ fontSize: 12, color: c.inkSoft }}>{item.label}</Text>
                  </Groove>
                )}
              </Pressable>
            );
          }}
        />
      </View>
      <View
        style={{ flex: 1 }}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (width !== page.w || height !== page.h) setPage({ w: width, h: height });
        }}
      >
        {page.w > 0 ? (
          <ScrollView
            ref={pager}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            directionalLockEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentum}
          >
            {SHOP_CATEGORIES.map((item) => {
              const shops = rankShops(
                state.shops.filter((s) => {
                  const okCat = item.id === "all" || s.category === item.id;
                  const needle = q.trim().toLowerCase();
                  const okQ = !needle || s.name.toLowerCase().includes(needle) || s.area.toLowerCase().includes(needle);
                  return okCat && okQ;
                }),
                { reviews: state.shopReviews ?? [], blockedShopIds: state.blockedShopIds ?? [] },
              );
              return (
                <View key={item.id} style={{ width: page.w, height: page.h }}>
                  <HubLane
                    shops={shops}
                    following={state.followingShops}
                    bottom={insets.bottom}
                    onOpen={(id) => router.push(`/hub/${id}`)}
                    onFollow={toggleFollowShop}
                    onPullSearch={() => setSearchOpen(true)}
                    onHideSearch={() => {
                      setSearchOpen(false);
                      setQ("");
                    }}
                  />
                </View>
              );
            })}
          </ScrollView>
        ) : null}
      </View>
    </Paper>
  );
}

function HubLane({
  shops,
  following,
  bottom,
  onOpen,
  onFollow,
  onPullSearch,
  onHideSearch,
}: {
  shops: Shop[];
  following: string[];
  bottom: number;
  onOpen: (id: string) => void;
  onFollow: (id: string) => void;
  onPullSearch: () => void;
  onHideSearch: () => void;
}) {
  const startY = useRef(0);
  return (
    <FlatList
      data={shops}
      keyExtractor={(s) => s.id}
      nestedScrollEnabled
      contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: bottom + 26 }}
      showsVerticalScrollIndicator={false}
      onScrollBeginDrag={(e) => {
        startY.current = e.nativeEvent.contentOffset.y;
      }}
      onScrollEndDrag={(e) => {
        const y = e.nativeEvent.contentOffset.y;
        if (startY.current <= 4 && y < -24) onPullSearch();
        if (y > startY.current + 24) onHideSearch();
      }}
      renderItem={({ item }) => {
        const cover = pic(item.cover);
        return (
          <Pressable onPress={() => onOpen(item.id)}>
            <Card depth={1} radius={18} style={{ marginBottom: 10, padding: 14 }}>
              {cover ? (
                <Image
                  source={cover}
                  style={{ width: "100%", height: 138, borderRadius: 14, backgroundColor: c.paperDeep }}
                  resizeMode="cover"
                />
              ) : null}
              <View style={{ marginTop: cover ? 12 : 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: c.ink, flex: 1 }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={t.meta}>{item.km} km</Text>
                </View>
                <Text style={[t.soft, { marginTop: 5 }]}>{item.description}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 11 }}>
                  <Text style={t.meta}>
                    {item.hours ? `${item.hours} · ` : ""}
                    {item.area} · {item.city}
                  </Text>
                  <Text style={t.meta}>★ {item.rating}</Text>
                  <Text style={t.meta}>{compact(item.followerCount)} following</Text>
                  <Pressable onPress={() => onFollow(item.id)}>
                    <Text style={t.meta}>{following.includes(item.id) ? "Following" : "Follow"}</Text>
                  </Pressable>
                </View>
              </View>
            </Card>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <Card depth={1} radius={18} style={{ padding: 28, alignItems: "center" }}>
          <Text style={[t.body, { textAlign: "center" }]}>Nothing in this lane yet.</Text>
          <Text style={[t.soft, { marginTop: 7, textAlign: "center" }]}>Swipe for another category, or search.</Text>
        </Card>
      }
      ListFooterComponent={
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 12 }}>
          <IconLock size={12} color={c.inkGhost} />
          <Text style={[t.meta, { color: c.inkGhost }]}>Enquiries open an encrypted chat with the seller.</Text>
        </View>
      }
    />
  );
}
