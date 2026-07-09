import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";
import Button from "./ui/Button";

const T = {
  az: { cancel: "İmtina", confirm: "Sil" },
  en: { cancel: "Cancel", confirm: "Delete" },
};

export default function ConfirmDialog({ open, title, body, onConfirm, onCancel }) {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="confirm-dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.15 }}
          style={{ background: "var(--bg-overlay)", backdropFilter: "blur(4px)" }}
          onClick={onCancel}
        >
          <motion.div
            className="confirm-card"
            initial={{ scale: reduce ? 1 : 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: reduce ? 1 : 0.96, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-title">{title}</div>
            <div className="confirm-body">{body}</div>
            <div className="confirm-actions">
              <Button variant="ghost" onClick={onCancel}>{t.cancel}</Button>
              <Button variant="accent" onClick={onConfirm}>{t.confirm}</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
