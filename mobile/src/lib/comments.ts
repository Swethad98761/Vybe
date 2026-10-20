import type { Comment } from "./types";

export function commentRoots(comments: Comment[]) {
  const ids = new Set(comments.map((c) => c.id));
  return comments.filter((c) => !c.replyTo || !ids.has(c.replyTo));
}

export function commentKids(comments: Comment[], parentId: string) {
  return comments.filter((c) => c.replyTo === parentId);
}
