# Astro Spirit — Development Log

This file tracks *how* the app got to its current state, phase by phase, including
judgment calls made without a round-trip to the client and known gaps to review before
shipping. `README.md` covers the architecture as it stands today; this file covers the
history and the decisions behind it.

---

## Phase 1 — Initial build

Full app built from scratch: React Native + Expo SDK 51, TypeScript, feature-based
architecture (`src/{app,shared,features}`). Onboarding flow, 4-tab main app (My Day,
Calendar/Intentions, Sanctuary, Profile), tarot card system (78 individually cropped
card images), horoscope API integration against freehoroscopeapi.com with offline
fallbacks, local "AI" stand-ins for meditation scripts/affirmations/journal sentiment,
and natal-chart math (sun sign exact, moon/ascendant illustrative). See `README.md` →
"Where things live from the spec" for the full feature-to-file map.

## Phase 2 — Visual redesign

Reskinned the entire app to a flat, ornamental "gold-on-charcoal" aesthetic matching a
set of reference screens (a "Zodiac Match" splash/data-entry/compatibility flow):

- New color system: single antique-gold accent on warm near-black (`shared/theme/colors.ts`).
- New ornament component library: `CornerSparkle`, `OrnateFrame`, `HeaderFlourish`,
  `SunburstMandala`.
- Full onboarding rebuild, all 4 home-screen reskins, tab bar reskin, an animated
  Zodiac Love-Match compatibility screen, tarot draw re-skin, regenerated app icon.
- Follow-up pass: corner-sunburst ornaments on `ScreenBackground`, `RadialGauge`
  reskinned into an ornamental dial, laurel-sprig flourish option on `ZodiacIcon`.

## Phase 3 — Feature pass

A 9-item request, worked through in this order:

1. **Day/Week/Month horoscope tabs** — `useDailyHoroscope` generalized into
   `useHoroscope(period)` (`features/my-day/hooks/useDailyHoroscope.ts`), with a new
   `getMonthly()` added to `horoscopeClient.ts` and a segmented `PeriodTabs` control in
   `HoroscopeWidget.tsx`. `useDailyHoroscope()` is kept as a deprecated wrapper so
   `AffirmationWidget.tsx` didn't need touching.
2. **EN / RU / UA localization** — a dependency-free i18n system (no npm registry
   access in the build sandbox, so no `i18next`/`react-intl`):
   `shared/storage/useLocaleStore.ts` (persisted locale), `shared/i18n/translations.ts`
   (English dict as the canonical shape — `ru`/`uk` are typed against it so a missing
   key is a compile error), `shared/i18n/index.ts` (`useT()` dotted-path lookup,
   `useTList()` for array-valued keys), `shared/components/LanguageSwitcher.tsx`.
   **Scope limitation, by design:** this covers static UI chrome only — onboarding, the
   4 tab headlines, horoscope period tabs, the paywall, the language switcher itself.
   It does **not** cover dynamic/generated content: horoscope paragraphs, tarot
   meanings, affirmations, journal sentiment text, or the spiritual-tracker pool labels.
   Those stay English — translating generated copy is a separate, much larger pass
   (either pre-translating every static corpus, or routing it through a translation
   API at generation time).
3. **Paywall screen** — `features/paywall/`. Lives on the *root* navigation stack
   (`app/navigation/RootNavigator.tsx`, `Paywall` route) so it can open as a modal from
   any tab; `shared/hooks/usePaywallNavigation.ts` walks up to that root stack from
   wherever a screen is nested. Reachable from the Profile tab's new `PremiumBanner`
   and from the Sanctuary content library's existing "premium content" alert (now with
   an "Upgrade" action). Top of the screen is `PremiumPreviewCarousel.tsx` — an
   animated, auto-rotating preview of the two flagship premium features named in the
   spec (AI meditation-music generation, zodiac love-match). Below that: three
   selectable plan cards (week/month/year, `features/paywall/data/plans.ts`) and a
   perks list. **Pricing is intentionally left blank** ("Price TBA") — set the real
   numbers in `data/plans.ts`'s `price`/`priceBreakdown` fields once decided; the cards
   pick them up automatically. "Continue" just flips the local `usePremiumStore` flag —
   there's no real payment/IAP integration wired in (that's a separate piece of work:
   RevenueCat or native StoreKit/Billing, receipt validation, etc.).
4. **Corner sparkles on card blocks** — `GlassCard`'s existing `sparkles` prop (already
   used by the Affirmation block) applied to the remaining card blocks: Card of the Day,
   Today's Forecast, library list, mindfulness stats, journal prompt, spiritual
   trackers, astro passport, lunar calendar.
5. **Zodiac icons** — the 12 reference icon images attached to the request were **not**
   embedded directly; `shared/components/ZodiacIcon.tsx`'s existing hand-drawn glyph
   paths were instead given a bolder stroke weight to move visually closer to the
   reference set while keeping the vector data 100% original. This was a provenance/
   licensing judgment call on an unlabeled icon set, not something confirmed up front —
   worth a second look if the literal files were wanted instead of a closer original
   treatment. **Resolved in Phase 4** — the literal attached files were swapped in.
6. **AI Audio Immersion bottom padding** — `AudioGeneratorInput.tsx`'s outer `wrap`
   padding split into `paddingTop`/`paddingBottom: spacing.sm` (was a uniform
   `spacing.lg` on all sides), plus matching trims to the suggestion-chip row.
7. **50+ spiritual trackers** — `shared/storage/useIntentionsStore.ts` rewritten: a
   53-item `TRACKER_POOL`, a seeded PRNG (`hashString` + `mulberry32`, Fisher-Yates
   shuffle) picks a stable, date-keyed subset of `TRACKERS_PER_DAY` (5) items via
   `getTodayTrackers(dateKey)` — different pick each day, same pick if you reopen the
   same day.
8. **FontAwesome bottom-tab icons** — `app/navigation/CustomTabBar.tsx` swapped from
   hand-drawn SVG icons to `@expo/vector-icons`' `FontAwesome5` (`sun`/`moon`/`spa`/
   `user-astronaut`).
9. **DEVLOG.md** added.

## Phase 4 — Translation security, notifications, deeper compatibility, friends/auth

A 7-item request:

1. **Translation security** — most dynamic-content translation coverage already existed
   (horoscope, affirmations, journal, tarot, trackers via `useTranslatedText(s)`); added
   a Firebase Cloud Function (`functions/translateProxy`) so the Google Translate API
   key lives server-side as a secret instead of shipping in the client bundle.
   `shared/i18n/googleTranslate.ts` auto-routes through it once Firebase is configured,
   falling back to the direct (dev-only) key-based call otherwise.
2. **Full compatibility report** — `shared/utils/astrology.ts#getCompatibilityReport`:
   per-area breakdown (love/communication/trust/intimacy/growth), a moon-phase-based
   timing read, and one piece of advice, all deterministic from the two signs + date.
   `CompatibilityScreen.tsx` renders it with animated bars.
3. **Daily + weekly local notifications** — `shared/notifications/`, settings card in
   Profile, synced via `useSyncNotifications` in `App.tsx`.
4. **Friends + Firebase Auth + Firestore** — `features/friends/`: add friends, view
   compatibility with any friend (or compare two friends to each other) plus simplified
   natal charts, email sign-in/sign-up (`shared/firebase/authActions.ts`). Works fully
   offline/local (`useFriendsStore`); mirrors to Firestore once Firebase is configured
   and the user signs in (`useFriendsSync`). Schema documented in `FIRESTORE_SCHEMA.md`,
   starter rules in `firestore.rules`.
5. **Zodiac icons** — the literally-attached PNG files were swapped in (superseding the
   Phase 3 "bolder redraw" judgment call).
6. **Horoscope gauge animation** — `RadialGauge.tsx`'s outer dotted halo now rotates
   continuously.
7. **Horoscope gauges from real text** — `shared/utils/horoscopeAnalysis.ts`: energy/
   intuition/tension/luck are now derived from the actual forecast text (keyword
   scoring + seeded jitter) instead of being computed independently of it.

---

## Phase 5 — Firebase Analytics

