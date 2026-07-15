import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import App from "./App";
import { CommandProvider } from "./contexts/CommandContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";

try {
  document.documentElement.setAttribute(
    "data-theme",
    localStorage.getItem("xk_ui_theme") || "dark"
  );
} catch {
  document.documentElement.setAttribute("data-theme", "dark");
}

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/animated-background.css";
import "./styles/shell.css";
import "./styles/bento.css";
import "./styles/compat.css";
import "./styles/dashboard.css";
import "./styles/screens.css";
import "./styles/proto.css";
import "./styles/lab.css";
import "./styles/ai-fab.css";
import "./styles/ai-assistant.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* reducedMotion="user" makes every framer-motion animation in the
          app (route transitions, nav indicator, stat pulses) automatically
          collapse to instant when prefers-reduced-motion is set. */}
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <LanguageProvider>
            <CommandProvider>
              <App />
            </CommandProvider>
          </LanguageProvider>
        </ThemeProvider>
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>
);
