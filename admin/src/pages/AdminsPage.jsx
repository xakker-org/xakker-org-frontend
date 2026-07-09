import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../contexts/LanguageContext";
import { users } from "../services/adminApi";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import DataTable from "../components/ui/DataTable";
import { Input } from "../components/ui/Field";
import Segmented from "../components/ui/Segmented";
import { Chip } from "../components/ui/Chip";
import Avatar from "../components/ui/Avatar";
import { TileSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";

const T = {
  az: {
    title: "Adminlər", sub: "Staff və superuser hesabları — Django admin və bu paneldəki girişi olanlar",
    search: "Axtar...", empty: "Admin hesabı tapılmadı",
    roleAll: "Hamısı", roleStaff: "Staff", roleSuper: "Superuser",
  },
  en: {
    title: "Admins", sub: "Staff and superuser accounts — Django admin and this panel's access",
    search: "Search...", empty: "No admin accounts found",
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
  const [superFilter, setSuperFilter] = useState("");
  const [ordering, setOrdering] = useState("-date_joined");

  const load = useCallback(() => {
    setLoading(true);
    users
      .list({ page, search, ordering, is_staff: "true", is_superuser: superFilter })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [page, search, ordering, superFilter]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    {
      key: "username",
      header: lang === "az" ? "Admin" : "Admin",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar user={row} size={28} rounded="md" />
          <div>
            <div style={{ fontWeight: 600 }}>{row.full_name || row.username}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "is_superuser",
      header: lang === "az" ? "Rol" : "Role",
      align: "center",
      render: (row) => <Chip tone="accent">{row.is_superuser ? "SUPERUSER" : "STAFF"}</Chip>,
    },
    {
      key: "is_active",
      header: lang === "az" ? "Vəziyyət" : "Status",
      align: "center",
      render: (row) => <Chip tone={row.is_active ? "mint" : "coral"}>{row.is_active ? "Active" : "Banned"}</Chip>,
    },
    { key: "date_joined", header: lang === "az" ? "Qoşulma tarixi" : "Joined", sortable: true,
      render: (row) => new Date(row.date_joined).toLocaleDateString(lang === "az" ? "az-AZ" : "en-US") },
  ];

  return (
    <div>
      <PageHeader title={t.title} sub={t.sub} />

      <div className="res-toolbar">
        <div className="res-search">
          <Input placeholder={t.search} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Segmented
          value={superFilter}
          onChange={(v) => { setSuperFilter(v); setPage(1); }}
          options={[
            { value: "", label: t.roleAll },
            { value: "false", label: t.roleStaff },
            { value: "true", label: t.roleSuper },
          ]}
        />
        <div className="res-count">{data.count} {lang === "az" ? "nəticə" : "results"}</div>
      </div>

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
