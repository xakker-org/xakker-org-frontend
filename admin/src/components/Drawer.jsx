import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Icon from "./ui/Icon";

export default function Drawer({ open, onClose, title, children, footer }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="drawer-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18 }}
          />
          <motion.div
            className="drawer"
            initial={{ x: reduce ? 0 : 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: reduce ? 0 : 32, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="drawer-head">
              <div className="drawer-title">{title}</div>
              <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">
                <Icon name="chevronRight" size={16} />
              </button>
            </div>
            <div className="drawer-body">{children}</div>
            {footer && <div className="drawer-footer">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
