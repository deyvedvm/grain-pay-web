import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"
import * as importExportApi from "@/api/import-export"
import type { ImportResult } from "@/types/api"

function extractMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
  }
  return fallback
}

export function useImportCsv() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => importExportApi.importCsv(file),
    onSuccess: (result: ImportResult) => {
      qc.invalidateQueries({ queryKey: ["transactions"] })
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] })
      qc.invalidateQueries({ queryKey: ["accounts"] })
      qc.invalidateQueries({ queryKey: ["reports"] })
      toast.success(
        `Importação concluída: ${result.imported} importada(s), ${result.duplicates} duplicada(s), ${result.failed} falha(s)`,
      )
    },
    onError: (e) => toast.error(extractMessage(e, "Falha ao importar CSV")),
  })
}

export function useExport() {
  const csv = useMutation({
    mutationFn: (month: string) => importExportApi.exportCsv(month),
    onError: (e) => toast.error(extractMessage(e, "Falha ao exportar CSV")),
  })
  const pdf = useMutation({
    mutationFn: (month: string) => importExportApi.exportPdf(month),
    onError: (e) => toast.error(extractMessage(e, "Falha ao exportar PDF")),
  })
  return { csv, pdf }
}
