"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardCheck, TrendingUp, Calendar } from "lucide-react"
import { useAvaliacoesSetor } from "@/hooks/use-avaliacoes-setor"
import { useMediaDesempenho } from "@/hooks/use-media-desempenho"
import { useMediaDesempenhoMes } from "@/hooks/use-media-desempenho-mes"
import { useFilters } from "@/components/filter-context"

export function MetricsCards() {
  const { filters } = useFilters()
  const { avaliacoesSetor, loading: loadingAvaliacoes, error: errorAvaliacoes } = useAvaliacoesSetor(filters)
  const { mediaDesempenho, loading: loadingMediaDesempenho, error: errorMediaDesempenho } = useMediaDesempenho(filters)
  const { mediaDesempenhoMes, loading: loadingMediaDesempenhoMes, error: errorMediaDesempenhoMes } = useMediaDesempenhoMes() // SEM filtros - sempre mês atual

  const metrics = [
    {
      title: "Avaliações Concluídas",
      value: avaliacoesSetor,
      change: "Total de avaliações setor",
      icon: ClipboardCheck,
    },
    {
      title: "Média de Desempenho",
      value: mediaDesempenho,
      change: "Média geral do setor",
      icon: TrendingUp,
    },
    {
      title: "Média do Mês Atual",
      value: mediaDesempenhoMes,
      change: "Média geral do mês atual (sem filtros)",
      icon: Calendar,
    },
  ]

  const getLoadingState = (title: string) => {
    if (title === "Avaliações Concluídas") return loadingAvaliacoes
    if (title === "Média de Desempenho") return loadingMediaDesempenho
    if (title === "Média do Mês Atual") return loadingMediaDesempenhoMes
    return false
  }

  const getErrorState = (title: string) => {
    if (title === "Avaliações Concluídas") return errorAvaliacoes
    if (title === "Média de Desempenho") return errorMediaDesempenho
    if (title === "Média do Mês Atual") return errorMediaDesempenhoMes
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => {
        const isLoading = getLoadingState(metric.title)
        const error = getErrorState(metric.title)
        
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-black">{metric.title}</CardTitle>
              <metric.icon className={`w-4 h-4 ${isLoading ? "animate-pulse text-blue-400" : "text-gray-400"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${metric.value === "404" ? "text-red-500" : "text-black"}`}>
                {isLoading ? "..." : metric.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {error ? `Erro: ${error}` : metric.change}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
