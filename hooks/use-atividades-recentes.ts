import { useState, useEffect } from 'react'

interface Avaliacao {
  id: number
  titulo: string
  usuario: string
  tempo: string
  tipo: string
  feedback: string
  nota: number
  colaborador?: string | null
}

interface UltimasAvaliacoesResponse {
  success: boolean
  message: string
  data: {
    atividades: Avaliacao[]
  }
}

export function useAtividadesRecentes() {
  const [atividades, setAtividades] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Importa o token do AuthContext
  // @ts-ignore
  const { token } = typeof window !== 'undefined' ? require("@/components/auth-context").useAuth() : { token: null };

  useEffect(() => {
    const fetchUltimasAvaliacoes = async () => {
      try {
        setLoading(true)
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch('/api/atividades-recentes', {
          method: 'GET',
          headers
        })
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`)
        }
        const data: UltimasAvaliacoesResponse = await response.json()
        if (data.success && data.data?.atividades) {
          setAtividades(data.data.atividades)
          setError(null)
        } else {
          setAtividades([])
          setError("Dados não encontrados")
        }
      } catch (error) {
        console.error('Erro ao buscar últimas avaliações:', error)
        setAtividades([])
        setError(error instanceof Error ? error.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }
    fetchUltimasAvaliacoes()
  }, [token])
  return { atividades, loading, error }
}