import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function WeeklyHours() {
  const [hours, setHours] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [hoursRes, locRes] = await Promise.all([
      supabase.from('weekly_hours').select('*').order('day_of_week', { ascending: true }),
      supabase.from('locations').select('id, name').order('created_at', { ascending: true }),
    ])
    if (!hoursRes.error) setHours(hoursRes.data || [])
    if (!locRes.error) setLocations(locRes.data || [])
    setLoading(false)
  }

  // Save to DB — only called on blur or toggle/select change
  async function saveField(id, field, value) {
    setSavingId(id)
    const { error } = await supabase.from('weekly_hours').update({ [field]: value }).eq('id', id)
    if (error) {
      alert('Could not save: ' + error.message)
      fetchAll()
    }
    setSavingId(null)
  }

  // Local update only — doesn't hit DB
  function updateLocal(id, field, value) {
    setHours((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)))
  }

  // Toggle saves immediately (no typing involved)
  async function toggleOpen(h) {
    updateLocal(h.id, 'is_open', !h.is_open)
    await saveField(h.id, 'is_open', !h.is_open)
  }

  // Location select saves immediately (no typing involved)
  async function handleLocationChange(h, locationId) {
    const value = locationId === '' ? null : locationId
    updateLocal(h.id, 'location_id', value)
    await saveField(h.id, 'location_id', value)
  }

  if (loading) return <p className="text-neutral-500">Loading...</p>

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        Set the shop's regular weekly schedule. Assign a location to each open day so customers know where to go.
      </p>

      <div className="space-y-2">
        {hours.map((h) => (
          <div key={h.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="font-medium w-28 text-neutral-100 shrink-0">{DAY_NAMES[h.day_of_week]}</div>

              <button
                onClick={() => toggleOpen(h)}
                className={`relative w-10 h-5 rounded-full transition shrink-0 ${h.is_open ? 'bg-neutral-100' : 'bg-neutral-700'}`}
                aria-label="Toggle open"
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full transition ${h.is_open ? 'left-5 bg-black' : 'left-0.5 bg-neutral-300'}`} />
              </button>

              <div className={`flex items-center gap-2 flex-wrap flex-1 ${h.is_open ? '' : 'opacity-30 pointer-events-none'}`}>
                <input
                  type="time"
                  value={h.open_time?.slice(0, 5) || ''}
                  onChange={(e) => updateLocal(h.id, 'open_time', e.target.value)}
                  onBlur={(e) => saveField(h.id, 'open_time', e.target.value)}
                  className="px-2 py-1 rounded border border-neutral-800 bg-neutral-950 text-neutral-100"
                />
                <span className="text-sm text-neutral-500">to</span>
                <input
                  type="time"
                  value={h.close_time?.slice(0, 5) || ''}
                  onChange={(e) => updateLocal(h.id, 'close_time', e.target.value)}
                  onBlur={(e) => saveField(h.id, 'close_time', e.target.value)}
                  className="px-2 py-1 rounded border border-neutral-800 bg-neutral-950 text-neutral-100"
                />

                <select
                  value={h.location_id || ''}
                  onChange={(e) => handleLocationChange(h, e.target.value)}
                  className="px-2 py-1 rounded border border-neutral-800 bg-neutral-950 text-neutral-100 text-sm flex-1 min-w-[140px]"
                >
                  <option value="">No location set</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              {savingId === h.id && <span className="text-xs text-neutral-500 shrink-0">Saving...</span>}
            </div>
          </div>
        ))}
      </div>

      {locations.length === 0 && (
        <p className="text-xs text-neutral-500 mt-4">
          Add locations in the Locations tab to assign them to days.
        </p>
      )}
    </div>
  )
}
