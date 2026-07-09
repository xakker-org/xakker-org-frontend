import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../contexts/LanguageContext";
import { t } from "../lib/i18n";
import Drawer from "./Drawer";
import ConfirmDialog from "./ConfirmDialog";
import ResourceForm from "./forms/ResourceForm";
import Button from "./ui/Button";
import DataTable from "./ui/DataTable";
import EmptyState from "./ui/EmptyState";
import { TileSkeleton } from "./ui/Skeleton";

const T = {
  az: {
    add: "Əlavə et",
    emptyTitle: "Hələ heç nə yoxdur",
    emptyAction: "+ İlkini əlavə et",
    confirmTitle: "Silinsin?",
    confirmBody: "Bu əməliyyat geri qaytarıla bilməz.",
  },
  en: {
    add: "Add",
    emptyTitle: "Nothing here yet",
    emptyAction: "+ Add the first one",
    confirmTitle: "Delete this?",
    confirmBody: "This action cannot be undone.",
  },
};

/**
 * Embeds a filtered child collection (e.g. a Room's Tasks, a Mission's
 * Passes) inside a parent's edit page. If `linkTo` is given, clicking an
 * existing row navigates there instead of opening the inline edit drawer —
 * used when the child has its own deeper nested management.
 */
export default function InlineResourceList({
  config,
  parentFilter,
  title,
  FormComponent,
  linkTo,
  emptyIcon = "◌",
  emptyDescription,
}) {
  const { lang } = useLang();
  const tr = T[lang] || T.az;
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    config.endpoint
      .list({ ...parentFilter, page_size: 100, ordering: "order" })
      .then(({ data }) => setItems(data.results ?? data))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, JSON.stringify(parentFilter)]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setErrors({}); setDrawerOpen(true); };

  const handleRowClick = (row) => {
    if (linkTo) navigate(linkTo(row));
    else { setEditing(row); setErrors({}); setDrawerOpen(true); }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setErrors({});
    try {
      const payload = { ...parentFilter, ...values };
      if (editing) await config.endpoint.update(editing.id, payload);
      else await config.endpoint.create(payload);
      setDrawerOpen(false);
      load();
    } catch (err) {
      setErrors(err.response?.data || {});
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
        <button
          className="res-row-btn is-danger"
          onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
          title="Delete"
        >
          ×
        </button>
      ),
    },
  ];

  return (
    <div className="tile" style={{ marginTop: 20 }}>
      <div className="tile-head">
        <div className="tile-title">{title}</div>
        <Button size="sm" variant="accent" onClick={openCreate}>+ {tr.add}</Button>
      </div>
      {loading ? (
        <TileSkeleton height={120} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={tr.emptyTitle}
          description={emptyDescription}
          action={<Button size="sm" variant="ghost" onClick={openCreate}>{tr.emptyAction}</Button>}
        />
      ) : (
        <DataTable columns={columns} data={items} rowKey={(r) => r.id} onRowClick={handleRowClick} />
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={title}>
        {FormComponent ? (
          <FormComponent
            id={editing?.id ?? null}
            record={editing}
            parentFilter={parentFilter}
            onSaved={() => { setDrawerOpen(false); load(); }}
            onCancel={() => setDrawerOpen(false)}
          />
        ) : (
          <ResourceForm
            fields={config.formFields}
            initialValues={editing}
            onSubmit={handleSubmit}
            onCancel={() => setDrawerOpen(false)}
            submitting={submitting}
            errors={errors}
          />
        )}
      </Drawer>

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
