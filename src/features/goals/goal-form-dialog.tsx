import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useCreateGoal,
  useUpdateGoal,
} from "@/features/goals/use-goals"
import type {
  CreateGoalPayload,
  Goal,
  GoalPriority,
  GoalStatus,
  UpdateGoalPayload,
} from "@/types/api"

const PRIORITIES: { value: GoalPriority; label: string }[] = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
]

const STATUSES: { value: GoalStatus; label: string }[] = [
  { value: "ACTIVE", label: "Ativa" },
  { value: "COMPLETED", label: "Concluída" },
  { value: "ABANDONED", label: "Abandonada" },
]

const baseSchema = z.object({
  name: z.string().min(1, "Informe um nome"),
  targetAmount: z.number().positive("O valor deve ser maior que zero"),
  deadline: z.string().min(1, "Informe a data limite"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
})

const createSchema = baseSchema.extend({
  deadline: z
    .string()
    .min(1, "Informe a data limite")
    .refine(
      (v) => new Date(v) > new Date(new Date().toDateString()),
      "A data deve ser futura",
    ),
})

const editSchema = baseSchema.extend({
  currentAmount: z.number().min(0, "O valor atual não pode ser negativo"),
  status: z.enum(["ACTIVE", "COMPLETED", "ABANDONED"]),
})

type CreateValues = z.infer<typeof createSchema>
type EditValues = z.infer<typeof editSchema>

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"

const textareaClass =
  "flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal?: Goal
}

function toEditValues(g: Goal): EditValues {
  return {
    name: g.name,
    targetAmount: Number(g.targetAmount),
    currentAmount: Number(g.currentAmount),
    deadline: g.deadline,
    description: g.description ?? "",
    priority: g.priority,
    status: g.status,
  }
}

const emptyCreate: CreateValues = {
  name: "",
  targetAmount: 0,
  deadline: "",
  description: "",
  priority: "MEDIUM",
}

export function GoalFormDialog({ open, onOpenChange, goal }: Props) {
  const isEdit = Boolean(goal)

  if (isEdit && goal) {
    return (
      <EditDialog
        key={goal.id}
        open={open}
        onOpenChange={onOpenChange}
        goal={goal}
      />
    )
  }
  return <CreateDialog open={open} onOpenChange={onOpenChange} />
}

function CreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: emptyCreate,
  })

  useEffect(() => {
    if (open) form.reset(emptyCreate)
  }, [open, form])

  const createMutation = useCreateGoal()

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: CreateGoalPayload = {
      name: values.name.trim(),
      targetAmount: values.targetAmount,
      deadline: values.deadline,
      description: values.description?.trim() || undefined,
      priority: values.priority,
    }
    await createMutation.mutateAsync(payload)
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova meta</DialogTitle>
          <DialogDescription>
            Defina um objetivo financeiro com valor e prazo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            id="name"
            label="Nome"
            error={form.formState.errors.name?.message}
          >
            <Input id="name" autoFocus {...form.register("name")} />
          </Field>

          <Field
            id="targetAmount"
            label="Valor alvo"
            error={form.formState.errors.targetAmount?.message}
          >
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              min={0.01}
              {...form.register("targetAmount", { valueAsNumber: true })}
            />
          </Field>

          <Field
            id="deadline"
            label="Prazo"
            error={form.formState.errors.deadline?.message}
          >
            <Input id="deadline" type="date" {...form.register("deadline")} />
          </Field>

          <Field id="priority" label="Prioridade">
            <select
              id="priority"
              className={selectClass}
              {...form.register("priority")}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>

          <Field id="description" label="Descrição (opcional)">
            <textarea
              id="description"
              className={textareaClass}
              rows={3}
              {...form.register("description")}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditDialog({
  open,
  onOpenChange,
  goal,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: Goal
}) {
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: toEditValues(goal),
  })

  useEffect(() => {
    if (open) form.reset(toEditValues(goal))
  }, [open, goal, form])

  const updateMutation = useUpdateGoal()

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: UpdateGoalPayload = {
      name: values.name.trim(),
      targetAmount: values.targetAmount,
      currentAmount: values.currentAmount,
      deadline: values.deadline,
      description: values.description?.trim() || undefined,
      priority: values.priority,
      status: values.status,
    }
    await updateMutation.mutateAsync({ id: goal.id, payload })
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar meta</DialogTitle>
          <DialogDescription>
            Atualize valor acumulado, prazo ou status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            id="name"
            label="Nome"
            error={form.formState.errors.name?.message}
          >
            <Input id="name" {...form.register("name")} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field
              id="targetAmount"
              label="Valor alvo"
              error={form.formState.errors.targetAmount?.message}
            >
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                min={0.01}
                {...form.register("targetAmount", { valueAsNumber: true })}
              />
            </Field>
            <Field
              id="currentAmount"
              label="Acumulado"
              error={form.formState.errors.currentAmount?.message}
            >
              <Input
                id="currentAmount"
                type="number"
                step="0.01"
                min={0}
                {...form.register("currentAmount", { valueAsNumber: true })}
              />
            </Field>
          </div>

          <Field
            id="deadline"
            label="Prazo"
            error={form.formState.errors.deadline?.message}
          >
            <Input id="deadline" type="date" {...form.register("deadline")} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field id="priority" label="Prioridade">
              <select
                id="priority"
                className={selectClass}
                {...form.register("priority")}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="status" label="Status">
              <select
                id="status"
                className={selectClass}
                {...form.register("status")}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field id="description" label="Descrição (opcional)">
            <textarea
              id="description"
              className={textareaClass}
              rows={3}
              {...form.register("description")}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
