import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

const BLOCK_TYPES = [
  { value: 'break', label: 'Break', color: 'bg-amber-950 text-amber-300 border-amber-800' },
  { value: 'busy', label: 'Unavailable', color: 'bg-red-950 text-red-300 border-red-800' },
  { value: 'errand', label: 'Errand', color: 'bg-blue-950 text-blue-300 border-blue-800' },
]

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

export default function OneOffBlocks() {
  const [date, setDate] = useState(todayStr())
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newBlock, setNewBlock] = useState({ block_type: 'break', start_time: '12:00', end_time: '13:00', note: '' })

  useEffect(() => {
    fetchBlocks()
  }, [date])

  async function fetchBlocks() {
    setLoading(true)
    const { data, error } = await supabase
      .from('availability_blocks').select('*').eq('date', date).order('start_time', { ascending: true })
    if (!error) setBlocks(data || [])
    setLoading(false)
  }

  async function addBlock() {
    if (newBlock.start_time >= newBlock.end_time) { alert('End time must be after start time.'); return }
    const { data, error } = await supabase.from('availability_blocks').insert({
      date, block_type: newBlock.block_type, start_time: newBlock.start_time, end_time: newBlock.end_time,
      note: newBlock.note.trim() || null,
    }).select().single()
    if (error) alert('Could not add: ' + error.message)
    else {
      setBlocks((prev) => [...prev, data].sort((a, b) => a.start_time.localeCompare(b.start_time)))
      setNewBlock({ block_type: 'break', start_time: '12:00', end_time: '13:00', note: '' })
      setAdding(false)
    }
  }

  async function deleteBlock(id) {
    const { error } = await supabase.from('availability_blocks').delete().eq('id', id)
    if (error) alert('Could not delete: ' + error.message)
    else setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  const inputClass = "px-2 py-1 rounded border border-neutral-800 bg-neutral-950 text-neutral-100"

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium text-neutral-300">Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100" />
      </div>

      {loading ? <p className="text-neutral-500">Loading...</p> : (
        <>
          {blocks.length === 0 && !adding && (
            <p className="text-neutral-500 py-6 text-center bg-neutral-950 border border-neutral-800 rounded-lg mb-3">
              No one-off blocks for this date.
            </p>
          )}

          <div className="space-y-2 mb-3">
            {blocks.map((b) => {
              const type = BLOCK_TYPES.find((t) => t.value === b.block_type)
              return (
                <div key={b.id} className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-lg p-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded border ${type.color}`}>{type.label}</span>
                  <span className="text-sm font-medium text-neutral-200">{formatTime(b.start_time)} – {formatTime(b.end_time)}</span>
                  {b.note && <span className="text-sm text-neutral-500 italic flex-1">{b.note}</span>}
                  {!b.note && <span className="flex-1"></span>}
                  <button onClick={() => deleteBlock(b.id)} className="text-red-400 hover:bg-red-950 px-2 py-1 rounded text-sm">×</button>
                </div>
              )
            })}
          </div>

          {adding ? (
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
              <div className="flex flex-wrap items-end gap-2 mb-3">
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">Type</label>
                  <select value={newBlock.block_type} onChange={(e) => setNewBlock({ ...newBlock, block_type: e.target.value })} className={inputClass + ' py-1.5'}>
                    {BLOCK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">From</label>
                  <input type="time" value={newBlock.start_time} onChange={(e) => setNewBlock({ ...newBlock, start_time: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">To</label>
                  <input type="time" value={newBlock.end_time} onChange={(e) => setNewBlock({ ...newBlock, end_time: e.target.value })} className={inputClass} />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="text-xs text-neutral-500 block mb-1">Note (optional)</label>
                  <input type="text" placeholder="e.g. Lunch" value={newBlock.note} onChange={(e) => setNewBlock({ ...newBlock, note: e.target.value })} className={inputClass + ' w-full'} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addBlock} className="px-4 py-1.5 text-sm bg-neutral-100 text-black rounded hover:bg-white">Add</button>
                <button onClick={() => setAdding(false)} className="px-4 py-1.5 text-sm border border-neutral-800 rounded hover:bg-neutral-900 text-neutral-300">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="px-4 py-2 text-sm bg-neutral-100 text-black rounded-lg hover:bg-white">+ Add one-off block</button>
          )}
        </>
      )}
    </div>
  )
}