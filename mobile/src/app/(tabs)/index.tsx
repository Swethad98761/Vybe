import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Avatar } from "@/components/avatar";
import { IconAccount, IconBack, IconBell, IconComment, IconExplore, IconHome, IconPlus, IconRipple, IconStar, IconVybeChat } from "@/components/icons";
import { Card, Paper } from "@/components/surface";
import { detectLanguage, relativeTime } from "@/lib/format";
import { pic } from "@/lib/media";
import { hasFreshPulse, hasPulse, presenceOf } from "@/lib/presence";
import { useStore } from "@/lib/store";
import { CommentsSheet, ComposeSheet, EditSheet, ShareSheet, VybePostDetail, VybeProfile } from "@/components/vybe-profile";
import { ShareRipple } from "@/components/share-ripple";
import { StatusCompose, type StatusDraft } from "@/components/status-compose";
import { StatusViewer } from "@/components/status-viewer";
import { VybeChatPane } from "@/components/vybe-chat";
import { givenName, storyFriends, vybeStats } from "@/lib/vybe-stats";
import { publicNijiId, vybeFace } from "@/lib/identity";
import type { Post } from "@/lib/types";
import { c, type as t } from "@/theme";

const VYBE_TABS = [
  { id: "feed", label: "Home", Icon: IconHome },
  { id: "discover", label: "Explore", Icon: IconExplore },
  { id: "chat", label: "Vybe chat", Icon: IconVybeChat },
  { id: "me", label: "Vybe account", Icon: IconAccount },
] as const;

type VybeTab = (typeof VYBE_TABS)[number]["id"];

function PostCard({
  post,
  onProfile,
  onComment,
  onShare,
  onHold,
  rippling,
  onRippleDone,
}: {
  post: Post;
  onProfile?: (userId: string) => void;
  onComment?: () => void;
  onShare?: () => void;
  onHold?: () => void;
  rippling?: boolean;
  onRippleDone?: () => void;
}) {
  const { userById, me, toggleLike } = useStore();
  const author = userById(post.authorId);
  const liked = post.likedBy.includes(me.id);
  const image = pic(post.image);

  return (
    <Pressable onLongPress={onHold}>
    <Card depth={1} radius={18} style={{ marginBottom: 10, padding: 14, overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 10 }}>
        <Pressable onPress={() => author && onProfile?.(author.id)}>
          <Avatar user={author} size={40} place="vybe" />
        </Pressable>
        <Pressable onPress={() => author && onProfile?.(author.id)} style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink }}>{vybeFace(author)}</Text>
          </View>
          <Text style={t.meta}>
            {post.location ? `${post.location} · ` : ""}
            {relativeTime(post.createdAt)}
            {post.travel ? ` · ${post.travel}` : ""}
          </Text>
        </Pressable>
      </View>
      {image ? (
        <Image
          source={image}
          style={{
            width: "100%",
            aspectRatio: 4 / 5,
            borderRadius: 14,
            backgroundColor: c.paperDeep,
          }}
          resizeMode="cover"
        />
      ) : null}
      {post.text ? (
        <Text
          style={[
            t.body,
            {
              paddingHorizontal: 4,
              paddingVertical: image ? 10 : 8,
              marginTop: image ? 8 : 4,
              color: image ? c.inkSoft : c.ink,
            },
          ]}
        >
          {post.text}
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
          marginTop: 12,
        }}
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            toggleLike(post.id);
          }}
          accessibilityLabel="Star"
        >
          <IconStar size={21} color={liked ? c.ink : c.inkFaint} fill={liked} />
        </Pressable>
        <Pressable onPress={onComment} accessibilityLabel="Comment">
          <IconComment
            size={20}
            color={post.comments.length ? c.ink : c.inkFaint}
            heavy={post.comments.length > 0}
          />
        </Pressable>
        <Pressable onPress={onShare} accessibilityLabel="Share">
          <ShareRipple play={rippling} onDone={onRippleDone}>
            <IconRipple size={20} color={c.inkFaint} />
          </ShareRipple>
        </Pressable>
        <View style={{ flex: 1 }} />
        {post.language ? (
          <Text style={[t.meta, { color: c.inkGhost }]}>{post.language}</Text>
        ) : null}
      </View>
    </Card>
    </Pressable>
  );
}

