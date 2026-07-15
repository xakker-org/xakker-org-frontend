import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useLang } from "../contexts/LanguageContext";
import { t } from "../lib/i18n";
import { getResource } from "../resources";
import { useDebouncedValue } from "../utils/useDebouncedValue";
import PageHeader from "../components/PageHeader";
import Drawer from "../components/Drawer";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";
import ResourceForm from "../components/forms/ResourceForm";
import ResourceToolbar from "../components/ResourceToolbar";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/DataTable";
import { TileSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Icon from "../components/ui/Icon";

const T = {
  az: {
    new: "Yeni",
    search: "Axtar...",
    noMatch: "Axtarışa uyğun nəticə tapılmadı",
    clearFilters: "Filtrləri təmizlə",
    emptyAction: "+ İlkini əlavə et",
    confirmTitle: "Silinsin?",
    confirmBody: "Bu əməliyyat geri qaytarıla bilməz.",
  },
  en: {
    new: "New",
    search: "Search...",
    noMatch: "No results match your search",
    clearFilters: "Clear filters",
    emptyAction: "+ Add the first one",
    confirmTitle: "Delete this?",
    confirmBody: "This action cannot be undone.",
  },
};

export default function ResourceListPage() {
  const { type } = useParams();
  const { lang } = useLang();
  const tr = T[lang] || T.az;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const config = getResource(type);

  const [data, setData] = useState({ count: 0, results: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [filterValues, setFilterValues] = useState({});
  const [ordering, setOrdering] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [asyncFilterOptions, setAsyncFilterOptions] = useState({});

  // Filters may declare `optionsEndpoint` (a createResource endpoint) instead
  // of a static `options` array — used for admin-defined choices like CTF
  // mission categories/tags that don't fit a fixed enum.
  useEffect(() => {
    (config?.filters || []).forEach((f) => {
      if (!f.optionsEndpoint) return;
      f.optionsEndpoint.list({ page_size: 200 }).then(({ data }) => {
        const results = data.results ?? data;
        setAsyncFilterOptions((prev) => ({
          ...prev,
          [f.key]: [
            { value: "", label: f.allLabel || { az: "Hamısı", en: "All" } },
            ...results.map((r) => ({ value: r.slug ?? r.id, label: r[f.optionsLabelKey || "name"] })),
          ],
        }));
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    });
  }, [config]);

  const parentFilter = {};
  for (const [key, value] of searchParams.entries()) parentFilter[key] = value;

  const load = useCallback(() => {
    if (!config) return;
    setLoading(true);
    config.endpoint
      .list({ page, search: debouncedSearch, ordering, ...filterValues, ...parentFilter })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, page, debouncedSearch, ordering, JSON.stringify(filterValues), JSON.stringify(parentFilter)]);

  useEffect(() => { setPage(1); }, [type]);
  useEffect(() => { load(); }, [load]);

  if (!config) {
    return <EmptyState icon="?" title="Not found" description={`Unknown resource: ${type}`} />;
  }

  const openCreate = () => {
    setEditing(null);
    setFormErrors({});
    if (config.editMode === "route") {
      navigate(`/content/${type}/new`);
    } else {
      setDrawerOpen(true);
    }
  };

  const openEdit = (row) => {
    if (config.editMode === "route") {
      navigate(`/content/${type}/${row.id}`);
    } else {
      setEditing(row);
      setFormErrors({});
      setDrawerOpen(true);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setFormErrors({});
    try {
      if (editing) await config.endpoint.update(editing.id, values);
      else await config.endpoint.create(values);
      setDrawerOpen(false);
      load();
    } catch (err) {
      setFormErrors(err.response?.data || {});
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await config.endpoint.remove(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const columns = [
    ...config.columns,
    {
      key: "__actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="res-row-actions">
          <button
            className="res-row-btn"
            onClick={(e) => { e.stopPropagation(); openEdit(row); }}
            title={lang === "az" ? "Redaktə et" : "Edit"}
            aria-label={lang === "az" ? "Redaktə et" : "Edit"}
          >
            <Icon name="arrowRight" size={13} />
          </button>
          <button
            className="res-row-btn is-danger"
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            title={lang === "az" ? "Sil" : "Delete"}
            aria-label={lang === "az" ? "Sil" : "Delete"}
          >
            <Icon name="trash" size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t(config.title, lang)}
        actions={
          <Button variant="accent" onClick={openCreate}>
            + {tr.new}
          </Button>
        }
      />

      <ResourceToolbar
        search={search}
        onSearchChange={config.search ? (v) => { setSearch(v); setPage(1); } : undefined}
        searchPlaceholder={tr.search}
        filters={(config.filters || []).map((f) => ({
          key: f.key,
          ariaLabel: t(f.label, lang),
          value: filterValues[f.key] ?? "",
          onChange: (v) => { setFilterValues((prev) => ({ ...prev, [f.key]: v })); setPage(1); },
          options: (f.optionsEndpoint ? asyncFilterOptions[f.key] || [] : f.options).map((o) => ({
            value: o.value,
            label: t(o.label, lang),
          })),
        }))}
        count={data.count}
        countLabel={lang === "az" ? "nəticə" : "results"}
      />

      {loading ? (
        <div style={{ display: "grid", gap: 12 }}>
          <TileSkeleton height={280} />
        </div>
      ) : data.results.length === 0 ? (
        search || Object.values(filterValues).some(Boolean) ? (
          <EmptyState
            icon="🔍"
            title={tr.noMatch}
            action={
              <Button
                variant="ghost"
                onClick={() => { setSearch(""); setFilterValues({}); setPage(1); }}
              >
                {tr.clearFilters}
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={config.emptyIcon || "◌"}
            title={t(config.emptyTitle, lang) || (lang === "az" ? "Hələ heç nə yoxdur" : "Nothing here yet")}
            description={t(config.emptyDescription, lang)}
            action={
              <Button variant="accent" onClick={openCreate}>
                {tr.emptyAction}
              </Button>
            }
          />
        )
      ) : (
        <DataTable
          columns={columns}
          data={data.results}
          rowKey={config.rowKey}
          onRowClick={openEdit}
          sortKey={ordering}
          onSort={(key) => setOrdering((prev) => (prev === key ? `-${key}` : key))}
        />
      )}

      <Pagination page={page} pageSize={25} count={data.count} onChange={setPage} />

      {config.editMode !== "route" && (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? t(config.title, lang) : `${tr.new} — ${t(config.title, lang)}`}>
          <ResourceForm
            fields={config.formFields}
            initialValues={editing}
            onSubmit={handleSubmit}
            onCancel={() => setDrawerOpen(false)}
            submitting={submitting}
            errors={formErrors}
          />
        </Drawer>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={tr.confirmTitle}
        body={tr.confirmBody}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
