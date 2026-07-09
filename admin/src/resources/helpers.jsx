import { Chip } from "../components/ui/Chip";

export function publishedColumn(key = "is_published") {
  return {
    key,
    header: { az: "Vəziyyət", en: "Status" },
    align: "center",
    render: (row) => (
      <Chip tone={row[key] ? "mint" : "neutral"}>
        {row[key] ? "Live" : "Draft"}
      </Chip>
    ),
  };
}

export const publishedFilter = {
  key: "is_published",
  label: { az: "Vəziyyət", en: "Status" },
  options: [
    { value: "", label: { az: "Hamısı", en: "All" } },
    { value: "true", label: { az: "Yayımda", en: "Published" } },
    { value: "false", label: { az: "Qaralama", en: "Draft" } },
  ],
};
