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
    title: "İstifadəçilər", sub: "Platformadakı bütün istifadəçilər", search: "Axtar...", empty: "Nəticə yoxdur",
    roleAll: "Hamısı", roleAdmin: "Adminlər", roleStudent: "Tələbələr",
  },
  en: {
    title: "Users", sub: "All platform users", search: "Search...", empty: "No results",
    roleAll: "All", roleAdmin: "Admins", roleStudent: "Students",
  },
};

export default function UsersPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const navigate = useNavigate();

  const [data, setData] = useState({ count: 0, results: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [ordering, setOrdering] = useState("-date_joined");

  const load = useCallback(() => {
    setLoading(true);
    users
      .list({ page, search, ordering, is_active: activeFilter, is_staff: roleFilter })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [page, search, ordering, activeFilter, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    {
      key: "username",
      header: lang === "az" ? "İstifadəçi" : "User",
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
    { key: "rank", header: lang === "az" ? "Rütbə" : "Rank" },
    { key: "xp", header: "XP", align: "right", sortable: true },
    {
      key: "is_active",
      header: lang === "az" ? "Vəziyyət" : "Status",
      align: "center",
      render: (row) => <Chip tone={row.is_active ? "mint" : "coral"}>{row.is_active ? "Active" : "Banned"}</Chip>,
    },
    {
      key: "is_staff",
      header: "Staff",
      align: "center",
      render: (row) => (row.is_staff ? <Chip tone="accent">{row.is_superuser ? "SUPERUSER" : "STAFF"}</Chip> : "—"),
    },
  ];

  return (
    <div>
      <PageHeader title={t.title} sub={t.sub} />

      <div className="res-toolbar">
        <div className="res-search">
          <Input placeholder={t.search} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Segmented
          value={roleFilter}
          onChange={(v) => { setRoleFilter(v); setPage(1); }}
          options={[
            { value: "", label: t.roleAll },
            { value: "false", label: t.roleStudent },
            { value: "true", label: t.roleAdmin },
          ]}
        />
        <Segmented
          value={activeFilter}
          onChange={(v) => { setActiveFilter(v); setPage(1); }}
          options={[
            { value: "", label: lang === "az" ? "Hamısı" : "All" },
            { value: "true", label: lang === "az" ? "Aktiv" : "Active" },
            { value: "false", label: lang === "az" ? "Bloklanıb" : "Banned" },
          ]}
        />
        <div className="res-count">{data.count} {lang === "az" ? "nəticə" : "results"}</div>
      </div>

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
