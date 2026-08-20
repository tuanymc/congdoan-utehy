import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./lib/auth-context";
import { SiteSettingsProvider } from "./lib/site-settings-context";
import { TooltipProvider } from "./components/ui/tooltip";
import { SiteSeo } from "./components/SiteSeo";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Không tìm thấy phần tử #root trong index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <SiteSettingsProvider>
        <AuthProvider>
          <TooltipProvider>
            <SiteSeo />
            <App />
          </TooltipProvider>
        </AuthProvider>
      </SiteSettingsProvider>
    </BrowserRouter>
  </StrictMode>
);
