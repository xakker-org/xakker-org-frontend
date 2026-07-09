import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

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
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);
