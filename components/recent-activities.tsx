"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAtividadesRecentes } from "@/hooks/use-atividades-recentes"

export function RecentActivities() {
  const { atividades, loading, error } = useAtividadesRecentes()

  const getAvatarIcon = (tipo: string) => {
    switch (tipo) {
      case 'avaliacao': return '📝'
      case 'feedback': return '💬'
      case 'meta': return '🎯'
      case 'relatorio': return '📊'
      case 'sistema': return '⚙️'
      default: return '👤'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Avaliações Recentes</CardTitle>
          <CardDescription>Últimas avaliações e feedbacks enviados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-40 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Avaliações Recentes</CardTitle>
          <CardDescription>Últimas avaliações e feedbacks enviados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500">Erro ao carregar avaliações: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-black">Avaliações Recentes</CardTitle>
        <CardDescription>Últimas avaliações e feedbacks enviados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {atividades.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma avaliação recente encontrada</p>
            </div>
          ) : (
            atividades.map((atividade) => (
              <div key={atividade.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar>
                    <AvatarFallback style={{ backgroundColor: "#693019", color: "white" }}>
                      {atividade.usuario ? atividade.usuario.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-black">{atividade.usuario || 'Usuário não identificado'}</p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-sm text-gray-500">{atividade.tempo}</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{atividade.titulo}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
