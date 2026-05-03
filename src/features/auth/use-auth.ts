import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"
import * as authApi from "@/api/auth"
import { useAuthStore } from "@/store/auth-store"
import type { AuthResponse } from "@/types/api"

function persistSession(data: AuthResponse) {
  useAuthStore.getState().login(data.token, { name: data.name, email: data.email })
}

function extractMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
    if (error.response?.status === 401) return "E-mail ou senha incorretos"
    if (error.response?.status === 409) return "E-mail já cadastrado"
  }
  return fallback
}

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      persistSession(data)
      toast.success(`Bem-vindo, ${data.name}!`)
    },
    onError: (error) => {
      toast.error(extractMessage(error, "Não foi possível entrar"))
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      persistSession(data)
      toast.success(`Conta criada. Bem-vindo, ${data.name}!`)
    },
    onError: (error) => {
      toast.error(extractMessage(error, "Não foi possível criar a conta"))
    },
  })
}
