import { useState, useEffect } from 'react'

interface AvaliacoesSetorResponse {
  success: boolean
  message: string
  data: {
    quantidadeAvaliacoesSetor: number
  }
}

interface FilterParams {
  periodo?: string
  departamento?: string
  nome?: string
}

export function useAvaliacoesSetor(filters?: FilterParams) {
  // Importa o contexto de autenticação
  // @ts-ignore
  const { token } = require("@/components/auth-context").useAuth();
  const [avaliacoesSetor, setAvaliacoesSetor] = useState<string>("...")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAvaliacoesSetor = async () => {
      try {
        setLoading(true)
        
        // Build query string if filters are provided
        const queryParams = new URLSearchParams()
        if (filters?.periodo) queryParams.append('periodo', filters.periodo)
        if (filters?.departamento) queryParams.append('departamento', filters.departamento)
        if (filters?.nome) queryParams.append('nome', filters.nome)
        
  const queryString = queryParams.toString()
        const url = `/api/avaliacoes-setor${queryString ? `?${queryString}` : ''}`
        
        console.log('useAvaliacoesSetor - Filtros:', filters)
        console.log('useAvaliacoesSetor - URL:', url)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        })

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`)
        }

        const data: AvaliacoesSetorResponse = await response.json()
        
        if (data.success && data.data?.quantidadeAvaliacoesSetor !== undefined) {
          setAvaliacoesSetor(data.data.quantidadeAvaliacoesSetor.toString())
          setError(null)
        } else {
          setAvaliacoesSetor("404")
          setError("Dados não encontrados")
        }
      } catch (error) {
        console.error('Erro ao buscar avaliações por setor:', error)
        setAvaliacoesSetor("404")
        setError(error instanceof Error ? error.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    fetchAvaliacoesSetor()
  }, [filters?.periodo, filters?.departamento, filters?.nome])

  return { avaliacoesSetor, loading, error }
}