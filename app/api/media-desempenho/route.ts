import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5555'
    
    // Pegar o token do header Authorization da requisição do frontend
    const authorization = request.headers.get('authorization')

    const queryParams = new URLSearchParams()
    
    const periodo = searchParams.get('periodo')
    const departamento = searchParams.get('departamento')
    const nome = searchParams.get('nome')

    if (periodo) queryParams.append('periodo', periodo)
    if (departamento) queryParams.append('departamento', departamento)
    if (nome) queryParams.append('nome', nome)

    const queryString = queryParams.toString()
    const url = `${backendUrl}/api/dashboard/media-desempenho-setor${queryString ? `?${queryString}` : ''}`

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

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar média de desempenho:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}