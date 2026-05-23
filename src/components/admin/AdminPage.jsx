import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import AdminLogin from './AdminLogin'
import AppointmentsView from './AppointmentsView'
import ServicesEditor from './ServicesEditor'
import AvailabilityEditor from './AvailabilityEditor'
export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('appointments')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!session) return <AdminLogin />

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marco's Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Signed in as {session.user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            Sign out
          </button>
        </header>

        <TabBar active={activeTab} onChange={setActiveTab} />
        {activeTab === 'appointments' && <AppointmentsView />}
        {activeTab === 'availability' && <AvailabilityEditor />}
     {activeTab === 'services' && <ServicesEditor />}
      </div>
    </div>
  )
}

function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'appointments', label: 'Appointments' },
    { id: 'availability', label: 'Availability' },
    { id: 'services', label: 'Services & pricing' },
  ]
  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-2 text-sm font-medium rounded-lg border transition ${
            active === t.id
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}