import React from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Textarea, Avatar, Badge } from '@/components/ui'
import { useAuthStore } from '@/store/auth.store'
import { updateProfile, updateRole } from '@/lib/api/auth'
import type { UserRole } from '@/types'

const ROLES: { value: UserRole; label: string; desc: string; color: 'blue' | 'green' | 'purple' }[] = [
  { value: 'viewer',   label: '👀 Viewer',   desc: 'Browse ideas, save and follow projects.',   color: 'blue'   },
  { value: 'creator',  label: '⚡ Creator',  desc: 'Post ideas, manage groups, publish products.', color: 'green'  },
  { value: 'investor', label: '💰 Investor', desc: 'Access deal flow, contact founders.',          color: 'purple' },
]

export function SettingsPage() {
  const { profile, fetchProfile } = useAuthStore()
  const [saving, setSaving]     = React.useState(false)
  const [saved, setSaved]       = React.useState(false)
  const [roleLoading, setRoleLoading] = React.useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      full_name: profile?.full_name ?? '',
      username:  profile?.username  ?? '',
      bio:       profile?.bio       ?? '',
      location:  profile?.location  ?? '',
      website:   profile?.website   ?? '',
      github_url:profile?.github_url?? '',
    },
  })

  async function onSubmit(data: Record<string, string>) {
    if (!profile) return
    setSaving(true)
    try {
      await updateProfile(profile.id, data)
      await fetchProfile(profile.id)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function changeRole(role: UserRole) {
    if (!profile || profile.role === role) return
    setRoleLoading(true)
    try {
      await updateRole(profile.id, role)
      await fetchProfile(profile.id)
    } finally {
      setRoleLoading(false)
    }
  }

  if (!profile) return null

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
      <h1 className="text-xl font-bold text-primary">⚙️ Settings</h1>

      {/* Profile */}
      <section className="card p-5">
        <h2 className="text-base font-semibold text-primary mb-4">Profile</h2>
        <div className="flex items-center gap-4 mb-5">
          <Avatar name={profile.full_name} src={profile.avatar_url} size="lg" />
          <div>
            <p className="font-medium text-primary">{profile.full_name}</p>
            <p className="text-sm text-muted">@{profile.username}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full Name" {...register('full_name')} />
            <Input label="Username" {...register('username')} />
          </div>
          <Textarea label="Bio" placeholder="Tell people about yourself..." rows={2} {...register('bio')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Location" placeholder="San Francisco, CA" {...register('location')} />
            <Input label="Website" placeholder="https://yoursite.com" {...register('website')} />
          </div>
          <Input label="GitHub URL" placeholder="https://github.com/you" {...register('github_url')} />

          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
              {saved ? '✅ Saved!' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </section>

      {/* Role */}
      <section className="card p-5">
        <h2 className="text-base font-semibold text-primary mb-1">Role</h2>
        <p className="text-sm text-muted mb-4">Your role determines what actions you can take on the platform.</p>

        <div className="flex flex-col gap-2">
          {ROLES.map(role => (
            <button
              key={role.value}
              onClick={() => changeRole(role.value)}
              disabled={roleLoading}
              className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                profile.role === role.value ? 'border-emphasis' : 'border-default hover:border-emphasis'
              }`}
              style={profile.role === role.value ? { borderColor: 'var(--border-emphasis)', background: 'var(--bg-tertiary)' } : undefined}
            >
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-primary">{role.label}</span>
                  {profile.role === role.value && <Badge variant={role.color} className="text-[10px]">Current</Badge>}
                </div>
                <p className="text-xs text-muted">{role.desc}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${profile.role === role.value ? '' : 'border-default'}`}
                style={profile.role === role.value ? { borderColor: 'var(--accent)', background: 'var(--accent)' } : undefined}
              >
                {profile.role === role.value && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          ))}
        </div>

        {profile.role === 'investor' && !profile.investor_verified && (
          <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: 'rgba(188,140,255,0.1)', border: '1px solid #6e40c9' }}>
            <p style={{ color: 'var(--purple)' }}>💜 Investor verification coming soon. You can still explore the platform.</p>
          </div>
        )}
      </section>

      {/* Account */}
      <section className="card p-5">
        <h2 className="text-base font-semibold text-primary mb-1">Account</h2>
        <div className="flex justify-between items-center py-3 border-b border-default">
          <div>
            <p className="text-sm font-medium text-primary">Email</p>
            <p className="text-xs text-muted">{profile.email}</p>
          </div>
        </div>
        <div className="flex justify-between items-center py-3">
          <div>
            <p className="text-sm font-medium text-primary">Member Since</p>
            <p className="text-xs text-muted">{new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
