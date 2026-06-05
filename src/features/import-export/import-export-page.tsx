import { useRef, useState } from "react"
import { Download, FileText, FileUp, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import type { ImportResult } from "@/types/api"
import { useExport, useImportCsv } from "@/features/import-export/use-import-export"

function currentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export function ImportExportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Importar / Exportar</h2>
        <p className="text-sm text-muted-foreground">
          Importe um extrato em CSV ou exporte suas transações do mês.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ImportCard />
        <ExportCard />
      </div>
    </div>
  )
}

function ImportCard() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const importCsv = useImportCsv()

  function handleImport() {
    if (!file) return
    importCsv.mutate(file, {
      onSuccess: (res) => {
        setResult(res)
        setFile(null)
        if (inputRef.current) inputRef.current.value = ""
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Importar extrato CSV</CardTitle>
        <CardDescription>
          Duplicatas são detectadas automaticamente e categorias/contas são
          vinculadas quando possível.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="csv-file">Arquivo CSV</Label>
          <Input
            id="csv-file"
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <Button
          onClick={handleImport}
          disabled={!file || importCsv.isPending}
          className="gap-2"
        >
          {importCsv.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileUp className="size-4" />
          )}
          Importar
        </Button>

        {result && (
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">{result.imported} importada(s)</Badge>
              <Badge variant="secondary">{result.duplicates} duplicada(s)</Badge>
              <Badge variant={result.failed > 0 ? "destructive" : "outline"}>
                {result.failed} falha(s)
              </Badge>
            </div>

            {result.errors.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Linha</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.errors.map((err, i) => (
                    <TableRow key={`${err.line}-${i}`}>
                      <TableCell>{err.line}</TableCell>
                      <TableCell className="text-rose-600">{err.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ExportCard() {
  const [month, setMonth] = useState(currentYearMonth)
  const { csv, pdf } = useExport()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Exportar transações</CardTitle>
        <CardDescription>
          Baixe as transações do mês selecionado em CSV ou PDF.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="export-month">Mês</Label>
          <Input
            id="export-month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-44"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => csv.mutate(month)}
            disabled={csv.isPending}
            className="gap-2"
          >
            {csv.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => pdf.mutate(month)}
            disabled={pdf.isPending}
            className="gap-2"
          >
            {pdf.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileText className="size-4" />
            )}
            Exportar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
