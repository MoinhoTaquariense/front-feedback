// Removido bloco markdown
"use client"

import { useState, useEffect as useEffectReact } from "react"
import { Button } from "@/components/ui/button"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Search, Users, UserCheck, User, Building2, Link } from "lucide-react"

interface Colaborador {
  id: string
  nome: string
  email: string
  cargo: string
  status: "Ativo" | "Inativo"
  avatar?: string
}


import { useEffect } from "react"
import { useAuth } from "@/components/auth-context"

function useColaboradoresApi(token: string) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError("Token de autenticação não encontrado.")
      setColaboradores([])
      return
    }
    let cancelled = false
    async function fetchColaboradores() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/colaboradores", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Erro ao buscar colaboradores")
        const data = await res.json()
        // Garante que colaboradores seja sempre um array
        const colaboradoresArray = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
        // Mapeia os campos da API para o formato Colaborador
        const mapped = colaboradoresArray.map((item: any) => ({
          id: String(item.id),
          nome: item.nomecompleto ?? "",
          email: item.email ?? "",
          cargo: item.cargo ?? "",
          // departamento removido
          status: "Ativo", // ou "Inativo" se houver campo
          avatar: undefined,
        }))
        if (!cancelled) setColaboradores(mapped)
      } catch (err: any) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchColaboradores()
    return () => { cancelled = true }
  }, [token])

  return { colaboradores, loading, error }
}

