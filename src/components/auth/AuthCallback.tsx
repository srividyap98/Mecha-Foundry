import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/store/auth.store'
import { Spinner } from '@/components/ui'

export function AuthCallback() {
  const navigate = useNavigate()
  const { user, initialized } = useAuthStore()

  React.useEffect(() => {
    if (!initialized) return
    // Session is picked up automatically by AuthProvider via detectSessionInUrl
    navigate({ to: user ? '/ideas' : '/auth', replace: true })
  }, [initialized, user, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Spinner size={24} />
    </div>
  )
}
