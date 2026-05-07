import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Button, Input, Textarea, Select, TagInput } from '@/components/ui'
import { useCreateIdea } from '@/hooks/useIdeas'
import type { IdeaFormData } from '@/types'

const schema = z.object({
  title:         z.string().min(5, 'Title must be at least 5 characters').max(100),
  problem:       z.string().min(10, 'Describe the problem in at least 10 characters'),
  solution:      z.string().min(10, 'Describe your solution in at least 10 characters'),
  stage:         z.enum(['concept', 'mvp', 'beta', 'launched']),
  category:      z.enum(['ai','fintech','health','education','climate','cybersecurity','web3','social','productivity','other']),
  collab_setting:z.enum(['open', 'apply', 'invite_only']),
  tags:          z.array(z.string()).min(1, 'Add at least one tag'),
  skills_needed: z.array(z.string()),
  tech_stack:    z.array(z.string()),
  github_url:    z.string().url().optional().or(z.literal('')),
  figma_url:     z.string().url().optional().or(z.literal('')),
  demo_url:      z.string().url().optional().or(z.literal('')),
})

const STAGES    = [{ value:'concept',label:'Concept — just an idea' },{ value:'mvp',label:'MVP — early prototype' },{ value:'beta',label:'Beta — testing with users' },{ value:'launched',label:'Launched — live product' }]
const CATEGORIES= [{ value:'ai',label:'AI / ML' },{ value:'fintech',label:'Fintech' },{ value:'health',label:'Health' },{ value:'education',label:'Education' },{ value:'climate',label:'Climate' },{ value:'cybersecurity',label:'Cybersecurity' },{ value:'web3',label:'Web3' },{ value:'social',label:'Social' },{ value:'productivity',label:'Productivity' },{ value:'other',label:'Other' }]
const COLLAB    = [{ value:'open',label:'Open — anyone can join' },{ value:'apply',label:'Apply — you approve collaborators' },{ value:'invite_only',label:'Invite only — private' }]

interface Props { open: boolean; onClose: () => void }

export function PostIdeaModal({ open, onClose }: Props) {
  const createIdea = useCreateIdea()
  const [step, setStep] = React.useState(0)

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, watch } = useForm<IdeaFormData>({
    resolver: zodResolver(schema),
    defaultValues: { stage: 'concept', category: 'ai', collab_setting: 'apply', tags: [], skills_needed: [], tech_stack: [] },
  })

  function handleClose() { reset(); setStep(0); onClose() }

  async function onSubmit(data: IdeaFormData) {
    await createIdea.mutateAsync(data)
    handleClose()
  }

  const steps = ['Basics', 'Details', 'Links & Collab']

  return (
    <Modal open={open} onClose={handleClose} title="💡 Post a New Idea" size="lg">
      {/* Step indicator */}
      <div className="flex gap-1 mb-5">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-accent' : 'bg-tertiary'}`} style={{ background: i <= step ? 'var(--accent)' : undefined }} />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted mb-4">Step {step + 1} of {steps.length} — {steps[step]}</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <Input label="Idea Title *" placeholder="e.g. AI-powered carbon footprint tracker" error={errors.title?.message} {...register('title')} />
            <Textarea label="Problem Statement *" placeholder="What specific problem does this solve? Who has this problem?" rows={3} error={errors.problem?.message} {...register('problem')} />
            <Textarea label="Your Solution *" placeholder="How will you solve it? What makes your approach unique?" rows={3} error={errors.solution?.message} {...register('solution')} />
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Stage *" options={STAGES} error={errors.stage?.message} {...register('stage')} />
              <Select label="Category *" options={CATEGORIES} error={errors.category?.message} {...register('category')} />
            </div>
            <Controller name="tags" control={control} render={({ field }) => (
              <TagInput label="Tags *" value={field.value} onChange={field.onChange} placeholder="ai, sustainability, mobile..." />
            )} />
            {errors.tags && <p className="text-xs" style={{ color: 'var(--danger)' }}>{errors.tags.message}</p>}
            <Controller name="skills_needed" control={control} render={({ field }) => (
              <TagInput label="Skills Needed" value={field.value} onChange={field.onChange} placeholder="React developer, ML engineer..." />
            )} />
            <Controller name="tech_stack" control={control} render={({ field }) => (
              <TagInput label="Tech Stack" value={field.value} onChange={field.onChange} placeholder="Python, Next.js, PostgreSQL..." />
            )} />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <Select label="Collaboration Setting *" options={COLLAB} error={errors.collab_setting?.message} {...register('collab_setting')} />
            <div className="p-3 rounded-lg text-xs text-secondary" style={{ background: 'var(--bg-tertiary)' }}>
              {watch('collab_setting') === 'open'        && '✅ Anyone can join your project immediately.'}
              {watch('collab_setting') === 'apply'       && '📬 People apply and you choose who joins.'}
              {watch('collab_setting') === 'invite_only' && '🔒 Only people you invite can see the group.'}
            </div>
            <Input label="GitHub URL" placeholder="https://github.com/you/project" {...register('github_url')} />
            <Input label="Figma / Design URL" placeholder="https://figma.com/file/..." {...register('figma_url')} />
            <Input label="Demo URL" placeholder="https://your-demo.vercel.app" {...register('demo_url')} />
            {createIdea.error && (
              <p className="text-xs" style={{ color: 'var(--danger)' }}>
                {createIdea.error instanceof Error ? createIdea.error.message : 'Failed to post idea'}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-6 pt-4 border-t border-default">
          <Button type="button" variant="secondary" onClick={step === 0 ? handleClose : () => setStep(s => s - 1)}>
            {step === 0 ? 'Cancel' : '← Back'}
          </Button>
          {step < 2
            ? <Button type="button" variant="primary" onClick={() => setStep(s => s + 1)}>Next →</Button>
            : <Button type="submit" variant="primary" loading={isSubmitting}>🚀 Post Idea</Button>
          }
        </div>
      </form>
    </Modal>
  )
}
