import type { ImageSourcePropType } from "react-native";

/** Metro needs literal requires, so seed paths are mapped instead of interpolated. */
const registry: Record<string, ImageSourcePropType> = {
  "/media/avatars/aiden.jpg": require("@/assets/media/avatars/aiden.jpg"),
  "/media/avatars/alex.jpg": require("@/assets/media/avatars/alex.jpg"),
  "/media/avatars/hana.jpg": require("@/assets/media/avatars/hana.jpg"),
  "/media/avatars/jordan.jpg": require("@/assets/media/avatars/jordan.jpg"),
  "/media/avatars/leo.jpg": require("@/assets/media/avatars/leo.jpg"),
  "/media/avatars/maya.jpg": require("@/assets/media/avatars/maya.jpg"),
  "/media/avatars/nina.jpg": require("@/assets/media/avatars/nina.jpg"),
  "/media/avatars/priya.jpg": require("@/assets/media/avatars/priya.jpg"),
  "/media/posts/coffee.jpg": require("@/assets/media/posts/coffee.jpg"),
  "/media/posts/concert.jpg": require("@/assets/media/posts/concert.jpg"),
  "/media/posts/desert.jpg": require("@/assets/media/posts/desert.jpg"),
  "/media/posts/dining.jpg": require("@/assets/media/posts/dining.jpg"),
  "/media/posts/fashion.jpg": require("@/assets/media/posts/fashion.jpg"),
  "/media/posts/food.jpg": require("@/assets/media/posts/food.jpg"),
  "/media/posts/night-city.jpg": require("@/assets/media/posts/night-city.jpg"),
  "/media/posts/road.jpg": require("@/assets/media/posts/road.jpg"),
  "/media/posts/store.jpg": require("@/assets/media/posts/store.jpg"),
  "/media/posts/workshop.jpg": require("@/assets/media/posts/workshop.jpg"),
  "/media/products/bag.jpg": require("@/assets/media/products/bag.jpg"),
  "/media/products/bottle.jpg": require("@/assets/media/products/bottle.jpg"),
  "/media/products/camera.jpg": require("@/assets/media/products/camera.jpg"),
  "/media/products/ceramic.jpg": require("@/assets/media/products/ceramic.jpg"),
  "/media/products/headphones.jpg": require("@/assets/media/products/headphones.jpg"),
  "/media/products/lamp.jpg": require("@/assets/media/products/lamp.jpg"),
  "/media/products/shades.jpg": require("@/assets/media/products/shades.jpg"),
  "/media/products/speaker.jpg": require("@/assets/media/products/speaker.jpg"),
  "/media/products/tools.jpg": require("@/assets/media/products/tools.jpg"),
  "/media/products/watch.jpg": require("@/assets/media/products/watch.jpg"),
};

export function pic(path?: string): ImageSourcePropType | undefined {
  if (!path) return undefined;
  return registry[path];
}

/** Paper-levelled renders. tools/level-paper.py; -raw.jpg keeps the drop. */
export const brand = {
  story: require("@/assets/brand/niji-story.jpg"),
  lockup: require("@/assets/brand/niji-lockup.jpg"),
  gate: require("@/assets/brand/niji-gate.jpg"),
  mark: require("@/assets/brand/niji-mark.jpg"),
};
