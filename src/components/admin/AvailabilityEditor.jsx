import { useState } from 'react'
import WeeklyHours from './WeeklyHours'
import BlocksEditor from './BlocksEditor'
import SpecialOpenings from './SpecialOpenings'

export default function AvailabilityEditor() {
  const [section, setSection] = useState('weekly')

  const tabs = [
    { id: 'weekly', label: 'Weekly hours' },
    { id: 'blocks', label: 'Day blocks' },
    { id: 'openings', label: 'Special openings' },
  ]

  return (
    <div>
      <div className="flex gap-2 mb-4 text-sm flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSection(t.id)}
            className={
              section === t.id
                ? 'px-3 py-1.5 rounded border bg-neutral-100 border-neutral-100 font-medium text-black'
                : 'px-3 py-1.5 rounded border bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-900'
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {section === 'weekly' && <WeeklyHours />}
      {section === 'blocks' && <BlocksEditor />}
      {section === 'openings' && <SpecialOpenings />}
    </div>
  )
}
