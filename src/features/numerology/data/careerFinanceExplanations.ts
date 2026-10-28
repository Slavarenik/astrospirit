import { NumerologyValue } from "@shared/utils/numerology";

/** Career orientation — read from the Destiny Number (the full name,
 *  reduced). Generic field suggestions, not specific job titles. */
export const CAREER_EXPLANATION: Record<NumerologyValue, string> = {
  1: "Roles with autonomy suit you best — founder, entrepreneur, or any position where you set the direction.",
  2: "Roles built on collaboration suit you — mediation, counseling, partnerships, team-facing work.",
  3: "Roles built on communication suit you — writing, performing, marketing, teaching, design.",
  4: "Roles built on structure suit you — engineering, accounting, project management, logistics.",
  5: "Roles with variety suit you — sales, travel-based work, journalism, anything that isn't the same day twice.",
  6: "Roles centered on care suit you — healthcare, education, hospitality, family-oriented business.",
  7: "Roles built on expertise suit you — research, analysis, specialist or consulting work.",
  8: "Roles with scale and authority suit you — management, finance, business ownership.",
  9: "Roles oriented around service suit you — nonprofit work, healing professions, the arts, humanitarian work.",
  11: "A master path — teaching, healing, or any role that lets your insight reach other people directly.",
  22: "A master path — large-scale building: architecture, infrastructure, institutions that outlast you.",
};

/** Financial potential — same source number (Destiny), a different lens:
 *  how money tends to move for this person rather than what work suits
 *  them. */
export const FINANCIAL_EXPLANATION: Record<NumerologyValue, string> = {
  1: "Money tends to follow your own initiatives — income grows fastest when you're building something of your own.",
  2: "Money tends to grow through partnership — shared ventures suit you better than going it alone financially.",
  3: "Money tends to follow visibility — income connects to how openly you share your work or talent.",
  4: "Money tends to build slowly and steadily — patience and consistency serve you better than big bets.",
  5: "Money tends to move in waves — comfortable with risk, but worth building a cushion for the slow periods.",
  6: "Money tends to flow through responsibility — stable income often comes with caretaking roles or family business.",
  7: "Money tends to follow expertise — specialized knowledge pays better for you than general effort.",
  8: "Money is a genuine strength area — a strong natural capacity to build and manage real wealth.",
  9: "Money tends to flow best when it's also helping someone else — purely self-interested ventures satisfy you less.",
  11: "A master-level relationship with money — real potential, but it works best attached to a purpose bigger than income alone.",
  22: "A master-level relationship with money — the capacity to build substantial, lasting material results.",
};
