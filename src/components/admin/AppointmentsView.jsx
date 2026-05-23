import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

function formatTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const mer = h < 12 ? 'AM' : 'PM'
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hr}:${String(m).padStart(2, '0')} ${mer}`
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AppointmentsView() {
  const [date, setDate] = useState(todayStr())
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAppts() {
      setLoading(true)
      setError(null)

      // Join with services to get name + price
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          customer_name,
          customer_phone,
          customer_email,
          start_time,
          end_time,
          status,
          services ( name, price )
        `)
        .eq('appointment_date', date)
        .neq('status', 'cancelled')
        .order('start_time', { ascending: true })

      if (error) setError(error.message)
      else setAppts(data || [])
      setLoading(false)
    }

    fetchAppts()
  }, [date])

  async function cancelAppointment(id) {
    if (!confirm('Cancel this appointment?')) return

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) {
      alert('Could not cancel: ' + error.message)
    } else {
      setAppts((prev) => prev.filter((a) => a.id !== id))
    }
  }

  const totalRevenue = appts.reduce((sum, a) => sum + Number(a.services?.price || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200"
        />
        <div className="text-right">
          <div className="text-xl font-semibold">{appts.length} {appts.length === 1 ? 'booking' : 'bookings'}</div>
          <div className="text-sm text-gray-500">${totalRevenue} total</div>
        </div>
      </div>

      {loading && <p className="text-gray-500 py-8 text-center">Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && appts.length === 0 && (
        <p className="text-gray-500 py-12 text-center">No appointments on this day.</p>
      )}

      <div className="space-y-2">
        {appts.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="text-sm font-medium w-20">{formatTime(a.start_time)}</div>
            <div className="flex-1 px-3">
              <div className="font-medium">{a.customer_name}</div>
              <div className="text-sm text-gray-500">
                {a.services?.name} · {a.customer_phone}
                {a.customer_email && ` · ${a.customer_email}`}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-green-700">${a.services?.price}</div>
              <button
                onClick={() => cancelAppointment(a.id)}
                className="text-xs text-red-600 hover:underline mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}