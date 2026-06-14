import { Navigate, Route, Routes } from "react-router-dom"
import { AppShell } from "@/components/layout/app-shell"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { LoginPage } from "@/features/auth/login-page"
import { RegisterPage } from "@/features/auth/register-page"
import { AccountsPage } from "@/features/accounts/accounts-page"
import { BudgetsPage } from "@/features/budgets/budgets-page"
import { CategoriesPage } from "@/features/categories/categories-page"
import { DashboardPage } from "@/features/dashboard/dashboard-page"
import { GoalsPage } from "@/features/goals/goals-page"
import { ImportExportPage } from "@/features/import-export/import-export-page"
import { RecurringPage } from "@/features/recurring/recurring-page"
import { ReportsPage } from "@/features/reports/reports-page"
import { TransactionsPage } from "@/features/transactions/transactions-page"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="budgets" element={<BudgetsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="recurring" element={<RecurringPage />} />
        <Route path="import-export" element={<ImportExportPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
