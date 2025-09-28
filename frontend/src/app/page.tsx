'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthenticatedDashboard from '../components/AuthenticatedDashboard'
import LoginModal from '../components/LoginModal'
import { FullPageLoader } from '../components/LoadingSpinner'

export default function HomePage() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated)

  if (isLoading) return <FullPageLoader withinAppShell />

  if (isAuthenticated && user) {
    return <AuthenticatedDashboard user={user} onLogout={logout} />
  }

  return (
    <div className="min-h-screen bg-background relative">

      {/* Decorative background like nextjs.org */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* top spotlight */}
        <div className="absolute inset-0 bg-spotlight"></div>
        {/* subtle grid overlay */}
        {/* corner arc rings */}
        <div className="absolute inset-0 bg-corner-rings opacity-40 dark:opacity-25"></div>
        <div className="absolute inset-0 bg-grid opacity-30 dark:opacity-20"></div>
        {/* colorful blur */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[1100px] rounded-full bg-gradient-to-tr from-indigo-500/20 via-sky-400/20 to-emerald-400/20 blur-3xl"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">ComplykOrt</h1>
          <p className="text-muted-foreground mb-8">The Compliance Platform for Modern Teams</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-foreground px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}
