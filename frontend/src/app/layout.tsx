import TopNav from '../components/TopNav'
import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import CommandPalette from '../components/CommandPalette'
import { ToastProvider } from '../components/ToastProvider'

export const metadata: Metadata = {
  title: 'ComplykOrt - The Compliance Platform for Modern Teams',
  description: 'Streamline your compliance workflows, manage evidence, and ensure audit readiness with ComplykOrt\'s secure, multi-tenant platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-inter antialiased bg-background text-foreground transition-colors">
        <ToastProvider>
          <AuthProvider>
            <TopNav />
            <CommandPalette />
            <main className="min-h-[calc(100vh-56px)]">
              {children}
            </main>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
