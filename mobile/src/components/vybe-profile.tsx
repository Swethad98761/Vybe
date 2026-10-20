import { useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { IconBack, IconComment, IconRipple, IconStar } from "@/components/icons";
import { Card, Groove, Paper } from "@/components/surface";
import { relativeTime } from "@/lib/format";
import { pic } from "@/lib/media";
import { CommentStack } from "@/components/comment-stack";
import { NijiPaper } from "@/components/niji-paper";
import { presenceOf } from "@/lib/presence";
import { useStore } from "@/lib/store";
import { vybeStats } from "@/lib/vybe-stats";
import { publicNijiId, vybeFace } from "@/lib/identity";
import type { Audience, Expiry, Post, PresenceMode, Travel, User } from "@/lib/types";
import { TRAVELS, travelMeta } from "@/lib/tokens";
import { ShareRipple } from "@/components/share-ripple";
import { c, type as t } from "@/theme";

export function VybeProfile({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { state, me, userById, toggleFollow, updateMe, reportPost } = useStore();
  const user = userById(userId);
  const [editing, setEditing] = useState(false);
  const [openPost, setOpenPost] = useState<string | null>(null);
  if (!user) return null;

  const mine = user.id === me.id;
  const followingThem = state.following.includes(user.id);
  const stats = vybeStats(user.id, state.posts, state.following, me.id);
  const posts = state.posts.filter(
    (p) => p.authorId === user.id && !(state.reportedPostIds ?? []).includes(p.id),
  );

  return (
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
        <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Back">
          <IconBack size={24} />
        </Pressable>
        <Text style={[t.title, { fontSize: 18 }]}>{mine ? "Your vybe" : user.name}</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        <Card depth={1} radius={18} style={{ padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Avatar user={user} size={56} place="vybe" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: c.ink }}>{user.name}</Text>
              {publicNijiId(user) ? (
                <Text style={[t.meta, { marginTop: 4 }]}>{user.nijiId}</Text>
              ) : null}
              {user.city ? <Text style={[t.meta, { marginTop: 2 }]}>{user.city}</Text> : null}
            </View>
          </View>
          {user.bio ? <Text style={[t.soft, { marginTop: 12 }]}>{user.bio}</Text> : null}
          <View style={{ flexDirection: "row", marginTop: 16 }}>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: c.ink }}>{stats.vybes}</Text>
              <Text style={t.meta}>Vybes</Text>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: c.ink }}>{stats.following}</Text>
              <Text style={t.meta}>Following</Text>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: c.ink }}>{stats.followers}</Text>
              <Text style={t.meta}>Followers</Text>
            </View>
          </View>
          {mine ? (
            <Pressable
              onPress={() => setEditing(true)}
              style={{ marginTop: 14, backgroundColor: c.paperDeep, borderRadius: 16, paddingVertical: 11, alignItems: "center" }}
            >
              <Text style={{ fontSize: 14, color: c.ink }}>Edit profile</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => toggleFollow(user.id)}
              style={{
                marginTop: 14,
                backgroundColor: followingThem ? c.paperDeep : c.ink,
                borderRadius: 16,
                paddingVertical: 11,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, color: followingThem ? c.ink : c.card }}>
                {followingThem ? "Following" : "Follow"}
              </Text>
            </Pressable>
          )}
          {!mine ? (
            <Pressable
              onPress={() => {
                posts.forEach((p) => reportPost(p.id));
                onClose();
              }}
              style={{ marginTop: 8, paddingVertical: 10, alignItems: "center" }}
            >
              <Text style={{ fontSize: 13, color: c.inkFaint }}>Report</Text>
            </Pressable>
          ) : null}
        </Card>

        <Text style={[t.caps, { marginTop: 22, marginBottom: 8, marginLeft: 4 }]}>
          {mine ? "Your vybes" : `${user.name.split(" ")[0]}'s vybes`}
        </Text>
        {posts.length === 0 ? (
          <Text style={[t.soft, { textAlign: "center", paddingVertical: 28 }]}>No vybes on this paper yet.</Text>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
            {posts.map((post) => (
              <Pressable
                key={post.id}
                onPress={() => setOpenPost(post.id)}
                onLongPress={() => reportPost(post.id)}
                style={{ width: "32.2%" }}
              >
                <VybeTile post={post} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      {editing && mine ? <EditSheet user={user} onClose={() => setEditing(false)} onSave={updateMe} /> : null}
      {openPost ? (
        <Modal visible animationType="slide" onRequestClose={() => setOpenPost(null)}>
          <VybePostDetail postId={openPost} onClose={() => setOpenPost(null)} />
        </Modal>
      ) : null}
    </Paper>
  );
}

function VybeTile({ post }: { post: Post }) {
  const image = pic(post.image);
  return (
    <View style={{ aspectRatio: 1, borderRadius: 8, overflow: "hidden", backgroundColor: c.paperDeep }}>
      {image ? (
        <Image source={image} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
      ) : (
        <View style={{ flex: 1, padding: 6 }}>
          <Text numberOfLines={4} style={{ color: c.ink, fontSize: 11 }}>
            {post.text}
          </Text>
        </View>
      )}
    </View>
  );
}

export function VybePostDetail({ postId, onClose }: { postId: string; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { state, me, userById, toggleLike, addComment, sharePost } = useStore();
  const post = state.posts.find((p) => p.id === postId);
  const author = post ? userById(post.authorId) : undefined;
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | undefined>();
  const [shareOpen, setShareOpen] = useState(false);
  const [rippling, setRippling] = useState(false);
  if (!post || !author) return null;
  const liked = post.likedBy.includes(me.id);
  const image = pic(post.image);

  return (
    <Paper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
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
        <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Back">
          <IconBack size={24} />
        </Pressable>
        <Text style={[t.title, { fontSize: 18 }]}>{author.name}</Text>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={{ borderRadius: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <Avatar user={author} size={36} place="vybe" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink }}>{author.name}</Text>
              <Text style={t.meta}>
                {relativeTime(post.createdAt)}
                {post.location ? ` · ${post.location}` : ""}
              </Text>
            </View>
          </View>
          {image ? (
            <Image source={image} style={{ width: "100%", aspectRatio: 4 / 5, borderRadius: 18 }} resizeMode="cover" />
          ) : null}
          {post.text ? (
            <Text style={[t.body, { marginTop: image ? 12 : 4, color: image ? c.inkSoft : c.ink }]}>{post.text}</Text>
          ) : null}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 22, marginTop: 14 }}>
            <Pressable onPress={() => toggleLike(post.id)} accessibilityLabel="Star">
              <IconStar size={24} color={liked ? c.ink : c.inkFaint} fill={liked} />
            </Pressable>
            <IconComment size={24} color={post.comments.length ? c.ink : c.inkFaint} heavy={post.comments.length > 0} />
            <Pressable onPress={() => setShareOpen(true)} accessibilityLabel="Share">
              <ShareRipple play={rippling} onDone={() => setRippling(false)}>
                <IconRipple size={24} color={c.inkFaint} />
              </ShareRipple>
            </Pressable>
          </View>
        </View>

        <Text style={[t.caps, { marginTop: 22, marginBottom: 8 }]}>Comments</Text>
        {post.comments.length === 0 ? (
          <Text style={[t.soft, { textAlign: "center", paddingVertical: 20 }]}>Be the first.</Text>
        ) : (
          <CommentStack comments={post.comments} onReply={setReplyTo} />
        )}
      </ScrollView>
      <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: insets.bottom + 12 }}>
        {replyTo ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={t.meta}>
              Reply to {vybeFace(userById(post.comments.find((c) => c.id === replyTo)?.authorId ?? ""))}
            </Text>
            <Pressable onPress={() => setReplyTo(undefined)}>
              <Text style={t.meta}>Cancel</Text>
            </Pressable>
          </View>
        ) : null}
        <Groove style={{ paddingHorizontal: 14, height: 44, flexDirection: "row", alignItems: "center" }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={replyTo ? "Your reply..." : "Add a comment..."}
            placeholderTextColor={c.inkGhost}
            style={{ flex: 1, fontSize: 15, color: c.ink }}
            onSubmitEditing={() => {
              if (!text.trim()) return;
              addComment(post.id, text.trim(), replyTo);
              setText("");
              setReplyTo(undefined);
            }}
          />
          {text.trim() ? (
            <Pressable
              onPress={() => {
                addComment(post.id, text.trim(), replyTo);
                setText("");
                setReplyTo(undefined);
              }}
            >
              <Text style={{ fontSize: 14, color: c.ink }}>Post</Text>
            </Pressable>
          ) : null}
        </Groove>
      </View>
      </KeyboardAvoidingView>
      {shareOpen ? (
        <ShareSheet
          onClose={() => setShareOpen(false)}
          onSend={(ids) => {
            sharePost(post.id, ids);
            setShareOpen(false);
            setRippling(true);
          }}
        />
      ) : null}
    </Paper>
  );
}

