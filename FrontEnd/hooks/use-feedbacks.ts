import { useState, useEffect } from 'react'

interface FeedbacksResponse {
  success: boolean
  message: string
  data: {
    quantidadeFeedbacksSetor: number
  }
}

export function useFeedbacks() {
  const [totalFeedbacks, setTotalFeedbacks] = useState<string>("...")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true)
        
        const response = await fetch('/api/feedbacks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`)
        }

        const data: FeedbacksResponse = await response.json()
        
        if (data.success && data.data?.quantidadeFeedbacksSetor !== undefined) {
          setTotalFeedbacks(data.data.quantidadeFeedbacksSetor.toString())
          setError(null)
        } else {
          setTotalFeedbacks("404")
          setError("Dados não encontrados")
        }
      } catch (error) {
        console.error('Erro ao buscar feedbacks:', error)
        setTotalFeedbacks("404")
        setError(error instanceof Error ? error.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    fetchFeedbacks()
  }, [])

  return { totalFeedbacks, loading, error }
}