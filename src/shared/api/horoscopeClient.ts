import Constants from "expo-constants";
import { ZodiacSign } from "@shared/theme";

const BASE_URL: string =
  (Constants.expoConfig?.extra?.horoscopeApiBaseUrl as string | undefined) ??
  "https://freehoroscopeapi.com";

export type DailyHoroscope = {
  date: string;
  period: "daily" | "weekly" | "monthly";
  sign: string;
  horoscope: string;
};

export type ApiTarotCard = {
  type: "major" | "minor";
  name: string;
  name_short: string;
  value: string;
  value_int: number;
  meaning_up: string;
  meaning_rev: string;
  desc: string;
  suit?: string;
};

type Json = Record<string, unknown>;

async function getJson<T>(path: string, params: Record<string, string | number | boolean | undefined> = {}, timeoutMs = 8000): Promise<T> {
  const url = new URL(path, BASE_URL);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, String(v));
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export const horoscopeApi = {
  /** GET /api/v1/get-horoscope/daily?sign=aries */
  async getDaily(sign: ZodiacSign): Promise<DailyHoroscope> {
    const json = await getJson<{ data: DailyHoroscope }>("/api/v1/get-horoscope/daily", {
      sign: sign.toLowerCase(),
    });
    return json.data;
  },

  /** GET /api/v1/get-horoscope/weekly?sign=aries */
  async getWeekly(sign: ZodiacSign): Promise<DailyHoroscope> {
    const json = await getJson<{ data: DailyHoroscope }>("/api/v1/get-horoscope/weekly", {
      sign: sign.toLowerCase(),
    });
    return json.data;
  },

  /** GET /api/v1/get-horoscope/monthly?sign=aries */
  async getMonthly(sign: ZodiacSign): Promise<DailyHoroscope> {
    const json = await getJson<{ data: DailyHoroscope }>("/api/v1/get-horoscope/monthly", {
      sign: sign.toLowerCase(),
    });
    return json.data;
  },

  /** GET /api/v1/tarot/cards/random?n=1&minor=true */
  async drawRandomCards(n: number, minor = true): Promise<ApiTarotCard[]> {
    const json = await getJson<{ nhits: number; cards: ApiTarotCard[] }>(
      "/api/v1/tarot/cards/random",
      { n, minor }
    );
    return json.cards;
  },

  /** GET /api/v1/tarot/cards — full 78-card deck with meanings */
  async getAllCards(): Promise<ApiTarotCard[]> {
    const json = await getJson<{ nhits: number; cards: ApiTarotCard[] }>("/api/v1/tarot/cards");
    return json.cards;
  },

  /** GET /api/v1/planetary-positions — used to approximate natal placements */
  async getPlanetaryPositions(params: {
    datetime: string;
    lat?: number;
    lng?: number;
    zodiac?: "sidereal" | "tropical";
  }): Promise<Json> {
    return getJson<Json>("/api/v1/planetary-positions", {
      datetime: params.datetime,
      lat: params.lat,
      lng: params.lng,
      zodiac: params.zodiac ?? "tropical",
    });
  },
};
