import { useState } from 'react'
import OneOffBlocks from './OneOffBlocks'
import RecurringBlocks from './RecurringBlocks'

export default function BlocksEditor() {
  const [section, setSection] = useState('recurring')

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        Set times when you're not available. <strong className="text-neutral-300">Recurring</strong> blocks repeat every week (e.g. lunch every Monday). <strong className="text-neutral-300">One-off</strong> blocks apply to a single date only.
      </p>

      <div className="flex gap-2 mb-4 text-sm">
        <button
          onClick={() => setSection('recurring')}
          className={
            section === 'recurring'
              ? 'px-3 py-1.5 rounded border bg-neutral-100 border-neutral-100 font-medium text-black'
              : 'px-3 py-1.5 rounded border bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-900'
          }
        >
          Recurring (weekly)
        </button>
        <button
          onClick={() => setSection('oneoff')}
          className={
            section === 'oneoff'
              ? 'px-3 py-1.5 rounded border bg-neutral-100 border-neutral-100 font-medium text-black'
              : 'px-3 py-1.5 rounded border bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-900'
          }
        >
          One-off (specific date)
        </button>
      </div>

      {section === 'recurring' && <RecurringBlocks />}
      {section === 'oneoff' && <OneOffBlocks />}
    </div>
  )
}