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
  useCreateAccount,
  useUpdateAccount,
} from "@/features/accounts/use-accounts"
import type { Account, AccountType, CreateAccountPayload } from "@/types/api"

const ACCOUNT_TYPES: AccountType[] = [
  "CHECKING",
  "SAVINGS",
  "CREDIT_CARD",
  "WALLET",
  "VR",
  "VA",
]

export const accountTypeLabel: Record<AccountType, string> = {
  CHECKING: "Conta corrente",
  SAVINGS: "Poupança",
  CREDIT_CARD: "Cartão de crédito",
  WALLET: "Carteira",
  VR: "VR",
  VA: "VA",
}

const schema = z.object({
  name: z.string().min(1, "Informe o nome"),
  type: z.enum(["CHECKING", "SAVINGS", "CREDIT_CARD", "WALLET", "VR", "VA"]),
  bankName: z.string().optional(),
  balance: z.number().min(0, "Saldo deve ser zero ou positivo"),
})

type FormValues = z.infer<typeof schema>

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: Account
}

function toFormValues(a?: Account): FormValues {
  return {
    name: a?.name ?? "",
    type: a?.type ?? "CHECKING",
    bankName: a?.bankName ?? "",
    balance: a ? Number(a.balance) : 0,
  }
}

function toPayload(v: FormValues): CreateAccountPayload {
  return {
    name: v.name,
    type: v.type,
    bankName: v.bankName || undefined,
    balance: v.balance,
  }
}

export function AccountFormDialog({ open, onOpenChange, account }: Props) {
  const isEdit = Boolean(account)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(account),
  })

  useEffect(() => {
    if (open) form.reset(toFormValues(account))
  }, [open, account, form])

  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = toPayload(values)
    if (isEdit && account) {
      await updateMutation.mutateAsync({ id: account.id, payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar conta" : "Nova conta"}</DialogTitle>
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
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {accountTypeLabel[t]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bankName">Banco (opcional)</Label>
              <Input id="bankName" {...form.register("bankName")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="balance">Saldo</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              min={0}
              {...form.register("balance", { valueAsNumber: true })}
            />
            {form.formState.errors.balance && (
              <p className="text-xs text-destructive">
                {form.formState.errors.balance.message}
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
