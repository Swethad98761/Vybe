# Niji desk delta — swap /app to StageApp (do not touch mobile/)

This zip is the **web desk** that should render after login at `/app`.
It replaces the old five-tab phone web preview with `StageApp` (icon rail + working canvas).

## Unpack at repo root

```bash
cd /path/to/Niji   # GitHub clone root
unzip -o niji-desk-delta.zip
```

Paths overwritten / added (relative to repo root):

- `src/app/app/page.tsx` — must export `StageApp` after auth (not `AppFrame` / phone chrome)
- `src/components/web/**` — `stage-app.tsx`, `web-nav.tsx`, shell helpers
- `src/components/screens/**` — chat / calls / vybe / hub / you panes
- `src/components/niji/**` — seal, icons, chrome, paper
- `src/components/call-screen.tsx`
- `src/lib/**` — store, seed, types, niji-link, etc. (desk runtime)
- `src/app/globals.css` — desk stage tokens (merge carefully if you have local CSS edits)

## Rules

1. **Do not touch `mobile/`.**
2. Keep login redirect to `/app` (already correct if login goes to `/app`).
3. After unzip: `npm install` if needed, then `npm run build` (or `npm run dev`) and verify `/app` shows the desk (left icon rail: Chat / Calls / Vybe / Hub / You), not a phone frame.
4. Commit and push to the product-fix branch the GitHub agent is on.

## Quick smoke

- Open `/login?fresh=1` → demo `9876543210` / OTP `123456` → land on `/app`
- Desktop width: rail + canvas (not inset phone)
- Rooms switch with keys 1–5 or rail icons
