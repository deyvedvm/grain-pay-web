import { useMemo, useState } from "react"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  PAGE_SIZE,
  useDeleteTransaction,
  useTransactionsList,
} from "@/features/transactions/use-transactions"
import { TransactionFormDialog } from "@/features/transactions/transaction-form-dialog"
import type { Transaction, TransactionFilters, TransactionType } from "@/types/api"

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState<Transaction | undefined>()
  const [dialogOpen, setDialogOpen] = useState(false)

  const list = useTransactionsList(filters, page)
  const remove = useDeleteTransaction()

  const items = list.data ?? []
  const hasMore = items.length === PAGE_SIZE
  const isFirstLoad = list.isLoading && !list.data

  const updateFilter = <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K] | undefined,
  ) => {
    setPage(0)
    setFilters((prev) => {
      const next = { ...prev }
      if (value === undefined || value === ("" as unknown)) delete next[key]
      else next[key] = value
      return next
    })
  }

  const openCreate = () => {
    setEditing(undefined)
    setDialogOpen(true)
  }

  const openEdit = (t: Transaction) => {
    setEditing(t)
    setDialogOpen(true)
  }

  const handleDelete = (t: Transaction) => {
    if (window.confirm(`Excluir "${t.description}"?`)) remove.mutate(t.id)
  }

  const showingRange = useMemo(() => {
    if (!items.length) return null
    const from = page * PAGE_SIZE + 1
    const to = page * PAGE_SIZE + items.length
    return `${from}–${to}`
  }, [items.length, page])

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Transações</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie suas receitas e despesas.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          Nova transação
        </Button>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="filter-type">Tipo</Label>
            <select
              id="filter-type"
              className={selectClass}
              value={filters.type ?? ""}
              onChange={(e) =>
                updateFilter(
                  "type",
                  (e.target.value || undefined) as TransactionType | undefined,
                )
              }
            >
              <option value="">Todos</option>
              <option value="EXPENSE">Despesas</option>
              <option value="INCOME">Receitas</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-start">De</Label>
            <Input
              id="filter-start"
              type="date"
              value={filters.startDate ?? ""}
              onChange={(e) => updateFilter("startDate", e.target.value || undefined)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-end">Até</Label>
            <Input
              id="filter-end"
              type="date"
              value={filters.endDate ?? ""}
              onChange={(e) => updateFilter("endDate", e.target.value || undefined)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-min">Valor mínimo</Label>
            <Input
              id="filter-min"
              type="number"
              step="0.01"
              min={0}
              value={filters.minAmount ?? ""}
              onChange={(e) =>
                updateFilter(
                  "minAmount",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {list.isError ? (
            <div className="py-8 text-center text-sm text-destructive">
              Não foi possível carregar as transações.
            </div>
          ) : isFirstLoad ? (
            <div className="py-12 flex justify-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhuma transação encontrada.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[88px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDate(t.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{t.description}</span>
                        {t.installments && t.installments > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            {t.currentInstallment ?? 1}/{t.installments}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.category?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.account?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.paymentType ?? "—"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium tabular-nums",
                        t.type === "INCOME" ? "text-emerald-600" : "text-rose-600",
                      )}
                    >
                      {t.type === "INCOME" ? "+" : "−"}
                      {formatCurrency(Number(t.amount))}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(t)}
                          aria-label="Editar"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(t)}
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

      {items.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{showingRange && `Itens ${showingRange}`}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || list.isFetching}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore || list.isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              {list.isFetching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Próxima"
              )}
            </Button>
          </div>
        </div>
      )}

      <TransactionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editing}
      />
    </div>
  )
}
