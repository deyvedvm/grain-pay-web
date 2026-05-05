import { useState } from "react"
import { CalendarDays, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useDeleteGoal, useGoalsList } from "@/features/goals/use-goals"
import { GoalFormDialog } from "@/features/goals/goal-form-dialog"
import type { Goal, GoalPriority, GoalStatus } from "@/types/api"

const PRIORITY_LABEL: Record<GoalPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
}

const PRIORITY_CLASS: Record<GoalPriority, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-sky-100 text-sky-700",
  HIGH: "bg-rose-100 text-rose-700",
}

const STATUS_LABEL: Record<GoalStatus, string> = {
  ACTIVE: "Ativa",
  COMPLETED: "Concluída",
  ABANDONED: "Abandonada",
}

const STATUS_CLASS: Record<GoalStatus, string> = {
  ACTIVE: "bg-indigo-100 text-indigo-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  ABANDONED: "bg-zinc-100 text-zinc-600",
}

export function GoalsPage() {
  const [editing, setEditing] = useState<Goal | undefined>()
  const [dialogOpen, setDialogOpen] = useState(false)

  const list = useGoalsList()
  const remove = useDeleteGoal()
  const items = list.data ?? []

  const openCreate = () => {
    setEditing(undefined)
    setDialogOpen(true)
  }

  const openEdit = (g: Goal) => {
    setEditing(g)
    setDialogOpen(true)
  }

  const handleDelete = (g: Goal) => {
    if (window.confirm(`Excluir a meta "${g.name}"?`)) {
      remove.mutate(g.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Metas</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe o progresso dos seus objetivos financeiros.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          Nova meta
        </Button>
      </div>

      {list.isError ? (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">
            Não foi possível carregar as metas.
          </CardContent>
        </Card>
      ) : list.isLoading ? (
        <div className="py-12 flex justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma meta cadastrada.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={() => openEdit(g)}
              onDelete={() => handleDelete(g)}
              deleting={remove.isPending}
            />
          ))}
        </div>
      )}

      <GoalFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goal={editing}
      />
    </div>
  )
}

function GoalCard({
  goal,
  onEdit,
  onDelete,
  deleting,
}: {
  goal: Goal
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const progress = Number(goal.progress ?? 0)
  const clamped = Math.min(Math.max(progress, 0), 100)
  const completed = goal.status === "COMPLETED" || progress >= 100
  const abandoned = goal.status === "ABANDONED"

  const barColor = abandoned
    ? "bg-zinc-400"
    : completed
      ? "bg-emerald-500"
      : progress >= 75
        ? "bg-indigo-500"
        : "bg-sky-500"

  const overdue =
    goal.status === "ACTIVE" &&
    !completed &&
    new Date(goal.deadline) < new Date(new Date().toDateString())

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base truncate">{goal.name}</CardTitle>
          <div className="flex gap-1 shrink-0">
            <Badge variant="secondary" className={PRIORITY_CLASS[goal.priority]}>
              {PRIORITY_LABEL[goal.priority]}
            </Badge>
            <Badge variant="secondary" className={STATUS_CLASS[goal.status]}>
              {STATUS_LABEL[goal.status]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-sm tabular-nums">
            <span className="font-medium">
              {formatCurrency(Number(goal.currentAmount))}
            </span>
            <span className="text-muted-foreground">
              de {formatCurrency(Number(goal.targetAmount))}
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full transition-all", barColor)}
              style={{ width: `${clamped}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-muted-foreground tabular-nums">
            {progress.toFixed(0)}% concluído
          </div>
        </div>

        <div
          className={cn(
            "flex items-center gap-1.5 text-xs",
            overdue ? "text-rose-600" : "text-muted-foreground",
          )}
        >
          <CalendarDays className="size-3.5" />
          <span>
            Prazo: {formatDate(goal.deadline)}
            {overdue && " (vencido)"}
          </span>
        </div>

        {goal.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {goal.description}
          </p>
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
