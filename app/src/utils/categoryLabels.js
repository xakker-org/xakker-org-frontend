/* Known backend course category display names -> {az,en}.
   Backend currently returns AZ-only category/category_name strings; this maps
   them to English equivalents so course cards/detail pages localize in EN mode. */
export const CATEGORY_LABELS = {
  "veb təhlükəsizliyi": { az: "Veb Təhlükəsizliyi", en: "Web Security" },
  "şəbəkə təhlükəsizliyi": { az: "Şəbəkə Təhlükəsizliyi", en: "Network Security" },
  "sistem təhlükəsizliyi": { az: "Sistem Təhlükəsizliyi", en: "System Security" },
  "kriptoqrafiya": { az: "Kriptoqrafiya", en: "Cryptography" },
  "osint və kəşfiyyat": { az: "OSINT və Kəşfiyyat", en: "OSINT & Recon" },
  "hücum təhlükəsizliyi": { az: "Hücum Təhlükəsizliyi", en: "Offensive Security" },
  "web": { az: "Veb", en: "Web" },
  "network": { az: "Şəbəkə", en: "Network" },
  "system": { az: "Sistem", en: "System" },
  "crypto": { az: "Kripto", en: "Crypto" },
  "recon": { az: "Kəşfiyyat", en: "Recon" },
};

export function localizeCategory(name, lang) {
  if (!name) return name;
  const entry = CATEGORY_LABELS[String(name).trim().toLowerCase()];
  return entry ? entry[lang] || entry.az : name;
}
