import { useState } from "react"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
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
import { formatCurrency } from "@/lib/format"
import {
  useAccountsList,
  useDeleteAccount,
} from "@/features/accounts/use-accounts"
import {
  AccountFormDialog,
  accountTypeLabel,
} from "@/features/accounts/account-form-dialog"
import type { Account } from "@/types/api"

export function AccountsPage() {
  const [editing, setEditing] = useState<Account | undefined>()
  const [dialogOpen, setDialogOpen] = useState(false)

  const list = useAccountsList()
  const remove = useDeleteAccount()
  const items = list.data ?? []

  const openCreate = () => {
    setEditing(undefined)
    setDialogOpen(true)
  }

  const openEdit = (a: Account) => {
    setEditing(a)
    setDialogOpen(true)
  }

  const handleDelete = (a: Account) => {
    if (window.confirm(`Excluir a conta "${a.name}"?`)) remove.mutate(a.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Contas</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie suas contas bancárias e cartões.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          Nova conta
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {list.isError ? (
            <div className="py-8 text-center text-sm text-destructive">
              Não foi possível carregar as contas.
            </div>
          ) : list.isLoading ? (
            <div className="py-12 flex justify-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhuma conta cadastrada.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="w-[88px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {accountTypeLabel[a.type]}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.bankName ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(Number(a.balance))}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(a)}
                          aria-label="Editar"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(a)}
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

      <AccountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={editing}
      />
    </div>
  )
}
