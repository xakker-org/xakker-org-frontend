import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLang } from "../contexts/LanguageContext";
import { t } from "../lib/i18n";
import { getResource } from "../resources";
import PageHeader from "../components/PageHeader";
import ResourceForm from "../components/forms/ResourceForm";
import { TileSkeleton } from "../components/ui/Skeleton";
import Button from "../components/ui/Button";

export default function ResourceEditPage() {
  const { type, id } = useParams();
  const { lang } = useLang();
  const navigate = useNavigate();
  const config = getResource(type);
  const isNew = !id;

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!config) return;
    if (isNew) { setRecord(null); return; }
    setLoading(true);
    config.endpoint.get(id).then(({ data }) => setRecord(data)).finally(() => setLoading(false));
  }, [config, id, isNew]);

  if (!config) return null;

  const goBack = () => navigate(`/content/${type}`);
  const backLabel = lang === "az" ? "← Siyahı" : "← List";

  if (config.FormComponent) {
    const Bespoke = config.FormComponent;
    return (
      <div>
        <PageHeader
          title={t(config.title, lang)}
          actions={<Button variant="ghost" onClick={goBack}>{backLabel}</Button>}
        />
        {loading ? (
          <TileSkeleton height={320} />
        ) : (
          <Bespoke
            id={isNew ? null : Number(id)}
            record={record}
            parentFilter={{}}
            onSaved={goBack}
            onCancel={goBack}
          />
        )}
      </div>
    );
  }

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setErrors({});
    try {
      if (isNew) await config.endpoint.create(values);
      else await config.endpoint.update(id, values);
      goBack();
    } catch (err) {
      setErrors(err.response?.data || {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={t(config.title, lang)}
        actions={<Button variant="ghost" onClick={goBack}>{backLabel}</Button>}
      />
      {loading ? (
        <TileSkeleton height={320} />
      ) : (
        <div className="tile" style={{ maxWidth: 640 }}>
          <ResourceForm
            fields={config.formFields}
            initialValues={record}
            onSubmit={handleSubmit}
            submitting={submitting}
            errors={errors}
          />
        </div>
      )}
      {config.Children && record && <config.Children record={record} />}
    </div>
  );
}
