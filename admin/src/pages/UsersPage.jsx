import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../contexts/LanguageContext";
import { users } from "../services/adminApi";
import { useDebouncedValue } from "../utils/useDebouncedValue";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import ResourceToolbar from "../components/ResourceToolbar";
import DataTable from "../components/ui/DataTable";
import UserCell from "../components/ui/UserCell";
import { Chip } from "../components/ui/Chip";
import { TileSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";

const T = {
  az: { title: "İstifadəçilər", sub: "Qeydiyyatdan keçən tələbələr — xal, rütbə və fəaliyyət", search: "Axtar...", empty: "Nəticə yoxdur", results: "nəticə" },
  en: { title: "Users", sub: "Registered students — XP, rank and activity", search: "Search...", empty: "No results", results: "results" },
};

export default function UsersPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const navigate = useNavigate();

  const [data, setData] = useState({ count: 0, results: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [activeFilter, setActiveFilter] = useState("");
  const [ordering, setOrdering] = useState("-date_joined");

  const load = useCallback(() => {
    setLoading(true);
    users
      .list({ page, search: debouncedSearch, ordering, is_active: activeFilter, is_staff: "false" })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, ordering, activeFilter]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    {
      key: "username",
      header: { az: "İstifadəçi", en: "User" },
      render: (row) => <UserCell user={row} />,
    },
    { key: "rank", header: { az: "Rütbə", en: "Rank" } },
    { key: "xp", header: "XP", align: "right", sortable: true },
    { key: "streak_days", header: { az: "Seriya", en: "Streak" }, align: "right" },
    {
      key: "is_active",
      header: { az: "Vəziyyət", en: "Status" },
      align: "center",
      render: (row) => <Chip tone={row.is_active ? "mint" : "coral"}>{row.is_active ? "Active" : "Banned"}</Chip>,
    },
  ];

  return (
    <div>
      <PageHeader title={t.title} sub={t.sub} />

      <ResourceToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={t.search}
        filters={[
          {
            key: "active",
            ariaLabel: t.title,
            value: activeFilter,
            onChange: (v) => { setActiveFilter(v); setPage(1); },
            options: [
              { value: "", label: lang === "az" ? "Hamısı" : "All" },
              { value: "true", label: lang === "az" ? "Aktiv" : "Active" },
              { value: "false", label: lang === "az" ? "Bloklanıb" : "Banned" },
            ],
          },
        ]}
        count={data.count}
        countLabel={t.results}
      />

      {loading ? (
        <TileSkeleton height={280} />
      ) : data.results.length === 0 ? (
        <EmptyState icon="◌" title={t.empty} />
      ) : (
        <DataTable
          columns={columns}
          data={data.results}
          rowKey={(r) => r.id}
          onRowClick={(row) => navigate(`/users/${row.id}`)}
          sortKey={ordering}
          onSort={(key) => setOrdering((prev) => (prev === key ? `-${key}` : key))}
        />
      )}

      <Pagination page={page} pageSize={25} count={data.count} onChange={setPage} />
    </div>
  );
}
