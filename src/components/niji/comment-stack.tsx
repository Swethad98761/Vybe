"use client";

import { useState } from "react";
import { IconKeyboard } from "@/components/niji/icons";
import { commentKids, commentRoots } from "@/lib/comments";
import { relativeTime } from "@/lib/format";
import { vybeFace } from "@/lib/identity";
import { useStore } from "@/lib/store";
import type { Comment } from "@/lib/types";

export function CommentStack({
  comments,
  compact,
  onReply,
}: {
  comments: Comment[];
  compact?: boolean;
  onReply?: (commentId: string) => void;
}) {
  const { userById } = useStore();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const roots = commentRoots(comments);
  if (!comments.length) return null;

  return (
    <div className={compact ? "mt-3" : ""}>
      <div className="space-y-3">
        {roots.map((root) => {
          const kids = commentKids(comments, root.id);
          const shut = collapsed[root.id];
          const author = userById(root.authorId);
          return (
            <div key={root.id}>
              <p className="text-[14px] leading-5 text-[#17171A]">
                <span className="font-medium">{vybeFace(author)}</span> {root.text}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-[#9B9AA0]">
                <span>{relativeTime(root.createdAt)}</span>
                {onReply ? (
                  <button type="button" onClick={() => onReply(root.id)}>
                    Reply
                  </button>
                ) : null}
                {kids.length ? (
                  <button
                    type="button"
                    onClick={() => setCollapsed((m) => ({ ...m, [root.id]: !m[root.id] }))}
                    aria-label={shut ? `Open ${kids.length} replies` : "Hide replies"}
                    className="text-[#65656B]"
                  >
                    <IconKeyboard className="size-3.5" />
                  </button>
                ) : null}
              </div>
              {!shut && kids.length ? (
                <div className="mt-2 space-y-2 border-l border-black/10 pl-3">
                  {kids.map((kid) => {
                    const who = userById(kid.authorId);
                    return (
                      <div key={kid.id}>
                        <p className="text-[14px] leading-5 text-[#17171A]">
                          <span className="font-medium">{vybeFace(who)}</span> {kid.text}
                        </p>
                        <div className="mt-0.5 flex gap-3 text-[11px] text-[#9B9AA0]">
                          <span>{relativeTime(kid.createdAt)}</span>
                          {onReply ? (
                            <button type="button" onClick={() => onReply(root.id)}>
                              Reply
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
