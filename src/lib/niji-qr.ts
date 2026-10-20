import QRCode from "qrcode";

export function qrGrid(value: string) {
  const qr = QRCode.create(value, { errorCorrectionLevel: "H" });
  const n = qr.modules.size;
  const bits: boolean[][] = [];
  for (let y = 0; y < n; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < n; x++) {
      const get = qr.modules.get as ((x: number, y: number) => boolean | number) | undefined;
      row.push(typeof get === "function" ? Boolean(get.call(qr.modules, x, y)) : Boolean((qr.modules as { data?: ArrayLike<number> }).data?.[y * n + x]));
    }
    bits.push(row);
  }
  return bits;
}

export function isFinderCell(x: number, y: number, n: number) {
  const hit = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
  return hit(0, 0) || hit(n - 7, 0) || hit(0, n - 7);
}

export type CircuitQr = {
  n: number;
  cell: number;
  pad: number;
  pads: string;
  traces: string;
  finders: { x: number; y: number }[];
};

/** Pads and orthogonal traces — a circuit board, not a dotted grid. */
export function circuitQr(value: string, size: number, pad = 14): CircuitQr {
  const bits = qrGrid(value);
  const n = bits.length || 1;
  const cell = (size - pad * 2) / n;
  const r = cell * 0.28;
  const tw = Math.max(1.05, cell * 0.18);
  let pads = "";
  let traces = "";
  const cx = (x: number) => pad + (x + 0.5) * cell;
  const cy = (y: number) => pad + (y + 0.5) * cell;
  const dark = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < n && y < n && bits[y][x] && !isFinderCell(x, y, n);

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!dark(x, y)) continue;
      const px = cx(x);
      const py = cy(y);
      pads += `M${px} ${py}m ${-r} 0a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
      if (dark(x + 1, y)) {
        const nx = cx(x + 1);
        traces += `M${px} ${py - tw / 2}H${nx}v${tw}H${px}Z`;
      }
      if (dark(x, y + 1)) {
        const ny = cy(y + 1);
        traces += `M${px - tw / 2} ${py}V${ny}h${tw}V${py}Z`;
      }
    }
  }

  return {
    n,
    cell,
    pad,
    pads,
    traces,
    finders: [
      { x: 0, y: 0 },
      { x: n - 7, y: 0 },
      { x: 0, y: n - 7 },
    ],
  };
}
