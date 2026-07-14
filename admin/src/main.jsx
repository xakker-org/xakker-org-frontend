import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/bento.css";
import "./styles/admin-shell.css";
import "./styles/admin-tables.css";
import "./styles/admin-forms.css";

import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* reducedMotion="user" collapses every framer-motion animation
          (route transition, nav pill) to instant under
          prefers-reduced-motion — matches app/src/main.jsx. */}
      <MotionConfig reducedMotion="user">
        <LanguageProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LanguageProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>
);
