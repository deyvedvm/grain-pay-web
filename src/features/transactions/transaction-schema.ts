import { z } from "zod"

export const PAYMENT_TYPES = [
  "Money",
  "PIX",
  "Credit Card",
  "Debit Card",
  "VR",
  "VA",
  "Bank Transfer",
  "Boleto",
] as const

export const INCOME_SOURCES = [
  "SALARY",
  "FREELANCE",
  "INVESTMENT",
  "REFUND",
  "OTHER",
] as const

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.number().positive("O valor deve ser maior que zero"),
    date: z.string().min(1, "Informe a data"),
    description: z.string().min(1, "Informe a descrição"),
    paymentType: z.enum(PAYMENT_TYPES).optional(),
    categoryId: z.string().optional(),
    accountId: z.string().optional(),
    notes: z.string().optional(),
    installments: z.number().int().min(1).max(360).optional(),
    source: z.enum(INCOME_SOURCES).optional(),
  })
  .refine((v) => v.type !== "EXPENSE" || !!v.paymentType, {
    message: "Selecione a forma de pagamento",
    path: ["paymentType"],
  })

export type TransactionFormValues = z.infer<typeof transactionSchema>
