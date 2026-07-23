import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5555'
    
    // Pegar o token do header Authorization da requisição do frontend
    const authorization = request.headers.get('authorization')
    
    const url = `${backendUrl}/api/dashboard/media-desempenho-setor-mes`
    
    console.log('[DEBUG] Media Desempenho Mês - URL:', url)
    console.log('[DEBUG] Media Desempenho Mês - Authorization:', authorization)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (authorization) {
      headers['Authorization'] = authorization
    }

    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    
    console.log('[DEBUG] Media Desempenho Mês - Status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[DEBUG] Media Desempenho Mês - Erro:', errorText)
      throw new Error(`Erro HTTP: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar média de desempenho do mês:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor', error: error instanceof Error ? error.message : 'Erro desconhecido' }, 
      { status: 500 }
    )
  }
}