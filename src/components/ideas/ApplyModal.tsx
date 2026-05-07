import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Button, Input, Textarea, Select } from '@/components/ui'
import { useApplyToIdea } from '@/hooks/useData'
import type { Idea } from '@/types'

const schema = z.object({
  role_offered:  z.string().min(2, 'Describe the role you want to fill'),
  message:       z.string().min(20, 'Write at least 20 characters about why you want to collaborate'),
  portfolio_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

const ROLES = [
  { value: 'Frontend Developer', label: 'Frontend Developer' },
  { value: 'Backend Developer',  label: 'Backend Developer'  },
  { value: 'Full-Stack Developer',label:'Full-Stack Developer'},
  { value: 'ML Engineer',        label: 'ML Engineer'        },
  { value: 'Mobile Developer',   label: 'Mobile Developer'   },
  { value: 'UI/UX Designer',     label: 'UI/UX Designer'     },
  { value: 'Product Manager',    label: 'Product Manager'    },
  { value: 'Marketing',          label: 'Marketing'          },
  { value: 'DevOps / Infra',     label: 'DevOps / Infra'     },
  { value: 'Other',              label: 'Other'              },
]

interface Props {
  idea: Idea | null
  open: boolean
  onClose: () => void
}

export function ApplyModal({ idea, open, onClose }: Props) {
  const applyMutation = useApplyToIdea()

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role_offered: ROLES[0].value },
  })

  function handleClose() { reset(); onClose() }

  async function onSubmit(data: FormData) {
    if (!idea) return
    await applyMutation.mutateAsync({
      ideaId: idea.id,
      role_offered: data.role_offered,
      message: data.message,
      portfolio_url: data.portfolio_url || undefined,
    })
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="🤝 Apply to Collaborate">
      {idea && (
        <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-tertiary)' }}>
          <p className="text-xs text-muted mb-0.5">Applying to join</p>
          <p className="font-medium text-primary">{idea.title}</p>
          {idea.creator && <p className="text-xs text-secondary">by {idea.creator.full_name}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select
          label="Role You're Offering *"
          options={ROLES}
          error={errors.role_offered?.message}
          {...register('role_offered')}
        />

        <Textarea
          label="Why do you want to collaborate? *"
          placeholder="Tell the idea owner about your background, relevant experience, and what you'd bring to the project. Be specific!"
          rows={4}
          error={errors.message?.message}
          {...register('message')}
        />

        <Input
          label="Portfolio / GitHub / LinkedIn (optional)"
          placeholder="https://github.com/you"
          error={errors.portfolio_url?.message}
          {...register('portfolio_url')}
        />

        {applyMutation.error && (
          <p className="text-xs" style={{ color: 'var(--danger)' }}>
            {applyMutation.error instanceof Error ? applyMutation.error.message : 'Failed to send application'}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-default">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>Send Application</Button>
        </div>
      </form>
    </Modal>
  )
}
