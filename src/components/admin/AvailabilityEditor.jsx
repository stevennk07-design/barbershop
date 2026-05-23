import { useState } from 'react'
import WeeklyHours from './WeeklyHours'
import BlocksEditor from './BlocksEditor'

export default function AvailabilityEditor() {
  const [section, setSection] = useState('weekly')

  return (
    <div>
      <div className="flex gap-2 mb-4 text-sm">
        <button
          onClick={() => setSection('weekly')}
          className={
            section === 'weekly'
              ? 'px-3 py-1.5 rounded border bg-neutral-100 border-neutral-100 font-medium text-black'
              : 'px-3 py-1.5 rounded border bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-900'
          }
        >
          Weekly hours
        </button>
        <button
          onClick={() => setSection('blocks')}
          className={
            section === 'blocks'
              ? 'px-3 py-1.5 rounded border bg-neutral-100 border-neutral-100 font-medium text-black'
              : 'px-3 py-1.5 rounded border bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-900'
          }
        >
          Day blocks
        </button>
      </div>

      {section === 'weekly' && <WeeklyHours />}
      {section === 'blocks' && <BlocksEditor />}
    </div>
  )
}