function ColaboradoresPage() {
  const { token } = useAuth()
  const { colaboradores, loading, error } = useColaboradoresApi(token || "")
  const [localColaboradores, setLocalColaboradores] = useState<Colaborador[] | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null)
  const [editMode, setEditMode] = useState(false)

  const [formData, setFormData] = useState<{
    nome: string
    email: string
    cargo: string
    numeroidentificacao: string
  }>({
    nome: "",
    email: "",
    cargo: "",
    numeroidentificacao: "",
  })

  // Usa localColaboradores se houver, senão usa do hook
  const colaboradoresToShow = localColaboradores ?? colaboradores
  const filteredColaboradores = colaboradoresToShow.filter(
    (col) =>
      (col.nome ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (col.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (col.cargo ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = async () => {
    try {
      // Verifica se o token existe
      if (!token) {
        alert("Erro: Usuário não autenticado. Faça login novamente.")
        return
      }
      
      // Validações básicas antes de enviar
      if (!formData.numeroidentificacao.trim()) {
        alert("Número de identificação é obrigatório")
        return
      }
      if (!formData.nome.trim()) {
        alert("Nome completo é obrigatório")
        return
      }
      if (!formData.email.trim()) {
        alert("Email é obrigatório")
        return
      }
      
      // Validação de email básica
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        alert("Email deve ter um formato válido")
        return
      }
      
      // Monta payload conforme API
      const payload = {
        numeroidentificacao: formData.numeroidentificacao.trim(),
        nomecompleto: formData.nome.trim(),
        email: formData.email.trim(),
        cargo: formData.cargo.trim() || undefined, // Se vazio, não envia
      }
      
      console.log("Enviando dados para criar colaborador:", payload)
      console.log("Token:", token ? "Presente" : "Ausente")
      
      const res = await fetch("/api/colaboradores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      
      const apiResult = await res.json();
      console.log("Resposta da API:", apiResult)
      
      if (res.ok && apiResult && apiResult.success && apiResult.data) {
        setLocalColaboradores((prev) => {
          const base = prev ?? colaboradores;
          const novo: Colaborador = {
            id: String(apiResult.data.id ?? payload.numeroidentificacao),
            nome: apiResult.data.nomecompleto,
            email: apiResult.data.email,
            cargo: apiResult.data.cargo,
            status: "Ativo",
            avatar: undefined,
          };
          return [...base, novo];
        });
        setIsCreateDialogOpen(false);
        resetForm();
        alert("Colaborador criado com sucesso!");
      } else {
        console.error("Erro na resposta da API:", apiResult)
        alert(apiResult?.message || `Erro ao criar colaborador: ${res.status} - ${res.statusText}`);
      }
    } catch (err) {
      console.error("Erro na requisição:", err)
      alert(`Erro ao criar colaborador: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  }

  const handleEdit = async () => {
    if (selectedColaborador) {
      try {
        // Monta payload conforme API
        const payload = {
          numeroidentificacao: formData.numeroidentificacao,
          nomecompleto: formData.nome,
          email: formData.email,
          cargo: formData.cargo,
        }
        await fetch(`/api/colaboradores/${selectedColaborador.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        })
        // Atualiza localmente para refletir imediatamente
        setLocalColaboradores((prev) => {
          const base = prev ?? colaboradores
          return base.map((col) =>
            col.id === selectedColaborador.id
              ? { ...col, nome: formData.nome, email: formData.email, cargo: formData.cargo }
              : col
          )
        })
      } catch (err) {
        // Pode exibir erro se quiser
      }
      setIsCreateDialogOpen(false)
      setSelectedColaborador(null)
      resetForm()
      setEditMode(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/colaboradores/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      // Remove localmente para sumir imediatamente
      setLocalColaboradores((prev) => {
        const base = prev ?? colaboradores
        return base.filter((col) => col.id !== id)
      })
    } catch (err) {
      // Pode exibir erro se quiser
    }
    setSelectedColaborador(null)
  }

  const handleGenerateLink = async (colaboradorId: string) => {
    try {
      const response = await fetch('/api/tokens/gerar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          colaboradorId: colaboradorId
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ao gerar token: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      if (data && data.link) {
        // Tenta copiar o link para a área de transferência
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(data.link)
            alert('Link copiado para a área de transferência!')
          } else {
            // Fallback: mostra o link para o usuário copiar manualmente
            const textArea = document.createElement('textarea')
            textArea.value = data.link
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            
            try {
              const successful = document.execCommand('copy')
              if (successful) {
                alert('Link copiado para a área de transferência!')
              } else {
                throw new Error('execCommand falhou')
              }
            } catch (err) {
              // Se tudo falhar, apenas mostra o link
              alert(`Copie o link abaixo:\n\n${data.link}`)
            } finally {
              document.body.removeChild(textArea)
            }
          }
        } catch (clipboardError) {
          // Fallback final: apenas mostra o link
          alert(`Copie o link abaixo:\n\n${data.link}`)
        }
      } else {
        alert('Erro: Link não retornado pelo servidor')
      }
    } catch (error) {
      alert(`Erro ao gerar link: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }
  // Sempre que colaboradores do hook mudarem, reseta localColaboradores
  useEffectReact(() => {
    setLocalColaboradores(null)
  }, [colaboradores])

  const openEditDialog = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador)
    setFormData({
      nome: colaborador.nome,
      email: colaborador.email,
      cargo: colaborador.cargo,
  // departamento removido
      numeroidentificacao: colaborador.id,
    })
    setIsCreateDialogOpen(true)
    setEditMode(true)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
    setEditMode(false)
    setSelectedColaborador(null)
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      cargo: "",
  // departamento removido
      numeroidentificacao: "",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Colaboradores</h1>
              <p className="text-gray-600">Gerencie sua equipe e colaboradores</p>
            </div>
            <Button onClick={openCreateDialog} className="bg-[#7C4A3A] hover:bg-[#6A3F30] text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> Adicionar Colaborador
            </Button>
          </div>

          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Card minimalista: Total de Colaboradores */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="font-semibold text-sm text-gray-800">Total de Colaboradores</span>
                <User className="w-4 h-4 text-gray-400" />
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-xl font-bold text-gray-900">{colaboradores.length}</span>
              </CardContent>
            </Card>
            {/* Card: Departamentos removido */}
          </div>

          {/* Busca */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por nome, email ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de colaboradores */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Colaboradores</CardTitle>
              <CardDescription>{filteredColaboradores.length} colaborador(es) encontrado(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-gray-500">Carregando colaboradores...</div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">{error}</div>
              ) : (
                <div className="space-y-4">
                  {filteredColaboradores.map((colaborador) => (
                    <div
                      key={colaborador.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={colaborador.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-[#7C4A3A] text-white">
                            {(colaborador.nome ?? "").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{colaborador.nome}</h3>
                          </div>
                          <p className="text-sm text-gray-600">{colaborador.cargo}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-gray-500">{colaborador.email}</p>
                            <span className="text-gray-300">•</span>
                            {/* departamento removido */}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleGenerateLink(colaborador.id)}
                          className="hover:bg-blue-600 hover:text-white hover:border-blue-600"
                          title="Gerar link de avaliação"
                        >
                          <Link className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(colaborador)}
                          className="hover:bg-[#7C4A3A] hover:text-white hover:border-[#7C4A3A]"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="hover:bg-red-600 hover:text-white hover:border-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Colaborador</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este colaborador?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(colaborador.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  {filteredColaboradores.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum colaborador encontrado</h3>
                      <p className="text-gray-600">Tente ajustar sua busca ou adicione um novo colaborador</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dialog de criar/editar colaborador */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editMode ? "Editar Colaborador" : "Adicionar Colaborador"}</DialogTitle>
                <DialogDescription>
                  {editMode ? "Altere os dados do colaborador." : "Preencha os dados do novo colaborador."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="numeroidentificacao">Número de Identificação</Label>
                  <Input id="numeroidentificacao" value={formData.numeroidentificacao} onChange={e => setFormData({ ...formData, numeroidentificacao: e.target.value })} placeholder="Ex: 123456" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} placeholder="Ex: João Silva" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="joao.silva@empresa.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" value={formData.cargo} onChange={e => setFormData({ ...formData, cargo: e.target.value })} placeholder="Ex: Desenvolvedor" />
                </div>
                {/* Departamento removido */}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>Cancelar</Button>
                <Button onClick={editMode ? handleEdit : handleCreate} className="bg-[#7C4A3A] hover:bg-[#6A3F30] text-white">
                  {editMode ? "Salvar Alterações" : "Adicionar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}

export default ColaboradoresPage;
// Removido bloco markdown