import { useState } from "react"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useCategoriesList,
  useDeleteCategory,
} from "@/features/categories/use-categories"
import { CategoryFormDialog } from "@/features/categories/category-form-dialog"
import type { Category } from "@/types/api"

export function CategoriesPage() {
  const [editing, setEditing] = useState<Category | undefined>()
  const [dialogOpen, setDialogOpen] = useState(false)

  const list = useCategoriesList()
  const remove = useDeleteCategory()
  const items = list.data ?? []

  const openCreate = () => {
    setEditing(undefined)
    setDialogOpen(true)
  }

  const openEdit = (c: Category) => {
    setEditing(c)
    setDialogOpen(true)
  }

  const handleDelete = (c: Category) => {
    if (window.confirm(`Excluir a categoria "${c.name}"?`)) remove.mutate(c.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Categorias</h2>
          <p className="text-sm text-muted-foreground">
            Organize receitas e despesas por categoria.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          Nova categoria
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {list.isError ? (
            <div className="py-8 text-center text-sm text-destructive">
              Não foi possível carregar as categorias.
            </div>
          ) : list.isLoading ? (
            <div className="py-12 flex justify-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhuma categoria cadastrada.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead className="w-[88px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={c.type === "INCOME" ? "default" : "secondary"}
                      >
                        {c.type === "INCOME" ? "Receita" : "Despesa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {c.color ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block size-4 rounded-full border"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {c.color}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(c)}
                          aria-label="Editar"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(c)}
                          aria-label="Excluir"
                          disabled={remove.isPending}
                        >
                          <Trash2 className="size-4 text-rose-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
      />
    </div>
  )
}
