import { ctfMissions, ctfMissionCategories, ctfMissionTags } from "../services/adminApi";
import { Chip, DiffBadge } from "../components/ui/Chip";
import CtfMissionForm from "../components/children/CtfMissionForm";

const DIFFICULTY_CHOICES = ["easy", "medium", "hard", "expert"];

export default {
  key: "ctf-missions",
  title: { az: "Missiyalar (CTF)", en: "Missions (CTF)" },
  endpoint: ctfMissions,
  editMode: "route",
  FormComponent: CtfMissionForm,
  rowKey: (r) => r.id,
  search: true,
  emptyIcon: "🚩",
  emptyDescription: {
    az: "CTF missiyaları tək çətinlik daşıyan flag-tapma tapşırıqlarıdır — write-up kilidli ola bilər.",
    en: "CTF missions are single-challenge flag-capture tasks — the write-up can be locked.",
  },
  filters: [
    {
      key: "difficulty",
      label: { az: "Çətinlik", en: "Difficulty" },
      options: [{ value: "", label: { az: "Hamısı", en: "All" } }, ...DIFFICULTY_CHOICES.map((v) => ({ value: v, label: v }))],
    },
    {
      key: "status",
      label: { az: "Vəziyyət", en: "Status" },
      options: [
        { value: "", label: { az: "Hamısı", en: "All" } },
        { value: "draft", label: { az: "Qaralama", en: "Draft" } },
        { value: "published", label: { az: "Yayımda", en: "Published" } },
      ],
    },
    {
      key: "category",
      label: { az: "Kateqoriya", en: "Category" },
      optionsEndpoint: ctfMissionCategories,
      optionsLabelKey: "name",
    },
    {
      key: "tags",
      label: { az: "Teq", en: "Tag" },
      optionsEndpoint: ctfMissionTags,
      optionsLabelKey: "name",
    },
  ],
  columns: [
    { key: "title", header: { az: "Başlıq", en: "Title" }, sortable: true },
    {
      key: "difficulty",
      header: { az: "Çətinlik", en: "Difficulty" },
      render: (row) => <DiffBadge level={row.difficulty} />,
    },
    { key: "category", header: { az: "Kateqoriya", en: "Category" }, render: (row) => row.category?.name || "—" },
    { key: "points", header: { az: "Xal", en: "Points" }, align: "right", sortable: true },
    {
      key: "status",
      header: { az: "Vəziyyət", en: "Status" },
      align: "center",
      render: (row) => (
        <Chip tone={row.status === "published" ? "mint" : "neutral"}>
          {row.status === "published" ? "Live" : "Draft"}
        </Chip>
      ),
    },
    {
      key: "has_flag",
      header: { az: "Flag", en: "Flag" },
      align: "center",
      render: (row) => <Chip tone={row.has_flag ? "mint" : "coral"} size="sm">{row.has_flag ? "✓" : "✗"}</Chip>,
    },
  ],
  // FormComponent handles the create/edit UI itself (tabbed Mission + Write-up
  // editor); formFields kept empty since ResourceListPage/EditPage skip
  // ResourceForm entirely whenever config.FormComponent is set.
  formFields: [],
};
