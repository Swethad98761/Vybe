import type { ChatStatus, Post, User } from "./types";
import { canSeeVybeStatus, liveStatuses, statusLaneOf } from "./presence";

const FOLLOWERS: Record<string, number> = {
  me: 248,
  priya: 412,
  rahul: 188,
  ananya: 276,
  diya: 154,
  kabir: 98,
  meera: 221,
  arjun: 67,
};

export function givenName(name?: string) {
  return (name ?? "").trim().split(/\s+/)[0] || "";
}

/** Followed people with a status or vybe first; otherwise anyone who posted. */
export function storyFriends(
  meId: string,
  users: User[],
  posts: Post[],
  following: string[],
  statuses: ChatStatus[] = [],
) {
  const posted = new Set(posts.map((p) => p.authorId));
  const pulsing = new Set(
    liveStatuses(statuses)
      .filter((s) => statusLaneOf(s) === "vybe" && canSeeVybeStatus(s, meId, following))
      .map((s) => s.authorId),
  );
  const interesting = (u: User) => u.id !== meId && (posted.has(u.id) || pulsing.has(u.id));
  const followed = users.filter((u) => following.includes(u.id) && interesting(u));
  if (followed.length) return followed.slice(0, 14);
  return users.filter(interesting).slice(0, 14);
}

export function vybeStats(userId: string, posts: Post[], following: string[], meId: string) {
  const vybes = posts.filter((p) => p.authorId === userId).length;
  const followingCount =
    userId === meId ? following.length : 12 + ((userId.charCodeAt(0) * 7 + userId.length * 3) % 40);
  return {
    vybes,
    following: followingCount,
    followers: FOLLOWERS[userId] ?? 36,
  };
}
