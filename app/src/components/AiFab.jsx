import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";

/**
 * Global floating Xakker AI launcher. Mounted once at AppShell root
 * (persists across route transitions, same tier as AnimatedBackground
 * but must stay clickable — sits above content, not pointer-events:none).
 * Hidden on /xakker-ai itself since the page already is the assistant.
 */
export default function AiFab() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLang();

  const isActive = location.pathname.startsWith("/xakker-ai");

  return (
    <AnimatePresence>
      {!isActive && (
        <motion.button
          type="button"
          className="ai-fab"
          onClick={() => navigate("/xakker-ai")}
          aria-label={lang === "az" ? "Xakker AI-nı aç" : "Open Xakker AI"}
          title="Xakker AI"
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 16 }}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.06 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
        >
          <span className="ai-fab-ring" aria-hidden="true" />
          <video
            className="ai-fab-video"
            src="/static/logo/salamlama-animasiyasi.mp4"
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            aria-hidden="true"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
