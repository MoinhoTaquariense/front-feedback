import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-context'

interface ResumoAvaliacoesItem { data: string; quantidadeAvaliacoes: number }
interface ResumoAvaliacoesResponse { success: boolean; data?: { resumo?: ResumoAvaliacoesItem[] } }
interface FilterParams { periodo: string; nome?: string }

export function useResumoAvaliacoes(filters: FilterParams) {
  const { token } = useAuth()
  const [resumo, setResumo] = useState<ResumoAvaliacoesItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!filters.periodo) { setResumo([]); setLoading(false); setError(null); return }
    const fetchResumo = async () => {
      try {
        setLoading(true)
        const query = new URLSearchParams({ periodo: filters.periodo })
        if (filters.nome) query.set('nome', filters.nome)
        const response = await fetch(`/api/resumo-avaliacoes?${query}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (!response.ok) throw new Error(`Erro ao carregar resumo (${response.status})`)
        const data: ResumoAvaliacoesResponse = await response.json()
        setResumo(data.success && Array.isArray(data.data?.resumo) ? data.data.resumo : [])
        setError(data.success ? null : 'Dados não encontrados')
      } catch (exception) {
        setResumo([])
        setError(exception instanceof Error ? exception.message : 'Erro desconhecido')
      } finally { setLoading(false) }
    }
    void fetchResumo()
  }, [filters.periodo, filters.nome, token])

  return { resumo, loading, error }
}
