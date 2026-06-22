import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const mer = h < 12 ? 'AM' : 'PM'
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hr}:${String(m).padStart(2, '0')} ${mer}`
}

function formatDate(d) {
  const [y, mo, day] = d.split('-').map(Number)
  const date = new Date(y, mo - 1, day)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SpecialOpenings() {
  const [openings, setOpenings] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newOpening, setNewOpening] = useState({ date: todayStr(), start_time: '10:00', end_time: '14:00', note: '' })

  useEffect(() => { fetchOpenings() }, [])

  async function fetchOpenings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('availability_openings')
      .select('*')
      .gte('date', todayStr())
      .order('date', { ascending: true })
    if (!error) setOpenings(data || [])
    setLoading(false)
  }

  async function addOpening() {
    if (newOpening.start_time >= newOpening.end_time) { alert('End time must be after start time.'); return }
    const { data, error } = await supabase.from('availability_openings').insert({
      date: newOpening.date,
      start_time: newOpening.start_time,
      end_time: newOpening.end_time,
      note: newOpening.note.trim() || null,
    }).select().single()
    if (error) {
      if (error.code === '23505') alert('A special opening already exists for that date. Delete the existing one first.')
      else alert('Could not add: ' + error.message)
    } else {
      setOpenings((prev) => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
      setNewOpening({ date: todayStr(), start_time: '10:00', end_time: '14:00', note: '' })
      setAdding(false)
    }
  }

  async function deleteOpening(id) {
    const { error } = await supabase.from('availability_openings').delete().eq('id', id)
    if (error) alert('Could not delete: ' + error.message)
    else setOpenings((prev) => prev.filter((o) => o.id !== id))
  }

  const inputClass = 'px-2 py-1 rounded border border-neutral-800 bg-neutral-950 text-neutral-100'

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        Open the shop on a day that's normally closed. Customers will be able to book during the hours you set.
        One opening per date.
      </p>

      {loading ? <p className="text-neutral-500">Loading...</p> : (
        <>
          {openings.length === 0 && !adding && (
            <p className="text-neutral-500 py-6 text-center bg-neutral-950 border border-neutral-800 rounded-lg mb-3">
              No special openings scheduled.
            </p>
          )}

          <div className="space-y-2 mb-3">
            {openings.map((o) => (
              <div key={o.id} className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-lg p-3">
                <span className="text-xs font-medium px-2 py-1 rounded border border-emerald-800 bg-emerald-950 text-emerald-300">
                  Open
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-neutral-200">{formatDate(o.date)}</span>
                  <span className="text-sm text-neutral-400 ml-2">{formatTime(o.start_time)} – {formatTime(o.end_time)}</span>
                  {o.note && <span className="text-sm text-neutral-500 italic ml-2">{o.note}</span>}
                </div>
                <button onClick={() => deleteOpening(o.id)} className="text-red-400 hover:bg-red-950 px-2 py-1 rounded text-sm">×</button>
              </div>
            ))}
          </div>

          {adding ? (
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
              <div className="flex flex-wrap items-end gap-2 mb-3">
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">Date</label>
                  <input
                    type="date"
                    value={newOpening.date}
                    onChange={(e) => setNewOpening({ ...newOpening, date: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">From</label>
                  <input
                    type="time"
                    value={newOpening.start_time}
                    onChange={(e) => setNewOpening({ ...newOpening, start_time: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">To</label>
                  <input
                    type="time"
                    value={newOpening.end_time}
                    onChange={(e) => setNewOpening({ ...newOpening, end_time: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="text-xs text-neutral-500 block mb-1">Note (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Holiday hours"
                    value={newOpening.note}
                    onChange={(e) => setNewOpening({ ...newOpening, note: e.target.value })}
                    className={inputClass + ' w-full'}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addOpening} className="px-4 py-1.5 text-sm bg-neutral-100 text-black rounded hover:bg-white">Add</button>
                <button onClick={() => setAdding(false)} className="px-4 py-1.5 text-sm border border-neutral-800 rounded hover:bg-neutral-900 text-neutral-300">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="px-4 py-2 text-sm bg-neutral-100 text-black rounded-lg hover:bg-white">
              + Add special opening
            </button>
          )}
        </>
      )}
    </div>
  )
}
