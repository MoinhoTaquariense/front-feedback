"use client"

import type { ReactNode } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { MobileNavigation } from "@/components/mobile-navigation"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-page flex">
      <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
      <DashboardSidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader />
        <main id="main-content" className="app-content pb-24 lg:pb-8">{children}</main>
      </div>
      <MobileNavigation />
    </div>
  )
}
