"use client"

import { Bell, ChevronRight, Plus } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

const titles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Visão geral", subtitle: "Acompanhe suas campanhas e resultados." },
  "/campanhas": { title: "Campanhas", subtitle: "Planeje, publique e acompanhe a coleta." },
  "/questionarios": { title: "Questionários", subtitle: "Crie pesquisas que geram decisões." },
  "/relatorios": { title: "Resultados", subtitle: "Transforme respostas em melhorias." },
  "/administracao": { title: "Administração", subtitle: "Gerencie acessos, papéis e setores." },
}

export function DashboardHeader() {
  const pathname = usePathname(); const router = useRouter(); const page = titles[pathname] || { title: "Motasa Feedbacks", subtitle: "Central de feedbacks" }
  return <header className="flex min-h-[82px] items-center justify-between border-b border-[#e6e9f0] bg-white px-5 lg:px-8"><div><div className="flex items-center gap-1 text-xs text-[#8a92a4]"><span>Motasa</span><ChevronRight className="h-3 w-3" /><span>{page.title}</span></div><h1 className="mt-1 text-lg font-semibold tracking-tight text-[#172033]">{page.title}</h1><p className="hidden text-sm text-[#687086] xl:block">{page.subtitle}</p></div><div className="flex items-center gap-2"><button type="button" className="rounded-xl p-2.5 text-[#687086] hover:bg-[#f3f5f8]" aria-label="Notificações"><Bell className="h-5 w-5" /></button><button type="button" onClick={() => router.push("/campanhas")} className="inline-flex items-center gap-2 rounded-xl bg-[#5d3a2e] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4e3026]"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Nova campanha</span></button></div></header>
}
