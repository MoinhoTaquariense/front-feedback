import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      throw new Error('Token de autorização não encontrado')
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5555'

    const response = await fetch(`${backendUrl}/api/dashboard/ultimas-avaliacoes`, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    const data = await response.json()
    
    const atividades = data.data.ultimasAvaliacoes.map((avaliacao: any) => ({
      id: avaliacao.id,
      titulo: "Avaliação enviada",
      usuario: avaliacao.nomeAvaliador,
      tempo: formatarTempo(avaliacao.dataAvaliacao),
      tipo: "avaliacao",
      feedback: avaliacao.mensagem,
      nota: avaliacao.estrelas,
      colaborador: avaliacao.colaborador
    }))

    return NextResponse.json({
      success: true,
      message: "Últimas avaliações recentes",
      data: {
        atividades: atividades
      }
    })

  } catch (error) {
    console.error('Erro ao buscar últimas avaliações:', error)
    
    return NextResponse.json({
      success: true,
      message: "Nenhuma avaliação recente",
      data: {
        atividades: []
      }
    })
  }
}

function formatarTempo(dataEnvio: string): string {
  try {
    const agora = new Date()
    const data = new Date(dataEnvio)
    const diferenca = agora.getTime() - data.getTime()
    
    const minutos = Math.floor(diferenca / (1000 * 60))
    const horas = Math.floor(diferenca / (1000 * 60 * 60))
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24))
    
    if (minutos < 60) {
      return `há ${minutos} minuto${minutos !== 1 ? 's' : ''}`
    } else if (horas < 24) {
      return `há ${horas} hora${horas !== 1 ? 's' : ''}`
    } else {
      return `há ${dias} dia${dias !== 1 ? 's' : ''}`
    }
  } catch {
    return "há algumas horas"
  }
}