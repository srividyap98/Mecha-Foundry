import React from 'react'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'
import { X, Loader2 } from 'lucide-react'

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

export function Button({ variant = 'secondary', size = 'md', loading, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'btn',
        {
          'btn-primary':   variant === 'primary',
          'btn-secondary': variant === 'secondary',
          'btn-accent':    variant === 'accent',
          'btn-danger':    variant === 'danger',
          'btn-sm':        size === 'sm',
          'btn-lg':        size === 'lg',
          'btn-icon':      size === 'icon',
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  variant?: 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'default'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn('badge', `badge-${variant}`, className)}>
      {children}
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
interface AvatarProps {
  name: string
  src?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' }

export function Avatar({ name, src, size = 'sm', className }: AvatarProps) {
  const color = getAvatarColor(name)
  if (src) {
    return <img src={src} alt={name} className={cn('avatar rounded-full object-cover', sizeMap[size], className)} />
  }
  return (
    <div
      className={cn('avatar', sizeMap[size], className)}
      style={{ background: `${color}22`, color }}
    >
      {getInitials(name)}
    </div>
  )
}

export function AvatarGroup({ names, srcs, max = 3 }: { names: string[]; srcs?: (string | null)[]; max?: number }) {
  const shown = names.slice(0, max)
  const rest = names.length - max
  return (
    <div className="flex items-center">
      {shown.map((name, i) => (
        <div key={name} className="-ml-2 first:ml-0 border-2 rounded-full" style={{ borderColor: 'var(--bg-secondary)' }}>
          <Avatar name={name} src={srcs?.[i]} size="xs" />
        </div>
      ))}
      {rest > 0 && (
        <div className="-ml-2 w-6 h-6 rounded-full bg-[var(--bg-overlay)] border-2 flex items-center justify-center text-[10px] text-secondary" style={{ borderColor: 'var(--bg-secondary)' }}>
          +{rest}
        </div>
      )}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-secondary">{label}</label>}
      <input ref={ref} className={cn('input', error && 'border-red-500', className)} {...props} />
      {error  && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
      {helper && !error && <p className="text-xs text-muted">{helper}</p>}
    </div>
  )
)
Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-secondary">{label}</label>}
      <textarea ref={ref} className={cn('input resize-none', error && 'border-red-500', className)} rows={3} {...props} />
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-secondary">{label}</label>}
      <select ref={ref} className={cn('input', error && 'border-red-500', className)} {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const modalWidths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

export function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
  React.useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={cn('card w-full max-h-[90vh] overflow-y-auto animate-slide-up', modalWidths[size], className)} style={{ background: 'var(--bg-secondary)' }}>
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-default">
            <h2 className="text-base font-semibold text-primary">{title}</h2>
            <Button size="icon" variant="ghost" onClick={onClose} className="text-muted hover:text-primary">
              <X size={16} />
            </Button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={cn('animate-spin text-secondary', className)} />
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="text-4xl">{icon}</div>
      <p className="font-semibold text-primary">{title}</p>
      {body && <p className="text-sm text-secondary max-w-xs">{body}</p>}
      {action}
    </div>
  )
}

// ─── Tag input (multi-value) ──────────────────────────────────────────────────
interface TagInputProps {
  label?: string
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}

export function TagInput({ label, value, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = React.useState('')

  function add(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-')
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setInput('')
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-secondary">{label}</label>}
      <div className="input flex flex-wrap gap-1.5 min-h-[40px] h-auto py-1.5">
        {value.map(tag => (
          <span key={tag} className="badge badge-default flex items-center gap-1">
            {tag}
            <button type="button" onClick={() => onChange(value.filter(t => t !== tag))} className="hover:text-primary ml-0.5">
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ',') && input) { e.preventDefault(); add(input) }
            if (e.key === 'Backspace' && !input && value.length) onChange(value.slice(0, -1))
          }}
          onBlur={() => input && add(input)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="bg-transparent outline-none text-sm flex-1 min-w-[80px] text-primary"
        />
      </div>
      <p className="text-xs text-muted">Press Enter or comma to add</p>
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'var(--success)' }: { value: number; max?: number; color?: string }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }}
      />
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={cn('card p-4', onClick && 'cursor-pointer', className)} onClick={onClick}>
      {children}
    </div>
  )
}
