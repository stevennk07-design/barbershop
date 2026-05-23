import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import AdminLogin from './AdminLogin'
import AppointmentsView from './AppointmentsView'
import AvailabilityEditor from './AvailabilityEditor'
import ServicesEditor from './ServicesEditor'

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-neutral-500">Loading...</p>
      </div>
    )
  }

  if (!session) return <AdminLogin />

  return (
    <div className="min-h-screen bg-black text-neutral-100 p-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Matanza Cutz · Admin</h1>
            <p className="text-sm text-neutral-500 mt-1">Signed in as {session.user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm border border-neutral-800 rounded-lg hover:bg-neutral-900 text-neutral-300"
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
              ? 'bg-neutral-100 text-black border-neutral-100'
              : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-900'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}