import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5555'
    
    // Pegar o token do header Authorization da requisição do frontend
    const authorization = request.headers.get('authorization')

    // Parâmetros de filtro
    const periodo = searchParams.get('periodo')
    const departamento = searchParams.get('departamento')
    const nome = searchParams.get('nome')

    console.log('GET /api/resumo-avaliacoes - Parâmetros recebidos:', { periodo, departamento, nome })
    console.log('GET /api/resumo-avaliacoes - Authorization:', authorization)

    // Construir query params para o backend
    const queryParams = new URLSearchParams()
    if (periodo) queryParams.append('periodo', periodo)
    if (departamento) queryParams.append('departamento', departamento)
    if (nome) queryParams.append('nome', nome)

    const url = `${backendUrl}/api/dashboard/resumo-avaliacoes?${queryParams.toString()}`
    console.log('GET /api/resumo-avaliacoes - Backend URL:', url)

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

    console.log('GET /api/resumo-avaliacoes - Status response:', response.status)

    if (!response.ok) {
      const msg = await response.text()
      console.log('GET /api/resumo-avaliacoes - Erro response:', msg)
      throw new Error(`Erro HTTP: ${response.status} - ${msg}`)
    }

    const data = await response.json()
    console.log('GET /api/resumo-avaliacoes - Sucesso response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar resumo das avaliações:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
