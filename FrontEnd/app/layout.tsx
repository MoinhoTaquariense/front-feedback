import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from '@/components/auth-context'
import AuthGuard from '@/components/auth-guard'

export const metadata: Metadata = {
  title: 'Motasa Feedbacks',
  description: 'Plataforma de campanhas e feedbacks da Motasa',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}><AuthProvider><AuthGuard>{children}</AuthGuard></AuthProvider><Analytics /></body></html>
}
