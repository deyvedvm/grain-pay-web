import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  useAccountsQuery,
  useCategoriesQuery,
  useCreateTransaction,
  useUpdateTransaction,
} from "@/features/transactions/use-transactions"
import {
  INCOME_SOURCES,
  PAYMENT_TYPES,
  transactionSchema,
  type TransactionFormValues,
} from "@/features/transactions/transaction-schema"
import type { CreateTransactionPayload, Transaction } from "@/types/api"

const incomeSourceLabel: Record<(typeof INCOME_SOURCES)[number], string> = {
  SALARY: "Salário",
  FREELANCE: "Freelance",
  INVESTMENT: "Investimentos",
  REFUND: "Reembolso",
  OTHER: "Outros",
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction
}

const todayIso = () => new Date().toISOString().slice(0, 10)

function toFormValues(t?: Transaction): TransactionFormValues {
  if (!t) {
    return {
      type: "EXPENSE",
      amount: 0,
      date: todayIso(),
      description: "",
      paymentType: undefined,
      categoryId: undefined,
      accountId: undefined,
      notes: undefined,
      installments: undefined,
      source: undefined,
    }
  }
  return {
    type: t.type,
    amount: Number(t.amount),
    date: t.date,
    description: t.description,
    paymentType: t.paymentType,
    categoryId: t.category ? String(t.category.id) : undefined,
    accountId: t.account ? String(t.account.id) : undefined,
    notes: t.notes,
    installments: t.installments ?? undefined,
    source: t.source,
  }
}

function toPayload(v: TransactionFormValues): CreateTransactionPayload {
  return {
    type: v.type,
    amount: v.amount,
    date: v.date,
    description: v.description,
    paymentType: v.type === "EXPENSE" ? v.paymentType : undefined,
    categoryId: v.categoryId ? Number(v.categoryId) : undefined,
    accountId: v.accountId ? Number(v.accountId) : undefined,
    notes: v.notes || undefined,
    installments:
      v.type === "EXPENSE" && v.installments && v.installments > 1
        ? v.installments
        : undefined,
    source: v.type === "INCOME" ? v.source : undefined,
  }
}

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"

export function TransactionFormDialog({ open, onOpenChange, transaction }: Props) {
  const isEdit = Boolean(transaction)

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: toFormValues(transaction),
  })

  useEffect(() => {
    if (open) form.reset(toFormValues(transaction))
  }, [open, transaction, form])

  const type = form.watch("type")
  const categories = useCategoriesQuery()
  const accounts = useAccountsQuery()
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const filteredCategories = (categories.data ?? []).filter((c) => c.type === type)

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = toPayload(values)
    if (isEdit && transaction) {
      await updateMutation.mutateAsync({ id: transaction.id, payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar transação" : "Nova transação"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                className={selectClass}
                {...form.register("type")}
              >
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...form.register("date")} />
              {form.formState.errors.date && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            {type === "EXPENSE" ? (
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
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="source">Fonte</Label>
                <select
                  id="source"
                  className={selectClass}
                  {...form.register("source")}
                >
                  <option value="">Selecione…</option>
                  {INCOME_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {incomeSourceLabel[s]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" {...form.register("description")} />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
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

          {type === "EXPENSE" && (
            <div className="space-y-1.5">
              <Label htmlFor="installments">Parcelas (opcional)</Label>
              <Input
                id="installments"
                type="number"
                min={1}
                max={360}
                placeholder="Ex.: 12"
                {...form.register("installments", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Para parcelas, a API gera as transações futuras automaticamente.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notas</Label>
            <Input id="notes" {...form.register("notes")} />
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
            <Button type="submit" disabled={isSubmitting} className={cn()}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
