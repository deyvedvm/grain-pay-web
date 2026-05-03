import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getDashboardSummary } from "@/api/dashboard"
import { formatCurrency } from "@/lib/format"
import type { IncomeSource } from "@/types/api"

const incomeSourceLabel: Record<IncomeSource, string> = {
  SALARY: "Salário",
  FREELANCE: "Freelance",
  INVESTMENT: "Investimentos",
  REFUND: "Reembolso",
  OTHER: "Outros",
}

function currentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export function DashboardPage() {
  const [month, setMonth] = useState(currentYearMonth)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-summary", month],
    queryFn: () => getDashboardSummary(month),
  })

  const expensesChartData = useMemo(
    () =>
      (data?.expensesByCategory ?? [])
        .map((item) => ({ name: item.categoryName, total: item.total }))
        .sort((a, b) => b.total - a.total),
    [data],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Visão geral das suas finanças do mês.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="month">Mês</Label>
          <Input
            id="month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      {isError && (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">
            Não foi possível carregar o dashboard.
            {error instanceof Error ? ` (${error.message})` : ""}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Receitas"
          value={data?.totalIncome}
          loading={isLoading}
          tone="positive"
        />
        <SummaryCard
          label="Despesas"
          value={data?.totalExpenses}
          loading={isLoading}
          tone="negative"
        />
        <SummaryCard label="Saldo" value={data?.balance} loading={isLoading} tone="balance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : expensesChartData.length === 0 ? (
              <EmptyState message="Nenhuma despesa registrada neste mês." />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={expensesChartData}
                    margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => formatCurrency(v as number)}
                      fontSize={12}
                    />
                    <YAxis type="category" dataKey="name" width={120} fontSize={12} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                      cursor={{ fill: "var(--muted)" }}
                    />
                    <Bar dataKey="total" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receitas por fonte</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ListSkeleton />
            ) : !data?.incomeBySource.length ? (
              <EmptyState message="Nenhuma receita registrada." />
            ) : (
              <ul className="space-y-3">
                {data.incomeBySource.map((item) => (
                  <li
                    key={item.source}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {incomeSourceLabel[item.source]}
                    </span>
                    <span className="font-medium">{formatCurrency(item.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

type Tone = "positive" | "negative" | "balance"

function SummaryCard({
  label,
  value,
  loading,
  tone,
}: {
  label: string
  value: number | undefined
  loading: boolean
  tone: Tone
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
        ? "text-rose-600"
        : value !== undefined && value < 0
          ? "text-rose-600"
          : "text-foreground"

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <div className={`text-2xl font-semibold ${toneClass}`}>
            {formatCurrency(value ?? 0)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <div className="h-72 flex items-center justify-center text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-5 rounded bg-muted/60 animate-pulse" />
      ))}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-sm text-muted-foreground text-center">{message}</div>
  )
}
