import { useState, useEffect } from 'react'

interface ColaboradoresResponse {
  success: boolean
  message: string
  data: {
    quantidadeColaboradoresSetor: number
  }
}

export function useColaboradores() {
  // Importa o contexto de autenticação
  // @ts-ignore
  const { token } = require("@/components/auth-context").useAuth();
  const [totalColaboradores, setTotalColaboradores] = useState<string>("...")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        setLoading(true)
        
        // Buscar do backend real
        const response = await fetch('/api/colaboradores', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        })

        console.log('useColaboradores - Response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.log('useColaboradores - Error response:', errorText)
          throw new Error(`Erro HTTP: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log('useColaboradores - Response data:', data)
        
        // Verifica diferentes formatos de resposta
        if (data && typeof data === 'object') {
          let count = 0;
          
          // Se for um array, conta os itens
          if (Array.isArray(data)) {
            count = data.length;
          }
          // Se tiver propriedade quantidadeColaboradoresSetor
          else if (data.quantidadeColaboradoresSetor !== undefined) {
            count = data.quantidadeColaboradoresSetor;
          }
          // Se tiver data.quantidadeColaboradoresSetor
          else if (data.data?.quantidadeColaboradoresSetor !== undefined) {
            count = data.data.quantidadeColaboradoresSetor;
          }
          // Se tiver length
          else if (data.length !== undefined) {
            count = data.length;
          }
          
          setTotalColaboradores(count.toString())
          setError(null)
        } else {
          setTotalColaboradores("0")
          setError("Formato de dados inesperado")
        }
      } catch (error) {
        console.error('Erro ao buscar colaboradores:', error)
        setTotalColaboradores("404")
        setError(error instanceof Error ? error.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    fetchColaboradores()
  }, [])

  return { totalColaboradores, loading, error }
}