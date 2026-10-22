import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body: { email?: unknown; senha?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Dados de login inválidos' }, { status: 400 })
  }
  if (!body || typeof body.email !== 'string' || typeof body.senha !== 'string' || !body.email.trim() || !body.senha) {
    return NextResponse.json({ success: false, message: 'Email e senha são obrigatórios' }, { status: 400 })
  }
  try {
    const backendUrl = (process.env.BACKEND_URL || 'http://localhost:5555').replace(/\/$/, '')

    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: body.email.trim(), senha: body.senha }),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, message: errorData.message || 'Erro no login' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    return NextResponse.json(
      { success: false, message: 'Serviço de autenticação temporariamente indisponível. Tente novamente em instantes.' },
      { status: 503 }
    )
  }
}
