import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/features/categories/use-categories"
import type { Category, CreateCategoryPayload } from "@/types/api"

const schema = z.object({
  name: z.string().min(1, "Informe o nome"),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().optional(),
  color: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category
}

function toFormValues(c?: Category): FormValues {
  return {
    name: c?.name ?? "",
    type: c?.type ?? "EXPENSE",
    icon: c?.icon ?? "",
    color: c?.color ?? "#6366f1",
  }
}

function toPayload(v: FormValues): CreateCategoryPayload {
  return {
    name: v.name,
    type: v.type,
    icon: v.icon || undefined,
    color: v.color || undefined,
  }
}

export function CategoryFormDialog({ open, onOpenChange, category }: Props) {
  const isEdit = Boolean(category)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(category),
  })

  useEffect(() => {
    if (open) form.reset(toFormValues(category))
  }, [open, category, form])

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = toPayload(values)
    if (isEdit && category) {
      await updateMutation.mutateAsync({ id: category.id, payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar categoria" : "Nova categoria"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
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
              <Label htmlFor="color">Cor</Label>
              <Input id="color" type="color" {...form.register("color")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="icon">Ícone (opcional)</Label>
            <Input id="icon" placeholder="lucide" {...form.register("icon")} />
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
