import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import WeeklyHours from './WeeklyHours'
import BlocksEditor from './BlocksEditor'

export default function AvailabilityEditor() {
  const [section, setSection] = useState('weekly')

  return (
    <div>
      <div className="flex gap-2 mb-4 text-sm">
        <button
          onClick={() => setSection('weekly')}
          className={`px-3 py-1.5 rounded border ${
            section === 'weekly'
              ? 'bg-gray-100 border-gray-300 font-medium'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Weekly hours
        </button>
        <button
          onClick={() => setSection('blocks')}
          className={`px-3 py-1.5 rounded border ${
            section === 'blocks'
              ? 'bg-gray-100 border-gray-300 font-medium'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Day blocks
        </button>
      </div>

      {section === 'weekly' && <WeeklyHours />}
      {section === 'blocks' && <BlocksEditor />}
    </div>
  )
}