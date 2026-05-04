import { useMemo, useState } from "react"
import { AlertTriangle, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  useBudgetsList,
  useDeleteBudget,
} from "@/features/budgets/use-budgets"
import { BudgetFormDialog } from "@/features/budgets/budget-form-dialog"
import type { Budget } from "@/types/api"

function currentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function parseYearMonth(value: string): { year: number; month: number } {
  const [year, month] = value.split("-").map(Number)
  return { year, month }
}

export function BudgetsPage() {
  const [monthValue, setMonthValue] = useState(currentYearMonth)
  const { year, month } = useMemo(() => parseYearMonth(monthValue), [monthValue])

  const [editing, setEditing] = useState<Budget | undefined>()
  const [dialogOpen, setDialogOpen] = useState(false)

  const list = useBudgetsList(monthValue)
  const remove = useDeleteBudget()
  const items = list.data ?? []

  const openCreate = () => {
    setEditing(undefined)
    setDialogOpen(true)
  }

  const openEdit = (b: Budget) => {
    setEditing(b)
    setDialogOpen(true)
  }

  const handleDelete = (b: Budget) => {
    if (window.confirm(`Excluir o orçamento de "${b.category.name}"?`)) {
      remove.mutate(b.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Orçamentos</h2>
          <p className="text-sm text-muted-foreground">
            Defina limites mensais por categoria.
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="month">Mês</Label>
            <Input
              id="month"
              type="month"
              value={monthValue}
              onChange={(e) => setMonthValue(e.target.value)}
              className="w-44"
            />
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="size-4" />
            Novo orçamento
          </Button>
        </div>
      </div>

      {list.isError ? (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">
            Não foi possível carregar os orçamentos.
          </CardContent>
        </Card>
      ) : list.isLoading ? (
        <div className="py-12 flex justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum orçamento cadastrado para este mês.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={() => openEdit(b)}
              onDelete={() => handleDelete(b)}
              deleting={remove.isPending}
            />
          ))}
        </div>
      )}

      <BudgetFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        budget={editing}
        month={month}
        year={year}
      />
    </div>
  )
}

function BudgetCard({
  budget,
  onEdit,
  onDelete,
  deleting,
}: {
  budget: Budget
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const percentage = Number(budget.percentage ?? 0)
  const clamped = Math.min(Math.max(percentage, 0), 100)
  const overLimit = percentage > 100

  const barColor = overLimit
    ? "bg-rose-600"
    : budget.alert
      ? "bg-amber-500"
      : "bg-emerald-500"

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {budget.category.color && (
              <span
                className="inline-block size-3 rounded-full border shrink-0"
                style={{ backgroundColor: budget.category.color }}
              />
            )}
            <CardTitle className="text-base truncate">
              {budget.category.name}
            </CardTitle>
          </div>
          {budget.alert && (
            <Badge
              variant="secondary"
              className={cn(
                "gap-1",
                overLimit
                  ? "bg-rose-100 text-rose-700"
                  : "bg-amber-100 text-amber-700",
              )}
            >
              <AlertTriangle className="size-3" />
              {overLimit ? "Excedido" : "Alerta"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-sm tabular-nums">
            <span className="font-medium">{formatCurrency(Number(budget.spent))}</span>
            <span className="text-muted-foreground">
              de {formatCurrency(Number(budget.limitAmount))}
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full transition-all", barColor)}
              style={{ width: `${clamped}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-muted-foreground tabular-nums">
            {percentage.toFixed(0)}% utilizado
          </div>
        </div>
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar">
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label="Excluir"
            disabled={deleting}
          >
            <Trash2 className="size-4 text-rose-600" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
