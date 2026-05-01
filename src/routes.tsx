import { Navigate, Route, Routes } from "react-router-dom"
import { AppShell } from "@/components/layout/app-shell"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { LoginPage } from "@/features/auth/login-page"
import { DashboardPage } from "@/features/dashboard/dashboard-page"

function Placeholder({ title }: { title: string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">Em construção.</p>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="transactions" element={<Placeholder title="Transações" />} />
        <Route path="accounts" element={<Placeholder title="Contas" />} />
        <Route path="categories" element={<Placeholder title="Categorias" />} />
        <Route path="budgets" element={<Placeholder title="Orçamentos" />} />
        <Route path="goals" element={<Placeholder title="Metas" />} />
        <Route path="reports" element={<Placeholder title="Relatórios" />} />
        <Route path="recurring" element={<Placeholder title="Recorrentes" />} />
        <Route path="import-export" element={<Placeholder title="Importar/Exportar" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
