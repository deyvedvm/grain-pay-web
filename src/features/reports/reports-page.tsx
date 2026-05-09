import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  useCategoryReport,
  useMonthlyReport,
  useYearlyReport,
} from "@/features/reports/use-reports"

type Tab = "monthly" | "yearly" | "by-category"

const monthLabels = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
]

function currentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export function ReportsPage() {
  const [tab, setTab] = useState<Tab>("monthly")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Relatórios</h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe receitas, despesas e saldo em diferentes recortes.
        </p>
      </div>

      <div className="flex gap-2 border-b">
        <TabButton active={tab === "monthly"} onClick={() => setTab("monthly")}>
          Mensal
        </TabButton>
        <TabButton active={tab === "yearly"} onClick={() => setTab("yearly")}>
          Anual
        </TabButton>
        <TabButton
          active={tab === "by-category"}
          onClick={() => setTab("by-category")}
        >
          Por categoria
        </TabButton>
      </div>

      {tab === "monthly" && <MonthlyReport />}
      {tab === "yearly" && <YearlyReport />}
      {tab === "by-category" && <CategoryReport />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

function MonthlyReport() {
  const [year, setYear] = useState(() => new Date().getFullYear())
  const { data, isLoading, isError } = useMonthlyReport(year)

  const chartData = useMemo(
    () =>
      (data ?? []).map((item) => ({
        name: monthLabels[item.month - 1],
        receitas: item.totalIncome,
        despesas: item.totalExpenses,
      })),
    [data],
  )

  const totals = useMemo(() => {
    if (!data) return { income: 0, expenses: 0, balance: 0 }
    return data.reduce(
      (acc, item) => ({
        income: acc.income + Number(item.totalIncome),
        expenses: acc.expenses + Number(item.totalExpenses),
        balance: acc.balance + Number(item.balance),
      }),
      { income: 0, expenses: 0, balance: 0 },
    )
  }, [data])

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="year">Ano</Label>
          <Input
            id="year"
            type="number"
            min={2000}
            max={2100}
            value={year}
            onChange={(e) => setYear(Number(e.target.value) || year)}
            className="w-28"
          />
        </div>
      </div>

      {isError && <ErrorCard message="Não foi possível carregar o relatório mensal." />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TotalCard label="Receitas (ano)" value={totals.income} tone="positive" />
        <TotalCard label="Despesas (ano)" value={totals.expenses} tone="negative" />
        <TotalCard label="Saldo (ano)" value={totals.balance} tone="balance" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receitas vs despesas por mês</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v as number)}
                    fontSize={12}
                    width={90}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                    cursor={{ fill: "var(--muted)" }}
                  />
                  <Legend />
                  <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhamento mensal</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ListSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês</TableHead>
                  <TableHead className="text-right">Receitas</TableHead>
                  <TableHead className="text-right">Despesas</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((item) => (
                  <TableRow key={item.month}>
                    <TableCell>{monthLabels[item.month - 1]}</TableCell>
                    <TableCell className="text-right text-emerald-600">
                      {formatCurrency(item.totalIncome)}
                    </TableCell>
                    <TableCell className="text-right text-rose-600">
                      {formatCurrency(item.totalExpenses)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        Number(item.balance) < 0 && "text-rose-600",
                      )}
                    >
                      {formatCurrency(item.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function YearlyReport() {
  const { data, isLoading, isError } = useYearlyReport()

  const chartData = useMemo(
    () =>
      (data ?? []).map((item) => ({
        name: String(item.year),
        receitas: item.totalIncome,
        despesas: item.totalExpenses,
      })),
    [data],
  )

  return (
    <div className="space-y-4">
      {isError && <ErrorCard message="Não foi possível carregar o relatório anual." />}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparativo anual</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ChartSkeleton />
          ) : chartData.length === 0 ? (
            <EmptyState message="Nenhum dado disponível." />
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v as number)}
                    fontSize={12}
                    width={90}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhamento por ano</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ListSkeleton />
          ) : !data?.length ? (
            <EmptyState message="Nenhum dado disponível." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ano</TableHead>
                  <TableHead className="text-right">Receitas</TableHead>
                  <TableHead className="text-right">Despesas</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.year}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell className="text-right text-emerald-600">
                      {formatCurrency(item.totalIncome)}
                    </TableCell>
                    <TableCell className="text-right text-rose-600">
                      {formatCurrency(item.totalExpenses)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        Number(item.balance) < 0 && "text-rose-600",
                      )}
                    >
                      {formatCurrency(item.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CategoryReport() {
  const [month, setMonth] = useState(currentYearMonth)
  const { data, isLoading, isError } = useCategoryReport(month)

  const chartData = useMemo(
    () =>
      (data ?? [])
        .map((item) => ({
          name: item.categoryName,
          receitas: Number(item.totalIncome),
          despesas: Number(item.totalExpenses),
        }))
        .sort((a, b) => b.despesas + b.receitas - (a.despesas + a.receitas)),
    [data],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="month-cat">Mês</Label>
          <Input
            id="month-cat"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      {isError && <ErrorCard message="Não foi possível carregar o relatório por categoria." />}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receitas e despesas por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ChartSkeleton />
          ) : chartData.length === 0 ? (
            <EmptyState message="Nenhum dado neste mês." />
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatCurrency(v as number)}
                    fontSize={12}
                  />
                  <YAxis type="category" dataKey="name" width={140} fontSize={12} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="receitas" fill="#10b981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="despesas" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhamento por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ListSkeleton />
          ) : !data?.length ? (
            <EmptyState message="Nenhum dado neste mês." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Receitas</TableHead>
                  <TableHead className="text-right">Despesas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.categoryName}>
                    <TableCell>{item.categoryName}</TableCell>
                    <TableCell className="text-right text-emerald-600">
                      {formatCurrency(item.totalIncome)}
                    </TableCell>
                    <TableCell className="text-right text-rose-600">
                      {formatCurrency(item.totalExpenses)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

type Tone = "positive" | "negative" | "balance"

function TotalCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: Tone
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
        ? "text-rose-600"
        : value < 0
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
        <div className={cn("text-2xl font-semibold", toneClass)}>
          {formatCurrency(value)}
        </div>
      </CardContent>
    </Card>
  )
}

function ErrorCard({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-6 text-sm text-destructive">{message}</CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <div className="h-80 flex items-center justify-center text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
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
