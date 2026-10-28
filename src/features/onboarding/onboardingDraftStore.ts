import { create } from "zustand";
import { Gender, RelationshipStatus } from "@shared/types/user";

type DraftState = {
  name: string;
  gender: Gender | null;
  birthDate: Date | null;
  birthTime: Date | null;
  birthCity: string;
  /** Set only when birthCity was picked from the offline city-autocomplete
   *  (CityAutocompleteInput) rather than typed free-form — exact
   *  coordinates, no further geocoding needed. CityAutocompleteInput calls
   *  setBirthCityCoords(null, null) on every keystroke before re-searching,
   *  so editing the text away from a pick can't leave stale, mismatched
   *  coordinates behind. */
  birthCityLat: number | null;
  birthCityLon: number | null;
  relationshipStatus: RelationshipStatus | null;
  setName: (v: string) => void;
  setGender: (v: Gender) => void;
  setBirthDate: (v: Date) => void;
  setBirthTime: (v: Date | null) => void;
  setBirthCity: (v: string) => void;
  setBirthCityCoords: (lat: number | null, lon: number | null) => void;
  setRelationshipStatus: (v: RelationshipStatus) => void;
  reset: () => void;
};

export const useOnboardingDraft = create<DraftState>((set) => ({
  name: "",
  gender: null,
  birthDate: null,
  birthTime: null,
  birthCity: "",
  birthCityLat: null,
  birthCityLon: null,
  relationshipStatus: null,
  setName: (name) => set({ name }),
  setGender: (gender) => set({ gender }),
  setBirthDate: (birthDate) => set({ birthDate }),
  setBirthTime: (birthTime) => set({ birthTime }),
  setBirthCity: (birthCity) => set({ birthCity }),
  setBirthCityCoords: (birthCityLat, birthCityLon) => set({ birthCityLat, birthCityLon }),
  setRelationshipStatus: (relationshipStatus) => set({ relationshipStatus }),
  reset: () =>
    set({
      name: "",
      gender: null,
      birthDate: null,
      birthTime: null,
      birthCity: "",
      birthCityLat: null,
      birthCityLon: null,
      relationshipStatus: null,
    }),
}));