Added `@react-native-firebase/app` + `@react-native-firebase/analytics` (native SDK —
**not** the `firebase` JS package already used for Auth/Firestore, whose
`firebase/analytics` module is web-only and doesn't collect events in React Native).
This is also what the `GoogleService-Info.plist` you dropped in the project root is
for; wired into `app.json` via `ios.googleServicesFile` + the `@react-native-firebase/app`
config plugin.

- **`shared/analytics/analytics.ts`** — the only file that touches the native module.
  Every export (`logShareBlock`, `logTrackerCompleted`, `logOnboardingComplete`,
  `logSignUp`, `logLogin`, `logPurchase`) wraps the real call in try/catch and fails
  silently, so the app doesn't crash before the native module is actually linked.
- **`first_open`** needs no code — the native SDK logs it automatically on first launch
  once the app is built with the module linked.
- **Share blocks** (My Day): `HoroscopeWidget`, `CardOfDayWidget`, `AffirmationWidget`
  each call `logShareBlock("horoscope" | "tarot" | "affirmation")` right after a
  successful `Sharing.shareAsync`.
- **Daily tasks**: `SpiritualTrackers.tsx` calls `logTrackerCompleted(id, allDoneToday)`
  when a tracker is checked *done* (not on uncheck), using the Calendar tab's existing
  rotating-pool trackers as "ежедневные задания" — flag if a different feature was
  meant.
- **Onboarding**: both places a profile can be marked complete call
  `logOnboardingComplete()` — `GeneratingScreen.tsx`'s `setProfile(...)` and
  `useUserStore.completeOnboarding()`.
- **Auth**: `authActions.ts`'s `signUpWithEmail`/`signInWithEmail` call
  `logSignUp("password")` / `logLogin("password")`. Apple/Google are still UI
  placeholders; once wired, call the same functions with `"apple.com"`/`"google.com"`.
- **Purchase**: `logPurchase(planId, value, currency)` exists but is **not** called
  from the Paywall's current "Continue" yet (left as a `TODO` there) — firing a
  `purchase` event from a stub flow that doesn't charge anything would corrupt real
  revenue reporting. Call it from the real IAP success callback once that's built.

**Important workflow change**: `@react-native-firebase/*` ships native iOS/Android
code, so **Expo Go no longer works** for this project from here on — it needs a custom
dev client (`npx expo prebuild` + a native build) or an EAS Build with a dev client.
`npm install` also hasn't been run against the new dependencies in this sandboxed
environment — do that on your machine, then rebuild.

**Still needed for Android**: only `GoogleService-Info.plist` (iOS) was provided — add
`google-services.json` next to it and set `android.googleServicesFile` in `app.json`
once you've registered an Android app in the same Firebase project; until then,
Android builds won't have Analytics (iOS will).

---

## Phase 6 — Real Apple & Google Sign-In

Replaced the "coming soon" placeholder buttons with working native sign-in, in
`shared/firebase/authActions.ts` (`signInWithApple`, `signInWithGoogle`), wired up in
`AuthScreen.tsx`. Both end up calling Firebase's `signInWithCredential` the same way
email/password does, so `useAuthSync`/`useFriendsSync` needed no changes, and both log
`logSignUp`/`logLogin` (Phase 5) with the right `method`, distinguishing new vs.
returning users via `getAdditionalUserInfo(...).isNewUser`.

- **Apple** — `expo-apple-authentication`, with a SHA-256-hashed nonce (recommended by
  both Apple and Firebase to prevent replay). iOS-only; `AuthScreen` hides the button
  on Android and when `AppleAuthentication.isAvailableAsync()` is false. Needs the
  "Sign In with Apple" capability enabled for the app in your Apple Developer account
  (the `expo-apple-authentication` config plugin, now in `app.json`, handles the
  entitlement itself on an EAS/dev-client build — nothing else to add there).
- **Google** — `@react-native-google-signin/google-signin` (native SDK, not
  `expo-auth-session`'s browser-based flow — more reliable, and it's what
  `GoogleService-Info.plist`'s `REVERSED_CLIENT_ID` is for; wired into `app.json`'s
  plugin config as `iosUrlScheme`). **One manual step you still need to do**: Firebase
  auto-creates a "Web client" OAuth id the moment you enable the Google provider in
  Authentication → Sign-in method — that id (ends in
  `.apps.googleusercontent.com`, different from the iOS `CLIENT_ID` already in the
  `.plist`) goes in `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (see `.env.example`).
  Without it, Google sign-in will fail — the ID token's audience won't match what
  Firebase expects.
- User cancelling either sheet (`ERR_REQUEST_CANCELED` / `SIGN_IN_CANCELLED`) throws a
  dedicated `OAuthCancelledError` that `AuthScreen` swallows silently instead of
  showing an error.
- Same workflow note as Phase 5: both packages ship native code, so this only works on
  an EAS Build / custom dev client, not Expo Go — consistent with Analytics already
  requiring that.

---

## Phase 7 — Avatars, auth form polish, and device→account linking in Firestore

**AuthScreen form**: the EMAIL/PASSWORD labels moved out of their `GlassCard` into
plain text above each card (was inside the same bordered block). Sign-up mode now has
a Confirm Password field; mismatched passwords block submit with a translated error
(`auth.error.passwordMismatch`) instead of hitting Firebase.

**Avatars** (`shared/components/AvatarPicker.tsx`, a tappable circle with an edit
badge): added to `AstroPassportCard.tsx`, to the left of the name at the top of the
card — pick from the photo library (`expo-image-picker`), shows instantly from the
local file, then uploads to Firebase Storage (`avatars/{deviceId}.jpg`, see
`storage.rules`) and swaps in the download URL. `UserProfile.avatarUrl` persists it
locally the same way as every other profile field.
- **Google sign-in pulls the account photo automatically** (`authActions.ts`'s
  `signInWithGoogle`, from `GoogleSignin.signIn()`'s `user.photo`) into
  `profile.avatarUrl`, unless one was already manually set.
- **Apple sign-in cannot do this** — Sign In with Apple's API has no photo/avatar
  field at all, full stop. Nothing to wire up; not a gap to come back to.

**Firestore `Users/{deviceId}` collection** (capital U — a different collection from
the lowercase `users/{uid}` the Friends feature already uses; see
`FIRESTORE_SCHEMA.md` for the full shape and `firestore.rules` for the rules, both
updated): reports the onboarding profile to Firestore the moment onboarding finishes
— keyed by a random per-install id (`shared/utils/deviceId.ts`, persisted in
AsyncStorage) rather than the auth uid, since this has to work before anyone's signed
in. Every sign-up/sign-in (any method, in `authActions.ts`) then looks that same
device-keyed doc back up and merges in `uid`/`email`/`authMethod` instead of creating
a second record. Client code: `shared/firebase/firestoreUsers.ts`
(`syncProfileToFirestore`, `linkAuthToDeviceProfile`, `uploadAvatarImage`). Entirely
one-way/best-effort — nothing reads this collection back into the app, so it never
blocks onboarding or sign-in if Firestore is unreachable.

**New rules files to deploy** (not done automatically — see each file's own
comments): `firestore.rules` (added the `Users/{deviceId}` match block — note its
documented tradeoff: pre-auth writes can't be verified by `request.auth`, so this
trusts the deviceId the same way any client-generated analytics id is trusted) and
the brand-new `storage.rules` (avatar uploads). Deploy with
`firebase deploy --only firestore:rules,storage`.

---

## Phase 8 — Avatar removed; real (ephemeris-based) Moon sign, Stage 1 of the natal-chart rework

**Avatar feature removed entirely**, reversing Phase 7's avatar work — product direction
settled on the app being personal/spiritual rather than social, and an avatar only made
sense alongside the social features that were also dropped (see the compatibility/friends
discussion above this phase). Reverted: `AstroPassportCard.tsx`'s avatar row (back to a
plain eyebrow+name header), `UserProfile.avatarUrl`, the Google sign-in photo pull in
`authActions.ts#signInWithGoogle`, `firestoreUsers.ts#uploadAvatarImage` and its
`avatarUrl` fields, `getFirebaseStorage()` in `firebaseClient.ts` (now unused — Storage
isn't used for anything else), the `expo-image-picker` dependency, and the `avatarUrl`
field from `FIRESTORE_SCHEMA.md`. `storage.rules` is now deny-all with a note (delete it
once you've confirmed Storage isn't enabled on the Firebase project). **Not removed**:
`shared/components/AvatarPicker.tsx` itself is now an orphaned, unreferenced file — it
couldn't be deleted from this sandboxed session; delete it yourself, it's dead code.

**Natal chart, Stage 1 of a staged rework** — the ask: calculations are currently
simplified/illustrative rather than ephemeris-based, which is both the weakest part of
the app and the strongest premium lever ("real deep analysis" vs. a guess). Added
`astronomy-engine` (pure JS/TS, no native deps — fine for Expo/Hermes) and, in
`shared/utils/astrology.ts`:
- `buildBirthInstant(birthDateIso, birthTime)` — turns the stored birth date+time into a
  JS `Date` for the ephemeris functions.
- `getMoonSign(birthInstant)` — **replaces** `estimateMoonSign()` (the old ~2.5-day
  arbitrary cycling placeholder, which had no real connection to the actual Moon at all).
  Computes a real geocentric ecliptic longitude (ELP2000 lunar theory, via
  `Astronomy.GeoVector` + `Astronomy.Ecliptic`) and maps it to a tropical sign. Wired into
  `AstroPassportCard.tsx` in place of the old call.
- `getSunEclipticLongitude(birthInstant)` — same real-ephemeris path for the Sun; not
  wired into any UI yet, there for a future "exact degree in sign" display. The Sun
  *sign* was already accurate from the calendar date alone (`getZodiacSign`) and stays
  the source of truth for it.

**Known limitation carried into this stage, by design** — read the doc comment on
`buildBirthInstant()`: onboarding's `birthCity` (`BirthDateScreen.tsx`) is still a bare
free-text string with no geocoding, so there's no known timezone for the birth location,
and birth time is treated as UTC. The Sun is essentially unaffected (~1°/day of motion);
the Moon (~13°/day) can occasionally land one sign off for a birth time close to a
sign-change boundary. This doesn't block Stage 1 (it's still a real calculation, and a
large accuracy jump over the old placeholder), but it is the reason `estimateAscendant()`
is untouched and still clearly marked illustrative — a real Ascendant/Houses needs Local
Sidereal Time + birth latitude, which structurally requires a geocoded birth location.
**Stage 2 is geocoding `birthCity` → lat/long/timezone**, which removes this caveat for
the Moon and is the hard prerequisite for a real Ascendant. Later stages: planetary
aspects, and premium gating/UI for a "deep natal chart" built on top of this.

**Full-chart screen, pulled forward from Stage 3** — rather than wait for geocoding to
show any of this, added `getNatalPlacements()` to `astrology.ts`: the same real-ephemeris
path generalized to all eight planets (not just Sun/Moon), each with its real sign and
exact degree — this needs nothing beyond what Stage 1 already has, no geocoding required.
New `FullChartScreen.tsx` (`ProfileStackParamList.FullChart`, modal, reachable via a
"View full chart" button added to `AstroPassportCard.tsx`) shows a degree-accurate wheel
(`FullChartWheel.tsx`, markers at exact ecliptic longitude rather than mid-sign, tinted by
each sign's element via the existing `ELEMENT_COLOR`) plus a list of all ten
bodies — exact sign + degree for the real ones, and the Ascendant visually set apart
(dashed marker, an "Estimated" tag, and the same explanatory note as the doc comments)
so the screen never implies it's as real as the rest. New theme exports: `PlanetKey`,
`PLANET_KEYS`, `PLANET_GLYPHS`. New i18n namespace `fullChart.*` (en/ru/uk) plus
`passport.viewFullChart`.

**Follow-up on the full-chart wheel** — fixed marker overlap, added a subtle living-chart
animation, and added Houses:
- Planets were overlapping at the wheel's single radius; redrew the layout with the
  zodiac backdrop shrunk to its own inner band (`innerSize = size * 0.74`) and planets
  in a dedicated outer band, plus a greedy lane-assignment (`assignLanes` in
  `FullChartWheel.tsx`) that pushes genuinely close bodies (real conjunctions) onto an
  extra outward lane instead of drawing on top of each other.
- After the entrance reveal, the whole marker layer now breathes — a slow, continuous
  ±1.8% scale pulse (`withRepeat`/`withSequence`, 2.6s each way) — "slightly animated"
  without anything flashy.
- **Houses, added now rather than waiting for Stage 2**: `getWholeSignHouse()` in
  `astrology.ts` computes house 1-12 using the **Whole Sign** system specifically because
  it's the one house system that only needs the Ascendant's *sign* (not its exact
  degree) — the only thing `estimateAscendant` gives us. Every other system (Placidus,
  Koch, Equal House from the real cusp, etc.) needs Local Sidereal Time from a geocoded
  birth location, same Stage-2 blocker as a precise Ascendant. House numbers are drawn
  as tappable badges (plain RN `Pressable`s overlaid on the SVG, not SVG `onPress`, for a
  real touch target) at the zodiac wheel's own sign-slot positions — tapping one opens a
  modal with that house's name + a short meaning (`houses.names.*` / `houses.descriptions.*`,
  en/ru/uk, 12 each). `fullChart.housesNote` on the screen states the system and the
  inherited caveat plainly.

**Sun's house on the passport card** — didn't duplicate the full 12-house grid there
(that's what Full Chart is for); instead added one line, "Your Sun lives in House N —
name" (`passport.sunHouseLine`), tappable through to Full Chart, under the existing
Sun/Moon/Rising rows in `AstroPassportCard.tsx`.

**"What to do / what not to do"** on the daily horoscope, between the paragraph and the
gauge row (`HoroscopeWidget.tsx`): three tips each, from a new `shared/utils/dailyTips.ts`
— same stand-in-content philosophy as `aiContent.ts`, a wide hand-written pool (10 pools:
8 axis-conditioned + 2 general, ~100 lines total) deterministically selected per sign+date.
Selection is driven by the day's already-computed indexes (energy/intuition/tension/luck)
rather than re-scanning the horoscope text: whichever axis sits furthest from neutral
leads (today's strongest signal), backfilled from the general pool on a quiet/neutral
day, so there are always exactly three of each and they're still "depends on the day's
reading" one step removed. English-only pool, localized at render via the existing
`useTranslatedTexts` path (not the static `t()` dictionary — same convention as the
horoscope paragraph itself).

**Stage 2 — geocoding birthCity, a real timezone, and a real Ascendant.** `birthCity`
stayed free text (no autocomplete — a loose/ambiguous name like "Paris" can still resolve
to the wrong place; documented tradeoff, a picker UI is separate future work if it matters
enough), but it's now run through:

- `shared/utils/geocoding.ts` — `geocodeBirthCity(city)` uses `expo-location`'s native
  `geocodeAsync` (the device's own iOS/Android geocoder: free, no API key, no backend). On
  Android, if it throws, requests foreground location permission once and retries — `app.json`
  now carries the `expo-location` config plugin with that permission's usage copy. Resolves
  the city to lat/lon, then `tz-lookup` (lat/lon → IANA zone name, e.g. "Europe/Kyiv", pure
  JS, no native deps). Never throws; returns `null` on anything short of success, and
  `geocodeBirthCityWithTimeout` races it against a 3.5s cap so a slow/unavailable device
  geocoder can never hang onboarding. `UserProfile` gained `birthLat`/`birthLon`/`birthTimezone`
  (all three set together or not at all).
- **Onboarding**: `GeneratingScreen.tsx` best-effort geocodes the typed city before building
  the profile (during the existing "Generating…" wait). **Existing profiles** created before
  Stage 2 (or where geocoding failed) self-heal: `AstroPassportCard.tsx` — mounted whenever
  there's a profile at all — retries once on mount via the same timeout-boxed call and
  persists the result with `updateProfile`. Either path failing leaves the profile exactly
  as it was pre-Stage-2 — never a crash, never a blocked flow.
- **Real UTC conversion**: `buildPreciseBirthInstant()` in `astrology.ts` converts the
  wall-clock birth date/time in the resolved IANA zone to true UTC, using only
  `Intl.DateTimeFormat` (format the same instant in UTC and in the target zone, diff the
  wall-clock fields — the standard trick; no bundled tz-rule data needed, so it correctly
  picks up historical DST/offset changes as long as the JS engine's Intl has full IANA data).
  Two-pass (re-derives the offset at the corrected instant) so a birth time within a couple
  hours of a historical DST transition still lands on the right side of it. **Assumption worth
  confirming on-device**: this relies on Hermes shipping full ICU — should be true on Expo
  SDK 51/RN 0.74, but hasn't been verified by an actual run.
- **Real Ascendant**: `getRealAscendantLongitude()`/`getRealAscendant()` in `astrology.ts`
  replace a single memorized closed-form trig formula with a **numeric solver** — scan the
  ecliptic's altitude above the horizon (via GMST + mean obliquity + ecliptic→equatorial→
  horizontal, all independently standard textbook formulas) looking for where it crosses zero
  while *rising*, then refine by bisection. Chosen deliberately over a closed-form formula
  recalled from memory, and **verified in an isolated Node script before being written into
  the app**: GMST at the J2000.0 epoch matches the formula's own defining reference value;
  Ascendant and Descendant come out ~180° apart across six very different lat/lon/date
  combinations (Greenwich, Kyiv, New York, Sydney, near-equator Quito, high-latitude
  Reykjavik) plus near-polar/extreme-longitude edge cases; and the Ascendant advances forward
  through the zodiac hour by hour, as it should. Returns `null` only in the degenerate
  near-polar case of no horizon crossing, in which case callers fall back to the estimate.
  `resolveAscendant()` is the one entry point every screen now uses: real whenever the
  profile has geocoded lat/lon/timezone and the solver succeeds, `estimateAscendant`
  otherwise — with an `isReal` flag so the UI can show/hide the "Estimated" caveat.
  `AstroPassportCard.tsx` and `FullChartScreen.tsx` both switched to it; `FullChartScreen`
  also now feeds the real timezone-aware instant into the planet placements (sharper degrees,
  not just the Ascendant), and `FullChartWheel.tsx` draws the Ascendant marker solid and at
  its *exact* real degree (not the sign midpoint) once it's real, hiding the dashed
  "estimate" styling and the `fullChart.ascendantNote` footnote to match.
  **Whole Sign houses stay Whole Sign** even with a real Ascendant degree now available —
  it's a legitimate house system on its own merits, not just a Stage-1 workaround; Equal
  House from the precise cusp becomes possible as a future option but isn't required.
**Stage 2b — city autocomplete, offline.** Replaced the free-text `birthCity` field with a
type-ahead picker over a bundled, fully offline dataset instead of a paid API (two options
were weighed — Google Places Autocomplete for best coverage/quality vs. a bundled offline
list for zero cost and no API key — offline was the choice):

- **Data**: GeoNames `cities15000` export (CC BY 4.0, user-supplied — could not be
  downloaded from either sandbox, both network-restricted) parsed down to `shared/data/cities.json`,
  a compact tuple array `[name, countryCode, lat, lon, population]` for all 34,188 cities
  with population ≥15,000 worldwide (~1.4MB bundled asset). `shared/data/countryNames.ts` maps
  the exact 244 ISO-ish country codes that actually appear in that file to display names
  (verified by diff against the dataset's own distinct codes — not a speculative "every
  country" list).
- **Search**: `shared/utils/citySearch.ts#searchCities(query, limit)` — diacritic-stripped,
  lowercased prefix match first (so "kyiv" matches "Kyiv", "sao paulo" matches "São Paulo"),
  falling back to substring match, each tier sorted by population descending. Pure in-memory
  scan over ~34k rows (no index needed — sanity-checked fast enough per keystroke at this
  size) with the normalized-name array computed once on first use, not per keystroke.
- **UI**: new `features/onboarding/components/CityAutocompleteInput.tsx` — debounced (150ms)
  dropdown under the existing text field in `BirthDateScreen.tsx`; picking a result fills in
  "City, Country" and stores exact lat/lon on the onboarding draft (`birthCityLat`/`birthCityLon`
  in `onboardingDraftStore.ts`); typing without picking clears any earlier pick and behaves
  exactly like Stage 2 did (free text, resolved later by `geocodeBirthCityWithTimeout`) — purely
  additive, no regression path.
- **Onboarding**: `GeneratingScreen.tsx` now checks for picked coordinates first — if present,
  skips the device geocoder entirely and only resolves the timezone (`geocoding.ts`'s new
  `timezoneForCoords`), otherwise falls back to Stage 2's best-effort free-text geocode.
- **Known gap**: coverage stops at population ≥15,000 — a birth village/small town won't
  appear in suggestions and falls back to free text + Stage 2's geocoder. `cities5000.zip`
  (~200k entries, bigger bundle) would extend coverage if that matters enough later.

---

## Phase 9 — Sanctuary tab swapped for "Life Path Number" (digit-sum numerology)

The bottom-tab meditation/sounds feature (Sanctuary) was unlinked from the main tab bar and
replaced with a new numerology feature, branded "Life Path Number". This was requested after
a discussion of a specific branded method ("метод Сюцай" / digital psychology) that computes
two numbers from a birth date — rather than reproduce someone's proprietary branded formulas
and claims from an unverified paraphrase, the generic underlying technique (digit-sum
reduction, the same base math behind Western "Life Path Number" and the "Pythagorean square")
was implemented under the app's own neutral name.

- **`shared/utils/numerology.ts`** — `reduceToNumerologyNumber(n, allowMaster = true)`: repeatedly
  sums digits down to 1-9, except it stops early if an intermediate sum lands exactly on 11 or
  22 (Western "master numbers"). Built on top of that:
  - `getConsciousnessNumber(birthDateISO)` — reduces the day-of-month alone. Reads as
    instinctive core/ego/reflexes.
  - `getMissionNumber(birthDateISO)` — reduces the sum of every digit in the full
    `YYYY-MM-DD` string. Reads as the underlying purpose/lesson.
  Verified with a standalone Node script against hand-checked cases (including a day that
  lands on master number 22, and a digit-sum that lands on master number 11 mid-reduction)
  before being placed in the app — same verification discipline as Stage 2's Ascendant solver.
- **`features/numerology/data/numerologyExplanations.ts`** — `CONSCIOUSNESS_EXPLANATION` and
  `MISSION_EXPLANATION`, `Record<1-9|11|22, string>` each, written fresh in the same
  declarative-sentence style as `signExplanations.ts`'s `SUN_EXPLANATION`/`MOON_EXPLANATION`.
  English-only source, localized live via `useTranslatedTexts` like the rest of dynamic content
  — not a static `translations.ts` entry.
  **Not reviewed against the specific "метод Сюцай" claims** (e.g. its "activates after 30-33
  years" framing for the Mission Number) — deliberately generic/Western in tone instead.
- **`features/numerology/screens/NumerologyHomeScreen.tsx`** + **`NumerologyNumberCard.tsx`** —
  new screen mirroring `SanctuaryHomeScreen.tsx`'s layout (`ScreenBackground variant="night"`,
  `OrnateFrame`, scroll with eyebrow/headline/flourish), with two glass cards (Consciousness,
  Mission) in the glyph-badge-plus-text-row language of `AstroPassportCard.tsx`'s planet rows.
  Pulls `profile.birthDate` from `useUserStore`, same `"1996-06-15"` fallback used elsewhere.
- **Tab wiring**: `MainTabParamList.Sanctuary` → `Numerology` (`app/navigation/types.ts`),
  `MainTabNavigator.tsx` now mounts a new `NumerologyNavigator.tsx` (single-screen stack) on
  that tab, `CustomTabBar.tsx`'s icon map got `Numerology: "hashtag"` (FontAwesome5) in place
  of `Sanctuary: "spa"`. The tab bar renders icons only, no text labels, so no label changes
  were visually required — a `tabs.numerology` string ("Life Path Number" / RU "Число
  жизненного пути" / UK "Число життєвого шляху") was still added to `translations.ts` for
  parity/future use (e.g. accessibility labels), replacing the old `tabs.sanctuary` key.
  New `numerology.*` namespace added to all three locales (en/ru/uk) in `translations.ts` for
  the screen's static chrome (eyebrow, headline, intro, per-number eyebrows/titles, the
  "Master Number" tag).
- **Sanctuary's own source was deliberately left in place, just unlinked** — `SanctuaryNavigator.tsx`,
  `features/sanctuary/**`, and `SanctuaryStackParamList` all still exist and still compile; only
  the tab-bar wiring that pointed to them was swapped. Reconnecting the feature later (another
  tab, a settings entry, etc.) doesn't require rebuilding it.
- **Not done / out of scope for this pass**: no deep-link or quick-action elsewhere in the app
  was found to reference the `"Sanctuary"` route name (checked `profile`, `my-day`), but this
  was a search over the files staged this session, not an exhaustive repo-wide grep (the
  on-device shell tool was unavailable all session — see Known Gaps) — worth a final check
  on an actual device before shipping. No settings toggle to re-enable Sanctuary was added.

**Phase 9 follow-up — four more generic numerology techniques, plus visualization.** After
confirming the digit-sum-reduction mechanic isn't unique to any one author (it's the same base
math as Western "Life Path Number" and "квадрат Пифагора"/Alexandrov's square), extended the
Life Path Number tab with four more numbers and two visualizations, all picked from a short
list the person chose explicitly:

- **`shared/utils/numerology.ts` grew four more exports**, all still generic/public-domain
  techniques, not reproducing any specific branded course:
  - **Name numbers** (`getDestinyNumber`, `getSoulUrgeNumber`, `getPersonalityNumber`) — the
    classic Pythagorean letter-value table (A=1,B=2,...I=9, J=1,...R=9, S=1,...Z=8). Destiny
    sums every Latin letter in the full name; Soul Urge only the vowels (A,E,I,O,U);
    Personality only the consonants. **Only defined for Latin letters** — the table has no
    entry for Cyrillic or other scripts, and rather than invent an unverified Cyrillic
    letter-value system, a name with zero Latin letters makes all three return `null`, and the
    screen shows a "add your name in Latin script" hint card instead of fabricating numbers.
    Verified in a Node script: for two sample names, destiny's raw (pre-reduction) sum exactly
    equals soul-urge's raw sum plus personality's raw sum, since every letter is either a
    vowel or a consonant — a correctness check that would fail if the vowel/consonant split or
    the letter table had a bug.
  - **Personal Year Number** (`getPersonalYearNumber`) — birth day + birth month + a given
    year (defaults to the current year), each reduced on its own, then summed and reduced
    again. Conventionally single-digit only (1-9) — unlike every other number here, master
    numbers are deliberately *not* preserved for this one, matching standard practice. Recomputes
    differently each calendar year by design (it's the one "today" layer in this feature).
  - **Pythagorean Square** (`computePythagoreanSquare`) — a structurally different technique
    from the rest: instead of reducing the birth date to one digit, it counts how many times
    each digit 1-9 occurs across the date plus four numbers derived from it (the standard
    "квадрат Пифагора"/Alexandrov psychomatrix steps: `a` = digit-sum of `DDMMYYYY`, `b` =
    digit-sum of `a`, `c` = `a` minus twice `a`'s first digit, `d` = digit-sum of `c`;
    concatenate `DDMMYYYY+a+b+c+d` into one string and count each digit 1-9 in it, zeros
    dropped). The nine counts fill a fixed 3×3 grid, and rows/columns/diagonals are read as
    named traits (character, energy, duty / health, logic, labor / self-esteem, family).
    **Edge case the textbook description doesn't address**: `c` can go negative for a very
    low-digit-sum date (e.g. 2000-01-01, where `a` is already a single digit) — handled by
    taking `Math.abs(c)` before counting its digits, a documented judgment call, not something
    pulled from a source. Verified in a Node script that counted digits always sum back up
    with the dropped zeros to the working string's total length, across three sample dates.
- **Content**: `features/numerology/data/nameNumerologyExplanations.ts` (Destiny/Soul
  Urge/Personality, 11 entries each) and `pythagoreanSquareExplanations.ts` (8 traits × 3
  levels — low/balanced/strong, bucketed from the raw count by `pythagoreanTraitLevel()`) join
  `numerologyExplanations.ts`'s existing pair, now plus `PERSONAL_YEAR_EXPLANATION` (9 entries,
  no master numbers). All English-only, localized live via `useTranslatedTexts`, same
  convention as before — trait *titles* (short labels like "Character"/"Logic") are static
  chrome in `translations.ts` instead, same split as everywhere else in the app.
- **Visualization, both requested**:
  - `NumberWheel.tsx` — a plain ring with the eleven numerology values (1-9, 11, 22) around it,
    one or more values picked out as the person's own, with a thin line from center to each —
    same visual language as `NatalChartWheel.tsx`'s sun/moon/rising markers, just without a
    zodiac backdrop.
  - `PythagoreanSquareGrid.tsx` — the 3×3 grid, each cell shaded by its count, plus a trait list
    below with a low/balanced/strong level tag.
  - `NumerologyGroupCard.tsx` — new card shape replacing the one-card-per-number layout from
    the first Life Path Number pass: one wheel plus a row per number, grouped by "family" (by
    birth date: Consciousness/Mission/Personal Year; by name: Destiny/Soul Urge/Personality) —
    closer to how `AstroPassportCard.tsx` shows Sun/Moon/Rising in one wheel rather than three
    separate cards, and less repetitive than six individual cards would have been.
  - The original per-number `NumerologyNumberCard.tsx` from the first pass is now unused by the
    screen but was left in place rather than deleted, same "unlink, don't delete" judgment call
    as Sanctuary.
- **Not done / open**: Cyrillic (or other non-Latin) name numbers — intentionally out of scope,
  see above. No settings toggle for switching the Pythagorean Square's trait-naming convention
  (sources vary slightly on what to call each row/column/diagonal) — the names used here
  (character/energy/duty, health/logic/labor, self-esteem/family) are one common convention,
  not the only one.

---

## Phase 9 follow-up 2 — wheel-clipping fix + four new numerology sections

- **Bug fix**: `NumberWheel.tsx` was clipping highlighted number markers at the top/bottom of
  the circle. Root cause: `slotR` (0.44×size) plus the marker's own radius (0.085×size) added
  up to 0.525×size, past the SVG canvas's half-size (0.5×size) — the marker's stroke was
  getting cut off by the canvas edge. Fixed by deriving `slotR` from the canvas size and the
  marker radius instead of a fixed fraction (`slotR = size/2 - markerR - size*0.02`, with
  `ringR` matched to it), so every marker plus its stroke stays fully inside the canvas with a
  small margin, at any wheel size.
- **Four new numerology readings added**, all generic/public-domain techniques (same standing
  as everything else in this feature — see Phase 9's own note on the digit-sum method not
  being any one author's proprietary system):
  - **Hidden Talents** (`getHiddenTalentDigits` in `numerology.ts`) — reuses the Pythagorean
    Square's digit counts rather than a new calculation: whichever digit(s) reach the same
    "strong" threshold (count ≥ 4) already used for `pythagoreanTraitLevel` are read as a
    natural, well-developed gift. Can return an empty list (a birth date with no standout
    digit) — handled in the UI with a "balanced, no dominant digit" message
    (`HIDDEN_TALENT_BALANCED_NOTE`) rather than treated as missing data.
  - **Karmic Lesson Numbers** (`getKarmicLessonNumbers` in `numerology.ts`) — a different
    technique from the name-letter numbers above: instead of summing letter values, it checks
    *which* digits 1-9 the Pythagorean letter-value table never produces at all for a given
    name, and reads each missing digit as an undeveloped area. Same Latin-only convention and
    `null`-if-no-Latin-letters contract as Destiny/Soul Urge/Personality. Can return an empty
    array (every digit present) — handled with `KARMIC_LESSON_NONE_NOTE`.
  - **Pinnacle Cycles / "Life Stages"** (`getPinnacleCycles` in `numerology.ts`) — four
    successive periods covering a birth-to-death span, each read through one reduced number:
    P1 = reduce(reduce(month)+reduce(day)), P2 = reduce(reduce(day)+reduce(year)), P3 =
    reduce(P1+P2), P4 = reduce(reduce(month)+reduce(year)) — master numbers preserved
    throughout (unlike Personal Year, which never produces 11/22). Age ranges use the common
    "36 minus Life Path" rule for when the first cycle ends, 9 years per cycle after that, and
    an open-ended fourth cycle. **Documented judgment call**: when the Life Path number itself
    is a master number, this reduces it (11→2, 22→4) for that one subtraction, since using 11
    or 22 directly would push the first cycle's end past age 36 in a way most sources don't
    show — sources disagree on this point, so it's worth a second look if a stricter reading
    is wanted later.
  - **Career & Financial Potential** (`careerFinanceExplanations.ts`) — no new calculation;
    reads the already-computed Destiny Number through two new lenses (which fields/roles tend
    to suit the person, and how money tends to move for them) rather than a third.
- **New content/presentation files**: `hiddenTalentExplanations.ts`, `karmicLessonExplanations.ts`,
  `careerFinanceExplanations.ts`, `pinnacleExplanations.ts` (all English-source, localized live
  via `useTranslatedTexts` same as the rest of the screen's generated copy), and a new shared
  presentational component `NumerologyInsightList.tsx` — a plain label+paragraph list styled to
  match `PythagoreanSquareGrid`'s trait rows, reused for all four new sections' card bodies
  instead of one bespoke layout per section.
- **Screen layout** (`NumerologyHomeScreen.tsx`): sections now run birth-date numbers → name
  numbers (or the Latin-name hint) → Hidden Talents (always shown — it only needs the birth
  date) → Pythagorean Square → Karmic Lessons (gated on having name numbers) → Career &
  Finance (gated on having name numbers, since it reads the Destiny Number) → Life Stages
  (always shown). The screen's combined translation batch (`sourceTexts` passed once to
  `useTranslatedTexts`) now tracks section start-offsets dynamically (via `Array.push`'s
  return length) instead of hardcoded indices, since the Karmic Lessons list's length varies
  per person (0–9 missing digits) and a fixed-index scheme would have broken as soon as that
  count changed.
- **Numerology compatibility feature, built this round** — the open item above is resolved.
  Asked which existing zodiac-compatibility UX to mirror; the answer was the simple sign-only
  "Zodiac Match" picker (`CompatibilityScreen.tsx` is in fact that simple picker itself — on
  inspection there's no separate Friends-based compatibility screen in this app; `FriendMatch`
  is a dead navigation target in `FriendsScreen.tsx`, a pre-existing gap unrelated to this
  work).
  - **New screen**: `NumerologyMatchScreen.tsx` (`NumerologyStackParamList.NumerologyMatch`,
    registered in `NumerologyNavigator.tsx` as a modal, same `presentation`/`animation` as
    `ProfileNavigator`'s `Compatibility` screen). Structure deliberately mirrors
    `CompatibilityScreen.tsx` line for line where the pattern transfers directly: same header,
    same `HeartPulse`/`ConnectorDots`/`usePercentCountUp` animation helpers (duplicated into
    the new file rather than extracted to a shared module, matching how the zodiac version
    doesn't share them either), same percent-count-up + headline/blurb result card.
  - **Where it had to diverge**: the zodiac version's input is a tap on one of 12 fixed sign
    icons — there's no equivalent fixed small set for numerology, since the required input is
    a birth date. Swapped the sign grid for a single birth-date picker row, reusing the same
    `@react-native-community/datetimepicker` usage already established in
    `onboarding/screens/BirthDateScreen.tsx` (iOS spinner / Android native dialog, dark
    `themeVariant`). Picking a date computes and shows the result immediately — no separate
    "Calculate" step — keeping the same zero-friction, tap-and-see feel as tapping a sign.
    Also added a small `NumberBadge` component (a plain round numeral badge) standing in for
    `ZodiacIcon`, since Life Path numbers have no icon set.
  - **New calculation**: `getNumerologyCompatibility(a, b)` in `numerology.ts`, compared
    against the **Life Path Number** (`getMissionNumber` — the full birth date reduced) for
    both people, not Destiny/Soul Urge/Personality — Life Path is the one number everyone has
    without needing a Latin name, which matches the zodiac version's "only one input needed"
    simplicity. Deterministic and transparent by design, same spirit as `getCompatibility()`
    for zodiac signs: treats the two numbers as points on a 1-9 ring (master numbers 11/22
    reduced to their root, 2/4, for this one comparison only), scores by ring distance
    (`95 - distance*13`, clamped 40-97), and picks one of five headline tiers from the result.
    This is a generic heuristic of this app's own construction, not a transcription of any
    named tradition's compatibility chart — verified with a standalone Node script against
    every unordered pair of the 11 possible Life Path values (1-9, 11, 22) before being
    written into `numerology.ts`, confirming a reasonably even spread across the five score
    bands rather than clustering.
  - **Entry point**: `NumerologyMatchPreviewCard.tsx`, same shape as
    `profile/components/CompatibilityPreviewCard.tsx` (a `GlassCard` with a title, subtitle,
    and outline `GlowButton` that calls `navigation.navigate("NumerologyMatch")` via
    `useNavigation`), added as the last section of `NumerologyHomeScreen.tsx`.
  - **i18n**: new `numerology.match.*` keys (title, you/partner/choose labels, matchEnergy,
    date-picker prompt/label, and the preview card's title/subtitle/cta) added to all three
    locales — static chrome, so these live directly in `translations.ts` rather than going
    through `useTranslatedTexts` the way the generated headline/blurb text does.
- **Not done / open**: none remaining from this round. The one pre-existing, unrelated gap
  noticed in passing — `FriendsScreen.tsx` navigating to a `FriendMatch` route that isn't
  registered in any navigator — is worth a look separately, but is not part of the numerology
  feature and was left untouched.

---

## Phase 9 follow-up 3 — daily numerology widget (Personal Day Number)

- **New calculations** in `numerology.ts`, extending the existing Personal Year technique one
  (then two) steps further, same no-master-numbers convention:
  - `getPersonalMonthNumber(birthDateISO, date)` = reduce(Personal Year + calendar month).
  - `getPersonalDayNumber(birthDateISO, date)` = reduce(Personal Month + calendar day).
  - `getPersonalDayScores(personalDay)` — a small fixed table giving each Personal Day digit
    (1-9) three 0-100 "weather" scores: focus/energy, finance & career favorability, and
    relationship favorability. This app's own deterministic reading of the day numbers'
    well-known generic meanings (1 = beginnings/leadership, 8 = money/business, 6 =
    home/family, 7 = solitude, etc. — the same meanings the request itself listed), not a
    transcription of a named tradition's chart. Verified standalone (Node script) against five
    sample birth dates for a fixed "today" before being written into the app, confirming every
    output lands in 1-9 as expected (Personal Day never produces a master number, consistent
    with Personal Year).
- **New content file** `personalDayExplanations.ts` — three `Record<1-9, string>` tables
  (`PERSONAL_DAY_FOCUS`, `PERSONAL_DAY_FINANCE`, `PERSONAL_DAY_RELATIONSHIPS`), each digit's
  entry expanded from a one-line meaning into a fuller, actionable paragraph (requested
  explicitly — "расписать поподробней") covering what to focus on, whether it's a day to move
  on money/career decisions, and how favorable it reads for relationships.
- **New widget** `NumerologyDailyWidget.tsx` — the numerology tab's equivalent of My Day's
  `HoroscopeWidget.tsx`, placed as the first item in `NumerologyHomeScreen.tsx`'s stack, same
  position `HoroscopeWidget` holds on `MyDayHomeScreen.tsx` (screen header first, then this
  widget as the stack's first child). Deliberately simpler than `HoroscopeWidget`, since a
  Personal Day reading needs no API call: no period tabs (daily only — a "personal week/month"
  reading wasn't asked for), no loading skeleton, no share capture. Keeps the same header shape
  (a round badge — reusing the Personal Day digit instead of a zodiac icon — eyebrow, and a
  localized weekday+date line) and the same **three `RadialGauge` dials** from
  `@shared/components` (the "progress bars" asked for) for focus/finance/relationships, colored
  distinctly (accent/gold/rose) and staggered with the same delay pattern `HoroscopeWidget`
  uses for its four gauges. The finance and relationships paragraphs are shown via the existing
  `NumerologyInsightList` component rather than a new tips-column layout, reusing a component
  already established earlier this phase instead of adding another one-off list shape.
- **i18n**: new `numerology.daily.*` keys (eyebrow, finance/relationships labels, three gauge
  labels) added to all three locales.
- **Not done / open**: no "personal week" or "personal month" reading surfaced in the UI yet —
  `getPersonalMonthNumber` exists and is exercised internally (Personal Day is derived from it)
  but isn't shown on its own. Could be added later the same way Personal Year already is, if
  wanted.

---

## Phase 8 follow-up — planetary aspects, the natal-chart rework's next stage

Picking back up the natal-chart rework (Phase 8: Stage 1 real Moon/planets, Stage 2 real
geocoded Ascendant, Stage 2b offline city autocomplete) with the stage after that: **planetary
aspects** — the angular relationships between planets that turn a list of placements into an
actual chart reading. Built as a **separate screen**, not folded into `FullChartScreen.tsx` —
that screen's 300px wheel is already dense (8 planet markers on up to 2 lanes, 12 house
badges, the Ascendant), and a classic aspect web draws its lines through the chart's center,
exactly where the Whole Sign house ring already sits. A bigger, dedicated canvas was the only
way to show the aspect web clearly, and it's also a clean candidate for the next roadmap item
(premium gating on a "deep natal chart") — a whole screen is a simpler thing to gate later than
one visual layer peeled out of an already-free screen.

- **Aspect calculation**, `getNatalAspects()` in `astrology.ts` — the five major aspects
  (conjunction 0°, sextile 60°, square 90°, trine 120°, opposition 180°), each with its own orb
  (how many degrees off-exact still counts: 8° for conjunction/trine/opposition, 7° for square,
  6° for sextile — standard, commonly-used sizes, not a claim to one universal table). Computed
  directly from `getNatalPlacements()`'s existing real-ephemeris longitudes — no new
  astronomical data needed, just the angular separation between every unique pair of the ten
  bodies (45 pairs), closest-matching aspect type wins on the rare case a separation sits near
  two orbs at once. **Verified in a standalone Node script before being written into the app**
  (same discipline as the Ascendant solver and every other numerology formula this project
  has added) — checked `circularSeparationDeg`'s wrap-around case (e.g. 350° vs 10° → 20°, not
  340°) and a deliberately dense 8-body sample that produced the expected conjunction/
  sextile/square/trine/opposition classifications, including exact-angle edge cases (orb 0).
- **New content** `aspectExplanations.ts` — one explanation per aspect **type** (5 entries, not
  per specific planet pair — 45 pairs × 5 types would be far more than a type-level read needs),
  English-source, localized live via `useTranslatedTexts` like the rest of this app's generated
  content.
- **New screen** `AspectsScreen.tsx` (`ProfileStackParamList.Aspects`, modal, same
  presentation/animation as `FullChart`), reached via a new "View Planetary Aspects" button
  added to the bottom of `FullChartScreen.tsx`. Below the wheel, every found aspect gets its
  own card: a colored dot + aspect-type label, the two planets' glyphs and names, and that
  type's explanation text.
- **New wheel component** `AspectWheel.tsx` — a plain zodiac ring (reusing `NatalWheelSVG` with
  `showInnerChart={false}`, since the aspect lines are this wheel's own "inner chart" now) with
  the ten bodies around one band (same greedy lane-spread `FullChartWheel` uses for close
  conjunctions, duplicated locally rather than exported/shared — small, screen-specific layout
  helpers, same convention this app already follows for things like `HeartPulse`/
  `ConnectorDots`) and the aspect lines drawn straight through the middle. Aspect color follows
  the same "tint carries meaning" convention `ELEMENT_COLOR` already uses: trine/sextile
  (harmonious) in success-green/teal, square/opposition (tense) in rose/danger-red, conjunction
  in neutral gold.
- **Animation, explicitly requested to not just be an entrance reveal but a continuous loop** —
  two layers:
  1. **Entrance**: each aspect line draws itself in (`strokeDasharray`/`strokeDashoffset`,
     computed from the line's real Euclidean length since these are straight lines, not arcs),
     staggered ~90ms apart so the web appears to connect one line at a time rather than all at
     once — plus the same overall fade/scale-in + slow "breathing" scale pulse pattern
     `FullChartWheel` already established for its own entrance.
  2. **Perpetual loop, starting right as each line's own entrance finishes**: a small bright
     spark travels back and forth along each line between its two planets (an "energy flowing
     between them" visual — thematically fitting, since an aspect *is* an energy relationship
     between two planets), and each line's own opacity breathes gently between ~0.4 and 1. Both
     loops run on **per-line timings nudged by that line's stagger delay** (`1700 + (delay %
     400)` / `2200 + (delay % 600)` ms), specifically so the whole web feels organic rather than
     every connection pulsing or flowing in perfect lockstep — a field of independently "alive"
     connections rather than one synchronized animation.
  3. **Implementation note**: each aspect line is its own small component (`AspectLine`),
     owning its own shared values and `useEffect`, rather than the parent trying to hold a
     dynamically-sized array of shared values for however many aspects a given chart happens to
     have (that count varies chart to chart) — same "small self-contained animated unit, mapped
     over" pattern this app already uses elsewhere (`HeartPulse`, `ConnectorDots`,
     `RadialGauge`), just applied per-line instead of per-widget.
- **i18n**: new `aspects.*` namespace (title, subtitle, empty-state copy, the five aspect-type
  labels) plus `fullChart.viewAspects`, added to all three locales.
- **Not done / open**: no premium gating on `AspectsScreen` yet — it's fully open, same as
  `FullChartScreen`. That's the next item on the natal-chart roadmap (deep-chart premium
  gating), deliberately left for its own pass rather than bundled into this one. Minor aspects
  (semisextile, quincunx, semisquare, etc.) are out of scope by design — kept to the five majors,
  which is the standard scope for a chart read at this level of detail.

## Phase 8 follow-up 2 — aspects screen refinements (button placement, spark pacing, selectable highlighting) — REVERTED

Everything described in this section was reverted right after, back to the exact state from
"Phase 8 follow-up" above: the button is back at the bottom of `FullChartScreen.tsx`'s scroll
(after the footnotes), `AspectWheel.tsx`'s `AspectLine` is back to the plain two-point spark
tween with no `muted`/`dim` handling, and `AspectsScreen.tsx` has no selection state — rows are
plain, non-interactive cards again, same as the first round. Left this section in place rather
than deleting it, as a record of what was tried; the description below no longer matches the
current code.

Three explicit refinements to the just-built Aspects feature, all in response to direct
feedback after seeing the first round described above (no on-device look yet, so this is
still feedback on the described behavior, not a review of a running build):

- **"View Planetary Aspects" button moved to right under the wheel** on `FullChartScreen.tsx`
  — it used to sit at the very bottom of the scroll, after the planet-placement card and both
  footnotes, where a user would only find it after scrolling past everything else. Now it's
  the first thing after the wheel itself, before the placements card, so the path from "see
  the chart" to "see the aspects" is immediate rather than buried.
- **Traveling sparks fly less often.** The per-line spark used to shuttle back and forth on a
  plain two-point tween (`2200 + (delay % 600)`ms each way, no pause) — in motion essentially
  all the time. `AspectLine` in `AspectWheel.tsx` now runs the spark on an explicit
  travel → rest → travel → rest sequence (`travelMs = 1900 + (delay % 500)`, `restMs = 1500 +
  (delay % 700)`), so each spark visibly arrives, pauses, and only then starts back — noticeably
  calmer and less busy on a chart with a dozen-plus lines animating at once. The line's own
  opacity-breathe loop is untouched.
- **Aspects below the wheel are now selectable.** `AspectsScreen.tsx` holds a `selectedKey`
  (`${a}-${b}`) in state; tapping a card toggles it (tap again, or the request's "сбрасывать до
  дефолта если выбор снят" — reset to default if the selection is cleared, both read as the
  same toggle-off behavior). `AspectWheel` takes the new `selectedKey` prop and computes, per
  line, `muted={selectedKey != null && selectedKey !== aspKey}`; `AspectLine` tweens a `dim`
  shared value (260ms) on `muted` changing, fading the unselected lines' opacity down and
  swapping both the line's stroke and its spark's fill to a shared `MUTED_COLOR`
  (`colors.textTertiary`) rather than snapping instantly — so picking an aspect reads as "the
  rest recede" rather than an abrupt flash. The selected row also gets a visual marker (colored
  border matching the aspect's own tint, `sparkles` turned on) so the list and the wheel agree
  on which aspect is active.
- **Not done / open**: no "tap elsewhere to deselect" affordance beyond re-tapping the same
  row — there's no backdrop-tap-to-clear, since the whole screen is a scroll view, not a modal
  with empty space to tap. Worth revisiting if a user expects tapping the wheel itself (not just
  the list) to also select/deselect an aspect — currently the wheel is display-only and all
  selection happens from the list.
- **Still unverified on-device** (same caveat as everything in this project): all three changes
  are syntax-checked only (`transpileModule`, no type-checking, no module resolution — the only
  verification available in this sandboxed session). Worth confirming, on the next real build:
  that the button's new position doesn't crowd the wheel when the screen first opens; that the
  slower spark cadence actually reads as calmer rather than oddly stalled; and that tapping a
  card smoothly dims the rest of the web rather than popping, and correctly un-dims everything
  when the same card is tapped again.

## Tarot — new card art (full 78-card deck + back) and a flip-animation fix

Replaced every tarot image in the app with a new, purpose-made deck supplied as 79 SVGs
(78 cards + the back), plus fixed a real bug in the "card of the day" flip animation that had
been live since that feature was first built.

- **New deck, source format**: each card SVG shares one `viewBox="0 0 360 600"` and is a
  complete, self-contained design — dark gradient background, gold line art, card name/number,
  and the upright meaning's text — matching this app's existing gold-on-dark aesthetic far more
  closely than the old stock-photo/mixed-source art it replaces. Each card SVG also bakes in a
  **second, upside-down "REVERSED" text block** (label + reversed-meaning line) at the top of
  the canvas — meaning the art was designed to be shown rotated 180° for a reversed draw, not
  just cropped/relabeled. That happens to line up exactly with how this app already renders a
  reversed card (`transform: [{ rotate: "180deg" }]` on the whole image, in both
  `CardDrawScreen.tsx`'s `ResultImage` and `DrawnCardReveal.tsx`) — no changes needed there, the
  new art is already "reversed-ready" for that existing logic.
- **Rasterized to PNG, not shipped as SVG**: this project has no SVG-to-component metro
  transform configured (no `react-native-svg-transformer`, no custom `metro.config.js`), and
  `cardImages.ts` is a static `require()` map of PNGs (RN requires static, build-time-resolvable
  paths). Converting the whole deck to a new SVG-import pipeline would have meant adding a new
  build dependency this sandboxed session can't install or verify — so instead, every SVG was
  rasterized to PNG at 720×1200 (2×, for retina) using the pre-installed Playwright/Chromium
  (each SVG loaded into a minimal HTML wrapper sized to the target pixel dimensions, then
  screenshotted), then **re-encoded as palette (indexed-color) PNGs via `sharp`**
  (`{ palette: true, compressionLevel: 9 }`) — this art is flat gradients + line work, not
  photographic, so palette quantization is lossless-looking but cut the set from **56MB to
  11.6MB** (79 files, ~147KB average) before anything was committed to the device.
- **Filenames unchanged, only content replaced**: the new renders were named to match the
  kebab-case ids `cardImages.ts`/`tarotCatalog.ts`/`tarot-manifest.json` already use (e.g. the
  SVG `minor_cups_11_page.svg` → `page-of-cups.png`, `major_08_strength.svg` → `strength.png`),
  so every major (`assets/tarot/major/*.png`, 22 files) and minor (`assets/tarot/minor/*.png`,
  56 files) PNG was overwritten in place at its existing path — **no changes needed to
  `cardImages.ts`, `tarotCatalog.ts`, or `tarot-manifest.json`**, since none of those reference
  pixel content, only filenames. The old flat `assets/tarot/*.jpg` files (an older, apparently
  already-unused source set — confirmed nothing in `src/` still requires them) were left alone,
  untouched and still unused.
- **Card back is now the deck's own illustrated back**, not a hand-drawn placeholder. The old
  `CardBack.tsx` drew a small programmatic natal-wheel motif directly with `react-native-svg`
  primitives (`Circle`/`Line`/`Path`); it's now a plain `Image` of the new
  `assets/tarot/card-back.png` (a radiant-moon motif, symmetric top-to-bottom so it reads the
  same either way up), keeping the same `{ width, height }` prop interface so `CardPickGrid.tsx`
  and `DrawnCardReveal.tsx` needed no changes beyond the import.
  - **Note for later polish, not fixed this round**: the new face-card art already draws its own
    gold rounded-rect border into the image itself. `ResultImage`/`DrawnCardReveal`'s front face/
    `CardOfDayWidget`'s thumbnail all *also* add their own `borderWidth`/`borderColor:
    colors.goldLine` frame around the `Image`, which was needed for the old borderless stock art
    but now doubles up with the art's own baked-in border. Left as-is since it wasn't asked for
    and isn't a functional bug — worth a quick look on the next real build to see if it actually
    reads as redundant in practice before trimming those wrapper borders.
- **Flip-animation "stretch" bug, found and fixed** — `DrawnCardReveal.tsx`'s `flipStyle` (the
  per-frame style driving the big reveal animation: center-screen flip, then shrink-and-glide to
  the docked slot near the top) computed `rotate` and `scaleX` via
  `interpolate(progress.value, [0, 0.25, 0.5], [...])`, **with no extrapolation option** — but
  `progress` is a single shared value that drives the *entire* sequence, not just the flip: it
  continues on from 0.5 to 1.0 for the second phase (shrink + `translateY` to the dock). reanimated's
  `interpolate` defaults to `Extrapolation.EXTEND`, which keeps projecting a curve's last segment's
  slope forward past its final breakpoint rather than holding the last value. `scaleX`'s last
  segment (0.25→0.5: 0.05→1) has a steep slope; left unclamped, it kept climbing well past 1 as
  `progress` continued 0.5→1 — reaching roughly **3× width** by the time progress hit 1.0. That's
  exactly the "stretches horizontally" moment described: not a flip-math problem at all, but the
  flip's own style object still being evaluated (and its curve still extrapolating) during the
  unrelated dock-glide phase that follows it. **Fix**: added `"clamp"` as the fourth argument to
  both `interpolate` calls in `flipStyle`, so `rotate` and `scaleX` hold at their flip-complete
  values (180°, scaleX 1) for the rest of the animation once `progress` passes 0.5. No other
  change to the animation's shape or timing.
- **Not done / open**: still haven't seen any of this running on-device — same caveat as
  everything in this sandboxed build. Worth confirming, on the next real build: that the new
  card art reads clearly at the grid's small face-down size (`CARD_W`×`CARD_H`, ~1:1.62, slightly
  squatter than the art's native 1:1.667 — `resizeMode="cover"` will crop a sliver off top/bottom,
  same as it already did for the old mixed-aspect-ratio source photos) and at the `CardOfDayWidget`
  thumbnail's small size (64×108); that the reversed-card rotation genuinely lines up with the new
  art's baked-in "REVERSED" block the way the SVG design intends; and — the actual point of the
  fix — that the flip-to-dock animation now glides smoothly with no stretch/snap at any point.

## NatalWheelSVG — zodiac ring now uses the app's real zodiac icon set — REVERTED

The 12 zodiac glyphs drawn around the outer band of `NatalWheelSVG.tsx` (the shared wheel
behind every natal/astral chart — `FullChartWheel`, `AspectWheel`, `NatalChartWheel`, plus its
several decorative-background uses in `ScreenBackground`, `NatalLoader`, `AffirmationWidget`,
`PlayerScreen`, `AuthScreen`, `BirthDateScreen`) were hand-drawn simplified vector strokes from
`zodiacGlyphPaths.ts` — a 24×24-viewBox approximation of each symbol, built before this project
had a proper icon set. The app already *has* one: `assets/zodiac/*.png` (512×512, white-on-
transparent line art) plus the `ZODIAC_IMAGES` require-map and `ZodiacIcon` component built
around it, both added in an earlier round and already used for the zodiac badges elsewhere in
the app (sign pickers, horoscope widgets) — just never wired into this particular wheel. Swapped
the ring over to that same icon set.

- **Why not just drop a `ZodiacIcon` per glyph**: `ZodiacIcon` renders via a plain RN `Image`,
  which can't be mixed directly into an `<Svg>` tree the way the old `<Path>` glyphs could —  and
  the glyphs need to live *inside* the same `Svg` as the rest of the wheel (ring, dividers,
  compass core) so they share its exact coordinate space, rotate/scale with it as one piece, and
  (for the decorative background uses) fade together via the wheel's single `opacity` prop.
  `react-native-svg` does have its own `Image` primitive for embedding a raster source inside an
  `<Svg>`, but unlike RN's `Image` it has no `tintColor` — and this wheel needs each glyph tinted
  to whichever `glyphColor` the caller passes (`colors.gold` everywhere except `NatalLoader`,
  which passes `colors.accent`).
- **Fix: icon-as-alpha-mask.** Each sign now gets a `<Mask>` in the `Svg`'s `<Defs>` whose only
  content is that sign's `ZODIAC_IMAGES` icon (`react-native-svg`'s `Image`, `href={...}`)
  positioned at the glyph's wheel coordinates; a solid `<Rect>` filled with `glyphColor` is then
  drawn at those same coordinates with `mask={`url(#...)`}`. SVG masking is luminance × alpha, so
  the icon's transparent background contributes nothing (masked out) and its opaque white line
  art contributes full luminance (masked in) — the net effect is the icon's exact silhouette,
  recolored to `glyphColor`, same as the old stroked paths but using the real icon art instead of
  an approximation.
- **Mask ids are namespaced per component instance** (`` `${React.useId()}-zodiac-${sign}` ``)
  rather than a fixed string — several of this wheel's own call sites mount two instances at once
  (e.g. `FullChartScreen`'s `ScreenBackground` watermark wheel behind its own `FullChartWheel`),
  and `react-native-svg` mask/def ids are a shared namespace per app, not auto-scoped per `<Svg>`
  — a fixed id risked one instance's mask bleeding into (or overwriting) another's, particularly
  on Android. `React.useId()` (React 18, already in use via Expo SDK 51) guarantees a stable,
  unique prefix per mounted instance.
- **Sizing**: kept the glyphs at roughly their old footprint (`size * 0.072` bounding box here vs.
  the old `size * 0.052` 24-unit path box — bumped up slightly since the icon art has its own
  internal padding baked in, unlike the old paths which filled their box edge-to-edge) and the
  same `glyphR`/12-way angular spacing, so the ring's overall density and layout shouldn't shift
  noticeably from before — only the glyph artwork itself changes.
- **`zodiacGlyphPaths.ts` left in place but now unused** (nothing else in `src/` imports
  `ZODIAC_GLYPH_PATHS`) — not deleted, in case it's still wanted as a fallback or reference; safe
  to remove in a later cleanup pass if confirmed unneeded.
- **Not done / open, same caveat as always**: unverified on-device. This was a fairly involved
  SVG-masking change (new in this codebase — no other component here uses `Mask`/`Defs` this
  way, only `MoonPhaseSVG.tsx`'s simpler `RadialGradient`), so it's worth a closer look than
  usual on the next real build: confirm the masked icons actually render (masking support can be
  flakier than plain fills/strokes on some Android GPU/driver combinations with
  `react-native-svg`), that they're recognizable at this small size (~22px on a 300px wheel) and
  correctly tinted on both the gold and accent variants, and that nothing bleeds between the two
  simultaneously-mounted instances on `FullChartScreen`.

**Reverted right after**, before ever being seen on a device — asked to go back to how it was,
likely over that exact same "unverified, first use of SVG masking in this codebase" caveat.
`NatalWheelSVG.tsx` is back to its previous hand-drawn-path glyphs (`ZODIAC_GLYPH_PATHS` /
`zodiacGlyphPaths.ts`, byte-identical to before this section). Left this writeup in place as a
record of the approach, in case it's worth revisiting later with an actual on-device look first
rather than as a blind swap.

## Known gaps / things to verify before shipping

- **Paywall pricing** is placeholder ("Price TBA") by design — fill in
  `features/paywall/data/plans.ts`.
- **Paywall has no real purchase flow** — "Continue" just sets a local flag. Wiring a
  real subscription (RevenueCat, StoreKit/Billing) is separate work; once it exists,
  call `logPurchase` from `shared/analytics/analytics.ts` in its success callback (see
  Phase 5).
- **Firebase Analytics needs a native build** — `@react-native-firebase/*` doesn't run
  in Expo Go; see Phase 5 for the dev-client/EAS Build requirement and the still-missing
  Android `google-services.json`.
- **i18n covers static chrome + a growing list of dynamic content** (see Phase 3 item 2
  and Phase 4 item 1) — some generated copy may still be English-only; check each
  screen's `useTranslatedText(s)` coverage before shipping a non-English build.
- **Apple/Google Sign-In** are UI placeholders ("coming soon") — see the note at the
  bottom of `shared/firebase/authActions.ts` for what finishing them needs.
- **Firestore rules are a minimal starting point** (`firestore.rules`) — ownership
  checks only, no field-shape validation; review before shipping.
- **Ascendant is real when the profile has a geocoded birth location, estimated otherwise**
  (`resolveAscendant` — see Phase 8's Stage 2 addendum) — depends on `expo-location`'s native
  geocoder succeeding, which isn't guaranteed (no geocoder service, permission denied,
  offline, an unresolvable city string) and **hasn't been run on an actual device yet** in
  this sandboxed build — verify the geocoding → timezone → real-Ascendant chain on-device,
  including that Hermes's `Intl` has full IANA tz data, before relying on it. `npx expo
  install expo-location` (not raw `npm install`) is required so the new native module lands
  in the already-prebuilt `ios`/`android` folders — rebuild the dev client after. Moon sign
  and all planet placements are real as of Phase 8 (`getMoonSign`/`getNatalPlacements`), now
  using the precise timezone-aware instant when one is available.
- Everything else inherited from Phase 1's own gaps list still applies: local heuristic
  stand-ins for the text-AI/voice-AI calls described in the spec, simulated audio
  playback with no real TTS/audio synthesis, and no `npm install`/`expo-doctor`/device
  run performed in this sandboxed build environment (every file was instead checked with
  `esbuild` for
  syntax only — see each phase's commits for the exact command used).
- **Life Path Number (Phase 9, plus its follow-up) hasn't been seen running on-device** — same
  caveat as everything else in this sandboxed build: syntax-checked only (via a TypeScript
  `transpileModule` script, not `esbuild`/`tsc`, since no deps are installed here), never
  actually rendered. Worth confirming the new tab icon, the Sanctuary-tab removal, both group
  cards' wheels, the Pythagorean Square grid, and the "add your name in Latin script" fallback
  (test with a Cyrillic-only name) all look right after the next on-device reload.
- **Life Path Number follow-up 2** (wheel-clipping fix + Hidden Talents/Karmic Lessons/
  Career & Finance/Life Stages sections) — same caveat again: syntax-checked only, never
  rendered. Worth confirming the wheel no longer clips at the top/bottom marker position, the
  Hidden Talents "balanced, no dominant digit" fallback actually shows for a birth date with
  no standout digit, and the Karmic Lessons list renders correctly for both a name missing
  several digits and one missing none.
- **Numerology Match** (this round's compatibility feature) — same caveat: syntax-checked
  only, never rendered. Worth confirming the partner date picker opens correctly on both iOS
  (spinner) and Android (native dialog), that picking a date immediately reveals the partner's
  number and the result card, and that the modal opens/dismisses correctly from the new
  preview card at the bottom of the Life Path Number screen.
- **Numerology daily widget** (Personal Day Number, this round) — same caveat again:
  syntax-checked only, never rendered. Worth confirming the three `RadialGauge` dials animate
  and lay out correctly at three-across (My Day's `HoroscopeWidget` uses four), that the badge
  + eyebrow + date header row looks right at the top of the Life Path Number screen, and that
  the weekday/date line localizes correctly in all three locales (it reuses `date-fns`'s
  `enUS`/`ru`/`uk` locale objects the same way `HoroscopeWidget` already does).
- **Planetary Aspects screen** (this round) — same caveat: syntax-checked only, never
  rendered. The aspect math itself was verified standalone in Node, but the animation timing
  (staggered line draw-in, then the per-line traveling-spark + opacity-breathe loops) hasn't
  been seen running — worth confirming on-device that the stagger reads as intentional rather
  than janky, that the traveling sparks are visible at this line thickness/size, and that a
  chart with many aspects (a dense conjunction cluster) doesn't visually overwhelm the 320px
  wheel.

## Premium gating — the deep natal chart (FullChart + Aspects), bundled

The natal-chart rework's next stage after planetary aspects (Stage 3, now
complete): gating the "deep natal chart" behind Premium. Asked explicitly
which scope to gate — aspects-only, a partial-preview-then-paywall, or the
full chart and aspects screens together — and the answer was **FullChart +
Aspects together, as one bundled feature**. That shaped the whole approach
below: there's no partial preview and no separate gate on the Aspects
screen itself, because by the time anyone can reach it they've already
cleared the one gate that covers both screens.

**Where the gate actually sits.** Grepped the whole `src/` tree for every
navigation into `"FullChart"` and `"Aspects"` (including the navigator's
own screen registrations, to rule out a deep-link config pointing at either
route) and found exactly three call sites:
- `AstroPassportCard.tsx` — the "Sun lives in House N" line (a `Pressable`)
  and the "View full chart" `GlowButton` below it. Both navigate straight to
  `FullChart`.
- `FullChartScreen.tsx`'s own "View Planetary Aspects" button, which
  navigates to `Aspects`.

No deep-linking config exists in this app at all (`src/app/` has no
`linking` setup), so those three are genuinely the only paths in. That
means gating both `AstroPassportCard.tsx` entry points is sufficient to
cover the whole bundle — anyone who reaches `FullChartScreen` has already
cleared the gate, so its own "View Planetary Aspects" button needed no
second check. Deliberately did *not* add a defensive mount-time guard
inside `FullChartScreen`/`AspectsScreen` themselves (e.g. bounce back if
`!isPremium`) — with no other entry point to defend against today, that
would only add a confusing double-gate experience (a paying user who
already got in, then hits a second, pointless check) for a risk that
doesn't currently exist. Worth revisiting only if a future entry point
(a push-notification deep link, a widget) is added later.

**Followed the app's existing gating convention exactly**, rather than
inventing a new one — the same pattern already used in
`LibraryList.tsx` (`sanctuary`): `usePremiumStore`'s `isPremium`,
`usePaywallNavigation()`'s `goToPaywall`, and an `Alert.alert(...)` with a
"maybe later" (cancel) / "upgrade" (→ Paywall) pair. Both `AstroPassportCard`
call sites now route through one shared `handleViewFullChart`:

```tsx
const handleViewFullChart = () => {
  if (!isPremium) {
    Alert.alert(t("fullChart.premiumAlert.title"), t("fullChart.premiumAlert.body"), [
      { text: t("fullChart.premiumAlert.later"), style: "cancel" },
      { text: t("fullChart.premiumAlert.upgrade"), onPress: goToPaywall },
    ]);
    return;
  }
  navigation.navigate("FullChart");
};
```

Added a small lock affordance too, matching `LibraryList`'s `LockIcon`
pattern (a local, per-file SVG icon rather than a shared component, same as
`PremiumBanner.tsx`'s `CrownIcon`) — but only on the `GlowButton`, via its
existing `icon` prop, shown when `!isPremium`:
`icon={!isPremium ? <LockIcon /> : undefined}`. Colored it `colors.gold` to
match that button's own `outline`-variant label color (`styles.labelOther`
in `GlowButton.tsx`), not the primary-variant color. Left the "Sun lives in
House N" line itself without a lock glyph — it reads as a sentence, not a
button, and a glyph there would look unrelated — the Alert on tap is enough
signal.

**i18n.** Added a `fullChart.premiumAlert` block (title/body/later/upgrade)
to all three locales in `translations.ts`, right after `fullChart.viewAspects`
— same shape as `sanctuary.premiumAlert`, named under `fullChart` rather than
`passport` since the feature being gated (and its copy) is about the chart
itself, not the passport card that happens to be where the gate lives.

**Not done/open, same caveat as always** — unverified on-device: syntax-
checked only (`node .../syntax-check.js`), never actually rendered. Worth
confirming on the next device run: the Alert copy/buttons look right in all
three locales, the lock icon renders at the right size/color inside the
outline `GlowButton` without throwing off its layout, and — once there's a
way to flip `isPremium` on-device — that tapping either `AstroPassportCard`
entry point while premium navigates straight through with no Alert.

## Removed authorization (sign-in) from the Profile screen — not needed yet

Asked to remove authorization since there's no need for it right now. The
only place it surfaced was `AccountCard` (`@features/friends`), rendered at
the bottom of `ProfileHomeScreen.tsx` — a "Sign in" / "Sign out" card backed
by Firebase email+password and Apple/Google OAuth (`AuthScreen.tsx`,
`authActions.ts`, `useAuthStore.ts`).

**Pulled `<AccountCard />` and its import out of `ProfileHomeScreen.tsx`**,
left a comment in its place, and left every underlying file untouched —
same "kept, not deleted" convention already used for the unlinked
Numerology/Sanctuary screens, in case sign-in is wanted again later once
Friends cloud sync actually ships.

**Worth flagging, found while tracing this**: `"Auth"` was never actually
registered as a route — `ProfileStackParamList` (`app/navigation/types.ts`)
only declares `ProfileHome` / `Compatibility` / `FullChart` / `Aspects`,
and `ProfileNavigator.tsx` only mounts those same four screens. Same goes
for `"Friends"`, `"AddFriend"` and `"FriendMatch"` — `AuthScreen.tsx` and
`FriendsScreen.tsx` both type themselves against route names that don't
exist on that param list, and `FriendsPreviewCard` (still on the Profile
screen) presumably navigates to one of them. So `AccountCard`'s "Sign in"
button would have crashed on tap even before this change — removing it
happens to fix that, but the same latent issue still sits behind
`FriendsPreviewCard`. Left that one alone since only authorization was
asked about — worth a look if/when Friends is meant to go live.

Syntax-checked only, not run on-device, same caveat as always.

## Premium Tarot Spreads — Stage 1: 3-card Past/Present/Future spread

First of three personal (non-social) Premium features picked as the next
monetization push — see the project's `competitive-analysis.md` doc for the
full staged plan across all three (tarot spreads, journal insights, deeper
daily content; voice/meditation premium was considered and dropped for now).
This is Stage 1 of item 1.

**New screen**: `TarotSpreadScreen.tsx` (`src/features/tarot/screens/`),
registered as `TarotSpread` on `MyDayStackParamList` / `MyDayNavigator.tsx`
(modal presentation, same as `CardDraw`). A fixed 3-position "Past ·
Present · Future" spread — no spread picker yet, just the one spread type.

**Why it isn't built on `CardPickGrid` + `DrawnCardReveal`** (the existing
card-of-day draw pieces): that pair is built around picking *one* card out
of a 12-card face-down grid, then flying that single card to one specific
dock position near the top of the screen. A spread needs several
*positions*, each fixed in its own spot from the start — there's nothing to
fly anywhere. So this introduces a parallel, simpler piece instead of
forcing the existing one to generalize:

- **`SpreadSlot.tsx`** (`src/features/tarot/components/`) — one spread
  position. Starts face-down (`CardBack`), flips in place when tapped using
  the same clamped `rotateY`/`scaleX` technique as `DrawnCardReveal`'s flip
  (`interpolate(..., "clamp")` — the exact bug fixed earlier this session),
  just without the shrink-and-glide dock phase, since the slot never moves.
- **`pickRandomCards(n, pool)`** added to `tarotCatalog.ts` alongside the
  existing `pickRandomCard` — shuffles and takes `n`, so a spread can't draw
  the same card twice (the single-card draw never had to worry about that).
- The screen holds 3 independent slots, each resolved from a pre-shuffled
  3-card pool picked on mount (`pickRandomCards(3)`); tapping an unrevealed
  slot fills it (card + 25% reversed chance, same odds as the daily draw)
  in any order — no requirement to reveal Past before Present, etc. Once
  all 3 are filled, a result card per position appears below (position
  label, card name, upright/reversed meaning via `useTranslatedTexts`,
  same translation pipeline as `CardDrawScreen`'s result panel) plus a
  "New spread" button that reshuffles and clears all 3 slots.
- Reused `CARD_W`/`CARD_H` from `CardPickGrid.tsx` for the slot size —
  those constants are already sized for 3 cards across the screen's
  padding (`GRID_COLUMNS = 3`), which happens to be exactly the right math
  for 3 slots side by side here too.

**Gating.** One entry point: a small "Try a 3-card spread" text link under
the Card of the Day widget on My Day (`CardOfDayWidget.tsx`), deliberately
placed *outside* the `ViewShot` capture area so it never ends up in a
shared screenshot of someone's daily card. Same gating pattern as the deep
natal chart and `LibraryList`: `usePremiumStore`'s `isPremium`,
`usePaywallNavigation()`'s `goToPaywall`, an `Alert.alert` with cancel/
upgrade, and a small lock icon next to the link when `!isPremium`.

**i18n.** New `tarotSpreads` namespace (cta, `threeCard.title/subtitle`,
instruction, `positions.past/present/future`, newSpread, premiumAlert) added
to all three locales in `translations.ts`, right after `cardDraw`.

**Not done / open, same caveat as always** — unverified on-device, syntax-
checked only: confirm the per-slot flip actually looks right at this size
(smaller than the single-card draw's big center-screen flip), that tapping
slots in a different order than Past→Present→Future feels fine rather than
confusing, that the lock icon/link row reads clearly under the existing
Card of the Day card, and that `pickRandomCards` never draws from an empty
remaining pool (it can't — `ALL_CARDS` has 78, far more than 3 — but worth
knowing if a future spread type asks for more cards than exist in a
restricted pool).

## Tarot Spreads follow-up — standalone home card, a real preview screen, and a real bug fix

Three things from a look at Stage 1 right after it shipped.

**1. Bug: "New spread" left slots blank.** `SpreadSlot.tsx`'s flip animation
only had a branch for `card` going from null → present (`useEffect(() => {
if (card) flip.value = withTiming(1, ...) }, [card])`). "New spread" resets
a slot's `card` back to `null` without remounting the component (same `key`,
just a prop change), so `flip.value` stayed at `1` from the previous reveal.
With `flip` stuck at 1: `backOpacity` (`flip < 0.5`) was false, so the card
back never showed, and the front face had no `card` to render either —
every slot went effectively blank until retapped… except tapping does
nothing once `card` is already (briefly) non-null again mid-animation. Net
effect: card backs "don't load" after a new spread, exactly as reported.
**Fix:** added an `else` branch — `flip.value = 0` (snap, no animation
needed) whenever `card` goes back to `null`.

**2. A real block on the home screen, not a text link.** The Stage-1 entry
point was a plain "Try a 3-card spread" text row tucked under
`CardOfDayWidget`. Pulled that out entirely and gave the feature its own
card: `TarotSpreadsWidget.tsx` (`src/features/my-day/components/`), styled
like the other My Day widgets (`GlassCard`, header row, lock badge when
`!isPremium`) with a small non-interactive preview — three mini `CardBack`s
in a row — next to the spread's name/subtitle, plus its own outline
`GlowButton`. Rendered as its own sibling block on `MyDayHomeScreen`,
between `CardOfDayWidget` and `AffirmationWidget`.

**3. A preview screen instead of jumping straight into a modal.** Tapping
the new card no longer opens `TarotSpreadScreen` directly as a bottom-sheet
modal. It now pushes a new `TarotSpreadIntroScreen.tsx` first — a real full
screen (not a modal), showing the spread's three positions as idle, gently
bobbing face-down slots (same bob technique as `CardPickGrid`'s grid cells,
just staggered per slot) with their labels, the spread's name/description,
and a "Begin the spread" button that pushes into the actual interactive
`TarotSpreadScreen`. Both `TarotSpreadIntro` and `TarotSpread` are now
registered without `presentation: "modal"` on `MyDayNavigator.tsx` (default
push/slide-from-right), dropping the modal presentation entirely for this
feature — intro screen now gives the feature real room instead of a sheet,
and is structured so a Stage 2 second spread type can add itself as another
preview card here later without reshaping this screen.

**i18n**: added `tarotSpreads.widgetTitle`, `widgetSubtitle`, and `start`
to all three locales, alongside the existing keys from Stage 1.

**Not done / open, same caveat as always** — unverified on-device: confirm
the "New spread" fix actually shows fresh card backs now (this one's
confident — the root cause is clear — but still unseen on a real device),
that the new widget's mini three-card preview reads clearly at that small
size, that the intro screen's bobbing preview doesn't feel janky at this
stagger/speed, and that back-navigation from the draw screen → intro →
home all feels right now that none of it is a modal.

## Tarot Spreads — bottom-padding bug fix + Stage 2 (Celtic Cross)

**Bug: "New spread" button sat under the tab bar, unreachable.**
`TarotSpreadScreen`'s `ScrollView` used `paddingBottom: insets.bottom +
spacing.xxl` (36px) — fine for a modal, which fully covers the custom
floating tab bar (`CustomTabBar.tsx`, `position: "absolute"`, rendered by
the tab navigator itself). But this screen stopped being a modal in the
previous round (switched to a plain push screen so Spreads wouldn't feel
like a bottom sheet), and a non-modal screen nested in a tab's stack still
sits *behind* that floating tab bar, not above it. 36px of clearance was
nowhere near enough — the real top-level tab screens (`MyDayHomeScreen`,
`ProfileHomeScreen`) already solve this the same way, with `paddingBottom:
insets.bottom + 110`. Applied that same `+110` constant here; `CelticCrossScreen`
(new, below) was built with it from the start.

**Stage 2: the Celtic Cross.** The second spread from the staged plan
(`competitive-analysis.md` → "Personal (non-social) monetization track").
New screen `CelticCrossScreen.tsx`, route `CelticCross` on
`MyDayStackParamList` (plain push, no modal, same as the 3-card spread).

- Ten positions in the classic order (also the reading/result order):
  Present, Challenge, Foundation, Past, Crown, Future, then the four-card
  staff — Attitude, External Influences, Hopes & Fears, Outcome.
- Reuses `SpreadSlot` (flip-in-place) at a smaller size (56×91 vs the
  3-card spread's 3-across size) and `pickRandomCards(10)` — no new
  drawing primitives needed, just more of them, arranged differently.
- Layout: a 3×3 cross (Crown above, Past/Future either side, Foundation
  below, Present+Challenge crossed in the center) plus a separate 4-card
  staff column to the right. The "Challenge" card is the base Present slot
  with a second `SpreadSlot` absolutely positioned on top and rotated 90°
  (`transform: [{ rotate: "90deg" }]` on a plain wrapping `View` — the
  rotation is static and sits outside `SpreadSlot`'s own flip animation
  entirely, so the two don't interfere). Only the four cross arms and the
  four staff cards get on-grid labels; Present/Challenge share one small
  caption underneath instead of two overlapping labels on a card that's
  already visually doing two jobs.
- Result list below (once all 10 are revealed) walks the same position
  order, same per-card GlassCard format as the 3-card spread's result
  cards.

**The intro screen is now a picker, not a single preview.** With two
spreads to offer, `TarotSpreadIntroScreen.tsx` changed from "preview one
spread, tap Begin" into a small list — one card per spread (3-card spread,
Celtic Cross), each with its own compact preview (three mini card backs for
the 3-card spread; a purely decorative plus-shaped dot cluster + a short
line of dots standing in for the cross-and-staff shape, for the Celtic
Cross — not meant to be literally counted, just legible at a glance as
"this one isn't a row") and its own "Begin" button. Built this way so a
future Stage 3 spread just adds another card here, same shape, same
`ScrollView` already using the `+110` bottom padding from the start.

**i18n**: added `tarotSpreads.celticCross.{title,subtitle}` and 7 new
position keys (`challenge`, `foundation`, `crown`, `attitude`, `external`,
`hopesFears`, `outcome` — `past`/`present`/`future` already existed and are
reused) to all three locales.

**Not done / open, same caveat as always** — unverified on-device: confirm
the cross+staff layout actually fits comfortably at this card size across
real screen widths (checked the arithmetic, not an actual render), that the
rotated "Challenge" card visually reads as crossing over "Present" rather
than looking like a stray sideways card, that the picker's two preview
styles (live mini card-backs vs. the dot schematic) don't feel mismatched
side by side, and — now that the bottom-padding root cause is understood —
that nothing else moved to push presentation earlier is quietly sitting
under the tab bar the same way.

## RevenueCat wired up — real prices + real purchase/restore/cancel

Replaces the Paywall's local-only stub (`usePremiumStore.setPremium` called
directly from button handlers, no store involved) with a real RevenueCat
integration. Matches the dashboard as configured:

- Offering `premium`, 3 packages: `premium_weekly`, `premium_monthly`,
  `premium_yearly` — same 3 ids used as the Product ids **and** as three
  separate Entitlements (one per tier, not a single shared `premium`
  entitlement — `bestActivePlan()`/`hasActiveEntitlement()` in
  `src/shared/revenuecat/purchases.ts` check all three rather than one
  well-known id).

**New**: `src/shared/revenuecat/purchases.ts` (SDK config, offering fetch,
mock↔live plan merge, entitlement→PlanId mapping, `openNativeSubscriptionManagement`)
and `useRevenueCatSync.ts` (configures once from App.tsx, mirrors
CustomerInfo → `usePremiumStore` via the update listener + an AppState
"active" refresh so cancelling in the App Store/Play Store settings is
picked up when the user comes back).

**Changed**: `PaywallScreen.tsx` now fetches the `premium` offering on
mount and merges it over the mock `PAYWALL_PLANS` from last session (see
`data/plans.ts`) — real localized price + a real "Save X%" recomputed from
the real numeric prices where a package was found, mock values as fallback
for any plan that wasn't (so the paywall never shows a blank price, it
silently upgrades from mock → real once the offering loads, same instant
either way if RevenueCat isn't configured). `handleContinue`/`handleSwitchPlan`
call `Purchases.purchasePackage` for real; `handleRestore` calls
`Purchases.restorePurchases`; `handleCancelSubscription` no longer fakes a
local cancel — Apple/Google don't let an app cancel on the user's behalf,
so it opens the native subscription-management screen instead and lets the
foreground-refresh listener pick up the result. All four still fall back to
the old local-stub behavior when `isRevenueCatConfigured()` is false, so
the paywall stays testable without real store credentials.

**Env**: `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` / `_ANDROID_API_KEY` in
`.env` (blank — fill in from RevenueCat → Project settings → API keys),
wired through `app.config.js` → `extra.revenueCat`, same pattern as the
Firebase config above it.

**Dependency**: added `react-native-purchases` to package.json. Not yet
installed/pod-installed on this machine — this was written from a linked
session without a macOS shell to run `npm install` + `cd ios && pod
install` or without a shell at all; that step still needs to happen before
a dev build will build RevenueCat at all. No In-App Purchase entitlement in
`ios/AstroSpirit/AstroSpirit.entitlements` yet either (only push +
Sign in with Apple) — double-check the IAP capability is on for the App ID
in Apple Developer / Xcode's Signing & Capabilities before a real device
test, and that the three `premium_weekly/monthly/yearly` products exist
and are "Ready to Submit" in App Store Connect (sandbox purchases silently
fail against products that aren't). Same story on Android: Play Console
needs the matching subscription products created before Play Billing will
return anything.

**Not done / open, same caveat as always** — nothing here has been run
against a real sandbox/test purchase yet (no API keys were available to
this session): the offering-fetch/merge path, the purchase/restore/cancel
handlers, and the `bestActivePlan` entitlement mapping are all written
against the documented SDK shape but unverified end to end. `handleSwitchPlan`
(upgrading/downgrading an existing subscriber's plan) calls
`purchasePackage` the same as a fresh purchase — correct for iOS (same
subscription group auto-prorates), but Android cross-grades may need
explicit `oldProductId`/proration-mode options if Play Billing doesn't
treat these three as the same base product automatically; worth testing
specifically before shipping plan-switching on Android.
