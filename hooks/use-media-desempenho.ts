import { useState, useEffect } from 'react'

interface MediaDesempenhoResponse {
  success: boolean
  message: string
  data: {
    mediaDesempenhoSetor: number
  }
}

interface FilterParams {
  periodo?: string
  departamento?: string
  nome?: string
}

export function useMediaDesempenho(filters?: FilterParams) {
  // Importa o contexto de autenticação
  // @ts-ignore
  const { token } = require("@/components/auth-context").useAuth();
  const [mediaDesempenho, setMediaDesempenho] = useState<string>("...")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMediaDesempenho = async () => {
      try {
        setLoading(true)
        
        // Build query string if filters are provided
        const queryParams = new URLSearchParams()
        if (filters?.periodo) queryParams.append('periodo', filters.periodo)
        if (filters?.departamento) queryParams.append('departamento', filters.departamento)
        if (filters?.nome) queryParams.append('nome', filters.nome)
        
        const queryString = queryParams.toString()
        const url = `/api/media-desempenho${queryString ? `?${queryString}` : ''}`
        
        console.log('useMediaDesempenho - Filtros:', filters)
        console.log('useMediaDesempenho - URL:', url)
        
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

        const data: MediaDesempenhoResponse = await response.json()
        
        if (data.success && data.data?.mediaDesempenhoSetor !== undefined) {
          setMediaDesempenho(data.data.mediaDesempenhoSetor.toString())
          setError(null)
        } else {
          setMediaDesempenho("404")
          setError("Dados não encontrados")
        }
      } catch (error) {
        console.error('Erro ao buscar média de desempenho:', error)
        setMediaDesempenho("404")
        setError(error instanceof Error ? error.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    fetchMediaDesempenho()
  }, [filters?.periodo, filters?.departamento, filters?.nome])

  return { mediaDesempenho, loading, error }
}