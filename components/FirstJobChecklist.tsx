'use client'

import { Check, Circle } from 'lucide-react'
import { useAppStore } from '@/lib/store'

/** "Get your first job": two steps that match what earns the new-member boost. Hides itself when done. */
export function FirstJobChecklist() {
  const { currentUser, jobs, setCurrentPage } = useAppStore()
  if (!currentUser) return null

  const missing = [
    !currentUser.name?.trim() && 'name',
    !currentUser.username?.trim() && 'username',
    !currentUser.phone?.trim() && 'phone',
    !currentUser.location?.trim() && 'area',
    !(currentUser.skills?.length) && 'a skill',
    !currentUser.bio?.trim() && 'a short bio',
  ].filter(Boolean) as string[]
  const profileDone = missing.length === 0
  const applied = jobs.some(j => j.applicants?.includes(currentUser.id))
  if (profileDone && applied) return null

  const steps = [
    {
      done: profileDone,
      title: 'Complete your profile',
      sub: profileDone ? 'Looks good' : `Still needed: ${missing.join(', ')}`,
      action: profileDone ? null : { label: 'Finish profile', onClick: () => setCurrentPage('profile') },
    },
    {
      done: applied,
      title: 'Apply to your first job',
      sub: applied ? 'Applied' : 'Employers pick from the people who apply',
      action: applied ? null : { label: 'Browse jobs', onClick: () => setCurrentPage('jobs') },
    },
  ]

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      <h2 className="font-black text-foreground">Get your first job</h2>
      <p className="text-xs text-muted-foreground mt-0.5 mb-3">
        Do both and you are shown to employers before everyone else for 30 days.
      </p>
      <ul className="space-y-3">
        {steps.map(s => (
          <li key={s.title} className="flex items-center gap-3">
            <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${s.done ? 'bg-green-500 text-white' : 'border-2 border-border text-muted-foreground'}`}>
              {s.done ? <Check size={14} /> : <Circle size={0} />}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${s.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
            {s.action && (
              <button onClick={s.action.onClick}
                className="shrink-0 px-3 min-h-[40px] rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition">
                {s.action.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
