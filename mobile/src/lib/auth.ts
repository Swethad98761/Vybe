import type { User } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from "./supabase";

export type SessionProfile = {
  username?: string;
  phone?: string;
  nijiId?: string;
};

export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (phone.trim().startsWith("+")) return `+${digits}`;
  return `+91${digits}`;
}

/** +91 first, then the 10-digit form a test-OTP row may use. */
export function phoneCandidates(phone: string): string[] {
  const e164 = toE164(phone);
  const digits = phone.replace(/\D/g, "");
  const out = [e164];
  if (digits.length === 10 && !out.includes(digits)) out.push(digits);
  if (digits.length === 12 && digits.startsWith("91")) {
    const national = digits.slice(2);
    if (!out.includes(national)) out.push(national);
  }
  return out;
}

function shouldTryNextPhone(error: unknown): boolean {
  const code =
    error && typeof error === "object"
      ? String(("code" in error && error.code) || ("error_code" in error && error.error_code) || "")
      : "";
  const message =
    error && typeof error === "object" && "message" in error ? String(error.message) : String(error ?? "");
  const blob = `${code} ${message}`.toLowerCase();
  return (
    blob.includes("20003") ||
    blob.includes("authenticate") ||
    blob.includes("sms_send_failed") ||
    blob.includes("error sending") ||
    blob.includes("otp_disabled") ||
    blob.includes("signups not allowed")
  );
}

export function profileFromUser(user: User): SessionProfile {
  const meta = user.user_metadata ?? {};
  const username =
    (typeof meta.username === "string" && meta.username) ||
    (typeof meta.handle === "string" && meta.handle) ||
    "";
  const stem = username.replace(/[^a-z0-9]/gi, "").slice(0, 6).toLowerCase() || "user";
  return {
    username: username || undefined,
    phone: user.phone || undefined,
    nijiId: `nj${stem}${user.id.replace(/-/g, "").slice(0, 4)}`,
  };
}

export function friendlyAuthError(error: unknown): string {
  const raw =
    error && typeof error === "object"
      ? String(
          ("code" in error && error.code) ||
            ("error_code" in error && error.error_code) ||
            "",
        )
      : "";
  const msg =
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error
        ? String(error.message)
        : String(error ?? "");
  const blob = `${raw} ${msg}`.toLowerCase();

  if (
    blob.includes("phone_provider_disabled") ||
    blob.includes("unsupported phone") ||
    blob.includes("phone signups are disabled") ||
    blob.includes("phone provider")
  ) {
    return "Phone sign-in is off in Supabase. Turn on Phone under Authentication → Providers, then add Twilio or a test number.";
  }
  if (
    blob.includes("sms_send") ||
    blob.includes("error sending") ||
    blob.includes("twilio") ||
    (blob.includes("sms") && blob.includes("provider"))
  ) {
    return "Phone is on, but SMS is not set up. Add a test phone + OTP, or Twilio, under Authentication → Providers → Phone.";
  }
  if (blob.includes("signups not allowed") || blob.includes("user not found")) {
    return "No account for this number. Create one first.";
  }
  if (blob.includes("otp_expired") || blob.includes("expired")) {
    return "That code expired. Request a new one.";
  }
  if (blob.includes("rate") || blob.includes("too many")) {
    return "Too many tries. Wait a minute and send another code.";
  }
  if (blob.includes("invalid") && (blob.includes("otp") || blob.includes("token") || blob.includes("code"))) {
    return "That code did not match. Try again.";
  }
  return msg || "Could not reach Niji just now. Try again.";
}

export async function phoneAuthEnabled(): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    const json = (await res.json()) as { external?: { phone?: boolean } };
    return Boolean(json.external?.phone);
  } catch {
    return false;
  }
}

export async function sendPhoneOtp(phone: string, createUser: boolean): Promise<string> {
  let lastError: unknown;
  for (const candidate of phoneCandidates(phone)) {
    const { error } = await supabase.auth.signInWithOtp({
      phone: candidate,
      options: { shouldCreateUser: createUser, channel: "sms" },
    });
    if (!error) return candidate;
    lastError = error;
    if (!shouldTryNextPhone(error)) throw error;
  }
  throw lastError;
}

export async function verifyPhoneOtp(phone: string, token: string, username?: string) {
  let lastError: unknown;
  let user: User | null = null;
  let usedPhone = toE164(phone);
  for (const candidate of phoneCandidates(phone)) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: candidate,
      token,
      type: "sms",
    });
    if (!error && data.user) {
      user = data.user;
      usedPhone = candidate;
      break;
    }
    lastError = error;
  }
  if (!user) throw lastError ?? new Error("Signed in, but no user came back.");
  const e164 = usedPhone.startsWith("+") ? usedPhone : toE164(usedPhone);
  if (user && username) {
    const { error: metaError } = await supabase.auth.updateUser({
      data: { username, handle: username },
    });
    if (metaError) throw metaError;
    // Auth metadata is enough to enter Niji. The profiles table is optional.
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      username,
      phone: e164,
    });
    if (profileError) {
      console.warn("profiles upsert skipped", profileError.message);
    }
    user.user_metadata = { ...user.user_metadata, username, handle: username };
  }
  return profileFromUser(user);
}

export async function signOutNiji() {
  await supabase.auth.signOut();
}
