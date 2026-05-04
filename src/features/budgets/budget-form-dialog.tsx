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
import { useCategoriesList } from "@/features/categories/use-categories"
import {
  useCreateBudget,
  useUpdateBudget,
} from "@/features/budgets/use-budgets"
import type { Budget, CreateBudgetPayload } from "@/types/api"

const schema = z.object({
  categoryId: z.string().min(1, "Selecione a categoria"),
  limitAmount: z.number().positive("O limite deve ser maior que zero"),
})

type FormValues = z.infer<typeof schema>

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget?: Budget
  month: number
  year: number
}

function toFormValues(b?: Budget): FormValues {
  return {
    categoryId: b?.category ? String(b.category.id) : "",
    limitAmount: b ? Number(b.limitAmount) : 0,
  }
}

export function BudgetFormDialog({
  open,
  onOpenChange,
  budget,
  month,
  year,
}: Props) {
  const isEdit = Boolean(budget)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(budget),
  })

  useEffect(() => {
    if (open) form.reset(toFormValues(budget))
  }, [open, budget, form])

  const categories = useCategoriesList()
  const expenseCategories = (categories.data ?? []).filter((c) => c.type === "EXPENSE")

  const createMutation = useCreateBudget()
  const updateMutation = useUpdateBudget()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: CreateBudgetPayload = {
      categoryId: Number(values.categoryId),
      limitAmount: values.limitAmount,
      month,
      year,
    }
    if (isEdit && budget) {
      await updateMutation.mutateAsync({ id: budget.id, payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar orçamento" : "Novo orçamento"}</DialogTitle>
          <DialogDescription>
            Mês {String(month).padStart(2, "0")}/{year}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="categoryId">Categoria (despesa)</Label>
            <select
              id="categoryId"
              className={selectClass}
              disabled={isEdit}
              {...form.register("categoryId")}
            >
              <option value="">Selecione…</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {form.formState.errors.categoryId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="limitAmount">Limite</Label>
            <Input
              id="limitAmount"
              type="number"
              step="0.01"
              min={0.01}
              {...form.register("limitAmount", { valueAsNumber: true })}
            />
            {form.formState.errors.limitAmount && (
              <p className="text-xs text-destructive">
                {form.formState.errors.limitAmount.message}
              </p>
            )}
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
