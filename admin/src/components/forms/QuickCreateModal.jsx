import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ResourceForm from "./ResourceForm";

/** Django-admin-style "add another" popup: create a related object without
 * leaving the current form. On success the new object is handed back to the
 * caller (RelationSelect), which selects it and appends it to its options. */
export default function QuickCreateModal({ open, title, fields, endpoint, onCreated, onClose }) {
  const reduce = useReducedMotion();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    const onKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setErrors({});
    try {
      const { data } = await endpoint.create(values);
      onCreated(data);
    } catch (err) {
      setErrors(err.response?.data || {});
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="qc-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.15 }}
        >
          <motion.div
            className="qc-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : 8 }}
            transition={{ duration: reduce ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="qc-head">
              <div className="qc-title">{title}</div>
              <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="qc-body">
              <ResourceForm
                fields={fields}
                initialValues={null}
                onSubmit={handleSubmit}
                onCancel={onClose}
                submitting={submitting}
                errors={errors}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
