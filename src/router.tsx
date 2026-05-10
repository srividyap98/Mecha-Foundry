import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import React from 'react'
import { useAuthStore } from '@/store/auth.store'
import { Navbar } from '@/components/layout/Navbar'
import { PostIdeaModal } from '@/components/ideas/PostIdeaModal'
import { AuthPage }       from '@/components/auth/AuthPage'
import { AuthCallback }   from '@/components/auth/AuthCallback'
import { IdeasPage }      from '@/pages/IdeasPage'
import { GroupsPage }     from '@/pages/GroupsPage'
import { MarketplacePage }from '@/pages/MarketplacePage'
import { InvestorsPage }  from '@/pages/InvestorsPage'
import { SettingsPage }   from '@/pages/SettingsPage'
import { SavedPage }      from '@/pages/SavedPage'
import { Spinner }        from '@/components/ui'

// ─── Root layout ──────────────────────────────────────────────────────────────
function RootLayout() {
  const { initialized, loading } = useAuthStore()
  const [postIdeaOpen, setPostIdeaOpen] = React.useState(false)

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
          <Spinner size={20} />
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar onPostIdea={() => setPostIdeaOpen(true)} />
      <Outlet />
      <PostIdeaModal open={postIdeaOpen} onClose={() => setPostIdeaOpen(false)} />
    </>
  )
}

// ─── Auth guard ───────────────────────────────────────────────────────────────
function requireAuth() {
  const { user, initialized } = useAuthStore.getState()
  if (initialized && !user) throw redirect({ to: '/auth' })
}

// ─── Routes ───────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: RootLayout })

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthPage,
})

const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  component: AuthCallback,
})

const ideasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ideas',
  beforeLoad: requireAuth,
  component: IdeasPage,
})

const groupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/groups',
  beforeLoad: requireAuth,
  component: GroupsPage,
})

const marketRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/market',
  beforeLoad: requireAuth,
  component: MarketplacePage,
})

const investorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investors',
  beforeLoad: requireAuth,
  component: InvestorsPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  beforeLoad: requireAuth,
  component: SettingsPage,
})

const savedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/saved',
  beforeLoad: requireAuth,
  component: SavedPage,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/ideas' }) },
  component: () => null,
})

// ─── Router ───────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  authCallbackRoute,
  savedRoute,
  ideasRoute,
  groupsRoute,
  marketRoute,
  investorsRoute,
  settingsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
