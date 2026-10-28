# Astro Spirit

A React Native (Expo) app for astrology, horoscopes, tarot, and mindful rituals — a flat,
ornamental gold-on-charcoal UI, built with a feature-based architecture.

> **See `DEVLOG.md` for the development history** — what was built in which pass, the
> judgment calls made along the way (e.g. the zodiac icon treatment, i18n scope), and a
> running list of known gaps to check before shipping.

## Getting started

```bash
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with Expo Go.

> This project was authored in a sandboxed environment without npm registry access, so
> dependencies have **not** been installed or test-run here. After `npm install`, run
> `npx tsc --noEmit` to type-check, and fix any version-skew issues `expo-doctor` reports
> (`npx expo install --check`) — Expo SDK 51 pins exact versions for native modules and
> the ones in `package.json` should already match, but it's worth confirming against
> whatever Expo CLI version you have locally.

## Architecture

```
src/
  app/
    navigation/       Root, tab, and per-feature stack navigators + custom tab bar
  shared/
    theme/             Colors, typography, spacing, zodiac constants
    components/        Cross-feature UI: NatalWheelSVG, NatalLoader, ScreenBackground,
                        GlowButton, GlassCard, RadialGauge, MoonPhaseSVG, FadeInUp...
    api/               freehoroscopeapi.com client
    storage/            Zustand + AsyncStorage stores (user, card-of-day, intentions,
                        premium, locale)
    i18n/                EN/RU/UA translation dict + useT()/useTList() lookup hooks
    hooks/               Cross-feature hooks (e.g. usePaywallNavigation)
    utils/              Astrology math (sun/moon/rising, compatibility, moon phase),
                        on-device "AI" stand-ins (affirmations, meditation scripts, sentiment)
    types/
  features/
    onboarding/        Name → Gender → Birth date/time/city → Relationship status → Generating
    my-day/            Tab 1 — horoscope widget (day/week/month tabs), card-of-day, affirmation
    tarot/              Card catalog (78 cards), pick/flip/dock animation, meanings
    calendar/           Tab 2 — lunar calendar, spiritual trackers (50+ pool), evening journal
    sanctuary/          Tab 3 — AI audio-immersion input, sound/mantra/breathwork library, player
    profile/            Tab 4 — natal chart wheel, mindfulness stats, zodiac compatibility,
                        premium banner
    friends/            Friends list, add-friend, friend/friend & friend/me compatibility,
                        email auth screen
    paywall/             Modal paywall screen (root stack) — animated premium-feature
                        preview, week/month/year plan selector
assets/
  tarot/major, tarot/minor   78 individual card images, cropped from the supplied sheets
  images/                    App icon (generated natal-wheel motif)
```

## Where things live from the spec

- **AI Horoscope Widget** — `features/my-day/components/HoroscopeWidget.tsx`, backed by
  `useDailyHoroscope` which calls `GET /api/v1/get-horoscope/daily` and falls back to a
  deterministic local forecast + animated energy/intuition/tension/luck gauges if offline.
- **Card of the Day** — `features/tarot/screens/CardDrawScreen.tsx`. Pick-a-card grid →
  flip → shrink-and-dock-to-top animation → full reading below, persisted per day in
  `useCardOfDayStore` so re-opening it shows the same card without re-drawing.
- **Affirmation of the Day** — `features/my-day/components/AffirmationWidget.tsx`, with
  save-to-photos (`expo-media-library` via `react-native-view-shot`) and share
  (`expo-sharing`).
- **Lunar Calendar** — `features/calendar/components/LunarCalendarWidget.tsx`, real moon
  phase/illumination math in `shared/utils/astrology.ts` (`getMoonPhase`), animated
  `MoonPhaseSVG`.
- **Spiritual Trackers** — `features/calendar/components/SpiritualTrackers.tsx`, animated
  checkboxes + streak counter.
- **AI Evening Journal** — `features/calendar/screens/EveningJournalScreen.tsx`, with a
  heuristic sentiment analyzer in `shared/utils/sentiment.ts` standing in for the
  GPT-4o-mini/Claude Haiku call described in the spec — swap that one function for a real
  API call when you wire up a text-AI key.
- **AI Audio Immersion Generator** — `features/sanctuary/components/AudioGeneratorInput.tsx`
  + `shared/utils/aiContent.ts#generateMeditationScript`, same swap-in-a-real-API note.
  `PlayerScreen` renders a 432 Hz-labeled pulsing orb and times the script lines over the
  session — there's no real TTS/audio synthesis wired up (that's the ElevenLabs call in
  the spec's unit-economics section), so treat the player as the visual/UX shell to plug
  a real audio URL into (`expo-av` is already a dependency).
