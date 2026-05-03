import { api } from "@/api/client"
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/api"

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload)
  return data
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload)
  return data
}
