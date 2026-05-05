import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"
import * as goalsApi from "@/api/goals"
import type { CreateGoalPayload, UpdateGoalPayload } from "@/types/api"

export const goalsKeys = {
  all: ["goals"] as const,
}

function extractMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
  }
  return fallback
}

export function useGoalsList() {
  return useQuery({
    queryKey: goalsKeys.all,
    queryFn: goalsApi.listGoals,
  })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateGoalPayload) => goalsApi.createGoal(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: goalsKeys.all })
      toast.success("Meta criada")
    },
    onError: (e) => toast.error(extractMessage(e, "Falha ao criar meta")),
  })
}

export function useUpdateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateGoalPayload }) =>
      goalsApi.updateGoal(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: goalsKeys.all })
      toast.success("Meta atualizada")
    },
    onError: (e) => toast.error(extractMessage(e, "Falha ao atualizar meta")),
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => goalsApi.deleteGoal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: goalsKeys.all })
      toast.success("Meta excluída")
    },
    onError: (e) => toast.error(extractMessage(e, "Falha ao excluir meta")),
  })
}
