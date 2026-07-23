import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5555'
    
    // Pegar o token do header Authorization da requisição do frontend
    const authorization = req.headers.get('authorization')
    const body = await req.json()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (authorization) {
      headers['Authorization'] = authorization
    }

    const response = await fetch(`${backendUrl}/api/tokens/gerar`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const msg = await response.text()
      throw new Error(`Erro HTTP: ${response.status} - ${msg}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao gerar token:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao gerar token', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}