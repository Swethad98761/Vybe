/** Story artwork is 768×1376. Globe flush to the top; mountain soles on the floor. */
export const STORY_RATIO = 768 / 1376;
export const STORY_MOUNTAIN = 0.948;

export function storyFrame(width: number, height: number) {
  const artHeight = height / STORY_MOUNTAIN;
  const artWidth = artHeight * STORY_RATIO;
  if (artWidth >= width) {
    return {
      position: "absolute" as const,
      top: 0,
      left: (width - artWidth) / 2,
      width: artWidth,
      height: artHeight,
    };
  }
  return {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width,
    height: width / STORY_RATIO,
  };
}
