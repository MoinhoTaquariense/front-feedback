"use client"

import { useState, useEffect } from "react"
import { fetchNotaSetorAno } from "@/lib/nota-setor-ano"
import { useAuth } from "@/components/auth-context"

function useNotaSetorAno(token: string) {
  const [grafico, setGrafico] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!token) return;
    fetchNotaSetorAno(token)
      .then((data) => {
        setGrafico(
          data.map((v, i) => ({
            name: new Date(new Date().setMonth(new Date().getMonth() - (11 - i))).toLocaleString("default", { month: "short" }),
            value: Number(Number.parseFloat(v).toFixed(2)),
          }))
        );
      })
      .catch(() => setError("Erro ao buscar gráfico anual do setor"))
      .finally(() => setLoading(false));
  }, [token]);
  return { grafico, loading, error };
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { fetchNotaGeralDiaria } from "@/lib/nota-geral-dia"
import { fetchNotaGeralSemanal } from "@/lib/nota-geral-semana"
import { fetchNotaGeralMensal } from "@/lib/nota-geral-mes"

function useNotaGeralDiaria(token: string) {
  const [nota, setNota] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!token) return;
    fetchNotaGeralDiaria(token)
      .then((data) => {
        if (typeof data === "number") setNota(data);
        else if (typeof data === "object" && data !== null && typeof data.nota === "number") setNota(data.nota);
        else setError("Formato de resposta inesperado");
      })
      .catch(() => setError("Erro ao buscar nota geral diária"))
      .finally(() => setLoading(false));
  }, [token]);
  return { nota, loading, error };
}

function useNotaGeralSemanal(token: string) {
  const [nota, setNota] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grafico, setGrafico] = useState<{ name: string; value: number }[]>([]);
  useEffect(() => {
    if (!token) return;
    fetchNotaGeralSemanal(token)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNota(data[data.length - 1]);
          setGrafico(
            data.map((v, i) => ({ name: `Sem ${i + 1}`, value: Number(Number.parseFloat(v).toFixed(2)) }))
          );
        } else if (typeof data === "object" && data !== null && typeof data.nota === "number") {
          setNota(data.nota);
          setGrafico([{ name: "Sem 1", value: data.nota }]);
        } else setError("Formato de resposta inesperado");
      })
      .catch(() => setError("Erro ao buscar nota geral semanal"))
      .finally(() => setLoading(false));
  }, [token]);
  return { nota, loading, error, grafico };
}

function useNotaGeralMensal(token: string) {
  const [nota, setNota] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grafico, setGrafico] = useState<{ name: string; value: number }[]>([]);
  useEffect(() => {
    if (!token) return;
    fetchNotaGeralMensal(token)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNota(data[data.length - 1]);
          setGrafico(
            data.map((v, i) => ({ name: `Mês ${i + 1}`, value: Number(Number.parseFloat(v).toFixed(2)) }))
          );
        } else if (typeof data === "object" && data !== null && typeof data.nota === "number") {
          setNota(data.nota);
          setGrafico([{ name: "Mês 1", value: Number(Number.parseFloat(data.nota).toFixed(2)) }]);
        } else setError("Formato de resposta inesperado");
      })
      .catch(() => setError("Erro ao buscar nota geral mensal"))
      .finally(() => setLoading(false));
  }, [token]);
  return { nota, loading, error, grafico };
}
import { fetchNotaSetorDiaria } from "@/lib/nota-setor-dia"
import { fetchNotaSetorSemanal } from "@/lib/nota-setor-semana"
import { fetchNotaSetorMensal } from "@/lib/nota-setor-mes"
function useNotaSetorDiaria(token: string) {
  const [nota, setNota] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grafico, setGrafico] = useState<{ name: string; value: number }[]>([]);
  useEffect(() => {
    if (!token) return;
    fetchNotaSetorDiaria(token)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNota(data[data.length - 1]);
          setGrafico(
            data.map((v, i) => ({ name: `Dia ${i + 1}`, value: Number(Number.parseFloat(v).toFixed(2)) }))
          );
        } else if (typeof data === "number") {
          setNota(data);
          setGrafico([{ name: "Dia 1", value: Number(data.toFixed(2)) }]);
        } else if (typeof data === "object" && data !== null && typeof data.nota === "number") {
          setNota(data.nota);
          setGrafico([{ name: "Dia 1", value: Number(Number.parseFloat(data.nota).toFixed(2)) }]);
        } else setError("Formato de resposta inesperado");
      })
      .catch(() => setError("Erro ao buscar nota diária por setor"))
      .finally(() => setLoading(false));
  }, [token]);
  return { nota, loading, error, grafico };
}

