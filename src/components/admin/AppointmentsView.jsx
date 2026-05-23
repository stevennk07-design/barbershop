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

export default function AppointmentsView() {
  const [view, setView] = useState('upcoming') // 'upcoming' or 'past'
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAppts() {
      setLoading(true)
      setError(null)

      const today = todayStr()
      let query = supabase
        .from('appointments')
        .select(`
          id, customer_name, customer_phone, customer_email,
          appointment_date, start_time, end_time, status,
          services ( name, price )
        `)
        .neq('status', 'cancelled')

      if (view === 'upcoming') {
        query = query.gte('appointment_date', today)
          .order('appointment_date', { ascending: true })
          .order('start_time', { ascending: true })
      } else {
        query = query.lt('appointment_date', today)
          .order('appointment_date', { ascending: false })
          .order('start_time', { ascending: false })
      }

      const { data, error } = await query
      if (error) setError(error.message)
      else setAppts(data || [])
      setLoading(false)
    }
    fetchAppts()
  }, [view])

  async function cancelAppointment(id) {
    if (!confirm('Cancel this appointment?')) return
    const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    if (error) alert('Could not cancel: ' + error.message)
    else setAppts((prev) => prev.filter((a) => a.id !== id))
  }

  const totalRevenue = appts.reduce((sum, a) => sum + Number(a.services?.price || 0), 0)

  // Group by date so we can render section headers
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
          <div className="text-sm text-neutral-500">${totalRevenue} total</div>
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
              <div key={'h-' + item.date} className={`text-xs font-medium uppercase tracking-wider text-neutral-500 ${i === 0 ? '' : 'pt-4'} pb-1`}>
                {formatDate(item.date)}
              </div>
            )
          }
          const a = item.appt
          return (
            <div key={a.id} className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-lg p-4">
              <div className="text-sm font-medium w-20 text-neutral-200">{formatTime(a.start_time)}</div>
              <div className="flex-1 px-3">
                <div className="font-medium text-neutral-100">{a.customer_name}</div>
                <div className="text-sm text-neutral-500">
                  {a.services?.name} · {a.customer_phone}
                  {a.customer_email && ` · ${a.customer_email}`}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-emerald-400">${a.services?.price}</div>
                {view === 'upcoming' && (
                  <button
                    onClick={() => cancelAppointment(a.id)}
                    className="text-xs text-red-400 hover:underline mt-1"
                  >
                    Cancel
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