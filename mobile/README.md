# Niji — iOS and Android

**Own Your Vibe.** The Niji phone app: encrypted chat and calls, Vybe, and Hub, built with Expo and React Native so one codebase ships to both the App Store and Play Store.

This is the primary product surface. The Next.js app in the repository root is a separate web preview and is not this codebase.

Stance is frozen — [`../STANCE.md`](../STANCE.md). Do not add chrome to chase a market.

## Run it on your phone

### Expo Go (fastest)

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with the Camera app on iOS or inside **Expo Go** on Android. Same Wi‑Fi is enough. If the phone cannot see the laptop:

```bash
npx expo start --tunnel
```

Sign-in on the phone uses the same Supabase test OTP as the web preview: phone `9876543210`, code `123456`.

### Installable build (APK / device IPA)

Run these from the **Niji repo**, not from `~`. `cd mobile` only works after you are inside that clone.

```bash
# once
git clone https://github.com/agnyathaavasi-innovations/Niji.git
cd Niji/mobile
npm install
npx eas-cli login

# every build
npx eas-cli build --platform android --profile preview
```

If Niji is already on disk:

```bash
cd /path/to/Niji/mobile
npx eas-cli build --platform android --profile preview
```

The first run asks EAS to create or link the project and writes `extra.eas.projectId` into `app.json` — commit that. It produces an APK for `app.niji.mobile` on the Expo account `agnyathaa_vasi`. iOS preview needs an Apple team: `npx eas-cli build --platform ios --profile preview`.

`preview` is an internal build. `production` is what you later send to the stores.

Local native compile still works if you have the toolchains:

```bash
npx expo run:ios       # macOS and Xcode
npx expo run:android   # Android Studio
```

`npx expo start --web` is a desktop look at the same React Native tree. It is not the shipping target.

## Accounts

Sign up and login send a real SMS code through Supabase. Phone auth must be enabled on the project (Authentication → Providers → Phone), with Twilio or a test number. Chat, Vybe, Hub, and calls still live on the device in this slice.

## First launch

1. The full story artwork — locks, mountains, the lot — fits on the phone. Tap to go on.
2. The chrome Niji logo holds as its own screen, then dissolves into the fingerprint field.
3. Touch the fingerprint: a white orb lights from behind it, and **Sign up** / **Login** soften in. Pressing one lights it — neon orange or neon green — and the other fades to white.
4. Create account asks for a **username** and a **phone number**. Login is phone plus a one-time code.

To see it again: **Account → Replay intro**.

## The material

Niji is machined white, not flat white. The brand renders in `assets/brand/` are used exactly as delivered; the interface is what moves to meet them. Every surface shares one paper tone, `#EBEBEC`, sampled from the paper in those renders, so artwork and interface are the same material. Panels are lit along the top edge and drop a soft shadow; fields are grooves pressed into the paper. Chrome appears only as a hairline rule and in the artwork itself. The only colour is the tricolour set — saffron, white, and India green.

See `src/theme.ts` for the tokens and the `raised()` / `Groove` helpers in `src/components/surface.tsx`.

## Layout

| Path | Screen |
| --- | --- |
| `src/app/(tabs)/index.tsx` | Vybe — chronological feed, moods, star likes, ripple share |
| `src/app/(tabs)/chat.tsx` | Trusted chats, ghost veils, later drafts |
| `src/app/chat/[id].tsx` | Thread. Disappear lives on the person profile |
| `src/app/(tabs)/calls.tsx` | Encrypted call history |
| `src/app/(tabs)/hub.tsx` | Sellers by category |
| `src/app/hub/[id].tsx` | A stall and its items; Enquire opens an encrypted chat |
| `src/app/id/[nijiId].tsx` | Shared Niji ID — opens that Vybe profile |
| `src/app/(tabs)/you.tsx` | Niji ID, Ghost mode, hide Vybe |

The active tab is marked by a 2px bar **above** the icon, not below it.
