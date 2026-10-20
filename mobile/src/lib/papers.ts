import type { Shop, ShopPaperProof } from "./types";
import { papersFor } from "./tokens";

/** Official public portals. Niji does not scrape them or keep the PDF. */
export const PAPER_LOOKUPS: Record<
  string,
  { label: string; href: string; hint: string; numberHint: string }
> = {
  fssai: {
    label: "FSSAI",
    href: "https://foscos.fssai.gov.in/",
    hint: "Look the 14-digit licence up on FoSCoS. Check status and expiry there.",
    numberHint: "14 digits",
  },
  gst: {
    label: "GST",
    href: "https://services.gst.gov.in/services/searchtp",
    hint: "Search Taxpayer on the GST portal. Confirm GSTIN and whether it is active.",
    numberHint: "15-character GSTIN",
  },
  shop: {
    label: "Shop licence",
    href: "https://www.india.gov.in/website-directory",
    hint: "Trade licence is civic — your municipal or state portal. India.gov lists them.",
    numberHint: "Licence number on the civic paper",
  },
  msme: {
    label: "MSME",
    href: "https://udyamregistration.gov.in/",
    hint: "Confirm the Udyam number on the MSME portal.",
    numberHint: "UDYAM-XX-00-0000000",
  },
  cosmet: {
    label: "Cosmetic licence",
    href: "https://cdsco.gov.in/",
    hint: "State FDA / CDSCO holds cosmetic manufacturing papers.",
    numberHint: "Licence number on the FDA paper",
  },
};

export function paperLookup(id: string) {
  return (
    PAPER_LOOKUPS[id] ?? {
      label: id,
      href: "https://www.india.gov.in/website-directory",
      hint: "Look this number up on the issuing portal.",
      numberHint: "Number on the paper",
    }
  );
}

/** Official public search — GSTIN / FSSAI are not permalinks; the number is copied for the form. */
export function paperVerifyHref(id: string, number?: string) {
  const n = (number ?? "").replace(/\s/g, "");
  if (id === "gst") return "https://services.gst.gov.in/services/searchtp";
  if (id === "fssai") return "https://foscos.fssai.gov.in/";
  if (id === "msme") return "https://udyamregistration.gov.in/Udyam_Verify.aspx";
  if (id === "shop") return "https://www.india.gov.in/website-directory";
  if (id === "cosmet") return "https://cdsco.gov.in/";
  if (n) return paperLookup(id).href;
  return paperLookup(id).href;
}

/** Type digits; we cut them as day / month / year. */
export function expiryDraft(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  const display = [dd, mm, yyyy].filter(Boolean).join(" / ");
  let iso: string | undefined;
  if (digits.length === 8) {
    const day = Number(dd);
    const month = Number(mm);
    const year = Number(yyyy);
    const dt = new Date(year, month - 1, day);
    if (dt.getFullYear() === year && dt.getMonth() === month - 1 && dt.getDate() === day) {
      iso = `${yyyy}-${mm}-${dd}`;
    }
  }
  return { digits, display, iso };
}

export function expiryDisplay(iso?: string) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso ? expiryDraft(iso).display : "";
  const [y, m, d] = iso.split("-");
  return `${d} / ${m} / ${y}`;
}

export function cleanPaperNumber(id: string, raw: string) {
  const t = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (id === "gst" || id === "msme") return t;
  if (id === "fssai") return t.replace(/\D/g, "").slice(0, 14);
  return raw.trim();
}

export function paperNumberOk(id: string, number?: string) {
  const n = (number ?? "").trim();
  if (!n) return false;
  if (id === "gst") return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(n.replace(/\s/g, "").toUpperCase());
  if (id === "fssai") return /^\d{14}$/.test(n.replace(/\D/g, ""));
  if (id === "msme") return /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/i.test(n.replace(/\s/g, ""));
  return n.length >= 3;
}

export type PaperExpiryTone = "valid" | "waning" | "expired" | "unknown";

export function paperExpiryTone(expiresAt?: string, now = Date.now()): PaperExpiryTone {
  if (!expiresAt) return "unknown";
  const t = new Date(expiresAt).getTime();
  if (Number.isNaN(t)) return "unknown";
  if (t < now) return "expired";
  if (t - now <= 30 * 24 * 3_600_000) return "waning";
  return "valid";
}

export function paperExpiryLabel(expiresAt?: string, now = Date.now()) {
  const tone = paperExpiryTone(expiresAt, now);
  if (!expiresAt) return "No expiry on this paper";
  const day = new Date(expiresAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (tone === "expired") return `Expired ${day}`;
  if (tone === "waning") return `Valid till ${day} · soon`;
  return `Valid till ${day}`;
}

export function proofsOf(shop: Pick<Shop, "papers" | "paperProofs" | "category">): ShopPaperProof[] {
  if (shop.paperProofs?.length) return shop.paperProofs;
  return (shop.papers ?? []).map((id) => ({ id }));
}

export function proofLabels(proofs: ShopPaperProof[] | undefined, category: string) {
  const known = papersFor(category);
  return (proofs ?? [])
    .map((p) => known.find((x) => x.id === p.id)?.label ?? p.id)
    .filter(Boolean);
}

export function blankProof(id: string): ShopPaperProof {
  return { id };
}
