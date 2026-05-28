import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function LocationsEditor() {
  return (
    <div className="space-y-10">
      <LocationsList />
      <DateOverrides />
    </div>
  )
}

// ─── Locations list ───────────────────────────────────────────────────────────

function LocationsList() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // editingId: which location row is open for editing (null = none)
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState({ name: '', address: '' })
  const [saving, setSaving] = useState(false)
  // adding: whether the new-location form is visible
  const [adding, setAdding] = useState(false)
  const [newLoc, setNewLoc] = useState({ name: '', address: '' })
  const [addSaving, setAddSaving] = useState(false)

  useEffect(() => { fetchLocations() }, [])

  async function fetchLocations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setLocations(data || [])
    setLoading(false)
  }

  function startEdit(loc) {
    setEditingId(loc.id)
    setEditDraft({ name: loc.name, address: loc.address || '' })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditDraft({ name: '', address: '' })
  }

  async function saveEdit() {
    if (!editDraft.name.trim()) { alert('Location name cannot be empty'); return }
    setSaving(true)
    const { error } = await supabase
      .from('locations')
      .update({ name: editDraft.name.trim(), address: editDraft.address.trim() || null })
      .eq('id', editingId)
    if (error) {
      alert('Could not save: ' + error.message)
    } else {
      setLocations((prev) =>
        prev.map((l) =>
          l.id === editingId
            ? { ...l, name: editDraft.name.trim(), address: editDraft.address.trim() || null }
            : l
        )
      )
      setEditingId(null)
    }
    setSaving(false)
  }

  async function deleteLocation(loc) {
    if (!confirm(`Delete "${loc.name}"?\n\nIf any past appointments reference this location the delete will fail — rename it instead.`)) return
    const { error } = await supabase.from('locations').delete().eq('id', loc.id)
    if (error) alert('Could not delete: ' + error.message + '\n\nTip: rename the location instead of deleting if it has past appointments.')
    else {
      setLocations((prev) => prev.filter((l) => l.id !== loc.id))
      if (editingId === loc.id) cancelEdit()
    }
  }

  async function addLocation() {
    if (!newLoc.name.trim()) { alert('Please enter a location name'); return }
    setAddSaving(true)
    const { data, error } = await supabase
      .from('locations')
      .insert({ name: newLoc.name.trim(), address: newLoc.address.trim() || null })
      .select()
      .single()
    if (error) {
      alert('Could not add: ' + error.message)
    } else {
      setLocations((prev) => [...prev, data])
      setNewLoc({ name: '', address: '' })
      setAdding(false)
    }
    setAddSaving(false)
  }

  if (loading) return <p className="text-neutral-500">Loading locations...</p>
  if (error) return <p className="text-red-400">Error: {error}</p>

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 focus:border-neutral-500 focus:outline-none'

  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-1">Locations</h2>
      <p className="text-sm text-neutral-500 mb-4">
        Add as many locations as you need. Assign them to days of the week in the Availability tab.
      </p>

      <div className="space-y-2 mb-4">
        {locations.length === 0 && !adding && (
          <p className="text-neutral-500 text-sm py-6 text-center border border-neutral-800 rounded-lg">
            No locations yet — add your first one below.
          </p>
        )}

        {locations.map((loc) => {
          const isEditing = editingId === loc.id

          if (isEditing) {
            // ── Edit mode ──
            return (
              <div key={loc.id} className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
                <div className="mb-3">
                  <label className="text-xs text-neutral-400 block mb-1">Location name</label>
                  <input
                    type="text"
                    value={editDraft.name}
                    autoFocus
                    onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
                    className={inputClass}
                  />
                </div>
                <div className="mb-4">
                  <label className="text-xs text-neutral-400 block mb-1">Address <span className="text-neutral-600">(optional)</span></label>
                  <input
                    type="text"
                    value={editDraft.address}
                    placeholder="e.g. 123 Main St, Brooklyn NY"
                    onChange={(e) => setEditDraft((d) => ({ ...d, address: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
                    className={inputClass}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="px-4 py-1.5 text-sm bg-neutral-100 text-black rounded hover:bg-white disabled:opacity-40"
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="px-4 py-1.5 text-sm border border-neutral-700 rounded hover:bg-neutral-800 text-neutral-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          }

          // ── Display mode ──
          return (
            <div key={loc.id} className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-lg p-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-neutral-100">{loc.name}</div>
                {loc.address
                  ? <div className="text-sm text-neutral-500 mt-0.5">📍 {loc.address}</div>
                  : <div className="text-sm text-neutral-700 mt-0.5">No address set</div>
                }
              </div>
              <button
                onClick={() => startEdit(loc)}
                className="px-3 py-1.5 text-sm border border-neutral-700 rounded hover:bg-neutral-800 text-neutral-300 shrink-0"
              >
                Edit
              </button>
              <button
                onClick={() => deleteLocation(loc)}
                className="text-red-400 hover:bg-red-950 px-2 py-1.5 rounded text-sm border border-transparent hover:border-red-900 shrink-0"
                title="Delete location"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>

      {/* Add new location */}
      {adding ? (
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 mb-2">
          <div className="mb-3">
            <label className="text-xs text-neutral-400 block mb-1">Location name</label>
            <input
              type="text"
              placeholder="e.g. Main St Shop"
              value={newLoc.name}
              autoFocus
              onChange={(e) => setNewLoc((n) => ({ ...n, name: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') addLocation(); if (e.key === 'Escape') { setAdding(false); setNewLoc({ name: '', address: '' }) } }}
              className={inputClass}
            />
          </div>
          <div className="mb-4">
            <label className="text-xs text-neutral-400 block mb-1">Address <span className="text-neutral-600">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. 123 Main St, Brooklyn NY"
              value={newLoc.address}
              onChange={(e) => setNewLoc((n) => ({ ...n, address: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') addLocation(); if (e.key === 'Escape') { setAdding(false); setNewLoc({ name: '', address: '' }) } }}
              className={inputClass}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addLocation}
              disabled={addSaving}
              className="px-4 py-1.5 text-sm bg-neutral-100 text-black rounded hover:bg-white disabled:opacity-40"
            >
              {addSaving ? 'Adding…' : 'Add location'}
            </button>
            <button
              onClick={() => { setAdding(false); setNewLoc({ name: '', address: '' }) }}
              className="px-4 py-1.5 text-sm border border-neutral-700 rounded hover:bg-neutral-800 text-neutral-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="px-4 py-2 text-sm bg-neutral-100 text-black rounded-lg hover:bg-white"
        >
          + Add location
        </button>
      )}
    </div>
  )
}

// ─── Date overrides ───────────────────────────────────────────────────────────

function DateOverrides() {
  const [overrides, setOverrides] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newOverride, setNewOverride] = useState({ date: '', location_id: '' })
  const [addSaving, setAddSaving] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [ovRes, locRes] = await Promise.all([
      supabase
        .from('location_overrides')
        .select('*, locations(id, name)')
        .order('date', { ascending: true }),
      supabase.from('locations').select('id, name').order('created_at', { ascending: true }),
    ])
    if (!ovRes.error) setOverrides(ovRes.data || [])
    if (!locRes.error) setLocations(locRes.data || [])
    setLoading(false)
  }

  async function deleteOverride(id) {
    const { error } = await supabase.from('location_overrides').delete().eq('id', id)
    if (error) alert('Could not delete: ' + error.message)
    else setOverrides((prev) => prev.filter((o) => o.id !== id))
  }

  async function addOverride() {
    if (!newOverride.date) { alert('Please pick a date'); return }
    if (!newOverride.location_id) { alert('Please pick a location'); return }
    setAddSaving(true)
    const { data, error } = await supabase
      .from('location_overrides')
      .upsert({ date: newOverride.date, location_id: newOverride.location_id }, { onConflict: 'date' })
      .select('*, locations(id, name)')
      .single()
    if (error) {
      alert('Could not save: ' + error.message)
    } else {
      setOverrides((prev) => {
        const filtered = prev.filter((o) => o.date !== data.date)
        return [...filtered, data].sort((a, b) => a.date.localeCompare(b.date))
      })
      setNewOverride({ date: '', location_id: '' })
      setAdding(false)
    }
    setAddSaving(false)
  }

  function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const dow = new Date(y, m - 1, d).getDay()
    return `${days[dow]}, ${months[m - 1]} ${d}, ${y}`
  }

  if (loading) return null

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 focus:border-neutral-500 focus:outline-none'

  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-1">Date overrides</h2>
      <p className="text-sm text-neutral-500 mb-4">
        Override which location you're at on a specific date — this takes priority over the weekly schedule.
      </p>

      <div className="space-y-2 mb-4">
        {overrides.length === 0 && !adding && (
          <p className="text-neutral-500 text-sm py-6 text-center border border-neutral-800 rounded-lg">
            No date overrides set.
          </p>
        )}

        {overrides.map((o) => (
          <div key={o.id} className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-lg p-4">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-neutral-100">{formatDate(o.date)}</div>
              <div className="text-xs text-neutral-500 mt-0.5">📍 {o.locations?.name || '—'}</div>
            </div>
            <button
              onClick={() => deleteOverride(o.id)}
              className="text-red-400 hover:bg-red-950 px-2 py-1.5 rounded text-sm border border-transparent hover:border-red-900 shrink-0"
              title="Remove override"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 mb-2">
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="text-xs text-neutral-400 block mb-1">Date</label>
              <input
                type="date"
                value={newOverride.date}
                onChange={(e) => setNewOverride((n) => ({ ...n, date: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-neutral-400 block mb-1">Location</label>
              <select
                value={newOverride.location_id}
                onChange={(e) => setNewOverride((n) => ({ ...n, location_id: e.target.value }))}
                className={inputClass}
              >
                <option value="">Pick a location…</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addOverride}
              disabled={addSaving}
              className="px-4 py-1.5 text-sm bg-neutral-100 text-black rounded hover:bg-white disabled:opacity-40"
            >
              {addSaving ? 'Saving…' : 'Save override'}
            </button>
            <button
              onClick={() => { setAdding(false); setNewOverride({ date: '', location_id: '' }) }}
              className="px-4 py-1.5 text-sm border border-neutral-700 rounded hover:bg-neutral-800 text-neutral-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          disabled={locations.length === 0}
          className="px-4 py-2 text-sm bg-neutral-100 text-black rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          + Add date override
        </button>
      )}

      {locations.length === 0 && (
        <p className="text-xs text-neutral-500 mt-2">Add locations above before creating overrides.</p>
      )}
    </div>
  )
}
