import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function WeeklyHours() {
  const [hours, setHours] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)

  useEffect(() => {
    fetchHours()
  }, [])

  async function fetchHours() {
    setLoading(true)
    const { data, error } = await supabase
      .from('weekly_hours')
      .select('*')
      .order('day_of_week', { ascending: true })

    if (!error) setHours(data || [])
    setLoading(false)
  }

  async function updateField(id, field, value) {
    setSavingId(id)
    setHours((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)))
    const { error } = await supabase.from('weekly_hours').update({ [field]: value }).eq('id', id)
    if (error) {
      alert('Could not save: ' + error.message)
      fetchHours()
    }
    setSavingId(null)
  }

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Set the shop's regular weekly schedule. Customers will only be able to book within these hours.
      </p>

      <div className="space-y-2">
        {hours.map((h) => (
          <div
            key={h.id}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3"
          >
            <div className="font-medium w-28">{DAY_NAMES[h.day_of_week]}</div>

            <button
              onClick={() => updateField(h.id, 'is_open', !h.is_open)}
              className={`relative w-10 h-5 rounded-full transition ${
                h.is_open ? 'bg-gray-900' : 'bg-gray-300'
              }`}
              aria-label="Toggle open"
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${
                  h.is_open ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>

            <div className={`flex items-center gap-2 flex-1 ${h.is_open ? '' : 'opacity-30 pointer-events-none'}`}>
              <input
                type="time"
                value={h.open_time?.slice(0, 5) || ''}
                onChange={(e) => updateField(h.id, 'open_time', e.target.value)}
                className="px-2 py-1 rounded border border-gray-200"
              />
              <span className="text-sm text-gray-500">to</span>
              <input
                type="time"
                value={h.close_time?.slice(0, 5) || ''}
                onChange={(e) => updateField(h.id, 'close_time', e.target.value)}
                className="px-2 py-1 rounded border border-gray-200"
              />
            </div>

            {savingId === h.id && <span className="text-xs text-gray-400">Saving...</span>}
          </div>
        ))}
      </div>
    </div>
  )
}