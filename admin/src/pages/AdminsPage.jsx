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
  az: {
    title: "Adminlər", sub: "Staff və superuser hesabları — Django admin və bu paneldəki girişi olanlar",
    search: "Axtar...", empty: "Admin hesabı tapılmadı", results: "nəticə",
    roleAll: "Hamısı", roleStaff: "Staff", roleSuper: "Superuser",
  },
  en: {
    title: "Admins", sub: "Staff and superuser accounts — Django admin and this panel's access",
    search: "Search...", empty: "No admin accounts found", results: "results",
    roleAll: "All", roleStaff: "Staff", roleSuper: "Superuser",
  },
};

export default function AdminsPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const navigate = useNavigate();

  const [data, setData] = useState({ count: 0, results: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [superFilter, setSuperFilter] = useState("");
  const [ordering, setOrdering] = useState("-date_joined");

  const load = useCallback(() => {
    setLoading(true);
    users
      .list({ page, search: debouncedSearch, ordering, is_staff: "true", is_superuser: superFilter })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, ordering, superFilter]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    {
      key: "username",
      header: { az: "Admin", en: "Admin" },
      render: (row) => <UserCell user={row} />,
    },
    {
      key: "is_superuser",
      header: { az: "Rol", en: "Role" },
      align: "center",
      render: (row) => <Chip tone="accent">{row.is_superuser ? "SUPERUSER" : "STAFF"}</Chip>,
    },
    {
      key: "is_active",
      header: { az: "Vəziyyət", en: "Status" },
      align: "center",
      render: (row) => <Chip tone={row.is_active ? "mint" : "coral"}>{row.is_active ? "Active" : "Banned"}</Chip>,
    },
    {
      key: "date_joined",
      header: { az: "Qoşulma tarixi", en: "Joined" },
      sortable: true,
      render: (row) => new Date(row.date_joined).toLocaleDateString(lang === "az" ? "az-AZ" : "en-US"),
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
            key: "role",
            ariaLabel: t.title,
            value: superFilter,
            onChange: (v) => { setSuperFilter(v); setPage(1); },
            options: [
              { value: "", label: t.roleAll },
              { value: "false", label: t.roleStaff },
              { value: "true", label: t.roleSuper },
            ],
          },
        ]}
        count={data.count}
        countLabel={t.results}
      />

      {loading ? (
        <TileSkeleton height={280} />
      ) : data.results.length === 0 ? (
        <EmptyState icon="🛡️" title={t.empty} />
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
