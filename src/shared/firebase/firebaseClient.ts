import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { initializeAuth, getAuth, Auth, Persistence } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getFunctions, Functions } from "firebase/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

/** Metro resolves the RN auth entry (which exports this); default browser
 *  typings omit it, so we pull it via require with a narrow cast. */
function getReactNativePersistence(storage: typeof AsyncStorage): Persistence {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const auth = require("firebase/auth") as {
    getReactNativePersistence: (s: typeof AsyncStorage) => Persistence;
  };
  return auth.getReactNativePersistence(storage);
}

/**
 * Single place that initializes the Firebase JS SDK (Auth + Firestore +
 * Cloud Functions) for Expo managed workflow — no native config/eject
 * needed. Reads the public web config app.config.js wrote into
 * `extra.firebase` from .env (see .env.example).
 *
 * Nothing here is a secret: Firebase web config identifiers are safe to
 * ship in the client bundle by design — real access control is
 * firestore.rules (see /firestore.rules) + Firebase Auth, not hiding these
 * values. Until you've created a Firebase project and filled in .env,
 * `isFirebaseConfigured()` is false and every call site below should (and
 * does, via useAuthStore / useFriendsStore) fall back to a local-only mode
 * instead of throwing.
 */

type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function readConfig(): FirebaseWebConfig {
  const extra = (Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {}) as {
    firebase?: Partial<FirebaseWebConfig>;
  };
  const f = extra.firebase ?? {};
  return {
    apiKey: f.apiKey ?? "",
    authDomain: f.authDomain ?? "",
    projectId: f.projectId ?? "",
    storageBucket: f.storageBucket ?? "",
    messagingSenderId: f.messagingSenderId ?? "",
    appId: f.appId ?? "",
  };
}

const config = readConfig();

/** True once a real Firebase project config has been filled into .env. */
export function isFirebaseConfigured(): boolean {
  return !!(config.apiKey && config.projectId && config.appId);
}

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let functionsInstance: Functions | null = null;

function ensureApp(): FirebaseApp {
  if (app) return app;
  app = getApps().length ? getApp() : initializeApp(config);
  return app;
}

/** Firebase Auth, persisted to AsyncStorage so a signed-in user stays
 *  signed in across app restarts (React Native has no browser localStorage
 *  for the default web persistence to use). Only call this when
 *  `isFirebaseConfigured()` is true. */
export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance;
  const a = ensureApp();
  try {
    authInstance = initializeAuth(a, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // initializeAuth throws if it's already been called for this app
    // (e.g. Fast Refresh during dev) — fall back to the existing instance.
    authInstance = getAuth(a);
  }
  return authInstance;
}

export function getFirebaseDb(): Firestore {
  if (dbInstance) return dbInstance;
  dbInstance = getFirestore(ensureApp());
  return dbInstance;
}

export function getFirebaseFunctions(): Functions {
  if (functionsInstance) return functionsInstance;
  functionsInstance = getFunctions(ensureApp());
  return functionsInstance;
}
