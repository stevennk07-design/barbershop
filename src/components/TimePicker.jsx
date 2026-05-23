import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { computeTimeSlots } from '../lib/availability'

export default function TimePicker({ date, service, selectedTime, onSelect }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true)
      setError(null)

      const [y, m, d] = date.split('-').map(Number)
      const dateObj = new Date(y, m - 1, d)
      const dayOfWeek = dateObj.getDay()

      const [hoursRes, blocksRes, recurringRes, apptsRes] = await Promise.all([
        supabase.from('weekly_hours').select('*').eq('day_of_week', dayOfWeek).single(),
        supabase.from('availability_blocks').select('*').eq('date', date),
        supabase.from('recurring_blocks').select('*').eq('day_of_week', dayOfWeek),
        supabase.from('appointments').select('start_time, end_time').eq('appointment_date', date).neq('status', 'cancelled'),
      ])

      if (hoursRes.error || blocksRes.error || recurringRes.error || apptsRes.error) {
        setError('Could not load availability.')
        setLoading(false)
        return
      }

      const computed = computeTimeSlots(
        hoursRes.data,
        blocksRes.data || [],
        recurringRes.data || [],
        apptsRes.data || [],
        service.duration_minutes,
        new Date(),
        date
      )

      setSlots(computed)
      setLoading(false)
    }

    fetchAvailability()
  }, [date, service])

  if (loading) return <p className="text-gray-500">Loading available times...</p>
  if (error) return <p className="text-red-600">{error}</p>

  if (slots.length === 0) {
    return (
      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-3">
          Available times
        </h2>
        <p className="text-gray-500 py-8 text-center">
          The shop is closed on this day. Please pick another date.
        </p>
      </div>
    )
  }

  const anyAvailable = slots.some((s) => s.available)

  return (
    <div>
      <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-3">
        Available times
      </h2>
      {!anyAvailable && (
        <p className="text-gray-500 mb-3">
          No times available on this day. Please pick another date.
        </p>
      )}
      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time
          let classes = 'py-2.5 text-center text-sm rounded-lg border transition '
          if (isSelected) classes += 'bg-gray-900 text-white border-gray-900'
          else if (!slot.available) classes += 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          else classes += 'bg-white border-gray-200 hover:border-gray-400 cursor-pointer'

          return (
            <button
              key={slot.time}
              disabled={!slot.available}
              onClick={() => onSelect(slot.time)}
              className={classes}
            >
              {slot.available ? slot.label : 'Booked'}
            </button>
          )
        })}
      </div>
    </div>
  )
}