function useNotaSetorSemanal(token: string) {
  const [nota, setNota] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grafico, setGrafico] = useState<{ name: string; value: number }[]>([]);
  useEffect(() => {
    if (!token) return;
    fetchNotaSetorSemanal(token)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNota(data[data.length - 1]);
          setGrafico(
            data.map((v, i) => ({ name: `Sem ${i + 1}`, value: Number(Number.parseFloat(v).toFixed(2)) }))
          );
        } else if (typeof data === "object" && data !== null && typeof data.nota === "number") {
          setNota(data.nota);
          setGrafico([{ name: "Sem 1", value: Number(Number.parseFloat(data.nota).toFixed(2)) }]);
        } else setError("Formato de resposta inesperado");
      })
      .catch(() => setError("Erro ao buscar nota semanal por setor"))
      .finally(() => setLoading(false));
  }, [token]);
  return { nota, loading, error, grafico };
}

function useNotaSetorMensal(token: string) {
  const [nota, setNota] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grafico, setGrafico] = useState<{ name: string; value: number }[]>([]);
  useEffect(() => {
    if (!token) return;
    fetchNotaSetorMensal(token)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNota(data[data.length - 1]);
          setGrafico(
            data.map((v, i) => ({ name: `Mês ${i + 1}`, value: Number(Number.parseFloat(v).toFixed(2)) }))
          );
        } else if (typeof data === "object" && data !== null && typeof data.nota === "number") {
          setNota(data.nota);
          setGrafico([{ name: "Mês 1", value: Number(Number.parseFloat(data.nota).toFixed(2)) }]);
        } else setError("Formato de resposta inesperado");
      })
      .catch(() => setError("Erro ao buscar nota mensal por setor"))
      .finally(() => setLoading(false));
  }, [token]);
  return { nota, loading, error, grafico };
}

// Dados fictícios com variação para os gráficos
const dailyData = [
  { name: "Seg", value: 4.2 },
  { name: "Ter", value: 4.5 },
  { name: "Qua", value: 4.1 },
  { name: "Qui", value: 4.7 },
  { name: "Sex", value: 4.6 },
  { name: "Sáb", value: 4.3 },
  { name: "Dom", value: 4.4 },
];

const weeklyData = [
  { name: "Sem 1", value: 4.3 },
  { name: "Sem 2", value: 4.5 },
  { name: "Sem 3", value: 4.1 },
  { name: "Sem 4", value: 4.6 },
  { name: "Sem 5", value: 4.4 },
];

const monthlyData = [
  { name: "Jan", value: 4.2 },
  { name: "Fev", value: 4.4 },
  { name: "Mar", value: 4.1 },
  { name: "Abr", value: 4.5 },
  { name: "Mai", value: 4.6 },
  { name: "Jun", value: 4.7 },
  { name: "Jul", value: 4.3 },
  { name: "Ago", value: 4.5 },
  { name: "Set", value: 4.4 },
  { name: "Out", value: 4.6 },
  { name: "Nov", value: 4.2 },
  { name: "Dez", value: 4.8 },
];