function DiscoverViewer({
  posts,
  startId,
  onClose,
  onProfile,
}: {
  posts: Post[];
  startId: string;
  onClose: () => void;
  onProfile?: (userId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { userById, me, toggleLike, toggleFollow, state } = useStore();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const start = Math.max(0, posts.findIndex((p) => p.id === startId));
  const swipe = useRef<{ x: number; y: number } | null>(null);

  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <View
        style={{ flex: 1, backgroundColor: "#111" }}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
        }}
      >
        <View
          onTouchStart={(e) => {
            const t = e.nativeEvent;
            swipe.current = { x: t.pageX, y: t.pageY };
          }}
          onTouchEnd={(e) => {
            const start = swipe.current;
            swipe.current = null;
            if (!start) return;
            const t = e.nativeEvent;
            const dx = t.pageX - start.x;
            const dy = t.pageY - start.y;
            if (dx > 72 && Math.abs(dx) > Math.abs(dy)) onClose();
            if (dy > 80 && Math.abs(dy) > Math.abs(dx)) onClose();
          }}
          style={{ flex: 1 }}
        >
        {size.h > 0 ? (
          <FlatList
            data={posts}
            keyExtractor={(p) => p.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            initialScrollIndex={start}
            getItemLayout={(_, i) => ({ length: size.h, offset: size.h * i, index: i })}
            renderItem={({ item }) => {
              const author = userById(item.authorId);
              const image = pic(item.image);
              const following = !author || author.id === me.id || state.following.includes(author.id);
              return (
                <View style={{ width: size.w, height: size.h, justifyContent: "flex-end", backgroundColor: "#17171A" }}>
                  {image ? (
                    <Image
                      source={image}
                      style={{ position: "absolute", width: size.w, height: size.h, opacity: 0.8 }}
                      resizeMode="cover"
                    />
                  ) : null}
                  <View style={{ padding: 20, paddingBottom: insets.bottom + 28 }}>
                    <Text style={{ color: "#fff", fontSize: 24, fontFamily: "serif", lineHeight: 30 }}>
                      {item.text}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 }}>
                      <Pressable
                        onPress={() => {
                          if (author) {
                            onClose();
                            onProfile?.(author.id);
                          }
                        }}
                      >
                        <Avatar user={author} size={36} place="vybe" />
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          if (author) {
                            onClose();
                            onProfile?.(author.id);
                          }
                        }}
                        style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}
                      >
                        <Text style={{ color: "#fff" }}>{vybeFace(author)}</Text>
                      </Pressable>
                      {author && author.id !== me.id ? (
                        <Pressable
                          onPress={() => toggleFollow(author.id)}
                          style={{ borderColor: "rgba(255,255,255,0.4)", borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}
                        >
                          <Text style={{ color: "#fff", fontSize: 12 }}>{following ? "Following" : "Follow +"}</Text>
                        </Pressable>
                      ) : null}
                    </View>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        toggleLike(item.id);
                      }}
                      style={{ marginTop: 16 }}
                    >
                      <IconStar size={28} color="#fff" fill={item.likedBy.includes(me.id)} />
                    </Pressable>
                  </View>
                </View>
              );
            }}
          />
        ) : null}
        </View>
      </View>
    </Modal>
  );
}

