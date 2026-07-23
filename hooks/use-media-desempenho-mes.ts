import { useState, useEffect } from 'react'

interface MediaDesempenhoMesResponse {
  success: boolean
  message: string
  data: {
    mediaDesempenhoSetorMes: number
  }
}

export function useMediaDesempenhoMes() {
  // Importa o contexto de autenticação
  // @ts-ignore
  const { token } = require("@/components/auth-context").useAuth();
  const [mediaDesempenhoMes, setMediaDesempenhoMes] = useState<string>("...")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMediaDesempenhoMes = async () => {
      try {
        setLoading(true)
        
        
        // Sempre sem filtros - retorna média do mês atual
        const url = `/api/media-desempenho-mes`
        
        console.log('useMediaDesempenhoMes - URL (sem filtros):', url)
        
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

        const data: MediaDesempenhoMesResponse = await response.json()
        
        if (data.success && data.data?.mediaDesempenhoSetorMes !== undefined) {
          setMediaDesempenhoMes(data.data.mediaDesempenhoSetorMes.toString())
          setError(null)
        } else {
          setMediaDesempenhoMes("404")
          setError("Dados não encontrados")
        }
      } catch (error) {
        console.error('Erro ao buscar média de desempenho do mês:', error)
        setMediaDesempenhoMes("404")
        setError(error instanceof Error ? error.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    fetchMediaDesempenhoMes()
  }, []) // Sem dependências - sempre executa apenas uma vez

  return { mediaDesempenhoMes, loading, error }
}