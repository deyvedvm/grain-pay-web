export type TransactionType = "INCOME" | "EXPENSE"

export type PaymentType =
  | "PIX"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "MONEY"
  | "VR"
  | "VA"
  | "BANK_TRANSFER"
  | "BOLETO"

export type GoalStatus = "ACTIVE" | "COMPLETED" | "ABANDONED"
export type GoalPriority = "LOW" | "MEDIUM" | "HIGH"
export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"

export type Category = {
  id: number
  name: string
  color?: string
}

export type Account = {
  id: number
  name: string
  type?: string
  initialBalance?: number
}

export type Transaction = {
  id: number
  type: TransactionType
  amount: number
  date: string
  description: string
  paymentType: PaymentType
  categoryId: number
  accountId?: number
  installments?: number
}

export type Budget = {
  id: number
  categoryId: number
  categoryName?: string
  limitAmount: number
  spent: number
  percentage: number
  alert: boolean
  month: number
  year: number
}

export type Goal = {
  id: number
  name: string
  targetAmount: number
  currentAmount: number
  progress: number
  status: GoalStatus
  priority: GoalPriority
  deadline?: string
}

export type DashboardSummary = {
  month: string
  totalIncome: number
  totalExpense: number
  balance: number
  byCategory: { categoryId: number; categoryName: string; total: number }[]
}

export type Page<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
