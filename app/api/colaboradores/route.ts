import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5555'
    
    // Pegar o token do header Authorization da requisição do frontend
    const authorization = request.headers.get('authorization')

    console.log('GET /api/colaboradores - Authorization:', authorization)
    console.log('GET /api/colaboradores - Backend URL:', `${backendUrl}/api/colaboradores`)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (authorization) {
      headers['Authorization'] = authorization
    }

    const response = await fetch(`${backendUrl}/api/colaboradores`, {
      method: 'GET',
      headers
    })

    console.log('GET /api/colaboradores - Status response:', response.status)

    if (!response.ok) {
      const msg = await response.text()
      console.log('GET /api/colaboradores - Erro response:', msg)
      throw new Error(`Erro HTTP: ${response.status} - ${msg}`)
    }

    const data = await response.json()
    console.log('GET /api/colaboradores - Sucesso response:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5555'
    
    // Pegar o token do header Authorization da requisição do frontend
    const authorization = req.headers.get('authorization')
    const body = await req.json()

    console.log('POST /api/colaboradores - Dados recebidos:', body)
    console.log('POST /api/colaboradores - Authorization:', authorization)
    console.log('POST /api/colaboradores - Backend URL:', `${backendUrl}/api/colaboradores`)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (authorization) {
      headers['Authorization'] = authorization
    }

    const response = await fetch(`${backendUrl}/api/colaboradores`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    console.log('POST /api/colaboradores - Status response:', response.status)

    if (!response.ok) {
      const msg = await response.text()
      console.log('POST /api/colaboradores - Erro response:', msg)
      throw new Error(`Erro HTTP: ${response.status} - ${msg}`)
    }

    const data = await response.json()
    console.log('POST /api/colaboradores - Sucesso response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao criar colaborador:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao criar colaborador', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}



