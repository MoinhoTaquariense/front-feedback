import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5555'
    
    // Pegar o token do header Authorization da requisição do frontend
    const authorization = req.headers.get('authorization')
    const body = await req.json()
    const { id } = params

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (authorization) {
      headers['Authorization'] = authorization
    }

    const response = await fetch(`${backendUrl}/api/colaboradores/${id}`, {
      method: 'PUT',
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
    console.error('Erro ao atualizar colaborador:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar colaborador' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5555'
    
    // Pegar o token do header Authorization da requisição do frontend
    const authorization = req.headers.get('authorization')
    const { id } = params

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (authorization) {
      headers['Authorization'] = authorization
    }

    const response = await fetch(`${backendUrl}/api/colaboradores/${id}`, {
      method: 'DELETE',
      headers
    })

    if (!response.ok) {
      const msg = await response.text()
      throw new Error(`Erro HTTP: ${response.status} - ${msg}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar colaborador:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao deletar colaborador' },
      { status: 500 }
    )
  }
}