const PRESENCE: { id: PresenceMode; label: string }[] = [
  { id: "around", label: "Around" },
  { id: "quiet", label: "Quiet" },
  { id: "ghost", label: "Ghost" },
];

export function EditSheet({
  user,
  onClose,
  onSave,
}: {
  user: User;
  onClose: () => void;
  onSave: (patch: Partial<Pick<User, "name" | "bio" | "city" | "showNijiId" | "verified" | "papersLooked" | "postAs">>) => void;
}) {
  const insets = useSafeAreaInsets();
  const { state, me, setPresence, updateMe } = useStore();
  const mode = presenceOf(state);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [city, setCity] = useState(user.city);
  const [showId, setShowId] = useState(Boolean(user.showNijiId));
  const [postAs, setPostAs] = useState<"name" | "nijiId">(user.postAs === "nijiId" ? "nijiId" : "name");
  const [paper, setPaper] = useState(false);
  const [idShot, setIdShot] = useState<string | null>(null);
  const [faceShot, setFaceShot] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);

  async function pickShot(into: (src: string) => void) {
    try {
      const ImagePicker = await import("expo-image-picker");
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
        base64: true,
      });
      const asset = result.assets?.[0];
      if (result.canceled || !asset) return;
      if (asset.base64) into(`data:image/jpeg;base64,${asset.base64}`);
      else if (asset.uri) into(asset.uri);
    } catch {
      /* Expo Go without the module */
    }
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={paper ? () => setPaper(false) : onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.28)" }} onPress={onClose} />
        <View
          style={{
            backgroundColor: c.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingTop: 18,
            paddingBottom: insets.bottom + 18,
            maxHeight: "88%",
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{ paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false}
          >
          <Text style={[t.caps, { textAlign: "center" }]}>Edit vybe</Text>
          <Text style={[t.caps, { marginTop: 16 }]}>Name</Text>
          <Groove style={{ marginTop: 8, paddingHorizontal: 14, height: 44, justifyContent: "center" }}>
            <TextInput value={name} onChangeText={(v) => setName(v.slice(0, 32))} style={{ fontSize: 16, color: c.ink }} />
          </Groove>
          {user.id === me.id ? (
            <View style={{ marginTop: 16, backgroundColor: c.paperDeep, borderRadius: 16, padding: 14 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink }}>Verification</Text>
              <Text style={[t.soft, { marginTop: 6 }]}>
                {user.verified
                  ? "Looked at. A silver ring sits on your face. Papers left this phone — Niji does not keep them. Ask again if the papers changed."
                  : "A government copy, and a photo of your face holding that copy. A person looks. Then both pictures leave this phone — they never sit in Niji."}
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                <Pressable
                  onPress={() => void pickShot(setIdShot)}
                  style={{
                    flex: 1,
                    height: 112,
                    borderRadius: 16,
                    overflow: "hidden",
                    backgroundColor: c.card,
                    justifyContent: "center",
                  }}
                >
                  {idShot ? (
                    <Image source={{ uri: idShot }} style={{ width: "100%", height: "100%" }} />
                  ) : (
                    <Text style={{ fontSize: 13, color: c.inkSoft, paddingHorizontal: 12 }}>Govt copy</Text>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => void pickShot(setFaceShot)}
                  style={{
                    flex: 1,
                    height: 112,
                    borderRadius: 16,
                    overflow: "hidden",
                    backgroundColor: c.card,
                    justifyContent: "center",
                  }}
                >
                  {faceShot ? (
                    <Image source={{ uri: faceShot }} style={{ width: "100%", height: "100%" }} />
                  ) : (
                    <Text style={{ fontSize: 13, color: c.inkSoft, paddingHorizontal: 12 }}>Face with ID</Text>
                  )}
                </Pressable>
              </View>
              <Pressable
                disabled={!idShot || !faceShot || looking}
                onPress={() => {
                  setLooking(true);
                  setTimeout(() => {
                    updateMe({ verified: true, papersLooked: true });
                    setIdShot(null);
                    setFaceShot(null);
                    setLooking(false);
                  }, 1100);
                }}
                style={{
                  marginTop: 12,
                  backgroundColor: c.ink,
                  borderRadius: 16,
                  paddingVertical: 11,
                  alignItems: "center",
                  opacity: !idShot || !faceShot || looking ? 0.3 : 1,
                }}
              >
                <Text style={{ color: c.card, fontSize: 14, fontWeight: "600" }}>
                  {looking ? "Looking" : user.verified ? "Again" : "Look"}
                </Text>
              </Pressable>
            </View>
          ) : null}
          {user.id === me.id ? (
            <View style={{ marginTop: 16 }}>
              <Text style={t.caps}>Niji ID</Text>
              <Text style={{ marginTop: 6, fontSize: 15, fontWeight: "600", color: c.ink }}>{user.nijiId}</Text>
              <Pressable
                onPress={() => setPaper(true)}
                style={{
                  marginTop: 12,
                  backgroundColor: c.paperDeep,
                  borderRadius: 16,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 14, color: c.ink }}>Share this paper</Text>
              </Pressable>
              <Text style={[t.meta, { marginTop: 8 }]}>
                A scan on the mountain paper finds you. The ID stays on this phone unless you share it.
              </Text>
            </View>
          ) : null}
          <Text style={[t.caps, { marginTop: 12 }]}>Bio</Text>
          <Groove style={{ marginTop: 8, paddingHorizontal: 14, paddingVertical: 10 }}>
            <TextInput
              value={bio}
              onChangeText={(v) => setBio(v.slice(0, 140))}
              multiline
              style={{ fontSize: 16, color: c.ink, minHeight: 72 }}
            />
          </Groove>
          <Text style={[t.caps, { marginTop: 12 }]}>City</Text>
          <Groove style={{ marginTop: 8, paddingHorizontal: 14, height: 44, justifyContent: "center" }}>
            <TextInput value={city} onChangeText={(v) => setCity(v.slice(0, 32))} style={{ fontSize: 16, color: c.ink }} />
          </Groove>
          {user.id === me.id ? (
            <>
              <Text style={[t.caps, { marginTop: 16 }]}>On Vybe</Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                {PRESENCE.map((p) => {
                  const on = mode === p.id;
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => setPresence(p.id)}
                      style={{
                        flex: 1,
                        borderRadius: 16,
                        paddingVertical: 9,
                        alignItems: "center",
                        backgroundColor: on ? c.ink : c.paperDeep,
                      }}
                    >
                      <Text style={{ fontSize: 13, color: on ? c.card : c.inkSoft }}>{p.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable
                onPress={() => setShowId((v) => !v)}
                style={{
                  marginTop: 12,
                  backgroundColor: c.paperDeep,
                  borderRadius: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 14, color: c.ink, flex: 1, paddingRight: 12 }}>Show Niji ID on Vybe</Text>
                <View
                  style={{
                    width: 40,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: showId ? c.ink : "#C8C8CC",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: "#fff",
                      marginLeft: showId ? 18 : 2,
                    }}
                  />
                </View>
              </Pressable>
              <Text style={[t.meta, { marginTop: 8 }]}>
                The ID is an address. Hide it if you don’t want strangers to search you.
              </Text>
              <Text style={[t.caps, { marginTop: 16 }]}>Post as</Text>
              <Text style={[t.meta, { marginTop: 4 }]}>How your vybes and comments are signed.</Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                {(["name", "nijiId"] as const).map((id) => {
                  const on = postAs === id;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => setPostAs(id)}
                      style={{
                        flex: 1,
                        borderRadius: 16,
                        paddingVertical: 9,
                        alignItems: "center",
                        backgroundColor: on ? c.ink : c.paperDeep,
                      }}
                    >
                      <Text style={{ fontSize: 13, color: on ? c.card : c.inkSoft }}>
                        {id === "name" ? "Name" : "Niji ID"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}
          <Pressable
            onPress={() => {
              onSave({
                name: name.trim() || user.name,
                bio: bio.trim(),
                city: city.trim(),
                showNijiId: showId,
                postAs,
              });
              onClose();
            }}
            style={{
              marginTop: 18,
              backgroundColor: c.ink,
              borderRadius: 16,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: c.card, fontSize: 14, fontWeight: "600" }}>Save</Text>
          </Pressable>
          </ScrollView>
        </View>
        {paper ? (
          <View style={StyleSheet.absoluteFill}>
            <NijiPaper nijiId={user.nijiId} name={name || user.name} onClose={() => setPaper(false)} />
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

export function ShareSheet({ onClose, onSend }: { onClose: () => void; onSend: (ids: string[]) => void }) {
  const insets = useSafeAreaInsets();
  const { state, me } = useStore();
  const [picked, setPicked] = useState<string[]>([]);
  const people = state.users.filter((u) => u.id !== me.id && u.id !== "mist" && !u.id.startsWith("veil-"));

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.28)" }} onPress={onClose} />
        <View
          style={{
            backgroundColor: c.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: insets.bottom + 18,
          }}
        >
        <Text style={[t.caps, { textAlign: "center" }]}>Share to chat</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
          {people.map((u) => {
            const on = picked.includes(u.id);
            return (
              <Pressable
                key={u.id}
                onPress={() => setPicked((p) => (on ? p.filter((x) => x !== u.id) : [...p, u.id]))}
                style={{ width: 68, alignItems: "center", marginRight: 10 }}
              >
                <View style={{ borderRadius: 28, borderWidth: on ? 2 : 0, borderColor: c.ink, padding: 2 }}>
                  <Avatar user={u} size={48} />
                </View>
                <Text style={[t.meta, { marginTop: 6 }]} numberOfLines={1}>
                  {u.name.split(" ")[0]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable
          onPress={() => {
            if (!picked.length) return;
            onSend(picked);
          }}
          style={{
            marginTop: 18,
            backgroundColor: picked.length ? c.ink : "#C8C8CC",
            borderRadius: 16,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: c.card, fontSize: 14, fontWeight: "600" }}>Send</Text>
        </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function CommentsSheet({
  post,
  replyTo,
  onReply,
  onClose,
  onSend,
}: {
  post: Post;
  replyTo?: string;
  onReply?: (id?: string) => void;
  onClose: () => void;
  onSend: (text: string, replyTo?: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { userById } = useStore();
  const [text, setText] = useState("");
  const parent = replyTo ? post.comments.find((c) => c.id === replyTo) : undefined;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "flex-end" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.28)" }} onPress={onClose} />
        <View
          style={{
            backgroundColor: c.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: "78%",
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: insets.bottom + 18,
          }}
        >
        <Text style={[t.caps, { textAlign: "center" }]}>Comments</Text>
        <ScrollView keyboardShouldPersistTaps="handled" style={{ marginTop: 14 }} showsVerticalScrollIndicator={false}>
          {post.comments.length === 0 ? (
            <Text style={[t.soft, { textAlign: "center", paddingVertical: 28 }]}>Be the first.</Text>
          ) : (
            <CommentStack comments={post.comments} onReply={onReply} />
          )}
        </ScrollView>
        {parent ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
            <Text style={t.meta}>Reply to {vybeFace(userById(parent.authorId))}</Text>
            <Pressable onPress={() => onReply?.(undefined)}>
              <Text style={t.meta}>Cancel</Text>
            </Pressable>
          </View>
        ) : null}
        <Groove style={{ marginTop: 10, paddingHorizontal: 14, height: 44, flexDirection: "row", alignItems: "center" }}>
          <TextInput
            value={text}
            onChangeText={setText}
            autoFocus={Boolean(replyTo)}
            placeholder={parent ? "Your reply..." : "Add a comment..."}
            placeholderTextColor={c.inkGhost}
            style={{ flex: 1, fontSize: 15, color: c.ink }}
          />
          {text.trim() ? (
            <Pressable
              onPress={() => {
                onSend(text.trim(), replyTo);
                setText("");
                onReply?.(undefined);
              }}
            >
              <Text style={{ fontSize: 14, color: c.ink }}>Post</Text>
            </Pressable>
          ) : null}
        </Groove>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function ComposeSheet({
  onClose,
  onPost,
}: {
  onClose: () => void;
  onPost: (data: { text: string; image?: string; audience: Audience; expiry: Expiry; travel: Travel }) => void;
}) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [image, setImage] = useState<string>();
  const [travel, setTravel] = useState<Travel>("hold");
  const { audience, expiry } = travelMeta(travel);
  const images = [
    "/media/posts/night-city.jpg",
    "/media/posts/coffee.jpg",
    "/media/posts/road.jpg",
    "/media/posts/desert.jpg",
  ];
  const canPost = Boolean(text.trim() || image);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.28)" }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View
          style={{
            backgroundColor: c.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: insets.bottom + 16,
            maxHeight: "88%",
            overflow: "hidden",
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={[t.caps, { textAlign: "center" }]}>What is your vybe?</Text>
            <Text style={[t.caps, { marginTop: 16 }]}>Photo</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              {images.map((src) => (
                <Pressable
                  key={src}
                  onPress={() => setImage(src === image ? undefined : src)}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    borderRadius: 10,
                    overflow: "hidden",
                    borderWidth: image === src ? 1 : 0,
                    borderColor: c.ink,
                  }}
                >
                  <Image source={pic(src)} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                </Pressable>
              ))}
            </View>
            <Text style={[t.caps, { marginTop: 16 }]}>A note</Text>
            <Groove style={{ marginTop: 10, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 }}>
              <TextInput
                value={text}
                onChangeText={setText}
                maxLength={300}
                placeholder="A line is a vybe. Photo is extra."
                placeholderTextColor={c.inkGhost}
                multiline
                style={{ minHeight: 72, fontSize: 16, color: c.ink }}
              />
            </Groove>
            <Text style={[t.caps, { marginTop: 16 }]}>How it travels</Text>
            <Text style={[t.soft, { marginTop: 6 }]}>
              Other apps keep it forever, for everyone. Here you hold it, pass it, or let it fade.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {TRAVELS.map((item) => {
                const on = travel === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setTravel(item.id)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 16,
                      backgroundColor: on ? c.ink : c.paperDeep,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: on ? c.card : c.inkSoft }}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[t.soft, { marginTop: 8 }]}>{TRAVELS.find((item) => item.id === travel)?.hint}</Text>
            <Pressable
              disabled={!canPost}
              onPress={() => onPost({ text: text.trim(), image, audience, expiry, travel })}
              style={{
                marginTop: 18,
                backgroundColor: canPost ? c.ink : "#C8C8CC",
                borderRadius: 16,
                paddingVertical: 13,
                alignItems: "center",
              }}
            >
              <Text style={{ color: c.card, fontSize: 14, fontWeight: "600" }}>Post Vybe</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
