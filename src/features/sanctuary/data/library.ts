export type LibraryItem = {
  id: string;
  title: string;
  subtitle: string;
  category: "Nature" | "Noise" | "Bowls" | "Mantras" | "Breathwork";
  durationMinutes: number;
  premium: boolean;
};

export const LIBRARY: LibraryItem[] = [
  { id: "rain", title: "Rainfall on Leaves", subtitle: "Steady rain, distant thunder", category: "Nature", durationMinutes: 30, premium: false },
  { id: "ocean", title: "Ocean at Dusk", subtitle: "Slow tide, soft wind", category: "Nature", durationMinutes: 45, premium: false },
  { id: "forest", title: "Deep Forest Morning", subtitle: "Birdsong, rustling canopy", category: "Nature", durationMinutes: 25, premium: true },
  { id: "white-noise", title: "White Noise", subtitle: "Full-spectrum static, masks distraction", category: "Noise", durationMinutes: 60, premium: false },
  { id: "pink-noise", title: "Pink Noise", subtitle: "Softer, deeper frequency blend", category: "Noise", durationMinutes: 60, premium: false },
  { id: "brown-noise", title: "Brown Noise", subtitle: "Low rumble, grounding", category: "Noise", durationMinutes: 60, premium: true },
  { id: "bowls-432", title: "432Hz Singing Bowls", subtitle: "Tibetan bowls, long resonance", category: "Bowls", durationMinutes: 20, premium: true },
  { id: "bowls-crystal", title: "Crystal Bowl Bath", subtitle: "High clarity overtones", category: "Bowls", durationMinutes: 18, premium: true },
  { id: "mantra-om", title: "Om Chanting", subtitle: "Repetitive grounding mantra", category: "Mantras", durationMinutes: 15, premium: true },
  { id: "mantra-gratitude", title: "Gratitude Mantra", subtitle: "Soft spoken repetition", category: "Mantras", durationMinutes: 10, premium: false },
  { id: "box-breathing", title: "Box Breathing", subtitle: "4-4-4-4 pattern for panic relief", category: "Breathwork", durationMinutes: 5, premium: false },
  { id: "478-breathing", title: "4-7-8 Breathing", subtitle: "Inhale 4, hold 7, exhale 8", category: "Breathwork", durationMinutes: 6, premium: false },
];

export const CATEGORY_ORDER: LibraryItem["category"][] = ["Nature", "Noise", "Bowls", "Mantras", "Breathwork"];
