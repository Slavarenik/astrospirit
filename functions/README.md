# Astro Spirit Cloud Functions

One function so far: **`translateProxy`** — a server-side proxy for Google
Cloud Translation, so the Translation API key never ships inside the mobile
app bundle (it currently does, via `EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY`,
which is a fine dev-only shortcut but not safe for a real release — see the
note in the main `README.md` / `DEVLOG.md`).

## One-time setup

1. Install the Firebase CLI if you don't have it:
   ```
   npm install -g firebase-tools
   ```
2. From the **Astro Spirit** project root (not `functions/`):
   ```
   firebase login
   firebase init functions
   ```
   Pick "Use an existing project" → your Astro Spirit Firebase project. Say
   **no** to overwriting `functions/package.json` / `functions/src/index.ts`
   — they're already here.
3. Install dependencies:
   ```
   cd functions && npm install
   ```
4. Set the Translate API key as a server-side secret (never committed,
   never shipped to the client — this is the whole point):
   ```
   firebase functions:secrets:set GOOGLE_TRANSLATE_API_KEY
   ```
   **Use a new key here, not the one currently in `.env`** — that one was
   pasted into a chat and should be treated as burned. Rotate/delete it in
   [Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
   and create a fresh one restricted to the Cloud Translation API only.
5. Deploy:
   ```
   npm run deploy
   ```

## After deploying

Nothing else to change in the app. `src/shared/i18n/googleTranslate.ts`
automatically routes through this function instead of calling Google
directly as soon as `isFirebaseConfigured()` is true (i.e. once you've
filled in the Firebase web config in the root `.env` for the friends/auth
feature — see `.env.example`). Once that's live, delete
`EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY` from `.env` entirely; it's only read
as a fallback for local dev before Firebase is set up.
