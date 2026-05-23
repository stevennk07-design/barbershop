import { useState } from 'react'
import OneOffBlocks from './OneOffBlocks'
import RecurringBlocks from './RecurringBlocks'

export default function BlocksEditor() {
  const [section, setSection] = useState('recurring')

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Set times when you're not available. <strong>Recurring</strong> blocks repeat every week (e.g. lunch every Monday). <strong>One-off</strong> blocks apply to a single date only.
      </p>

      <div className="flex gap-2 mb-4 text-sm">
        <button
          onClick={() => setSection('recurring')}
          className={`px-3 py-1.5 rounded border ${
            section === 'recurring'
              ? 'bg-gray-100 border-gray-300 font-medium'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Recurring (weekly)
        </button>
        <button
          onClick={() => setSection('oneoff')}
          className={`px-3 py-1.5 rounded border ${
            section === 'oneoff'
              ? 'bg-gray-100 border-gray-300 font-medium'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          One-off (specific date)
        </button>
      </div>

      {section === 'recurring' && <RecurringBlocks />}
      {section === 'oneoff' && <OneOffBlocks />}
    </div>
  )
}