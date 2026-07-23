"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { Pencil, Trash2, Plus, Search, Users, ClipboardList, Star, Building2 } from "lucide-react"

interface Avaliacao {
  id: number;
  NomeAvaliador: string;
  Estrelas: number;
  Mensagem: string;
  setorId: number;
  colaboradorId: number | null;
  createdAt: string;
  updatedAt: string;
}

// Busca avaliações reais da API

import { useAuth } from "@/components/auth-context"
function AvaliacoesPage() {
  const { token } = useAuth()
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comentarioAberto, setComentarioAberto] = useState<number | null>(null)
  const [pagina, setPagina] = useState(1)
  const porPagina = 10

  useEffect(() => {
    async function fetchAvaliacoes() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/backend/feedbacks?soSetor=true", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!res.ok) throw new Error("Erro ao buscar avalia 7 f5es")
        const data = await res.json()
        setAvaliacoes(Array.isArray(data) ? data : data.data || [])
        setTotal(data.total || (Array.isArray(data) ? data.length : 0))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAvaliacoes()
  }, [token])

  const filteredAvaliacoes = avaliacoes.filter(
    (a) =>
      (a.NomeAvaliador?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (a.Mensagem?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (a.createdAt ?? "").includes(searchTerm)
  )
  const totalPaginas = Math.ceil(filteredAvaliacoes.length / porPagina)
  const avaliacoesPaginadas = filteredAvaliacoes.slice((pagina - 1) * porPagina, pagina * porPagina)


  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Avaliações</h1>
              <p className="text-gray-600">Gerencie avaliações dos colaboradores</p>
            </div>
          </div>

          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card minimalista: Total de Avaliações */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <span className="font-semibold text-sm text-gray-800">Total de Avaliações</span>
                <ClipboardList className="w-5 h-5 text-gray-400" />
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-2xl font-bold text-gray-900">{total}</span>
              </CardContent>
            </Card>
            {/* Card minimalista: Média das notas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <span className="font-semibold text-sm text-gray-800">Média das notas</span>
                <Star className="w-5 h-5 text-[#7C4A3A]" />
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-2xl font-bold text-gray-900">{avaliacoes.length > 0 ? (avaliacoes.reduce((acc, a) => acc + (a.Estrelas || 0), 0) / avaliacoes.length).toFixed(1) : "-"}</span>
              </CardContent>
            </Card>
            {/* Card minimalista: Departamentos avaliados */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <span className="font-semibold text-sm text-gray-800">Departamentos avaliados</span>
                <Building2 className="w-5 h-5 text-[#7C4A3A]" />
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-2xl font-bold text-gray-900">{new Set(avaliacoes.map((a) => a.setorId)).size}</span>
              </CardContent>
            </Card>
          </div>

          {/* Busca */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por colaborador, departamento, data ou observação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de avaliações */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Avaliações</CardTitle>
              <CardDescription>{filteredAvaliacoes.length} avaliação(ões) encontrada(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-gray-500">Carregando avaliações...</div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">{error}</div>
              ) : filteredAvaliacoes.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma avaliação encontrada</h3>
                  <p className="text-gray-600">Tente ajustar sua busca</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {avaliacoesPaginadas.map((avaliacao) => (
                      <div
                        key={avaliacao.id}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{avaliacao.NomeAvaliador}</h3>
                            <span className="text-sm text-gray-500">&bull; {avaliacao.setorId}</span>
                          </div>
                          <p className="text-sm text-gray-600">Data: {new Date(avaliacao.createdAt).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">Nota: <span className="font-bold">{avaliacao.Estrelas}</span></p>
                          {avaliacao.colaboradorId && (
                            <p className="text-sm text-gray-700 mt-1">Colaborador: {avaliacao.colaboradorId}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 text-gray-500 hover:text-[#7C4A3A]"
                          onClick={() => setComentarioAberto(avaliacao.id)}
                          title="Ver comentário"
                        >
                          <ClipboardList className="w-5 h-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {/* Paginação */}
                  {totalPaginas > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={pagina === 1}
                        onClick={() => setPagina((p) => Math.max(1, p - 1))}
                        title="Página anterior"
                      >
                        &#8592;
                      </Button>
                      {Array.from({ length: totalPaginas }, (_, i) => (
                        <Button
                          key={i + 1}
                          variant={pagina === i + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPagina(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={pagina === totalPaginas}
                        onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                        title="Próxima página"
                      >
                        &#8594;
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
      {/* Dialog para mostrar comentário */}
      <Dialog open={comentarioAberto !== null} onOpenChange={() => setComentarioAberto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comentário</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-gray-700 whitespace-pre-line">
              {filteredAvaliacoes.find(a => a.id === comentarioAberto)?.Mensagem}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AvaliacoesPage
