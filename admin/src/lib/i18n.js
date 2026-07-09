export function t(value, lang) {
  if (value == null) return "";
  return typeof value === "string" ? value : value[lang] ?? value.az ?? "";
}