export default function VybeScreen() {
  const { state, me, addComment, addPost, sharePost, updateMe, readNotes, dropPost, archivePost, reportPost } = useStore();
  const insets = useSafeAreaInsets();
  const pager = useRef<ScrollView>(null);
  const [tab, setTab] = useState<VybeTab>("feed");
  const [page, setPage] = useState({ w: 0, h: 0 });
  const [openPost, setOpenPost] = useState<string | null>(null);
  const [profileOf, setProfileOf] = useState<string | null>(null);
  const [commentFor, setCommentFor] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | undefined>();
  const [shareFor, setShareFor] = useState<string | null>(null);
  const [editMe, setEditMe] = useState(false);
  const [detailPost, setDetailPost] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [compose, setCompose] = useState(false);
  const [pickChat, setPickChat] = useState(false);
  const [exploreSalt, setExploreSalt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [statusOf, setStatusOf] = useState<string | null>(null);
  const [statusCompose, setStatusCompose] = useState(false);
  const [statusDraft, setStatusDraft] = useState<StatusDraft>();
  const [youPick, setYouPick] = useState(false);
  const [storyFeed, setStoryFeed] = useState<Post[] | null>(null);
  const [ripplePost, setRipplePost] = useState<string | null>(null);
  const [holdPost, setHoldPost] = useState<string | null>(null);
  const mode = presenceOf(state);
  const livePosts = useMemo(() => {
    const reported = new Set(state.reportedPostIds ?? []);
    return state.posts.filter((p) => !p.archived && !reported.has(p.id));
  }, [state.posts, state.reportedPostIds]);
  const feed = useMemo(
    () => livePosts.filter((p) => p.authorId === me.id || state.following.includes(p.authorId)),
    [livePosts, state.following, me.id],
  );
  const discover = useMemo(() => {
    const list = [...livePosts];
    if (!list.length || !exploreSalt) return list;
    const n = exploreSalt % list.length;
    return list.slice(n).concat(list.slice(0, n));
  }, [livePosts, exploreSalt]);
  const mine = useMemo(() => livePosts.filter((p) => p.authorId === me.id), [livePosts, me.id]);
  const notes = state.notifications;
  const friends = useMemo(
    () => storyFriends(me.id, state.users, state.posts, state.following, state.statuses),
    [me.id, state.users, state.posts, state.following, state.statuses],
  );
  function openYou() {
    if (hasPulse(me.id, state.statuses, "vybe")) setYouPick(true);
    else {
      setStatusDraft(undefined);
      setStatusCompose(true);
    }
  }

  function openStory(userId: string) {
    if (userId === me.id) {
      openYou();
      return;
    }
    if (hasPulse(userId, state.statuses, "vybe")) {
      setStatusOf(userId);
      return;
    }
    setProfileOf(userId);
  }

  const goTo = (id: VybeTab) => {
    setTab(id);
    const i = VYBE_TABS.findIndex((t) => t.id === id);
    if (page.w) pager.current?.scrollTo({ x: i * page.w, animated: true });
  };

  const onMomentum = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!page.w) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / page.w);
    const next = VYBE_TABS[i]?.id;
    if (next && next !== tab) setTab(next);
  };

  const listPad = { paddingHorizontal: 18, paddingBottom: insets.bottom + 26 };

  return (
    <Paper>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 6,
          paddingBottom: 4,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={() => (tab === "chat" ? setPickChat(true) : setCompose(true))}
          hitSlop={8}
          accessibilityLabel={tab === "chat" ? "New vybe chat" : "New vybe"}
          style={{ width: 40, alignItems: "center", paddingVertical: 10 }}
        >
          <IconPlus size={23} color={c.ink} />
        </Pressable>
        <View style={{ flex: 1, flexDirection: "row" }}>
          {VYBE_TABS.map(({ id, label, Icon }) => {
            const on = tab === id;
            return (
              <Pressable
                key={id}
                accessibilityLabel={label}
                onPress={() => goTo(id)}
                style={{ flex: 1, alignItems: "center", paddingVertical: 10 }}
              >
                <Icon size={23} color={on ? c.ink : c.inkGhost} />
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={() => {
            setNotesOpen(true);
            readNotes();
          }}
          hitSlop={8}
          accessibilityLabel="Notes"
          style={{ width: 40, alignItems: "center", paddingVertical: 10 }}
        >
          <View>
            <IconBell size={23} color={c.ink} />
            {notes.some((n) => !n.read) ? (
              <View
                style={{
                  position: "absolute",
                  top: -1,
                  right: -1,
                  width: 7,
                  height: 7,
                  borderRadius: 7,
                  backgroundColor: c.saffron,
                }}
              />
            ) : null}
          </View>
        </Pressable>
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
            keyboardShouldPersistTaps="handled"
            onMomentumScrollEnd={onMomentum}
          >
            <View style={{ width: page.w, height: page.h }}>
              <FlatList
                data={feed}
                keyExtractor={(p) => p.id}
                renderItem={({ item }) => (
                  <PostCard
                    post={item}
                    onProfile={setProfileOf}
                    onComment={() => {
                      setReplyTo(undefined);
                      setCommentFor(item.id);
                    }}
                    onShare={() => setShareFor(item.id)}
                    onHold={() => setHoldPost(item.id)}
                    rippling={ripplePost === item.id}
                    onRippleDone={() => setRipplePost(null)}
                  />
                )}
                contentContainerStyle={listPad}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                ListHeaderComponent={
                  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingBottom: 12 }}>
                    <Pressable onPress={openYou} accessibilityLabel="Your status" style={{ width: 48, alignItems: "center" }}>
                      <View style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
                        <Avatar user={me} size={36} story pulse={false} />
                        <View
                          style={{
                            position: "absolute",
                            right: 0,
                            bottom: 0,
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            backgroundColor: c.ink,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ color: "#fff", fontSize: 10, lineHeight: 12 }}>+</Text>
                        </View>
                      </View>
                      <Text style={{ marginTop: 4, fontSize: 10, color: c.inkFaint }} numberOfLines={1}>
                        You
                      </Text>
                    </Pressable>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                      {friends.map((u) => {
                        const fresh = hasFreshPulse(u.id, state.statuses, me.id, "vybe");
                        return (
                          <Pressable
                            key={u.id}
                            onPress={() => openStory(u.id)}
                            accessibilityLabel={u.name}
                            style={{ width: 48, alignItems: "center" }}
                          >
                            <View style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
                              <Avatar user={u} size={36} story pulse={fresh} />
                            </View>
                            <Text style={{ marginTop: 4, fontSize: 10, color: c.inkFaint }} numberOfLines={1}>
                              {givenName(u.name)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                }
                ListEmptyComponent={
                  <Card depth={1} radius={18} style={{ padding: 28, alignItems: "center" }}>
                    <Text style={[t.body, { textAlign: "center" }]}>No vybes yet.</Text>
                  </Card>
                }
              />
            </View>

            <View style={{ width: page.w, height: page.h }}>
              <FlatList
                data={discover}
                keyExtractor={(p) => p.id}
                numColumns={2}
                columnWrapperStyle={{ gap: 10, paddingHorizontal: 18 }}
                contentContainerStyle={{ paddingBottom: insets.bottom + 26, gap: 10 }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    tintColor={c.ink}
                    onRefresh={() => {
                      setRefreshing(true);
                      setExploreSalt((n) => n + 1);
                      setTimeout(() => setRefreshing(false), 420);
                    }}
                  />
                }
                renderItem={({ item }) => {
                  const image = pic(item.image);
                  return (
                    <Pressable onPress={() => setOpenPost(item.id)} style={{ flex: 1 }}>
                      <Card depth={1} radius={16} style={{ flex: 1, padding: 8, marginBottom: 0 }}>
                        <View
                          style={{
                            aspectRatio: 3 / 4,
                            borderRadius: 12,
                            overflow: "hidden",
                            backgroundColor: c.paperDeep,
                            justifyContent: "flex-end",
                          }}
                        >
                          {image ? (
                            <Image source={image} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                          ) : (
                            <Text style={{ color: c.ink, fontSize: 13, padding: 10 }}>{item.text}</Text>
                          )}
                        </View>
                      </Card>
                    </Pressable>
                  );
                }}
                ListEmptyComponent={
                  <Card depth={1} radius={18} style={{ padding: 28, marginHorizontal: 18, alignItems: "center" }}>
                    <Text style={[t.body, { textAlign: "center" }]}>Nothing in discover</Text>
                  </Card>
                }
              />
            </View>

            <View style={{ width: page.w, height: page.h }}>
              <VybeChatPane pick={pickChat} onPick={setPickChat} />
            </View>

            <View style={{ width: page.w, height: page.h }}>
              <FlatList
                data={mine}
                keyExtractor={(p) => p.id}
                nestedScrollEnabled
                ListHeaderComponent={
                  <View>
                  <Card depth={1} radius={18} style={{ padding: 16, marginBottom: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                      <Avatar
                        user={me}
                        size={56}
                        place="vybe"
                        around={mode === "around"}
                        vybeOn={state.vybeEnabled}
                      />
                      <View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={{ fontSize: 16, fontWeight: "600", color: c.ink }}>{me.name}</Text>
                        </View>
                        {publicNijiId(me) ? <Text style={[t.meta, { marginTop: 4 }]}>{me.nijiId}</Text> : null}
                        {me.city ? <Text style={[t.meta, { marginTop: 4 }]}>{me.city}</Text> : null}
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", marginTop: 16 }}>
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <Text style={{ fontSize: 18, fontWeight: "600", color: c.ink }}>
                          {vybeStats(me.id, state.posts, state.following, me.id).vybes}
                        </Text>
                        <Text style={t.meta}>Vybes</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <Text style={{ fontSize: 18, fontWeight: "600", color: c.ink }}>{state.following.length}</Text>
                        <Text style={t.meta}>Following</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <Text style={{ fontSize: 18, fontWeight: "600", color: c.ink }}>
                          {vybeStats(me.id, state.posts, state.following, me.id).followers}
                        </Text>
                        <Text style={t.meta}>Followers</Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => setEditMe(true)}
                      style={{
                        marginTop: 14,
                        backgroundColor: c.paperDeep,
                        borderRadius: 16,
                        paddingVertical: 11,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 14, color: c.ink }}>Edit profile</Text>
                    </Pressable>
                  </Card>
                  </View>
                }
                numColumns={3}
                columnWrapperStyle={{ gap: 4 }}
                renderItem={({ item }) => {
                  const image = pic(item.image);
                  return (
                    <Pressable
                      onPress={() => setDetailPost(item.id)}
                      onLongPress={() => setHoldPost(item.id)}
                      style={{ flex: 1, maxWidth: "33%" }}
                    >
                      <View
                        style={{
                          aspectRatio: 1,
                          borderRadius: 8,
                          overflow: "hidden",
                          backgroundColor: c.paperDeep,
                          marginBottom: 4,
                        }}
                      >
                        {image ? (
                          <Image source={image} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                        ) : (
                          <Text numberOfLines={4} style={{ color: c.ink, fontSize: 11, padding: 6 }}>
                            {item.text}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  );
                }}
                contentContainerStyle={listPad}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Card depth={1} radius={18} style={{ padding: 28, alignItems: "center" }}>
                    <Text style={[t.body, { textAlign: "center" }]}>No vybes of yours here</Text>
                  </Card>
                }
              />
            </View>
          </ScrollView>
        ) : null}
      </View>

      {statusOf ? (
        <StatusViewer
          authorId={statusOf}
          lane="vybe"
          onClose={() => setStatusOf(null)}
          onReshare={(item) => {
            setStatusOf(null);
            setStatusDraft({
              text: item.text,
              image: item.image,
              resharedFrom: item.id,
              resharedFromAuthorId: item.authorId,
            });
            setStatusCompose(true);
          }}
        />
      ) : null}
      {openPost ? (
        <DiscoverViewer
          posts={storyFeed ?? state.posts}
          startId={openPost}
          onClose={() => {
            setOpenPost(null);
            setStoryFeed(null);
          }}
          onProfile={(id) => {
            setOpenPost(null);
            setStoryFeed(null);
            setProfileOf(id);
          }}
        />
      ) : null}
      {profileOf ? (
        <Modal visible animationType="slide" onRequestClose={() => setProfileOf(null)}>
          <VybeProfile userId={profileOf} onClose={() => setProfileOf(null)} />
        </Modal>
      ) : null}
      {commentFor && state.posts.find((p) => p.id === commentFor) ? (
        <CommentsSheet
          post={state.posts.find((p) => p.id === commentFor)!}
          replyTo={replyTo}
          onReply={setReplyTo}
          onClose={() => {
            setCommentFor(null);
            setReplyTo(undefined);
          }}
          onSend={(text, to) => addComment(commentFor, text, to)}
        />
      ) : null}
      {shareFor ? (
        <ShareSheet
          onClose={() => setShareFor(null)}
          onSend={(ids) => {
            sharePost(shareFor, ids);
            setShareFor(null);
            setRipplePost(shareFor);
          }}
        />
      ) : null}
      {notesOpen ? (
        <Modal visible animationType="slide" onRequestClose={() => setNotesOpen(false)}>
          <Paper>
            <View
              style={{
                paddingTop: insets.top + 8,
                paddingHorizontal: 14,
                paddingBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Pressable onPress={() => setNotesOpen(false)} hitSlop={12} accessibilityLabel="Back">
                <IconBack size={24} />
              </Pressable>
              <Text style={[t.title, { fontSize: 18 }]}>Landed</Text>
            </View>
            <FlatList
              data={notes}
              keyExtractor={(n) => n.id}
              contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 28 }}
              renderItem={({ item }) => (
                <Card depth={1} radius={18} style={{ padding: 14, marginBottom: 10 }}>
                  <Text style={{ fontSize: 14, color: item.read ? c.inkFaint : c.ink }}>{item.text}</Text>
                  <Text style={[t.meta, { marginTop: 6 }]}>{relativeTime(item.createdAt)}</Text>
                </Card>
              )}
              ListEmptyComponent={
                <Card depth={1} radius={18} style={{ padding: 28, alignItems: "center" }}>
                  <Text style={[t.body, { textAlign: "center" }]}>Quiet for now</Text>
                </Card>
              }
            />
          </Paper>
        </Modal>
      ) : null}
      {compose ? (
        <ComposeSheet
          onClose={() => setCompose(false)}
          onPost={(data) => {
            const id = addPost({ ...data, language: detectLanguage(data.text) });
            setCompose(false);
            if (data.travel === "pass") setShareFor(id);
          }}
        />
      ) : null}
      {statusCompose ? (
        <StatusCompose
          lane="vybe"
          draft={statusDraft}
          onClose={() => {
            setStatusCompose(false);
            setStatusDraft(undefined);
          }}
        />
      ) : null}
      {youPick ? (
        <Modal visible transparent animationType="fade" onRequestClose={() => setYouPick(false)}>
          <Pressable style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" }} onPress={() => setYouPick(false)}>
            <Pressable
              onPress={() => {}}
              style={{ backgroundColor: c.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: insets.bottom + 16 }}
            >
              <Text style={[t.caps, { textAlign: "center" }]}>Your status</Text>
              <Pressable
                onPress={() => {
                  setYouPick(false);
                  setStatusDraft(undefined);
                  setStatusCompose(true);
                }}
                style={{ marginTop: 16, backgroundColor: c.paperDeep, borderRadius: 16, paddingVertical: 12, alignItems: "center" }}
              >
                <Text style={{ fontSize: 15, color: c.ink }}>Put up a status</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setYouPick(false);
                  setStatusOf(me.id);
                }}
                style={{ marginTop: 8, paddingVertical: 12, alignItems: "center" }}
              >
                <Text style={{ fontSize: 15, color: c.ink }}>See yours</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
      {editMe ? <EditSheet user={me} onClose={() => setEditMe(false)} onSave={updateMe} /> : null}
      {detailPost ? (
        <Modal visible animationType="slide" onRequestClose={() => setDetailPost(null)}>
          <VybePostDetail postId={detailPost} onClose={() => setDetailPost(null)} />
        </Modal>
      ) : null}
      {holdPost ? (
        <Modal visible transparent animationType="fade" onRequestClose={() => setHoldPost(null)}>
          <Pressable style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" }} onPress={() => setHoldPost(null)}>
            <Pressable
              onPress={() => {}}
              style={{ backgroundColor: c.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: insets.bottom + 16 }}
            >
              <Text style={[t.caps, { textAlign: "center" }]}>This vybe</Text>
              {state.posts.find((p) => p.id === holdPost)?.authorId === me.id ? (
                <>
                  <Pressable
                    onPress={() => {
                      archivePost(holdPost, true);
                      setHoldPost(null);
                    }}
                    style={{ marginTop: 16, backgroundColor: c.paperDeep, borderRadius: 16, paddingVertical: 12, alignItems: "center" }}
                  >
                    <Text style={{ fontSize: 14, color: c.ink }}>Archive</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      dropPost(holdPost);
                      setHoldPost(null);
                    }}
                    style={{ marginTop: 8, paddingVertical: 12, alignItems: "center" }}
                  >
                    <Text style={{ fontSize: 14, color: "#C0392B" }}>Delete</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  onPress={() => {
                    reportPost(holdPost);
                    setHoldPost(null);
                    if (openPost === holdPost) setOpenPost(null);
                  }}
                  style={{ marginTop: 16, paddingVertical: 12, alignItems: "center" }}
                >
                  <Text style={{ fontSize: 14, color: "#C0392B" }}>Report</Text>
                </Pressable>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </Paper>
  );
}
