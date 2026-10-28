import { NavigatorScreenParams } from "@react-navigation/native";

export type OnboardingStackParamList = {
  Welcome: undefined;
  Name: undefined;
  Gender: undefined;
  BirthDate: undefined;
  RelationshipStatus: undefined;
  Generating: undefined;
};

export type MyDayStackParamList = {
  MyDayHome: undefined;
  CardDraw: { context?: string } | undefined;
  TarotSpreadIntro: undefined;
  TarotSpread: { context?: string } | undefined;
  CelticCross: { context?: string } | undefined;
  YesNoSpread: { context?: string } | undefined;
  CrossSpread: { context?: string } | undefined;
  ChoiceSpread: { context?: string } | undefined;
  Horseshoe: { context?: string } | undefined;
  StationForTwo: { context?: string } | undefined;
  TarotHistory: undefined;
};

export type CalendarStackParamList = {
  CalendarHome: undefined;
  EveningJournal: undefined;
  JournalInsights: undefined;
};

export type SanctuaryStackParamList = {
  SanctuaryHome: undefined;
  Player: { trackId: string } | { generatedTitle: string; lines: string[]; durationMinutes: number };
};

// Kept alongside Sanctuary (unlinked from the tab bar, not deleted) so the
// meditation feature can be restored later without rebuilding it.
export type NumerologyStackParamList = {
  NumerologyHome: undefined;
  NumerologyMatch: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Compatibility: undefined;
  FullChart: undefined;
  Aspects: undefined;
  Friends: undefined;
  AddFriend: undefined;
  Auth: undefined;
  FriendMatch: { friendId: string };
};

export type MainTabParamList = {
  MyDay: NavigatorScreenParams<MyDayStackParamList>;
  Calendar: NavigatorScreenParams<CalendarStackParamList>;
  Numerology: NavigatorScreenParams<NumerologyStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Paywall: undefined;
};
