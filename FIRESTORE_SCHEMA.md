# Firestore Schema — Friends & Accounts

This describes the Firestore structure the Friends feature (Phase 5) expects.
**Nothing here requires Firestore to exist yet** — the app works entirely
locally (AsyncStorage) until you create a Firebase project, fill in `.env`
(see `.env.example`), and Firestore starts receiving writes. Everything on
the client is gated behind `isFirebaseConfigured()` (see
`src/shared/firebase/firebaseClient.ts`), so there's nothing to break by
setting this up later.

You said you'll add the `users` collection and its auth-linked fields
yourself — this doc describes the shape the client code already assumes,
so whatever you build lines up with it.

## Collections

### `users/{uid}`

One document per authenticated user, `{uid}` = the Firebase Auth UID
(`firebase/auth`'s `User.uid`). The client doesn't read or write this
document directly yet (that's the part you're adding) — it only writes to
the `friends` subcollection below. Suggested fields for when you build it:

```
users/{uid}
  email: string                 // mirrors Firebase Auth, handy for admin queries
  displayName: string | null
  sunSign: string | null        // ZodiacSign, e.g. "Leo" — from UserProfile.sunSign
  birthDate: string | null      // ISO "YYYY-MM-DD", from onboarding
  birthTime: string | null      // "HH:mm", optional
  birthCity: string | null      // optional
  createdAt: Timestamp
  updatedAt: Timestamp
```

### `users/{uid}/friends/{friendId}` ← **implemented now**

A subcollection mirroring the user's local `useFriendsStore` friends list.
`{friendId}` is the same id the client generates locally (see
`useFriendsStore.addFriend` — a timestamp+random string, not a Firestore
auto-id), so the same friend has the same id locally and remotely, which is
what makes the local↔remote merge in `useFriendsSync` idempotent.

```
users/{uid}/friends/{friendId}
  name: string
  birthDate: string             // ISO "YYYY-MM-DD"
  sunSign: string                // ZodiacSign
  createdAt: string             // ISO timestamp, set client-side on creation
  updatedAt: Timestamp           // Firestore server timestamp, set on every write
```

Client code: `src/shared/firebase/firestoreFriends.ts`
(`subscribeFriends`, `upsertFriendRemote`, `deleteFriendRemote`).

## Sync behavior (client-side, already implemented)

- **Guest / signed out / Firebase not configured:** `useFriendsStore` is the
  only source of truth, persisted to AsyncStorage. Nothing touches Firestore.
- **On sign-in** (`useFriendsSync`, wired in `App.tsx`): any friends already
  in the local store are pushed up once (`upsertFriendRemote` for each), so
  guest-added friends aren't lost.
- **While signed in:** `subscribeFriends` keeps a live `onSnapshot` listener;
  every remote change replaces the local list (`useFriendsStore.replaceAll`),
  so the same account sees the same friends on a second device.
- **On sign-out:** the listener is torn down; the local list is left as-is
  (so a guest who signs out doesn't lose what's on screen, even though it's
  now "unsynced" again).

## Security rules (draft)

See `firestore.rules` at the project root — a minimal starting point:
a user can only read/write their own `users/{uid}` document and
`friends` subcollection. Review and tighten before shipping (e.g. field
validation, rate limiting via App Check) — this is intentionally the
simplest rule set that matches what the client actually does today.

---

### `Users/{deviceId}` — **capital U, a different collection from `users` above**

Added for: "report onboarding data + deviceId to Firestore as soon as
onboarding finishes, then attach the Firebase Auth account to that same
record once the person registers/signs in by any method." Keyed by a
random per-install UUID (`shared/utils/deviceId.ts`, persisted in
AsyncStorage) instead of the auth uid, because the first write happens
right after onboarding — before anyone has necessarily signed in.

```
Users/{deviceId}
  deviceId: string              // same value as the doc id, duplicated for querying
  name: string
  gender: string
  birthDate: string             // ISO "YYYY-MM-DD"
  birthTime: string | null
  birthCity: string | null
  relationshipStatus: string
  sunSign: string                // ZodiacSign
  onboardingComplete: boolean
  uid: string                    // set once the person registers/signs in — absent before then
  email: string | null           // set at the same time as uid
  authMethod: "password" | "apple.com" | "google.com"
  createdAt: Timestamp
  updatedAt: Timestamp
```

Client code: `src/shared/firebase/firestoreUsers.ts`
(`syncProfileToFirestore` — called right after onboarding and on every
later profile edit; `linkAuthToDeviceProfile` — called at the end of every
sign-up/sign-in in `src/shared/firebase/authActions.ts`, regardless of
method).

This is one-way reporting: the client never reads `Users/{deviceId}` back
(everything authoritative stays in `useUserStore`/`useAuthStore` locally),
so if you want to use this collection for anything (an admin dashboard,
re-hydrating a reinstall), that's new work on top of what exists today.

**Known tradeoff** — read the comment block above `match /Users/{deviceId}`
in `firestore.rules`: because the pre-auth write has to work without
`request.auth`, rules can't verify a caller really owns the deviceId it
claims. Acceptable for lightweight device-level reporting (comparable to
any client-generated analytics/install id); add App Check before shipping
if your risk tolerance is lower than that.
