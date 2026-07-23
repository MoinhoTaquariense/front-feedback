"use client"

import { useFilters } from "@/components/filter-context"
import { useResumoAvaliacoes } from "@/hooks/use-resumo-avaliacoes"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export function ResumoAvaliacoesChart() {
  const { filters } = useFilters()
  const { resumo, loading, error } = useResumoAvaliacoes({ periodo: filters.periodo || "", nome: filters.nome })
  if (!filters.periodo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400">Selecione um período para visualizar o gráfico.</div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo das Avaliações</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-gray-400">Carregando...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : resumo.length === 0 ? (
          <div className="text-center text-gray-400">Nenhum dado para o período selecionado.</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resumo} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="quantidadeAvaliacoes" fill="#693019" name="Avaliações" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
