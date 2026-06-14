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
import { useAccountsList } from "@/features/accounts/use-accounts"
import { useCategoriesList } from "@/features/categories/use-categories"
import { PAYMENT_TYPES } from "@/features/transactions/transaction-schema"
import {
  useCreateRecurring,
  useUpdateRecurring,
} from "@/features/recurring/use-recurring"
import type {
  CreateRecurringTransactionPayload,
  RecurrenceFrequency,
  RecurringTransaction,
} from "@/types/api"

const FREQUENCIES: { value: RecurrenceFrequency; label: string }[] = [
  { value: "DAILY", label: "Diária" },
  { value: "WEEKLY", label: "Semanal" },
  { value: "MONTHLY", label: "Mensal" },
  { value: "YEARLY", label: "Anual" },
]

const schema = z
  .object({
    description: z.string().min(1, "Informe a descrição"),
    amount: z.number().positive("O valor deve ser maior que zero"),
    type: z.enum(["INCOME", "EXPENSE"]),
    paymentType: z.enum(PAYMENT_TYPES).optional(),
    recurrenceType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
    startDate: z.string().min(1, "Informe a data de início"),
    endDate: z.string().optional(),
    // mantido como string para evitar NaN quando o campo fica vazio
    dayOfMonth: z.string().optional(),
    categoryId: z.string().optional(),
    accountId: z.string().optional(),
  })
  .refine((v) => v.type !== "EXPENSE" || !!v.paymentType, {
    message: "Selecione a forma de pagamento",
    path: ["paymentType"],
  })
  .refine((v) => !v.endDate || !v.startDate || v.endDate >= v.startDate, {
    message: "O término deve ser igual ou posterior ao início",
    path: ["endDate"],
  })
  .refine(
    (v) => {
      if (v.recurrenceType !== "MONTHLY" || !v.dayOfMonth) return true
      const n = Number(v.dayOfMonth)
      return Number.isInteger(n) && n >= 1 && n <= 31
    },
    { message: "Informe um dia entre 1 e 31", path: ["dayOfMonth"] },
  )

type FormValues = z.infer<typeof schema>

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"

const todayIso = () => new Date().toISOString().slice(0, 10)

function toFormValues(rt?: RecurringTransaction): FormValues {
  if (!rt) {
    return {
      description: "",
      amount: 0,
      type: "EXPENSE",
      paymentType: undefined,
      recurrenceType: "MONTHLY",
      startDate: todayIso(),
      endDate: "",
      dayOfMonth: "",
      categoryId: undefined,
      accountId: undefined,
    }
  }
  return {
    description: rt.description,
    amount: Number(rt.amount),
    type: rt.type,
    paymentType: rt.paymentType,
    recurrenceType: rt.recurrenceType,
    startDate: rt.startDate,
    endDate: rt.endDate ?? "",
    dayOfMonth: rt.dayOfMonth != null ? String(rt.dayOfMonth) : "",
    categoryId: rt.category ? String(rt.category.id) : undefined,
    accountId: rt.account ? String(rt.account.id) : undefined,
  }
}

function toPayload(v: FormValues): CreateRecurringTransactionPayload {
  return {
    description: v.description.trim(),
    amount: v.amount,
    type: v.type,
    paymentType: v.type === "EXPENSE" ? v.paymentType : undefined,
    recurrenceType: v.recurrenceType,
    startDate: v.startDate,
    endDate: v.endDate || undefined,
    dayOfMonth:
      v.recurrenceType === "MONTHLY" && v.dayOfMonth
        ? Number(v.dayOfMonth)
        : undefined,
    categoryId: v.categoryId ? Number(v.categoryId) : undefined,
    accountId: v.accountId ? Number(v.accountId) : undefined,
  }
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recurring?: RecurringTransaction
}

export function RecurringFormDialog({ open, onOpenChange, recurring }: Props) {
  const isEdit = Boolean(recurring)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(recurring),
  })

  useEffect(() => {
    if (open) form.reset(toFormValues(recurring))
  }, [open, recurring, form])

  const type = form.watch("type")
  const recurrenceType = form.watch("recurrenceType")
  const categories = useCategoriesList()
  const accounts = useAccountsList()
  const createMutation = useCreateRecurring()
  const updateMutation = useUpdateRecurring()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const filteredCategories = (categories.data ?? []).filter(
    (c) => c.type === type,
  )

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = toPayload(values)
    if (isEdit && recurring) {
      await updateMutation.mutateAsync({ id: recurring.id, payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar recorrência" : "Nova recorrência"}
          </DialogTitle>
          <DialogDescription>
            A API gera as transações automaticamente conforme a frequência.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" autoFocus {...form.register("description")} />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="type">Tipo</Label>
              <select id="type" className={selectClass} {...form.register("type")}>
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...form.register("amount", { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>
          </div>

          {type === "EXPENSE" && (
            <div className="space-y-1.5">
              <Label htmlFor="paymentType">Forma de pagamento</Label>
              <select
                id="paymentType"
                className={selectClass}
                {...form.register("paymentType")}
              >
                <option value="">Selecione…</option>
                {PAYMENT_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {form.formState.errors.paymentType && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.paymentType.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="recurrenceType">Frequência</Label>
              <select
                id="recurrenceType"
                className={selectClass}
                {...form.register("recurrenceType")}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {recurrenceType === "MONTHLY" && (
              <div className="space-y-1.5">
                <Label htmlFor="dayOfMonth">Dia do mês (opcional)</Label>
                <Input
                  id="dayOfMonth"
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Ex.: 5"
                  {...form.register("dayOfMonth")}
                />
                {form.formState.errors.dayOfMonth && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.dayOfMonth.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Início</Label>
              <Input id="startDate" type="date" {...form.register("startDate")} />
              {form.formState.errors.startDate && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endDate">Término (opcional)</Label>
              <Input id="endDate" type="date" {...form.register("endDate")} />
              {form.formState.errors.endDate && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="categoryId">Categoria</Label>
              <select
                id="categoryId"
                className={selectClass}
                {...form.register("categoryId")}
              >
                <option value="">Sem categoria</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="accountId">Conta</Label>
              <select
                id="accountId"
                className={selectClass}
                {...form.register("accountId")}
              >
                <option value="">Sem conta</option>
                {(accounts.data ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
