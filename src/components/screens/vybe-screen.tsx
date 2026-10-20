"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { detectLanguage, relativeTime } from "@/lib/format";
import { useHorizontalPager } from "@/lib/pager";
import { hasFreshPulse, hasPulse, presenceOf } from "@/lib/presence";
import { useStore } from "@/lib/store";
import { Person } from "@/components/niji/person";
import { Chip, Groove, Raised } from "@/components/niji/chrome";
import {
  IconAccount,
  IconBell,
  IconComment,
  IconExplore,
  IconHome,
  IconPlus,
  IconRipple,
  IconStar,
  IconVybeChat,
} from "@/components/niji/icons";
import type { Audience, Expiry, Post, Travel } from "@/lib/types";
import { TRAVELS, travelMeta } from "@/lib/tokens";
import { ShareRipple } from "@/components/niji/share-ripple";
import { CommentStack } from "@/components/niji/comment-stack";
import { EditSheet, VybePostDetail, VybeProfile } from "@/components/screens/vybe-profile";
import { StatusCompose, type StatusDraft } from "@/components/screens/status-compose";
import { StatusViewer } from "@/components/screens/status-viewer";
import { VybeChatPane } from "@/components/screens/vybe-chat";
import { givenName, storyFriends, vybeStats } from "@/lib/vybe-stats";
import { publicNijiId, vybeFace } from "@/lib/identity";
import { useShellOverlay } from "@/components/web/shell-overlay";

const VYBE_TABS = [
  { id: "feed", label: "Home", Icon: IconHome },
  { id: "discover", label: "Explore", Icon: IconExplore },
  { id: "chat", label: "Vybe chat", Icon: IconVybeChat },
  { id: "me", label: "Vybe account", Icon: IconAccount },
] as const;

type VybeTab = (typeof VYBE_TABS)[number]["id"];

function rotate<T>(items: T[], salt: number) {
  if (!items.length || !salt) return items;
  const n = salt % items.length;
  return items.slice(n).concat(items.slice(0, n));
}

