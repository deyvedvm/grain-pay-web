import { type ReactNode } from "react"
import { NavLink, Outlet } from "react-router-dom"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tags,
  Target,
  PiggyBank,
  BarChart3,
  Upload,
  Repeat,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { to: "/accounts", label: "Contas", icon: Wallet },
  { to: "/categories", label: "Categorias", icon: Tags },
  { to: "/budgets", label: "Orçamentos", icon: PiggyBank },
  { to: "/goals", label: "Metas", icon: Target },
  { to: "/reports", label: "Relatórios", icon: BarChart3 },
  { to: "/recurring", label: "Recorrentes", icon: Repeat },
  { to: "/import-export", label: "Importar/Exportar", icon: Upload },
]

export function AppShell({ children }: { children?: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="min-h-svh grid grid-cols-[240px_1fr] bg-muted/30">
      <aside className="border-r bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-6 py-5">
          <h1 className="text-lg font-semibold tracking-tight">Grain Pay</h1>
          <p className="text-xs text-muted-foreground">Controle financeiro</p>
        </div>
        <Separator />
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Separator />
        <div className="p-4 space-y-2">
          <div className="text-xs">
            <div className="font-medium truncate">{user?.name ?? "Usuário"}</div>
            <div className="text-muted-foreground truncate">{user?.email}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={logout}
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
      </aside>

      <main className="px-8 py-6 overflow-auto">{children ?? <Outlet />}</main>
    </div>
  )
}
