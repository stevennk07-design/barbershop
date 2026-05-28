import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const mer = h < 12 ? 'AM' : 'PM'
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hr}:${String(m).padStart(2, '0')} ${mer}`
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function nowTimeStr() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const STATUS_BADGES = {
  confirmed: { label: 'Confirmed', class: 'bg-blue-950 text-blue-300 border-blue-800' },
  completed: { label: 'Showed up', class: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
  no_show:   { label: 'No show',   class: 'bg-red-950 text-red-300 border-red-800' },
}

export default function AppointmentsView() {
  const [view, setView] = useState('upcoming')
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAppts()
    const interval = setInterval(fetchAppts, 30000)
    return () => clearInterval(interval)
  }, [view])

  async function fetchAppts() {
    setLoading(true)
    setError(null)

    const today = todayStr()
    const now = nowTimeStr()

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id, customer_name, customer_phone, customer_email,
        appointment_date, start_time, end_time, status,
        services ( name, price )
      `)
      .neq('status', 'cancelled')

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const filtered = (data || []).filter((a) => {
      const isPast =
        a.appointment_date < today ||
        (a.appointment_date === today && a.end_time <= now)
      return view === 'past' ? isPast : !isPast
    })

    filtered.sort((a, b) => {
      const cmp = a.appointment_date.localeCompare(b.appointment_date)
      if (cmp !== 0) return view === 'past' ? -cmp : cmp
      return view === 'past'
        ? b.start_time.localeCompare(a.start_time)
        : a.start_time.localeCompare(b.start_time)
    })

    setAppts(filtered)
    setLoading(false)
  }

  async function cancelAppointment(id) {
    if (!confirm('Cancel this appointment?')) return
    const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    if (error) alert('Could not cancel: ' + error.message)
    else setAppts((prev) => prev.filter((a) => a.id !== id))
  }

  async function deleteAppointment(id) {
    if (!confirm('Delete this appointment permanently? This cannot be undone.')) return
    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (error) alert('Could not delete: ' + error.message)
    else setAppts((prev) => prev.filter((a) => a.id !== id))
  }

  async function updateStatus(id, status) {
    setAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (error) {
      alert('Could not update: ' + error.message)
      fetchAppts()
    }
  }

  const totalRevenue = appts
    .filter((a) => view === 'upcoming' || a.status === 'completed')
    .reduce((sum, a) => sum + Number(a.services?.price || 0), 0)

  const grouped = []
  let currentDate = null
  for (const a of appts) {
    if (a.appointment_date !== currentDate) {
      grouped.push({ type: 'header', date: a.appointment_date })
      currentDate = a.appointment_date
    }
    grouped.push({ type: 'appt', appt: a })
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 text-sm">
        <button
          onClick={() => setView('upcoming')}
          className={
            view === 'upcoming'
              ? 'px-3 py-1.5 rounded border bg-neutral-100 border-neutral-100 font-medium text-black'
              : 'px-3 py-1.5 rounded border bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-900'
          }
        >
          Upcoming
        </button>
        <button
          onClick={() => setView('past')}
          className={
            view === 'past'
              ? 'px-3 py-1.5 rounded border bg-neutral-100 border-neutral-100 font-medium text-black'
              : 'px-3 py-1.5 rounded border bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-900'
          }
        >
          Past
        </button>

        <div className="ml-auto text-right">
          <div className="text-xl font-semibold text-neutral-100">{appts.length} {appts.length === 1 ? 'booking' : 'bookings'}</div>
          <div className="text-sm text-neutral-500">
            ${totalRevenue} {view === 'past' ? 'earned' : 'expected'}
          </div>
        </div>
      </div>

      {loading && <p className="text-neutral-500 py-8 text-center">Loading...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && appts.length === 0 && (
        <p className="text-neutral-500 py-12 text-center">
          {view === 'upcoming' ? 'No upcoming appointments.' : 'No past appointments yet.'}
        </p>
      )}

      <div className="space-y-2">
        {grouped.map((item, i) => {
          if (item.type === 'header') {
            return (
              <div
                key={'h-' + item.date}
                className={`text-xs font-medium uppercase tracking-wider text-neutral-500 ${i === 0 ? '' : 'pt-4'} pb-1`}
              >
                {formatDate(item.date)}
              </div>
            )
          }
          const a = item.appt
          const badge = STATUS_BADGES[a.status] || STATUS_BADGES.confirmed
          return (
            <div key={a.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium w-20 text-neutral-200">{formatTime(a.start_time)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-100 truncate">{a.customer_name}</div>
                  <div className="text-sm text-neutral-500 truncate">
                    {a.services?.name} · {a.customer_phone}
                    {a.customer_email && ` · ${a.customer_email}`}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-medium text-emerald-400">${a.services?.price}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-900 flex-wrap">
                {view === 'past' && (
                  <span className={`text-xs font-medium px-2 py-1 rounded border ${badge.class}`}>
                    {badge.label}
                  </span>
                )}

                <div className="flex-1"></div>

                {view === 'upcoming' && (
                  <button
                    onClick={() => cancelAppointment(a.id)}
                    className="text-xs text-red-400 hover:bg-red-950 px-3 py-1.5 rounded border border-red-900"
                  >
                    Cancel
                  </button>
                )}

                {view === 'past' && a.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => updateStatus(a.id, 'no_show')}
                      className="text-xs text-red-400 hover:bg-red-950 px-3 py-1.5 rounded border border-red-900"
                    >
                      No show
                    </button>
                    <button
                      onClick={() => updateStatus(a.id, 'completed')}
                      className="text-xs text-emerald-400 hover:bg-emerald-950 px-3 py-1.5 rounded border border-emerald-900"
                    >
                      Showed up
                    </button>
                  </>
                )}

                {view === 'past' && a.status !== 'confirmed' && (
                  <button
                    onClick={() => updateStatus(a.id, 'confirmed')}
                    className="text-xs text-neutral-400 hover:bg-neutral-900 px-3 py-1.5 rounded border border-neutral-800"
                  >
                    Undo
                  </button>
                )}

                {view === 'past' && (
                  <button
                    onClick={() => deleteAppointment(a.id)}
                    className="text-xs text-neutral-500 hover:bg-neutral-900 px-2 py-1.5 rounded border border-neutral-800"
                    title="Delete permanently"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}