import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function ServicesEditor() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newService, setNewService] = useState({ name: '', duration_minutes: 30, price: 30 })

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    setLoading(true)
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) setError(error.message)
    else setServices(data || [])
    setLoading(false)
  }

  async function updateField(id, field, value) {
    // Optimistic update — change local state immediately, then save
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
    const { error } = await supabase.from('services').update({ [field]: value }).eq('id', id)
    if (error) {
      alert('Could not save: ' + error.message)
      fetchServices() // reload to revert
    }
  }

  async function toggleActive(s) {
    await updateField(s.id, 'active', !s.active)
  }

  async function deleteService(id) {
    if (!confirm('Delete this service? Existing appointments will keep their reference, but it won\'t be bookable anymore.')) return
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) {
      alert('Could not delete: ' + error.message + '\n\nTip: if this service has past appointments, try toggling it inactive instead.')
    } else {
      setServices((prev) => prev.filter((s) => s.id !== id))
    }
  }

  async function addService() {
    if (!newService.name.trim()) {
      alert('Please enter a service name')
      return
    }
    const { data, error } = await supabase
      .from('services')
      .insert({
        name: newService.name.trim(),
        duration_minutes: Number(newService.duration_minutes),
        price: Number(newService.price),
        active: true,
      })
      .select()
      .single()

    if (error) {
      alert('Could not add: ' + error.message)
    } else {
      setServices((prev) => [...prev, data])
      setNewService({ name: '', duration_minutes: 30, price: 30 })
      setAdding(false)
    }
  }

  if (loading) return <p className="text-gray-500">Loading services...</p>
  if (error) return <p className="text-red-600">Error: {error}</p>

  return (
    <div>
      <div className="space-y-2 mb-4">
        {services.map((s) => (
          <div
            key={s.id}
            className={`flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 ${
              !s.active ? 'opacity-50' : ''
            }`}
          >
            <input
              type="text"
              value={s.name}
              onChange={(e) =>
                setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)))
              }
              onBlur={(e) => updateField(s.id, 'name', e.target.value)}
              className="flex-1 px-2 py-1 rounded border border-transparent hover:border-gray-200 focus:border-gray-400 focus:outline-none font-medium"
            />
            <div className="text-right">
              <label className="text-xs text-gray-500 block">Price</label>
              <input
                type="number"
                value={s.price}
                onChange={(e) =>
                  setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, price: e.target.value } : x)))
                }
                onBlur={(e) => updateField(s.id, 'price', Number(e.target.value))}
                className="w-20 px-2 py-1 text-right rounded border border-gray-200"
              />
            </div>
            <div className="text-right">
              <label className="text-xs text-gray-500 block">Minutes</label>
              <input
                type="number"
                value={s.duration_minutes}
                onChange={(e) =>
                  setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, duration_minutes: e.target.value } : x)))
                }
                onBlur={(e) => updateField(s.id, 'duration_minutes', Number(e.target.value))}
                className="w-20 px-2 py-1 text-right rounded border border-gray-200"
              />
            </div>
            <button
              onClick={() => toggleActive(s)}
              className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100"
              title={s.active ? 'Hide from customers' : 'Show to customers'}
            >
              {s.active ? 'Active' : 'Hidden'}
            </button>
            <button
              onClick={() => deleteService(s.id)}
              className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-sm"
              title="Delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Service name"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              autoFocus
              className="flex-1 px-2 py-1 rounded border border-gray-200"
            />
            <div className="text-right">
              <label className="text-xs text-gray-500 block">Price</label>
              <input
                type="number"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                className="w-20 px-2 py-1 text-right rounded border border-gray-200"
              />
            </div>
            <div className="text-right">
              <label className="text-xs text-gray-500 block">Minutes</label>
              <input
                type="number"
                value={newService.duration_minutes}
                onChange={(e) => setNewService({ ...newService, duration_minutes: e.target.value })}
                className="w-20 px-2 py-1 text-right rounded border border-gray-200"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={addService}
              className="px-4 py-1.5 text-sm bg-gray-900 text-white rounded hover:opacity-90"
            >
              Add
            </button>
            <button
              onClick={() => {
                setAdding(false)
                setNewService({ name: '', duration_minutes: 30, price: 30 })
              }}
              className="px-4 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:opacity-90"
        >
          + Add service
        </button>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Tip: changes save automatically when you click out of a field. Use "Hidden" to remove a service from the booking page without deleting it.
      </p>
    </div>
  )
}