import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { IconKeyboard } from "@/components/icons";
import { commentKids, commentRoots } from "@/lib/comments";
import { relativeTime } from "@/lib/format";
import { vybeFace } from "@/lib/identity";
import { useStore } from "@/lib/store";
import type { Comment } from "@/lib/types";
import { c, type as t } from "@/theme";

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
    <View style={{ marginTop: compact ? 10 : 0 }}>
      {roots.map((root) => {
        const kids = commentKids(comments, root.id);
        const shut = collapsed[root.id];
        const author = userById(root.authorId);
        return (
          <View key={root.id} style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: c.ink, lineHeight: 20 }}>
              <Text style={{ fontWeight: "600" }}>{vybeFace(author)} </Text>
              {root.text}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 3 }}>
              <Text style={t.meta}>{relativeTime(root.createdAt)}</Text>
              {onReply ? (
                <Pressable onPress={() => onReply(root.id)}>
                  <Text style={t.meta}>Reply</Text>
                </Pressable>
              ) : null}
              {kids.length ? (
                <Pressable
                  onPress={() => setCollapsed((m) => ({ ...m, [root.id]: !m[root.id] }))}
                  accessibilityLabel={shut ? `Open ${kids.length} replies` : "Hide replies"}
                >
                  <IconKeyboard size={14} color={c.inkSoft} />
                </Pressable>
              ) : null}
            </View>
            {!shut && kids.length
              ? kids.map((kid) => {
                  const who = userById(kid.authorId);
                  return (
                    <View
                      key={kid.id}
                      style={{
                        marginTop: 8,
                        marginLeft: 2,
                        paddingLeft: 12,
                        borderLeftWidth: 1,
                        borderLeftColor: "rgba(0,0,0,0.08)",
                      }}
                    >
                      <Text style={{ fontSize: 14, color: c.ink, lineHeight: 20 }}>
                        <Text style={{ fontWeight: "600" }}>{vybeFace(who)} </Text>
                        {kid.text}
                      </Text>
                      <View style={{ flexDirection: "row", gap: 12, marginTop: 3 }}>
                        <Text style={t.meta}>{relativeTime(kid.createdAt)}</Text>
                        {onReply ? (
                          <Pressable onPress={() => onReply(root.id)}>
                            <Text style={t.meta}>Reply</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                  );
                })
              : null}
          </View>
        );
      })}
    </View>
  );
}
