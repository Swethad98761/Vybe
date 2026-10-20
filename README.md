# Vybe

**Own Your Vibe.** A privacy-first social app: encrypted chat and calls, **Vybe** (photos, moods, reels-style discover), and **Hub** (people selling their own products).

The product stance is **frozen**. Read [`STANCE.md`](./STANCE.md) before changing chrome, tabs, or “market” features. Next work is two-phone delivery, not another tab.

Launch trailer (cinematic cut from the UI): [http://127.0.0.1:43147/trailer](http://127.0.0.1:43147/trailer). Investor paper: [http://127.0.0.1:43147/pitch](http://127.0.0.1:43147/pitch) — `?play=1` starts the trailer over the paper.

## Two surfaces

| Directory             | What it is                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| [`mobile/`](./mobile) | **The product.** Expo and React Native, one codebase for iOS and Android. Start here.            |
| this directory        | A Next.js web preview built earlier. Web gets its own approach later; this is not the phone app. |

To run the phone app:

```bash
cd mobile
npm install
npx expo start
```

Open it in Expo Go, or make an installable build with `npx eas-cli build --platform android --profile preview`. See [`mobile/README.md`](./mobile/README.md).

Accounts use **Supabase phone OTP**. Chat, Vybe, Hub, and calls still live on the device in this slice. New chat text is sealed with the **Signal Protocol** (X3DH + Double Ratchet, X25519, HKDF-SHA256, ChaCha20-Poly1305) and stored under `niji-signal-v1`. That is not yet a live multi-device Signal / WebRTC backend — keys stay on the device, and there is no lock or “encrypted” chrome in the UI.

Prove the handshake locally:

```bash
npm run verify:signal
```

The Origin package `agnyathaavasi/libsignal-client-verify` is the intended swap-in client. This repo exposes the same facade (`sealText` / `openText` in `src/lib/signal`) so that package can replace the noble implementation when the repo is attached.

---

## The web preview

Everything below describes the Next.js app in this directory.

## First launch

1. The story artwork for 2.5 seconds, then the chrome logo for 2 seconds.
2. The fingerprint field. Touch it: two icons soften in beside the mark, no labels and no color. Touch one and it lights — saffron on Sign up, green on Login. The form sits below the fingerprint and is the same height for both.
3. Create account: username and phone number. Login: phone plus the SMS code Supabase sends.
4. The unselected path fades to white. A refresh keeps you signed in until you sign out.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43147](http://127.0.0.1:43147).

## Tabs

| Tab   | What you can do                                                                                                                                                                           |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Calls | History, encrypted voice / video                                                                                                                                                          |
| Chat  | Trusted threads, **Hub chat** (stall enquiries, orders, pay), **Mist** (share a code, not a name), later drafts                                                                           |
| Vybe  | Name, still, caption. Hold / Pass / Fade instead of a forever public feed. Status stories. Vybe chat.                                                                                     |
| Hub   | Browse stalls ranked by feedback, or **host more than one**. FSSAI / GST / licence numbers open the official Indian lookup. Share a stall by QR or into chat. Enquiries land in Hub chat. |
| You   | Presence (Around / Quiet / Ghost), changeable Niji ID, hide Vybe or Hub                                                                                                                   |

Chat lines can be copied into another thread. There is no forward. On **Ash**, a **seal**, or **Mist**, a screenshot or recording is blocked where the phone allows, and a capture that still lands writes a notice in the thread.

## Share Niji ID

The share paper is a photo plus a link to that person’s Vybe profile (`/id/{nijiId}` on web, `niji:///id/{nijiId}` in the app). WhatsApp and iMessage open a tapped **photo** in their gallery — they do not hand the PNG to Niji. The **QR** and the **caption link** do. Scan the seal, or tap the line under the photo, and Niji opens that profile.

Mist mints a **temp ID** (`priya-482`) with a QR (`niji:///mist/{token}`). Chat profiles carry a chat QR (`niji:///chat/{nijiId}`). A parked Later line lands in the thread and stays under **Sent · in chat**.

To watch the intro again, clear site data for this origin (`localStorage` key `niji-state-v7`).

The previous Expo app lives in the private [Niji-old-src](https://github.com/agnyathaavasi-innovations/Niji-old-src) repo. Tab marks and New group come from that tree. Do not merge it into this repo.

## Backend (Supabase)

The app is pointed at your project. The **anon key is a public client key** — keep the `service_role` key out of the repo and out of chat.

Phone sign-in must be turned on in the dashboard before a code will send. This machine cannot flip that switch.

1. Open [Authentication → Providers](https://supabase.com/dashboard/project/nujtalyynchxkgrvurwo/auth/providers) → **Phone** → enable it.
2. Fastest check (no Twilio spend): add a **test phone** in E.164 (`+91XXXXXXXXXX`) and a fixed 6-digit OTP, then Save.
3. For real SMS later: add Twilio (Account SID, Auth Token, Messaging Service SID) on that same Phone card. The project already reports `sms_provider: twilio`.
4. Optional: run [`supabase/schema.sql`](./supabase/schema.sql) in the [SQL editor](https://supabase.com/dashboard/project/nujtalyynchxkgrvurwo/sql/new) so usernames land in `public.profiles`. Sign-in still works from Auth metadata if you skip this.

`npm run check:phone` probes whether Phone is on. It does not need the service role key.

Local overrides (optional — the public project URL and anon key are already in the client):

```bash
cp .env.example .env.local
```
