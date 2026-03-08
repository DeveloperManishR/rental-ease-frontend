import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "sonner"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { AuthProvider } from "@/providers/auth-provider"
import { QueryProvider } from "@/providers/query-provider"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <QueryProvider>
          <BrowserRouter>
            <App />
            <Toaster richColors position="bottom-right" />
          </BrowserRouter>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)
