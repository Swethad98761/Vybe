import type { User } from "./types";

export function vybeName(user?: Pick<User, "name"> | null) {
  return user?.name?.trim() || "Someone";
}

export function vybeFace(user?: Pick<User, "name" | "nijiId" | "postAs"> | null) {
  if (!user) return "Someone";
  if (user.postAs === "nijiId") return user.nijiId;
  return user.name.trim() || "Someone";
}

/** Niji ID is an address, not a face. Vybe only shows it when they turned the toggle on. */
export function publicNijiId(user: Pick<User, "nijiId" | "showNijiId">) {
  if (user.showNijiId) return user.nijiId;
  return null;
}
