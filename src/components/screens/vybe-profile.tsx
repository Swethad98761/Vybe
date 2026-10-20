"use client";

import { useEffect, useRef, useState } from "react";
import { CommentStack } from "@/components/niji/comment-stack";
import { NijiPaper } from "@/components/niji/niji-paper";
import { Person } from "@/components/niji/person";
import { Groove, Raised } from "@/components/niji/chrome";
import { IconComment, IconRipple, IconStar } from "@/components/niji/icons";
import { ShareRipple } from "@/components/niji/share-ripple";
import { relativeTime } from "@/lib/format";
import { presenceOf } from "@/lib/presence";
import { useStore } from "@/lib/store";
import { vybeStats } from "@/lib/vybe-stats";
import { publicNijiId, vybeFace } from "@/lib/identity";
import type { Post, PresenceMode, User } from "@/lib/types";
import { useShellOverlay } from "@/components/web/shell-overlay";

export function VybeProfile({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const { state, me, userById, toggleFollow, updateMe, dropPost, archivePost, reportPost } = useStore();
  const user = userById(userId);
  const [editing, setEditing] = useState(false);
  const [openPost, setOpenPost] = useState<string | null>(null);
  const [holdPost, setHoldPost] = useState<string | null>(null);
  const overlay = useShellOverlay("z-40 flex flex-col overflow-hidden bg-paper");
  if (!user) return null;

  const mine = user.id === me.id;
  const followingThem = state.following.includes(user.id);
  const stats = vybeStats(user.id, state.posts, state.following, me.id);
  const posts = state.posts.filter(
    (p) => p.authorId === user.id && !p.archived && !(state.reportedPostIds ?? []).includes(p.id),
  );

  return (
    <div className={overlay}>
      <header className="flex items-center gap-2 px-3 py-3">
        <button type="button" onClick={onClose} className="px-1 text-xl text-neutral-500" aria-label="Back">
          ‹
        </button>
        <p className="text-[17px] font-medium">{mine ? "Your vybe" : user.name}</p>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
        <Raised className="px-4 py-4">
          <div className="flex items-center gap-4">
            <Person user={user} size="lg" place="vybe" />
            <div className="min-w-0">
              <p className="text-[16px] font-medium text-[#17171A]">
                {user.name}
              </p>
              {publicNijiId(user) ? (
                <p className="text-[13px] text-[#9B9AA0]">{user.nijiId}</p>
              ) : null}
              {user.city ? <p className="mt-1 text-[12px] text-[#9B9AA0]">{user.city}</p> : null}
            </div>
          </div>
          {user.bio ? <p className="mt-3 text-[14px] text-[#65656B]">{user.bio}</p> : null}
          <div className="mt-5 grid grid-cols-3 text-center text-[13px]">
            <div>
              <p className="text-lg font-semibold text-[#17171A]">{stats.vybes}</p>
              <p className="text-[#9B9AA0]">Vybes</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-[#17171A]">{stats.following}</p>
              <p className="text-[#9B9AA0]">Following</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-[#17171A]">{stats.followers}</p>
              <p className="text-[#9B9AA0]">Followers</p>
            </div>
          </div>
          {mine ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-4 w-full rounded-2xl bg-[#EFEFF1] py-2.5 text-[14px] text-[#17171A]"
            >
              Edit profile
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toggleFollow(user.id)}
              className={`mt-4 w-full rounded-2xl py-2.5 text-[14px] ${
                followingThem ? "bg-[#EFEFF1] text-[#17171A]" : "bg-[#17171A] text-[#F7F7F8]"
              }`}
            >
              {followingThem ? "Following" : "Follow"}
            </button>
          )}
          {!mine ? (
            <button
              type="button"
              className="mt-2 w-full py-2 text-[13px] text-[#9B9AA0]"
              onClick={() => {
                posts.forEach((p) => reportPost(p.id));
                onClose();
              }}
            >
              Report
            </button>
          ) : null}
        </Raised>

        <p className="mt-5 mb-2 px-1 text-[10px] tracking-caps uppercase text-[#9B9AA0]">
          {mine ? "Your vybes" : `${user.name.split(" ")[0]}'s vybes`}
        </p>
        {posts.length === 0 ? (
          <p className="px-2 py-10 text-center text-[13px] text-[#9B9AA0]">No vybes on this paper yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setOpenPost(post.id)}
                data-vybe-tile={post.id}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setHoldPost(post.id);
                }}
                className="text-left"
              >
                <VybeTile post={post} />
              </button>
            ))}
          </div>
        )}
      </div>

      {editing && mine ? <EditSheet user={user} onClose={() => setEditing(false)} onSave={updateMe} /> : null}
      {openPost ? <VybePostDetail postId={openPost} onClose={() => setOpenPost(null)} /> : null}
      {holdPost ? (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setHoldPost(null)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#F7F7F8] p-5" onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">This vybe</p>
            {mine ? (
              <>
                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-[#EFEFF1] py-3 text-[14px]"
                  onClick={() => {
                    archivePost(holdPost, true);
                    setHoldPost(null);
                  }}
                >
                  Archive
                </button>
                <button
                  type="button"
                  className="mt-2 w-full rounded-2xl py-3 text-[14px] text-[#C0392B]"
                  onClick={() => {
                    dropPost(holdPost);
                    setHoldPost(null);
                  }}
                >
                  Delete
                </button>
              </>
            ) : (
              <button
                type="button"
                className="mt-4 w-full rounded-2xl py-3 text-[14px] text-[#C0392B]"
                onClick={() => {
                  reportPost(holdPost);
                  setHoldPost(null);
                }}
              >
                Report
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function VybeTile({ post }: { post: Post }) {
  return (
    <div className="aspect-square overflow-hidden rounded-lg bg-[#E1E1E3]">
      {post.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image} alt="" className="size-full object-cover" />
      ) : (
        <p className="line-clamp-4 p-2 text-[11px] text-[#17171A]">{post.text}</p>
      )}
    </div>
  );
}

export function VybePostDetail({ postId, onClose }: { postId: string; onClose: () => void }) {
  const { state, me, userById, toggleLike, addComment, sharePost } = useStore();
  const post = state.posts.find((p) => p.id === postId);
  const author = post ? userById(post.authorId) : undefined;
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | undefined>();
  const [shareOpen, setShareOpen] = useState(false);
  const [sharedRipple, setSharedRipple] = useState(false);
  const [kbPad, setKbPad] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => setKbPad(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, []);

  useEffect(() => {
    if (!replyTo) return;
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ block: "nearest" });
  }, [replyTo]);

  const overlay = useShellOverlay("z-50 flex flex-col overflow-hidden bg-paper");
  if (!post || !author) return null;
  const liked = post.likedBy.includes(me.id);

  return (
    <div className={overlay}>
      <header className="flex items-center gap-2 px-3 py-3">
        <button type="button" onClick={onClose} className="px-1 text-xl text-neutral-500" aria-label="Back">
          ‹
        </button>
        <p className="text-[17px] font-medium">{author.name}</p>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-4">
        <div className="overflow-hidden rounded-[18px]">
          <div className="mb-3 flex items-center gap-3">
            <Person user={author} size="sm" place="vybe" />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium">{author.name}</p>
              <p className="text-[11px] text-[#9B9AA0]">
                {relativeTime(post.createdAt)}
                {post.location ? ` · ${post.location}` : ""}
              </p>
            </div>
          </div>
          {post.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.image} alt="" className="aspect-[4/5] w-full rounded-[18px] object-cover" />
          ) : null}
          {post.text ? (
            <p className={`text-[15px] leading-6 text-[#65656B] ${post.image ? "mt-3" : "mt-1"}`}>{post.text}</p>
          ) : null}
          <div className="mt-3 flex items-center gap-5 text-[#9B9AA0]">
            <button
              type="button"
              onClick={() => toggleLike(post.id)}
              className={`inline-flex size-6 items-center justify-center ${liked ? "text-[#17171A]" : ""}`}
              aria-label="Star"
            >
              <IconStar filled={liked} className="size-6" />
            </button>
            <span
              className={`inline-flex size-6 items-center justify-center ${
                post.comments.length ? "text-[#17171A]" : "text-[#9B9AA0]"
              }`}
            >
              <IconComment heavy={post.comments.length > 0} className="size-6" />
            </span>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              aria-label="Share"
              className="inline-flex size-6 items-center justify-center"
            >
              <ShareRipple play={sharedRipple} onDone={() => setSharedRipple(false)}>
                <IconRipple className="size-6" />
              </ShareRipple>
            </button>
          </div>
        </div>

        <p className="mt-6 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Comments</p>
        <div className="mt-3">
          {post.comments.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#9B9AA0]">Be the first.</p>
          ) : (
            <CommentStack comments={post.comments} onReply={setReplyTo} />
          )}
        </div>
      </div>
      <div className="shrink-0 px-4 pt-2" style={{ paddingBottom: kbPad > 0 ? kbPad + 10 : 16 }}>
        {replyTo ? (
          <div className="mb-2 flex items-center justify-between text-[12px] text-[#65656B]">
            <p>Reply to {vybeFace(userById(post.comments.find((c) => c.id === replyTo)?.authorId ?? ""))}</p>
            <button type="button" onClick={() => setReplyTo(undefined)}>
              Cancel
            </button>
          </div>
        ) : null}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            addComment(post.id, text.trim(), replyTo);
            setText("");
            setReplyTo(undefined);
          }}
        >
          <Groove className="flex flex-1 items-center">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => inputRef.current?.scrollIntoView({ block: "nearest" })}
              placeholder={replyTo ? "Your reply..." : "Add a comment..."}
              className="h-10 w-full bg-transparent text-sm text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
            />
          </Groove>
          {text ? (
            <button type="submit" className="text-sm font-medium">
              Post
            </button>
          ) : null}
        </form>
      </div>
      {shareOpen ? (
        <ShareSheet
          onClose={() => setShareOpen(false)}
          onSend={(ids) => {
            sharePost(post.id, ids);
            setShareOpen(false);
            setSharedRipple(true);
          }}
        />
      ) : null}
    </div>
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

  function pickFile(into: (src: string) => void) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => into(String(reader.result));
      reader.readAsDataURL(file);
    };
    input.click();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={() => { if (!paper) onClose(); }}>
      <div
        className="absolute inset-x-0 bottom-0 max-h-[92%] overflow-y-auto rounded-t-[28px] bg-[#F7F7F8] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">Edit vybe</p>
        <label className="mt-4 block">
          <span className="text-[10px] tracking-caps uppercase text-[#9B9AA0]">Name</span>
          <Groove className="mt-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 32))}
              className="h-11 w-full bg-transparent text-[16px] text-[#17171A] outline-none"
            />
          </Groove>
        </label>
        {user.id === me.id ? (
          <div className="mt-4 rounded-2xl bg-[#EFEFF1] p-4">
            <p className="text-[15px] font-medium text-[#17171A]">Verification</p>
            <p className="mt-1.5 text-[13px] leading-5 text-[#65656B]">
              {user.verified
                ? "Looked at. A silver ring sits on your face. Papers left this phone — Niji does not keep them. Ask again if the papers changed."
                : "A government copy, and a photo of your face holding that copy. A person looks. Then both pictures leave this phone — they never sit in Niji."}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => pickFile(setIdShot)}
                className="overflow-hidden rounded-2xl bg-[#F7F7F8] text-left"
              >
                {idShot ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={idShot} alt="" className="h-28 w-full object-cover" />
                ) : (
                  <span className="flex h-28 items-center px-3 text-[13px] text-[#65656B]">Govt copy</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => pickFile(setFaceShot)}
                className="overflow-hidden rounded-2xl bg-[#F7F7F8] text-left"
              >
                {faceShot ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={faceShot} alt="" className="h-28 w-full object-cover" />
                ) : (
                  <span className="flex h-28 items-center px-3 text-[13px] text-[#65656B]">Face with ID</span>
                )}
              </button>
            </div>
            <button
              type="button"
              disabled={!idShot || !faceShot || looking}
              onClick={() => {
                setLooking(true);
                window.setTimeout(() => {
                  updateMe({ verified: true, papersLooked: true });
                  setIdShot(null);
                  setFaceShot(null);
                  setLooking(false);
                }, 1100);
              }}
              className="mt-3 w-full rounded-2xl bg-[#17171A] py-2.5 text-[14px] text-[#F7F7F8] disabled:opacity-30"
            >
              {looking ? "Looking" : user.verified ? "Again" : "Look"}
            </button>
          </div>
        ) : null}
        {user.id === me.id ? (
          <div className="mt-4">
            <p className="text-[10px] tracking-caps uppercase text-[#9B9AA0]">Niji ID</p>
            <p className="mt-1 text-[15px] font-medium text-[#17171A]">{user.nijiId}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPaper(true);
              }}
              className="mt-3 w-full rounded-2xl bg-[#EFEFF1] py-3 text-[14px] text-[#17171A]"
            >
              Share this paper
            </button>
            <p className="mt-2 text-[12px] text-[#9B9AA0]">
              A scan on the Namaskaram paper finds you. The ID stays on this phone unless you copy it.
            </p>
          </div>
        ) : null}
        <label className="mt-3 block">
          <span className="text-[10px] tracking-caps uppercase text-[#9B9AA0]">Bio</span>
          <Groove className="mt-2 py-2">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 140))}
              className="h-20 w-full resize-none bg-transparent text-[16px] text-[#17171A] outline-none"
            />
          </Groove>
        </label>
        <label className="mt-3 block">
          <span className="text-[10px] tracking-caps uppercase text-[#9B9AA0]">City</span>
          <Groove className="mt-2">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value.slice(0, 32))}
              className="h-11 w-full bg-transparent text-[16px] text-[#17171A] outline-none"
            />
          </Groove>
        </label>
        {user.id === me.id ? (
          <div className="mt-4">
            <p className="text-[10px] tracking-caps uppercase text-[#9B9AA0]">On Vybe</p>
            <div className="mt-2 flex gap-2">
              {PRESENCE.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPresence(p.id)}
                  className={`flex-1 rounded-2xl px-2 py-2 text-[13px] ${
                    mode === p.id ? "bg-[#17171A] text-[#F7F7F8]" : "bg-[#EFEFF1] text-[#65656B]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowId((v) => !v)}
              className="mt-3 flex w-full items-center justify-between rounded-2xl bg-[#EFEFF1] px-4 py-3"
            >
              <span className="text-left text-[14px] text-[#17171A]">Show Niji ID on Vybe</span>
              <span className={`h-6 w-10 rounded-full ${showId ? "bg-[#17171A]" : "bg-[#C8C8CC]"}`}>
                <span className={`block size-5 rounded-full bg-white transition ${showId ? "translate-x-4" : "translate-x-0.5"}`} />
              </span>
            </button>
            <p className="mt-2 text-[12px] text-[#9B9AA0]">
              The ID is an address. Hide it if you don’t want strangers to search you.
            </p>
            <p className="mt-3 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Post as</p>
            <p className="mt-1 text-[12px] text-[#9B9AA0]">How your vybes and comments are signed.</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setPostAs("name")}
                className={`flex-1 rounded-2xl px-2 py-2 text-[13px] ${
                  postAs === "name" ? "bg-[#17171A] text-[#F7F7F8]" : "bg-[#EFEFF1] text-[#65656B]"
                }`}
              >
                Name
              </button>
              <button
                type="button"
                onClick={() => setPostAs("nijiId")}
                className={`flex-1 rounded-2xl px-2 py-2 text-[13px] ${
                  postAs === "nijiId" ? "bg-[#17171A] text-[#F7F7F8]" : "bg-[#EFEFF1] text-[#65656B]"
                }`}
              >
                Niji ID
              </button>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => {
            onSave({
              name: name.trim() || user.name,
              bio: bio.trim(),
              city: city.trim(),
              showNijiId: showId,
              postAs,
            });
            onClose();
          }}
          className="mt-5 mb-3 w-full rounded-2xl bg-[#17171A] py-3 text-[14px] font-medium text-[#F7F7F8]"
        >
          Save
        </button>
      </div>
      {paper ? <NijiPaper nijiId={user.nijiId} name={name || user.name} onClose={() => setPaper(false)} /> : null}
    </div>
  );
}

function ShareSheet({ onClose, onSend }: { onClose: () => void; onSend: (ids: string[]) => void }) {
  const { state, me } = useStore();
  const [picked, setPicked] = useState<string[]>([]);
  const people = state.users.filter((u) => u.id !== me.id && u.id !== "mist" && !u.id.startsWith("veil-"));
  return (
    <div className="fixed inset-0 z-[60] bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#F7F7F8] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">Share to chat</p>
        <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
          {people.map((u) => {
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
