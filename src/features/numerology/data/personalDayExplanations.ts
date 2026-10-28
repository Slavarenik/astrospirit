/** Personal Day Number — the "weather" readings shown by
 *  `NumerologyDailyWidget`. Three lenses per digit 1-9 (see
 *  `getPersonalDayNumber`/`getPersonalDayScores` in numerology.ts): what to
 *  focus energy on, whether it's a day to move on money/career matters, and
 *  how favorable it is for relationships — expanded from the standard,
 *  widely-used one-line meanings of the nine day numbers into fuller,
 *  actionable guidance. Day 1-9 only; Personal Day never resolves to a
 *  master number. */

export const PERSONAL_DAY_FOCUS: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, string> = {
  1: "A day of beginnings, decisive action, and leadership. If you've been circling a start date for something, today rewards just taking the first step rather than refining the plan further. Lead rather than wait to be led — your initiative lands better than usual.",
  2: "A day for diplomacy, teamwork, and finding the middle ground. Big solo pushes tend to meet more friction today than cooperative ones — better results come from listening first and proposing second. Good for patching up a disagreement rather than starting a new one.",
  3: "A day for creativity, communication, and self-expression. Ideas flow more easily than usual, and conversations tend to go further than planning sessions do. A good day to write, pitch, perform, or simply be seen — less suited to heads-down solitary grind.",
  4: "A day of steady, unglamorous work — organizing, planning, and following through on structure. Momentum comes from discipline rather than inspiration today. Good for clearing a backlog, fixing a system, or committing to a schedule you've been putting off.",
  5: "A day of change, movement, and unexpected openings. Plans may shift more than once — treat that as the day's nature rather than a problem to fix. Good for trying something new or saying yes to an opportunity that wasn't on the calendar.",
  6: "A day centered on care — home, family, and the people closest to you. Responsibilities toward others come to the front, and attending to them today tends to feel more worthwhile than usual. A good day for a conversation you've been postponing with someone close.",
  7: "A day for solitude, study, and inward focus. Energy runs better directed at your own thinking than at other people's demands — research, reflection, or quiet practice suit it well. Don't force big social plans against the day's natural pull inward.",
  8: "A day for ambition, results, and material matters. Focus runs clearer than usual on anything tied to achievement, status, or scale — a good day to push a plan that's been sitting half-finished. Match the effort to something concrete rather than abstract today.",
  9: "A day for closing, not opening. Loose ends, old commitments, and anything you've outgrown are easier to release today than to add to. Good for finishing, letting go, and tidying — physically or otherwise — rather than launching something new.",
};

export const PERSONAL_DAY_FINANCE: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, string> = {
  1: "Decent day to kick off a new financial move — opening something, pitching an idea, or asking to lead a project — but hold off on locking in the fine print of a contract. The energy favors starting over finalizing.",
  2: "Better for negotiating than deciding solo. If a deal or raise depends on another person's buy-in, today's collaborative tone helps — but it's not the sharpest day for a unilateral big purchase or a quick yes/no call.",
  3: "Not the strongest day for serious money decisions — attention drifts toward ideas and conversation rather than numbers. Fine for pitching or discussing a financial plan out loud; better to sign or commit on a different day.",
  4: "A genuinely solid day for practical financial work — budgeting, organizing accounts, reviewing a contract line by line. Less suited to a bold new venture; more suited to tightening up what already exists.",
  5: "Financially unpredictable — real opportunities can show up out of nowhere, but so can impulse spending. Fine for exploring a new option, risky for locking in anything long-term or irreversible today.",
  6: "A fair, if unremarkable, day for money — most financial energy naturally flows toward household or family-related spending and decisions rather than career moves. Good for a family budget conversation.",
  7: "Not a deal-making day. Attention pulls away from numbers and negotiation toward quieter things — if a financial decision can wait, let it. Good instead for research: reading the fine print, not signing it.",
  8: "The strongest day in the cycle for money and career — contracts, big purchases, asking for a raise, or closing a deal all land better than usual. If you've been waiting for the right day to move on something financial, this tends to be it.",
  9: "Better for settling old financial business than opening new accounts — paying off a debt, closing an account you no longer use, finalizing something overdue. Hold new ventures for a day with more forward momentum.",
};

export const PERSONAL_DAY_RELATIONSHIPS: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, string> = {
  1: "A more self-focused day than a relationship-focused one — fine for connection, but your own plans and independence are likely to take priority. Not the ideal day to ask a partner to put their plans ahead of yours.",
  2: "One of the best days for relationships in the whole cycle — patience, listening, and compromise come easier than usual. A strong day for a serious conversation, repairing a disagreement, or simply showing up for someone.",
  3: "Great for lighter connection — a fun date, a playful conversation, catching up with friends — though not necessarily the day for a heavy, serious talk. Social energy runs high; depth is optional today.",
  4: "A practical, low-drama day for relationships rather than a romantic one. Better suited to handling shared responsibilities with a partner (bills, chores, plans) than to a spontaneous gesture.",
  5: "Exciting but unstable — a good day for spontaneity, a new experience together, or meeting someone new, but not the steadiest day for a conversation that needs calm follow-through. Expect some unpredictability.",
  6: "The strongest day for family and close relationships — home matters, deep conversations, and caretaking all flow more naturally. A genuinely good day for reconciliation or for simply being present with people who matter.",
  7: "Better spent alone than with company — pushing for closeness today can feel more effortful than it should. If someone close needs space, this is a reasonable day to give it; big relationship milestones can wait.",
  8: "Relationships take a back seat to ambition today — fine for a partner who's equally focused on goals, less so if someone close needs emotional attention. Worth a conscious check-in if you notice yourself prioritizing work over people.",
  9: "Good for closure rather than new romance — finishing a conversation that's been left hanging, forgiving something old, or gracefully ending what's already over. Not the day to start something new with someone.",
};
