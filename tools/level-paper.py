#!/usr/bin/env python3
"""Level the paper in brand artwork to the app's paper tone.

Image generators light the page: they add a top-down falloff and land the paper
somewhere near the requested tone instead of on it. That reads as a brightness
jump when artwork sits next to a UI painted with a flat colour.

This lifts the paper onto the target and flattens the falloff, and nothing else.
The lift is masked to low-saturation pixels in the paper band and feathered at
both ends, so ink, gems and chrome highlights keep the values they were drawn
with.

    python3 tools/level-paper.py in.jpg out.jpg [--target EBEBEC]
"""

import argparse
import sys

import numpy as np
from PIL import Image

# Cells across the short edge when estimating the lighting field. Coarse enough
# that logo-sized objects never bend it, fine enough to track a page falloff.
FIELD_CELLS = 12
# Paper candidates: unsaturated and bright. Excludes ink, gems and mid chrome.
PAPER_MAX_SAT = 0.06
PAPER_MIN_LUM = 185
# Feather the lift in over the shadow edge of the paper band and back out
# before pure white, so nothing clips and no edge appears against the chrome.
LIFT_IN = (170.0, 202.0)
LIFT_OUT = (234.0, 252.0)
SAT_GATE = (0.05, 0.14)


def smoothstep(x, lo, hi):
    t = np.clip((x - lo) / (hi - lo), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def lighting_field(channel, mask, shape):
    """Coarse per-channel paper level, with non-paper cells filled from neighbours."""
    h, w = shape
    cells_y = max(2, round(FIELD_CELLS * h / min(h, w)))
    cells_x = max(2, round(FIELD_CELLS * w / min(h, w)))
    ys = np.linspace(0, h, cells_y + 1).astype(int)
    xs = np.linspace(0, w, cells_x + 1).astype(int)

    grid = np.full((cells_y, cells_x), np.nan, np.float32)
    for j in range(cells_y):
        for i in range(cells_x):
            cell = channel[ys[j] : ys[j + 1], xs[i] : xs[i + 1]]
            sel = mask[ys[j] : ys[j + 1], xs[i] : xs[i + 1]]
            # A cell that is mostly logo tells us nothing about the page.
            if sel.mean() > 0.25:
                grid[j, i] = np.median(cell[sel])

    if np.isnan(grid).all():
        raise SystemExit("no paper found — is this brand artwork?")

    # Row-wise fill first: the falloff runs down the page, so a row's own
    # neighbours are a better guess for a logo-covered cell than the global mean.
    for j in range(cells_y):
        row = grid[j]
        if not np.isnan(row).all():
            idx = np.arange(cells_x)
            ok = ~np.isnan(row)
            grid[j] = np.interp(idx, idx[ok], row[ok])
    col_ok = ~np.isnan(grid[:, 0])
    for i in range(cells_x):
        col = grid[:, i]
        bad = np.isnan(col)
        if bad.any():
            idx = np.arange(cells_y)
            ok = ~bad
            grid[:, i] = np.interp(idx, idx[ok], col[ok]) if ok.any() else np.nanmean(grid)
    del col_ok

    small = Image.fromarray(grid.astype(np.float32), mode="F")
    return np.asarray(small.resize((w, h), Image.BICUBIC), dtype=np.float32)


def level(src, target):
    a = np.asarray(src.convert("RGB"), dtype=np.float32)
    h, w = a.shape[:2]

    mx = a.max(axis=2)
    mn = a.min(axis=2)
    sat = np.divide(mx - mn, mx, out=np.zeros_like(mx), where=mx > 1)
    lum = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    paper = (sat < PAPER_MAX_SAT) & (lum > PAPER_MIN_LUM)

    weight = (
        smoothstep(lum, *LIFT_IN)
        * (1.0 - smoothstep(lum, *LIFT_OUT))
        * (1.0 - smoothstep(sat, *SAT_GATE))
    )

    out = a.copy()
    for ch in range(3):
        field = lighting_field(a[:, :, ch], paper, (h, w))
        out[:, :, ch] += (target[ch] - field) * weight

    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGB"), paper


def report(label, img, paper):
    a = np.asarray(img.convert("RGB"), dtype=np.float32)
    h = a.shape[0]
    bands = []
    for lo, hi in ((0, 0.25), (0.25, 0.5), (0.5, 0.75), (0.75, 1.0)):
        sel = paper[int(lo * h) : int(hi * h)]
        px = a[int(lo * h) : int(hi * h)][sel]
        bands.append("#%02X%02X%02X" % tuple(np.round(px.mean(0)).astype(int)) if len(px) else "--")
    print(f"{label:9s} paper by quarter: {'  '.join(bands)}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--target", default="EBEBEC", help="paper tone, hex (default EBEBEC)")
    ap.add_argument("--quality", type=int, default=95)
    args = ap.parse_args()

    hexs = args.target.lstrip("#")
    target = np.array([int(hexs[i : i + 2], 16) for i in (0, 2, 4)], np.float32)

    src = Image.open(args.src)
    out, paper = level(src, target)
    report("before", src, paper)
    report("after", out, paper)
    out.save(args.dst, quality=args.quality, subsampling=0)
    print(f"wrote {args.dst}  target #{hexs.upper()}")


if __name__ == "__main__":
    sys.exit(main())
