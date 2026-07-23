import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResumoAvaliacoesChart } from "@/components/resumo-avaliacoes-chart"
import { BarChart3 } from "lucide-react"

export function PerformanceOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: "#693019" }}>Visão Geral de Desempenho</CardTitle>
        <CardDescription>Análise de múltiplas possibilidades e métricas</CardDescription>
      </CardHeader>
      <CardContent>
        <ResumoAvaliacoesChart />
      </CardContent>
    </Card>
  )
}
