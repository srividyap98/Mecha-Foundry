import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Github } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { signIn, signUp, signInWithGithub, signInWithGoogle } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth.store'

const signInSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signUpSchema = signInSchema.extend({
  full_name: z.string().min(2, 'Enter your full name'),
  username:  z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, underscores'),
})

type SignInData = z.infer<typeof signInSchema>
type SignUpData = z.infer<typeof signUpSchema>

export function AuthPage() {
  const navigate  = useNavigate()
  const { user }  = useAuthStore()
  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin')
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (user) navigate({ to: '/ideas' })
  }, [user, navigate])

  const signInForm = useForm<SignInData>({ resolver: zodResolver(signInSchema) })
  const signUpForm = useForm<SignUpData>({ resolver: zodResolver(signUpSchema) })

  async function handleSignIn(data: SignInData) {
    setError('')
    try {
      await signIn(data.email, data.password)
      navigate({ to: '/ideas' })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign in failed')
    }
  }

  async function handleSignUp(data: SignUpData) {
    setError('')
    try {
      await signUp(data.email, data.password, data.username, data.full_name)
      navigate({ to: '/ideas' })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign up failed')
    }
  }

  async function handleGithub() {
    try { await signInWithGithub() }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'GitHub sign in failed') }
  }

  async function handleGoogle() {
    try { await signInWithGoogle() }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Google sign in failed') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-mono font-bold text-lg text-primary mb-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent)' }} />
            MECHA FOUNDRY
          </div>
          <p className="text-sm text-secondary">Together, we create. Together, we build.</p>
        </div>

        <div className="card p-6">
          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-default mb-5">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 text-sm font-medium transition-all ${
                  mode === m ? 'text-primary bg-tertiary' : 'text-secondary hover:text-primary'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* OAuth buttons */}
          <Button variant="secondary" className="w-full mb-2" onClick={handleGithub}>
            <Github size={15} /> Continue with GitHub
          </Button>
          <Button variant="secondary" className="w-full mb-4" onClick={handleGoogle}>
            <svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 divider" />
            <span className="text-xs text-muted">or</span>
            <div className="flex-1 divider" />
          </div>

          {/* Sign In form */}
          {mode === 'signin' && (
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="flex flex-col gap-3">
              <Input label="Email" type="email" placeholder="you@example.com" error={signInForm.formState.errors.email?.message} {...signInForm.register('email')} />
              <Input label="Password" type="password" placeholder="••••••••" error={signInForm.formState.errors.password?.message} {...signInForm.register('password')} />
              {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
              <Button variant="primary" className="w-full mt-1" type="submit" loading={signInForm.formState.isSubmitting}>
                Sign In
              </Button>
            </form>
          )}

          {/* Sign Up form */}
          {mode === 'signup' && (
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="flex flex-col gap-3">
              <Input label="Full Name" placeholder="Ada Lovelace" error={signUpForm.formState.errors.full_name?.message} {...signUpForm.register('full_name')} />
              <Input label="Username" placeholder="ada_builds" error={signUpForm.formState.errors.username?.message} {...signUpForm.register('username')} />
              <Input label="Email" type="email" placeholder="you@example.com" error={signUpForm.formState.errors.email?.message} {...signUpForm.register('email')} />
              <Input label="Password" type="password" placeholder="••••••••" error={signUpForm.formState.errors.password?.message} {...signUpForm.register('password')} />
              {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
              <Button variant="primary" className="w-full mt-1" type="submit" loading={signUpForm.formState.isSubmitting}>
                Create Account
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-4">
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