export function VybeScreen() {
  const { state, me, toggleLike, addComment, addPost, toggleFollow, sharePost, updateMe, readNotes, dropPost, archivePost, reportPost } =
    useStore();
  const pager = useHorizontalPager(VYBE_TABS.length);
  const tab: VybeTab = VYBE_TABS[pager.index]?.id ?? "feed";
  const [compose, setCompose] = useState(false);
  const [pickChat, setPickChat] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [openPost, setOpenPost] = useState<string | null>(null);
  const [commentFor, setCommentFor] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | undefined>();
  const [shareFor, setShareFor] = useState<string | null>(null);
  const [profileOf, setProfileOf] = useState<string | null>(null);
  const [editMe, setEditMe] = useState(false);
  const [detailPost, setDetailPost] = useState<string | null>(null);
  const [exploreSalt, setExploreSalt] = useState(0);
  const [statusOf, setStatusOf] = useState<string | null>(null);
  const [statusCompose, setStatusCompose] = useState(false);
  const [statusDraft, setStatusDraft] = useState<StatusDraft>();
  const [youPick, setYouPick] = useState(false);
  const [storyFeed, setStoryFeed] = useState<Post[] | null>(null);
  const [ripplePost, setRipplePost] = useState<string | null>(null);
  const [holdPost, setHoldPost] = useState<string | null>(null);
  const explorePull = useRef<{ y: number; top: number } | null>(null);
  const mode = presenceOf(state);

  const reported = new Set(state.reportedPostIds ?? []);
  const livePosts = state.posts.filter((p) => !p.archived && !reported.has(p.id));
  const feed = livePosts.filter((p) => p.authorId === me.id || state.following.includes(p.authorId));
  const mine = livePosts.filter((p) => p.authorId === me.id);
  const discover = rotate(
    livePosts.filter((p) => p.travel !== "pass"),
    exploreSalt,
  );
  const notes = state.notifications;
  const friends = storyFriends(me.id, state.users, state.posts, state.following, state.statuses);

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
  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-paper">
      <header className="flex items-center px-2 pt-3 pb-1">
        <button
          type="button"
          onClick={() => (tab === "chat" ? setPickChat(true) : setCompose(true))}
          aria-label={tab === "chat" ? "New vybe chat" : "New vybe"}
          className="grid w-10 shrink-0 place-items-center py-2.5 text-[#17171A]"
        >
          <IconPlus className="size-6" />
        </button>
        <div className="grid min-w-0 flex-1 grid-cols-4">
          {VYBE_TABS.map(({ id, label, Icon }, i) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              onClick={() => pager.goTo(i)}
              className={`flex flex-col items-center py-2.5 ${
                tab === id ? "text-[#17171A]" : "text-[#BFBEC3]"
              }`}
            >
              <Icon className="size-6" />
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Notes"
          className="relative grid w-10 shrink-0 place-items-center py-2.5 text-[#17171A]"
          onClick={() => {
            setNotesOpen(true);
            readNotes();
          }}
        >
          <IconBell className="size-6" />
          {notes.some((n) => !n.read) ? (
            <span className="absolute top-2 right-1.5 size-1.5 rounded-full bg-[#FF9933]" />
          ) : null}
        </button>
      </header>

      {state.ghostMode ? (
        <div className="px-5 pb-3">
          <Groove className="py-2 text-center text-[12px] text-[#65656B]">You are in Ghost Mode</Groove>
        </div>
      ) : null}

      <div
        ref={pager.ref}
        onPointerDown={pager.onPointerDown}
        onPointerMove={pager.onPointerMove}
        onPointerUp={pager.onPointerUp}
        onPointerCancel={pager.onPointerCancel}
        onScroll={pager.onScroll}
        onClickCapture={pager.onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className="flex min-h-0 flex-1 snap-x snap-mandatory items-stretch overflow-x-auto overflow-y-hidden overscroll-x-contain no-scrollbar"
      >
        <section className="min-h-0 w-full shrink-0 basis-full snap-start overflow-y-auto no-scrollbar px-4 pb-4">
          <div
            className="mb-3 flex items-start gap-3 pt-1"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={openYou}
              className="flex w-12 shrink-0 flex-col items-center"
              aria-label="Your status"
            >
              <span className="relative flex h-10 w-10 items-center justify-center">
                <Person user={me} size="sm" story pulse={false} />
                <span className="absolute right-0 bottom-0 grid size-3.5 place-items-center rounded-full bg-[#17171A] text-[9px] leading-none text-white">
                  +
                </span>
              </span>
              <span className="mt-1 w-full truncate text-center text-[10px] text-[#9B9AA0]">You</span>
            </button>
            <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto no-scrollbar">
              {friends.map((u) => {
                const fresh = hasFreshPulse(u.id, state.statuses, me.id, "vybe");
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => openStory(u.id)}
                    className="flex w-12 shrink-0 flex-col items-center"
                    aria-label={u.name}
                  >
                    <span className="flex h-10 w-10 items-center justify-center">
                      <Person user={u} size="sm" story pulse={fresh} />
                    </span>
                    <span className="mt-1 w-full truncate text-center text-[10px] text-[#9B9AA0]">{givenName(u.name)}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {feed.length ? (
            feed.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                rippling={ripplePost === p.id}
                onRippleDone={() => setRipplePost(null)}
                onLike={() => toggleLike(p.id)}
                onComment={() => {
                  setReplyTo(undefined);
                  setCommentFor(p.id);
                }}
                onShare={() => setShareFor(p.id)}
                onOpen={() => setOpenPost(p.id)}
                onProfile={(id) => setProfileOf(id)}
                onHold={() => setHoldPost(p.id)}
              />
            ))
          ) : (
            <Empty title="No vybes yet" body="Follow people, or tap + to post your first vybe." />
          )}
        </section>

        <section
          className="min-h-0 w-full shrink-0 basis-full snap-start overflow-y-auto no-scrollbar px-4 pb-4"
          onPointerDown={(e) => {
            explorePull.current = { y: e.clientY, top: e.currentTarget.scrollTop };
          }}
          onPointerUp={(e) => {
            if (!explorePull.current) return;
            const dy = e.clientY - explorePull.current.y;
            const fromTop = explorePull.current.top <= 8;
            explorePull.current = null;
            if (fromTop && dy > 48) setExploreSalt((n) => n + 1);
          }}
        >
          {discover.length ? (
            <div className="grid grid-cols-2 gap-2.5">
              {discover.map((p) => (
                <button key={p.id} type="button" onClick={() => setOpenPost(p.id)} className="text-left">
                  <Raised className="p-2">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[14px] bg-[#E1E1E3]">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" draggable={false} className="relative size-full object-cover" />
                      ) : (
                        <span className="absolute inset-0 z-[1] flex items-end p-3 text-left text-[13px] text-[#17171A]">
                          {p.text}
                        </span>
                      )}
                    </div>
                  </Raised>
                </button>
              ))}
            </div>
          ) : (
            <Empty title="Nothing in explore" body="Tap + to post a vybe. It lands here." />
          )}
        </section>

        <section className="min-h-0 w-full shrink-0 basis-full snap-start overflow-hidden">
          <VybeChatPane pick={pickChat} onPick={setPickChat} />
        </section>

        <section className="min-h-0 w-full shrink-0 basis-full snap-start overflow-y-auto no-scrollbar px-4 pb-4">
          <Raised className="mb-3 px-4 py-4">
            <div className="flex items-center gap-4">
              <Person
                user={me}
                size="lg"
                place="vybe"
                around={mode === "around"}
                vybeOn={state.vybeEnabled}
              />
              <div>
                <p className="text-[16px] font-medium text-[#17171A]">
                  {me.name}
                </p>
                {publicNijiId(me) ? <p className="text-[13px] text-[#9B9AA0]">{me.nijiId}</p> : null}
                {me.city ? <p className="text-[13px] text-[#9B9AA0]">{me.city}</p> : null}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 text-center text-[13px]">
              <div>
                <p className="text-lg font-semibold text-[#17171A]">{vybeStats(me.id, state.posts, state.following, me.id).vybes}</p>
                <p className="text-[#9B9AA0]">Vybes</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-[#17171A]">{state.following.length}</p>
                <p className="text-[#9B9AA0]">Following</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-[#17171A]">{vybeStats(me.id, state.posts, state.following, me.id).followers}</p>
                <p className="text-[#9B9AA0]">Followers</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditMe(true)}
              className="mt-4 w-full rounded-2xl bg-[#EFEFF1] py-2.5 text-[14px] text-[#17171A]"
            >
              Edit profile
            </button>
          </Raised>
          {mine.length ? (
            <div className="grid grid-cols-3 gap-1.5">
              {mine.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setDetailPost(p.id)}
                  data-vybe-tile={p.id}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setHoldPost(p.id);
                  }}
                  onPointerDown={() => {
                    const t = window.setTimeout(() => setHoldPost(p.id), 420);
                    const clear = () => window.clearTimeout(t);
                    window.addEventListener("pointerup", clear, { once: true });
                    window.addEventListener("pointercancel", clear, { once: true });
                  }}
                  className="text-left"
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-[#E1E1E3]">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="size-full object-cover" />
                    ) : (
                      <p className="line-clamp-4 p-2 text-[11px] text-[#17171A]">{p.text}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <Empty title="No vybes of yours here" body="Tap + to put one on this paper." />
          )}
        </section>
      </div>

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
          onLike={toggleLike}
          onComment={(id) => {
            setOpenPost(null);
            setStoryFeed(null);
            setCommentFor(id);
          }}
          onShare={(id) => {
            setOpenPost(null);
            setStoryFeed(null);
            setShareFor(id);
          }}
          onFollow={toggleFollow}
          onProfile={(id) => {
            setOpenPost(null);
            setStoryFeed(null);
            setProfileOf(id);
          }}
        />
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

      {compose ? (
        <ComposeSheet
          onClose={() => setCompose(false)}
          onPost={(data) => {
            const id = addPost({
              ...data,
              language: detectLanguage(data.text),
            });
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
        <div className="fixed inset-0 z-50 bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={() => setYouPick(false)}>
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#F7F7F8] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">Your status</p>
            <button
              type="button"
              className="mt-4 w-full rounded-2xl bg-[#EFEFF1] py-3 text-[15px] text-[#17171A]"
              onClick={() => {
                setYouPick(false);
                setStatusDraft(undefined);
                setStatusCompose(true);
              }}
            >
              Put up a status
            </button>
            <button
              type="button"
              className="mt-2 w-full rounded-2xl py-3 text-[15px] text-[#17171A]"
              onClick={() => {
                setYouPick(false);
                setStatusOf(me.id);
              }}
            >
              See yours
            </button>
          </div>
        </div>
      ) : null}

      {notesOpen ? (
        <div className="bg-paper absolute inset-0 z-40 flex flex-col overflow-hidden">
          <header className="flex items-center gap-2 px-3 py-3">
            <button type="button" onClick={() => setNotesOpen(false)} className="px-1 text-xl text-neutral-500" aria-label="Back">
              ‹
            </button>
            <p className="text-[17px] font-medium">Landed</p>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
            {notes.length === 0 ? (
              <Empty title="Quiet for now" body="Stars, follows and comments land here." />
            ) : (
              notes.map((n) => (
                <Raised key={n.id} className="mb-2.5 px-3.5 py-3">
                  <p className={`text-[14px] ${n.read ? "text-[#9B9AA0]" : "text-[#17171A]"}`}>{n.text}</p>
                  <p className="mt-1 text-[11px] text-[#9B9AA0]">{relativeTime(n.createdAt)}</p>
                </Raised>
              ))
            )}
          </div>
        </div>
      ) : null}

      {profileOf ? <VybeProfile userId={profileOf} onClose={() => setProfileOf(null)} /> : null}
      {editMe ? <EditSheet user={me} onClose={() => setEditMe(false)} onSave={updateMe} /> : null}
      {detailPost ? <VybePostDetail postId={detailPost} onClose={() => setDetailPost(null)} /> : null}
      {holdPost ? (
        <div className="fixed inset-0 z-50 bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={() => setHoldPost(null)}>
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#F7F7F8] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">This vybe</p>
            {state.posts.find((p) => p.id === holdPost)?.authorId === me.id ? (
              <>
                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-[#EFEFF1] py-3 text-[14px] text-[#17171A]"
                  onClick={() => {
                    archivePost(holdPost, true);
                    setHoldPost(null);
                    if (detailPost === holdPost) setDetailPost(null);
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
                    if (detailPost === holdPost) setDetailPost(null);
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
                  if (openPost === holdPost) setOpenPost(null);
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

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <Raised className="px-6 py-10 text-center">
      <p className="text-[16px] font-medium text-[#17171A]">{title}</p>
      <p className="mt-2 text-sm text-[#9B9AA0]">{body}</p>
    </Raised>
  );
}

function PostCard({
  post,
  rippling,
  onRippleDone,
  onLike,
  onComment,
  onShare,
  onOpen,
  onProfile,
  onHold,
}: {
  post: Post;
  rippling?: boolean;
  onRippleDone?: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onOpen: () => void;
  onProfile: (userId: string) => void;
  onHold?: () => void;
}) {
  const { userById, me } = useStore();
  const author = userById(post.authorId);
  const liked = post.likedBy.includes(me.id);
  if (!author) return null;
  return (
    <article className="mb-2.5">
      <Raised className="relative overflow-hidden px-3.5 py-3">
        <div className="mb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onProfile(author.id)}
            className="shrink-0"
            aria-label={`${author.name} profile`}
          >
            <Person user={author} size="sm" place="vybe" />
          </button>
          <button type="button" onClick={() => onProfile(author.id)} className="min-w-0 flex-1 text-left">
            <p className="truncate text-[15px] font-medium text-[#17171A]">
              {vybeFace(author)}
            </p>
            <p className="text-[11px] text-[#9B9AA0]">
              {relativeTime(post.createdAt)}
              {post.location ? ` · ${post.location}` : ""}
              {post.travel ? ` · ${post.travel}` : ""}
            </p>
          </button>
        </div>
        <button
          type="button"
          onClick={onOpen}
          onContextMenu={(e) => {
            if (!onHold) return;
            e.preventDefault();
            onHold();
          }}
          onPointerDown={() => {
            if (!onHold) return;
            const t = window.setTimeout(() => onHold(), 420);
            const clear = () => window.clearTimeout(t);
            window.addEventListener("pointerup", clear, { once: true });
            window.addEventListener("pointercancel", clear, { once: true });
          }}
          className="relative w-full overflow-hidden text-left"
        >
          {post.image ? (
            <div className="overflow-hidden rounded-[14px] bg-[#E1E1E3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image} alt="" className="aspect-[4/5] w-full object-cover" />
            </div>
          ) : null}
          {post.text ? (
            <p
              className={`text-[15px] leading-6 ${
                post.image ? "mt-2.5 text-[#65656B]" : "px-1 py-3 text-[#17171A]"
              }`}
            >
              {post.text}
            </p>
          ) : null}
        </button>
        {post.language ? (
          <Groove className="mt-3 inline-flex py-1 text-[10px] tracking-caps text-[#9B9AA0] uppercase">
            {post.language}
          </Groove>
        ) : null}
        <div className="mt-3 flex h-5 items-center gap-5 text-[#9B9AA0]">
          <button
            type="button"
            onClick={onLike}
            className={`inline-flex size-5 shrink-0 items-center justify-center ${liked ? "text-[#17171A]" : ""}`}
            aria-label="Star"
          >
            <IconStar filled={liked} className="size-5" />
          </button>
          <button
            type="button"
            onClick={onComment}
            aria-label="Comment"
            className={`inline-flex size-5 shrink-0 items-center justify-center ${
              post.comments.length ? "text-[#17171A]" : "text-[#9B9AA0]"
            }`}
          >
            <IconComment heavy={post.comments.length > 0} className="size-5" />
          </button>
          <button
            type="button"
            onClick={onShare}
            aria-label="Share"
            className="inline-flex size-5 shrink-0 items-center justify-center"
          >
            <ShareRipple play={rippling} onDone={onRippleDone}>
              <IconRipple className="size-5" />
            </ShareRipple>
          </button>
        </div>
      </Raised>
    </article>
  );
}

function DiscoverViewer({
  posts,
  startId,
  onClose,
  onLike,
  onComment,
  onShare,
  onFollow,
  onProfile,
}: {
  posts: Post[];
  startId: string;
  onClose: () => void;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onFollow: (id: string) => void;
  onProfile: (userId: string) => void;
}) {
  const start = Math.max(0, posts.findIndex((p) => p.id === startId));
  const scroller = useRef<HTMLDivElement>(null);
  const { userById, me, state } = useStore();
  const overlay = useShellOverlay("z-40 bg-black text-white");
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    st: number;
    axis: "h" | "v" | null;
  } | null>(null);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = start * el.clientHeight;
  }, [start]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const snapTo = (i: number) => {
    const el = scroller.current;
    if (!el) return;
    const next = Math.max(0, Math.min(posts.length - 1, i));
    el.scrollTo({ top: next * el.clientHeight, behavior: "smooth" });
  };

  return (
    <div
      className={overlay}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        const el = scroller.current;
        if (!el) return;
        drag.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, st: el.scrollTop, axis: null };
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        if (!d || d.pointerId !== e.pointerId) return;
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
          if (dy > 80 && Math.abs(dy) > Math.abs(dx)) onClose();
          if ((d.axis === "h" || Math.abs(dx) > Math.abs(dy)) && dx > 72) onClose();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 left-4 z-30 grid size-9 place-items-center rounded-full bg-black/45 text-[22px] leading-none text-white"
        aria-label="Close"
      >
        ‹
      </button>
      <div
        ref={scroller}
        className="h-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain no-scrollbar"
        onPointerDown={(e) => {
          if (e.pointerType === "touch") return;
          if (e.button !== 0) return;
          if ((e.target as HTMLElement).closest("button")) return;
          const el = scroller.current;
          if (!el) return;
          drag.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, st: el.scrollTop, axis: null };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          const el = scroller.current;
          if (!d || !el || d.pointerId !== e.pointerId) return;
          const dx = e.clientX - d.x;
          const dy = e.clientY - d.y;
          if (!d.axis) {
            if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
            d.axis = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
            if (d.axis === "v") {
              el.setPointerCapture(e.pointerId);
              el.style.scrollSnapType = "none";
            }
          }
          el.scrollTop = d.st - dy;
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          const el = scroller.current;
          if (!d || d.pointerId !== e.pointerId) return;
          drag.current = null;
          if (!el) return;
          el.style.scrollSnapType = "";
          try {
            el.releasePointerCapture(e.pointerId);
          } catch {
            /* already released */
          }
          const dx = e.clientX - d.x;
          const dy = e.clientY - d.y;
          if (d.axis === "h" || (Math.abs(dx) > Math.abs(dy) && dx > 72)) {
            if (dx > 72) onClose();
            return;
          }
          if (d.axis !== "v") return;
          const h = el.clientHeight || 1;
          if (dy < -48) snapTo(Math.round(d.st / h) + 1);
          else if (dy > 48) snapTo(Math.round(d.st / h) - 1);
          else snapTo(Math.round(el.scrollTop / h));
        }}
      >
        {posts.map((post) => {
          const author = userById(post.authorId);
          if (!author) return null;
          const following = state.following.includes(author.id) || author.id === me.id;
          return (
            <article
              key={post.id}
              className="relative flex h-full min-h-full snap-start flex-col justify-end bg-[#17171A] p-5"
            >
              {post.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.image}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute inset-0 size-full object-cover opacity-80"
                />
              ) : null}
              <div className="relative z-10 w-full">
                <p className="font-serif text-2xl leading-snug">{post.text}</p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onProfile(author.id)}
                    className="shrink-0"
                    aria-label={`${author.name} profile`}
                  >
                    <Person user={author} size="sm" place="vybe" />
                  </button>
                  <button type="button" onClick={() => onProfile(author.id)} className="flex-1 text-left">
                    <p>
                      {vybeFace(author)}
                    </p>
                  </button>
                  {author.id !== me.id ? (
                    <button
                      type="button"
                      onClick={() => onFollow(author.id)}
                      className="rounded-full border border-white/40 px-3 py-1 text-[12px]"
                    >
                      {following ? "Following" : "Follow +"}
                    </button>
                  ) : null}
                </div>
                <div className="mt-4 flex h-7 items-center gap-5 text-white">
                  <button
                    type="button"
                    onClick={() => onLike(post.id)}
                    className="inline-flex size-7 shrink-0 items-center justify-center"
                    aria-label="Star"
                  >
                    <IconStar filled={post.likedBy.includes(me.id)} className="size-7" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onComment(post.id)}
                    className="inline-flex size-7 shrink-0 items-center justify-center"
                    aria-label="Comment"
                  >
                    <IconComment heavy={post.comments.length > 0} className="size-7" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onShare(post.id)}
                    className="inline-flex size-7 shrink-0 items-center justify-center"
                    aria-label="Share"
                  >
                    <IconRipple className="size-7" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function CommentsSheet({
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
  const { userById } = useStore();
  const [text, setText] = useState("");
  const [kbPad, setKbPad] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const parent = replyTo ? post.comments.find((c) => c.id === replyTo) : undefined;

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

  return (
    <div className="fixed inset-0 z-40 bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-[28px] bg-[#F7F7F8]"
        style={{
          bottom: kbPad,
          maxHeight: kbPad > 0 ? `calc(88% - ${Math.max(0, kbPad - 12)}px)` : "70%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="shrink-0 px-5 pt-5 text-center text-[11px] tracking-caps uppercase text-neutral-400">Comments</p>
        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          <div className="mt-4">
            {post.comments.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-400">Be the first.</p>
            ) : (
              <CommentStack comments={post.comments} onReply={onReply} />
            )}
          </div>
        </div>
        <div className="shrink-0 px-5 pt-2 pb-5">
          {parent ? (
            <div className="mb-2 flex items-center justify-between text-[12px] text-[#65656B]">
              <p>Reply to {vybeFace(userById(parent.authorId))}</p>
              <button type="button" onClick={() => onReply?.(undefined)}>
                Cancel
              </button>
            </div>
          ) : null}
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              onSend(text.trim(), replyTo);
              setText("");
              onReply?.(undefined);
            }}
          >
            <Groove className="flex flex-1 items-center">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => inputRef.current?.scrollIntoView({ block: "nearest" })}
                placeholder={parent ? "Your reply..." : "Add a comment..."}
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
      </div>
    </div>
  );
}

function ShareSheet({ onClose, onSend }: { onClose: () => void; onSend: (ids: string[]) => void }) {
  const { state, me } = useStore();
  const [picked, setPicked] = useState<string[]>([]);
  return (
    <div className="fixed inset-0 z-40 bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#F7F7F8] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">Share to chat</p>
        <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
          {state.users
            .filter((u) => u.id !== me.id && u.id !== "mist" && !u.id.startsWith("veil-"))
            .map((u) => {
              const on = picked.includes(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() =>
                    setPicked((p) => (on ? p.filter((x) => x !== u.id) : [...p, u.id]))
                  }
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

function ComposeSheet({
  onClose,
  onPost,
}: {
  onClose: () => void;
  onPost: (data: { text: string; image?: string; audience: Audience; expiry: Expiry; travel: Travel }) => void;
}) {
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
  const left = 300 - text.length;
  return (
    <div className="fixed inset-0 z-40 bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 max-h-[88%] overflow-y-auto rounded-t-[28px] bg-[#F7F7F8] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">What is your vybe?</p>
        <p className="mt-4 text-[10px] tracking-caps uppercase text-neutral-400">Photo</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {images.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setImage(src === image ? undefined : src)}
              className={image === src ? "ring-1 ring-neutral-900" : ""}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-square object-cover" />
            </button>
          ))}
        </div>
        <p className="mt-4 text-[10px] tracking-caps uppercase text-neutral-400">A note</p>
        <Groove className="mt-2 py-3">
          <textarea
            value={text}
            maxLength={300}
            onChange={(e) => setText(e.target.value)}
            placeholder="A line is a vybe. Photo is extra."
            className="h-20 w-full resize-none bg-transparent text-[16px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
          />
        </Groove>
        <p className={`mt-2 text-right text-[11px] ${left < 20 ? "text-red-500" : "text-[#9B9AA0]"}`}>{left}</p>
        <p className="mt-4 text-[10px] tracking-caps uppercase text-neutral-400">How it travels</p>
        <p className="mt-1 text-[12px] text-[#9B9AA0]">
          Other apps keep it forever, for everyone. Here you hold it, pass it, or let it fade.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TRAVELS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTravel(t.id)}>
              <Chip on={travel === t.id}>{t.label}</Chip>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-[#65656B]">{TRAVELS.find((t) => t.id === travel)?.hint}</p>
        <button
          type="button"
          disabled={!text.trim() && !image}
          onClick={() => onPost({ text: text.trim(), image, audience, expiry, travel })}
          className="mt-5 w-full disabled:opacity-30"
        >
          <Raised className="flex h-12 items-center justify-center text-[13px] font-semibold tracking-[0.16em] text-[#17171A] uppercase">
            Post Vybe
          </Raised>
        </button>
      </div>
    </div>
  );
}