- **Content Library** — `features/sanctuary/components/LibraryList.tsx`, grouped by
  category with premium gating (`usePremiumStore`) and an inline animated breathing
  circle for box/4-7-8 breathwork.
- **Astrological Passport** — `features/profile/components/AstroPassportCard.tsx` +
  `NatalChartWheel.tsx`. Sun sign is computed exactly from birth date;
  Moon/Ascendant are clearly-labeled *illustrative* estimates (no ephemeris library is
  wired in) — swap `estimateMoonSign`/`estimateAscendant` in `shared/utils/astrology.ts`
  for a real call to `/api/v1/planetary-positions` (already wrapped in
  `shared/api/horoscopeClient.ts#getPlanetaryPositions`) when you want precise placements.
- **Mindfulness Statistics** — `features/profile/components/MindfulnessStats.tsx`, animated
  7-day bar chart derived from real local tracker/journal data.
- **Zodiac Compatibility %** — `features/profile/screens/CompatibilityScreen.tsx`, animated
  radial match gauge, deterministic element-based scoring plus a full per-area/timing/advice
  report in `shared/utils/astrology.ts#getCompatibility` / `getCompatibilityReport`.
- **Friends & Firebase Auth** — `features/friends/`: add a friend (name + birth date →
  auto sun sign), view your compatibility with any friend or compare two friends against
  each other, email sign-in/sign-up. Works entirely offline/local by default
  (`useFriendsStore`, AsyncStorage); once a Firebase project is configured in `.env` and
  the user signs in, `useFriendsSync`/`useAuthSync` mirror the friends list to/from
  Firestore — see `FIRESTORE_SCHEMA.md`.
- **Daily/weekly notifications** — `shared/notifications/`: local (on-device) scheduled
  reminders, settings UI in `features/profile/components/NotificationSettingsCard.tsx`.
- **Onboarding** — `features/onboarding/`: Name → Gender → Birth date/time/city →
  Relationship status (Soulmate/Engaged/Married/Difficult/Single) → an animated
  natal-wheel "Generating your chart" screen, then straight into the app.
- **Natal-chart-style loaders** — `shared/components/NatalLoader.tsx`, used on the
  onboarding "Generating" screen and the journal "analyzing" state; the same
  `NatalWheelSVG` is the slow-rotating background watermark behind every screen
  (`ScreenBackground.tsx`).

## Tarot assets

`assets/tarot/major/*.png` (22) and `assets/tarot/minor/*.png` (56) were cropped
programmatically from the two supplied tarot sheets (gold-on-black major arcana +
four minor-arcana suit sheets), so all 78 cards are real individual images, not
placeholders. `features/tarot/data/tarot-manifest.json` maps each file to its card
name/suit/rank, and `cardImages.ts` is a generated static `require()` map (React
Native requires static requires, so this is regenerated by a small script rather than
hand-written — see the crop/manifest logic if you ever need to re-run it on new sheets).

## API

`shared/api/horoscopeClient.ts` wraps the free, keyless
[freehoroscopeapi.com](https://freehoroscopeapi.com/explorer) endpoints:

- `GET /api/v1/get-horoscope/{daily,weekly,monthly}?sign=`
- `GET /api/v1/tarot/cards`, `/major`, `/minor`, `/random`
- `GET /api/v1/planetary-positions` (and its `/api/v1/astrology` alias)

Every call has a local fallback so the app is fully usable offline/in a simulator with
no network.

## Known gaps / next steps

- Real ephemeris-based natal chart math (moon sign, ascendant, houses) — currently
  illustrative estimates, clearly isolated in `shared/utils/astrology.ts`.
- Real text-AI (GPT-4o-mini/Claude Haiku) and voice-AI (ElevenLabs) calls — both have
  clearly-marked local stand-ins with matching function signatures.
- Sound library playback is a simulated player UI; no actual audio files are bundled.
- Apple/Google Sign-In are UI placeholders ("coming soon") — email auth is wired up;
  see the note in `shared/firebase/authActions.ts` for what's needed to finish them.
- `npm install` / `expo-doctor` / a real device or simulator run have not been performed
  in this environment — see the note at the top.
