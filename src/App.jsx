import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
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

      if (error) {
        setError(error.message)
      } else {
        setServices(data)
      }
      setLoading(false)
    }

    fetchServices()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Barbershop App</h1>

        {loading && <p className="text-gray-600">Loading services...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}

        <div className="grid grid-cols-2 gap-4">
          {services.map((s) => (
            <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="font-medium text-gray-900">{s.name}</div>
              <div className="text-sm text-gray-500">{s.duration_minutes} min</div>
              <div className="text-lg font-medium mt-2">${s.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App