import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginPage() {
  return (
    <div className="min-h-svh flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Entrar no Grain Pay</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Formulário de login será implementado na Etapa 1.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