export default function EstatisticasPage() {
  const { token } = useAuth()
  const safeToken = token || ""
  const { nota: notaDiaria, loading: loadingDiaria, error: errorDiaria } = useNotaGeralDiaria(safeToken);
  const { nota: notaSemanal, loading: loadingSemanal, error: errorSemanal, grafico: graficoSemanal } = useNotaGeralSemanal(safeToken);
  const { nota: notaMensal, loading: loadingMensal, error: errorMensal, grafico: graficoMensal } = useNotaGeralMensal(safeToken);
  const { nota: notaSetorDiaria, loading: loadingSetorDiaria, error: errorSetorDiaria, grafico: graficoSetorDiaria } = useNotaSetorDiaria(safeToken);
  const { nota: notaSetorSemanal, loading: loadingSetorSemanal, error: errorSetorSemanal, grafico: graficoSetorSemanal } = useNotaSetorSemanal(safeToken);
  const { nota: notaSetorMensal, loading: loadingSetorMensal, error: errorSetorMensal, grafico: graficoSetorMensal } = useNotaSetorMensal(safeToken);
  const { grafico: graficoSetorAno, loading: loadingSetorAno, error: errorSetorAno } = useNotaSetorAno(safeToken);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Estatísticas</h1>
            <p className="text-gray-600">Análise de desempenho e métricas da equipe</p>
          </div>

          {/* Top Metrics removidos conforme solicitado */}

          {/* Estatísticas Gerais */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Estatísticas Gerais</h2>
            <p className="text-gray-600 mb-6">Nota Geral - Diária, Semanal e Mensal</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nota Geral Diária</CardTitle>
                  <CardDescription>Média das últimas 24 horas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#7C4A3A] mb-4">
                    {loadingDiaria ? "..." : errorDiaria ? "Erro" : notaDiaria?.toFixed(2)}
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={dailyData}>
                      <Line type="monotone" dataKey="value" stroke="#7C4A3A" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nota Geral Semanal</CardTitle>
                  <CardDescription>Últimas 4 semanas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#7C4A3A] mb-4">
                    {loadingSemanal ? "..." : errorSemanal ? "Erro" : (notaSemanal !== null ? notaSemanal.toFixed(2) : "-")}
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={graficoSemanal.length > 0 ? graficoSemanal : weeklyData}>
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#7C4A3A" strokeWidth={2} dot={{ fill: "#7C4A3A" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nota Geral Mensal</CardTitle>
                  <CardDescription>Últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#7C4A3A] mb-4">
                    {loadingMensal ? "..." : errorMensal ? "Erro" : (notaMensal !== null ? notaMensal.toFixed(2) : "-")}
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={graficoMensal.length > 0 ? graficoMensal : monthlyData}>
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#7C4A3A" strokeWidth={2} dot={{ fill: "#7C4A3A" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Estatísticas do Setor */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Estatísticas do Setor</h2>
            <p className="text-gray-600 mb-6">Nota por Departamento - Diária, Semanal e Mensal</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nota Diária</CardTitle>
                  <CardDescription>Por setor - últimas 24h</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#7C4A3A] mb-4">
                    {loadingSetorDiaria ? "..." : errorSetorDiaria ? "Erro" : (notaSetorDiaria !== null ? notaSetorDiaria.toFixed(2) : "-")}
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={(() => {
                      const data = graficoSetorDiaria.length > 0 ? graficoSetorDiaria : dailyData;
                      // Se só tem um ponto, cria pontos fictícios para formar uma curva
                      if (data.length === 1) {
                        const v = data[0].value;
                        return [
                          { name: "", value: v - 0.1 },
                          data[0],
                          { name: "", value: v + 0.1 },
                        ];
                      }
                      return data;
                    })()}>
                      <Line type="monotone" dataKey="value" stroke="#7C4A3A" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nota Semanal</CardTitle>
                  <CardDescription>Por setor - últimas 4 semanas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#7C4A3A] mb-4">
                    {loadingSetorSemanal ? "..." : errorSetorSemanal ? "Erro" : (notaSetorSemanal !== null ? notaSetorSemanal.toFixed(2) : "-")}
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={graficoSetorSemanal.length > 0 ? graficoSetorSemanal : weeklyData}>
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#7C4A3A" strokeWidth={2} dot={{ fill: "#7C4A3A" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nota Mensal</CardTitle>
                  <CardDescription>Evolução mensal por setor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#7C4A3A] mb-4">
                    {loadingSetorMensal ? "..." : errorSetorMensal ? "Erro" : (notaSetorMensal !== null ? notaSetorMensal.toFixed(2) : "-")}
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={graficoSetorMensal.length > 0 ? graficoSetorMensal : monthlyData}>
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#7C4A3A" strokeWidth={2} dot={{ fill: "#7C4A3A" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Large Chart - Setor Ano */}
          <Card>
            <CardHeader>
              <CardTitle>Gráfico de Evolução Anual</CardTitle>
              <CardDescription>Comparativo de desempenho mensal do setor</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={graficoSetorAno}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" domain={[4.0, 5.0]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#7C4A3A" strokeWidth={3} dot={{ fill: "#7C4A3A" }} />
                </LineChart>
              </ResponsiveContainer>
              {loadingSetorAno && <div>Carregando gráfico anual...</div>}
              {errorSetorAno && <div className="text-red-500">{errorSetorAno}</div>}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
