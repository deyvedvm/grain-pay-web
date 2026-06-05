import { api } from "@/api/client"
import type { ApiEnvelope, ImportResult } from "@/types/api"

export async function importCsv(file: File): Promise<ImportResult> {
  const form = new FormData()
  form.append("file", file)
  const { data } = await api.post<ApiEnvelope<ImportResult>>("/api/import", form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data.data
}

async function downloadBlob(path: string, month: string, filename: string) {
  const response = await api.get(path, {
    params: { month },
    responseType: "blob",
  })
  const url = URL.createObjectURL(response.data as Blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function exportCsv(month: string) {
  return downloadBlob("/api/export/csv", month, `transactions-${month}.csv`)
}

export function exportPdf(month: string) {
  return downloadBlob("/api/export/pdf", month, `transactions-${month}.pdf`)
}
