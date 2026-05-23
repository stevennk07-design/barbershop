import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function ServicePicker({ selectedService, onSelect }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true })

      if (error) setError(error.message)
      else setServices(data)
      setLoading(false)
    }
    fetchServices()
  }, [])

  if (loading) return <p className="text-neutral-500">Loading services...</p>
  if (error) return <p className="text-red-400">Error: {error}</p>

  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-3">
        Choose a service
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {services.map((s) => {
          const isSelected = selectedService?.id === s.id
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`text-left p-4 rounded-lg border transition ${
                isSelected
                  ? 'border-neutral-100 bg-neutral-900'
                  : 'border-neutral-800 bg-neutral-950 hover:border-neutral-600'
              }`}
            >
              <div className="font-medium text-neutral-100">{s.name}</div>
              <div className="text-sm text-neutral-500">{s.duration_minutes} min</div>
              <div className="text-lg font-medium mt-2 text-neutral-100">${s.price}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}