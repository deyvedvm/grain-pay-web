import { useState } from "react"
import {
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  Repeat,
  Trash2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  useDeleteRecurring,
  useRecurringList,
} from "@/features/recurring/use-recurring"
import { RecurringFormDialog } from "@/features/recurring/recurring-form-dialog"
import type {
  RecurrenceFrequency,
  RecurringTransaction,
  TransactionType,
} from "@/types/api"

const FREQUENCY_LABEL: Record<RecurrenceFrequency, string> = {
  DAILY: "Diária",
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  YEARLY: "Anual",
}

const TYPE_LABEL: Record<TransactionType, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
}

const TYPE_CLASS: Record<TransactionType, string> = {
  INCOME: "bg-emerald-100 text-emerald-700",
  EXPENSE: "bg-rose-100 text-rose-700",
}

export function RecurringPage() {
  const [editing, setEditing] = useState<RecurringTransaction | undefined>()
  const [dialogOpen, setDialogOpen] = useState(false)

  const list = useRecurringList()
  const remove = useDeleteRecurring()
  const items = list.data ?? []

  const openCreate = () => {
    setEditing(undefined)
    setDialogOpen(true)
  }

  const openEdit = (rt: RecurringTransaction) => {
    setEditing(rt)
    setDialogOpen(true)
  }

  const handleDelete = (rt: RecurringTransaction) => {
    if (window.confirm(`Excluir a recorrência "${rt.description}"?`)) {
      remove.mutate(rt.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Recorrentes</h2>
          <p className="text-sm text-muted-foreground">
            Modelos que geram transações automaticamente conforme a frequência.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          Nova recorrência
        </Button>
      </div>

      {list.isError ? (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">
            Não foi possível carregar as recorrências.
          </CardContent>
        </Card>
      ) : list.isLoading ? (
        <div className="py-12 flex justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma recorrência cadastrada.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((rt) => (
            <RecurringCard
              key={rt.id}
              recurring={rt}
              onEdit={() => openEdit(rt)}
              onDelete={() => handleDelete(rt)}
              deleting={remove.isPending}
            />
          ))}
        </div>
      )}

      <RecurringFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        recurring={editing}
      />
    </div>
  )
}

function RecurringCard({
  recurring,
  onEdit,
  onDelete,
  deleting,
}: {
  recurring: RecurringTransaction
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const isIncome = recurring.type === "INCOME"

  return (
    <Card className={cn(!recurring.isActive && "opacity-70")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base truncate">
            {recurring.description}
          </CardTitle>
          <div className="flex gap-1 shrink-0">
            <Badge variant="secondary" className={TYPE_CLASS[recurring.type]}>
              {TYPE_LABEL[recurring.type]}
            </Badge>
            {!recurring.isActive && (
              <Badge variant="secondary" className="bg-zinc-100 text-zinc-600">
                Inativa
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className={cn(
            "text-xl font-semibold tabular-nums",
            isIncome ? "text-emerald-600" : "text-rose-600",
          )}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(Number(recurring.amount))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Repeat className="size-3.5" />
          <span>
            {FREQUENCY_LABEL[recurring.recurrenceType]}
            {recurring.recurrenceType === "MONTHLY" &&
              recurring.dayOfMonth != null &&
              ` · dia ${recurring.dayOfMonth}`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          <span>
            {formatDate(recurring.startDate)}
            {recurring.endDate
              ? ` → ${formatDate(recurring.endDate)}`
              : " → sem término"}
          </span>
        </div>

        {(recurring.category || recurring.account) && (
          <div className="flex flex-wrap gap-1.5">
            {recurring.category && (
              <Badge variant="outline" className="font-normal">
                {recurring.category.name}
              </Badge>
            )}
            {recurring.account && (
              <Badge variant="outline" className="font-normal">
                {recurring.account.name}
              </Badge>
            )}
            {recurring.paymentType && (
              <Badge variant="outline" className="font-normal">
                {recurring.paymentType}
              </Badge>
            )}
          </div>
        )}

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
