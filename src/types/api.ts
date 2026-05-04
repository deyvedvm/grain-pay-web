export type AuthResponse = {
  token: string
  email: string
  name: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
}

export type TransactionType = "INCOME" | "EXPENSE"

export type PaymentType =
  | "Money"
  | "PIX"
  | "Credit Card"
  | "Debit Card"
  | "VR"
  | "VA"
  | "Bank Transfer"
  | "Boleto"

export type AccountType =
  | "CHECKING"
  | "SAVINGS"
  | "CREDIT_CARD"
  | "WALLET"
  | "VR"
  | "VA"

export type GoalStatus = "ACTIVE" | "COMPLETED" | "ABANDONED"
export type GoalPriority = "LOW" | "MEDIUM" | "HIGH"
export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"

export type Category = {
  id: number
  name: string
  type: TransactionType
  icon?: string
  color?: string
  createdAt?: string
}

export type Account = {
  id: number
  name: string
  type: AccountType
  bankName?: string
  balance: number
  createdAt?: string
}

export type Transaction = {
  id: number
  type: TransactionType
  amount: number
  date: string
  description: string
  paymentType?: PaymentType
  category?: Category
  account?: Account
  notes?: string
  tags?: string[]
  userId?: number
  installments?: number
  currentInstallment?: number
  isRecurring?: boolean
  source?: IncomeSource
  createdAt?: string
  updatedAt?: string
}

export type CreateCategoryPayload = {
  name: string
  type: TransactionType
  icon?: string
  color?: string
}

export type CreateAccountPayload = {
  name: string
  type: AccountType
  bankName?: string
  balance: number
}

export type CreateTransactionPayload = {
  type: TransactionType
  amount: number
  date: string
  description: string
  paymentType?: PaymentType
  categoryId?: number | null
  accountId?: number | null
  notes?: string
  tags?: string[]
  installments?: number | null
  currentInstallment?: number | null
  isRecurring?: boolean
  source?: IncomeSource | null
}

export type TransactionFilters = {
  type?: TransactionType
  startDate?: string
  endDate?: string
  categoryId?: number
  paymentType?: PaymentType
  minAmount?: number
  maxAmount?: number
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

export type IncomeSource =
  | "SALARY"
  | "FREELANCE"
  | "INVESTMENT"
  | "REFUND"
  | "OTHER"

export type CategorySummary = {
  categoryName: string
  total: number
}

export type SourceSummary = {
  source: IncomeSource
  total: number
}

export type DashboardSummary = {
  totalIncome: number
  totalExpenses: number
  balance: number
  expensesByCategory: CategorySummary[]
  incomeBySource: SourceSummary[]
}

export type ApiEnvelope<T> = {
  data: T
  status: number
  message: string
}

export type Page<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
