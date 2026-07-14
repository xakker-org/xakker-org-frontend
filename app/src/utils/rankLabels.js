/* Backend rank enum -> {az,en} display label + icon.
   Source of truth: xakker-org-backend/accounts/models.py RankChoices. */
export const RANK_LABELS = {
  recruit:       { az: "Kursant",     en: "Recruit" },
  script_kiddie: { az: "Skript Uşağı", en: "Script Kiddie" },
  operative:     { az: "Agent",        en: "Operative" },
  hunter:        { az: "Ovçu",         en: "Hunter" },
  specialist:    { az: "Mütəxəssis",   en: "Specialist" },
  analyst:       { az: "Analitik",     en: "Analyst" },
  architect:     { az: "Memar",        en: "Architect" },
  operator:      { az: "Operator",     en: "Operator" },
  ghost:         { az: "Kölgə",        en: "Ghost" },
};

export const RANK_ICONS = {
  recruit: "◌", script_kiddie: "◎", operative: "◉", hunter: "⊕",
  specialist: "⊗", analyst: "⊘", architect: "⊙", operator: "⊛", ghost: "✦",
};

export function localizeRank(rank, lang) {
  if (!rank) return rank;
  const key = String(rank).toLowerCase();
  const entry = RANK_LABELS[key];
  if (entry) return entry[lang] || entry.en;
  // Fallback: humanize unknown rank keys (e.g. "some_rank" -> "Some Rank")
  return String(rank).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
