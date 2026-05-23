import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function ServicesEditor() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newService, setNewService] = useState({ name: '', duration_minutes: 30, price: 30 })

  useEffect(() => { fetchServices() }, [])

  async function fetchServices() {
    setLoading(true)
    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setServices(data || [])
    setLoading(false)
  }

  async function updateField(id, field, value) {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
    const { error } = await supabase.from('services').update({ [field]: value }).eq('id', id)
    if (error) { alert('Could not save: ' + error.message); fetchServices() }
  }

  async function toggleActive(s) { await updateField(s.id, 'active', !s.active) }

  async function deleteService(id) {
    if (!confirm('Delete this service? If it has past appointments, toggle Hidden instead.')) return
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) alert('Could not delete: ' + error.message + '\n\nTip: if this service has past appointments, toggle it Hidden instead.')
    else setServices((prev) => prev.filter((s) => s.id !== id))
  }

  async function addService() {
    if (!newService.name.trim()) { alert('Please enter a service name'); return }
    const { data, error } = await supabase.from('services').insert({
      name: newService.name.trim(), duration_minutes: Number(newService.duration_minutes),
      price: Number(newService.price), active: true,
    }).select().single()
    if (error) alert('Could not add: ' + error.message)
    else {
      setServices((prev) => [...prev, data])
      setNewService({ name: '', duration_minutes: 30, price: 30 })
      setAdding(false)
    }
  }

  if (loading) return <p className="text-neutral-500">Loading services...</p>
  if (error) return <p className="text-red-400">Error: {error}</p>

  const inputClass = "px-2 py-1 rounded border border-neutral-800 bg-neutral-950 text-neutral-100"

  return (
    <div>
      <div className="space-y-2 mb-4">
        {services.map((s) => (
          <div key={s.id} className={`flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-lg p-3 ${!s.active ? 'opacity-50' : ''}`}>
            <input
              type="text" value={s.name}
              onChange={(e) => setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)))}
              onBlur={(e) => updateField(s.id, 'name', e.target.value)}
              className="flex-1 px-2 py-1 rounded border border-transparent hover:border-neutral-800 focus:border-neutral-600 focus:outline-none font-medium bg-transparent text-neutral-100"
            />
            <div className="text-right">
              <label className="text-xs text-neutral-500 block">Price</label>
              <input type="number" value={s.price}
                onChange={(e) => setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, price: e.target.value } : x)))}
                onBlur={(e) => updateField(s.id, 'price', Number(e.target.value))}
                className={inputClass + ' w-20 text-right'} />
            </div>
            <div className="text-right">
              <label className="text-xs text-neutral-500 block">Minutes</label>
              <input type="number" value={s.duration_minutes}
                onChange={(e) => setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, duration_minutes: e.target.value } : x)))}
                onBlur={(e) => updateField(s.id, 'duration_minutes', Number(e.target.value))}
                className={inputClass + ' w-20 text-right'} />
            </div>
            <button onClick={() => toggleActive(s)} className="text-xs px-2 py-1 rounded border border-neutral-800 hover:bg-neutral-900 text-neutral-300">
              {s.active ? 'Active' : 'Hidden'}
            </button>
            <button onClick={() => deleteService(s.id)} className="text-red-400 hover:bg-red-950 px-2 py-1 rounded text-sm">×</button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 mb-2">
          <div className="flex items-center gap-3">
            <input type="text" placeholder="Service name" value={newService.name} autoFocus
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              className={inputClass + ' flex-1'} />
            <div className="text-right">
              <label className="text-xs text-neutral-500 block">Price</label>
              <input type="number" value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                className={inputClass + ' w-20 text-right'} />
            </div>
            <div className="text-right">
              <label className="text-xs text-neutral-500 block">Minutes</label>
              <input type="number" value={newService.duration_minutes}
                onChange={(e) => setNewService({ ...newService, duration_minutes: e.target.value })}
                className={inputClass + ' w-20 text-right'} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addService} className="px-4 py-1.5 text-sm bg-neutral-100 text-black rounded hover:bg-white">Add</button>
            <button onClick={() => { setAdding(false); setNewService({ name: '', duration_minutes: 30, price: 30 }) }}
              className="px-4 py-1.5 text-sm border border-neutral-800 rounded hover:bg-neutral-900 text-neutral-300">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="px-4 py-2 text-sm bg-neutral-100 text-black rounded-lg hover:bg-white">+ Add service</button>
      )}

      <p className="text-xs text-neutral-500 mt-4">
        Tip: changes save automatically when you click out of a field. Use "Hidden" to remove a service from the booking page without deleting it.
      </p>
    </div>
  )
}