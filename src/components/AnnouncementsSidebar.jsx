import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AnnouncementsSidebar() {
  const [announcements, setAnnouncements] = useState([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setAnnouncements(data || [])
        setLoaded(true)
      })
  }, [])

  if (!loaded || announcements.length === 0) return null

  const items = announcements.map((a) => (
    <div key={a.id} className="pb-3 mb-3 border-b border-neutral-800 last:border-0 last:mb-0 last:pb-0">
      {a.pinned && (
        <span className="text-xs font-medium text-amber-400 block mb-0.5">Pinned</span>
      )}
      <p className="text-sm font-medium text-neutral-100">{a.title}</p>
      {a.body && <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{a.body}</p>}
      <p className="text-xs text-neutral-600 mt-1">{formatDate(a.created_at)}</p>
    </div>
  ))

  return (
    <>
      {/* Desktop: left sidebar */}
      <div className="hidden md:flex flex-col w-56 shrink-0 border-r border-neutral-800 p-4 sticky top-0 max-h-screen overflow-y-auto">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
          Announcements
        </h3>
        {items}
      </div>

      {/* Mobile: collapsible top banner */}
      <div className="md:hidden border-b border-neutral-800">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-neutral-950"
        >
          <span className="font-medium text-neutral-300">
            Announcements
            <span className="ml-1.5 text-xs text-neutral-500">({announcements.length})</span>
          </span>
          <span className="text-neutral-600 text-xs">{mobileOpen ? '▲' : '▼'}</span>
        </button>
        {mobileOpen && (
          <div className="px-4 pb-4 bg-neutral-950">
            {items}
          </div>
        )}
      </div>
    </>
  )
}
