import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { computeTimeSlots } from '../lib/availability'

export default function TimePicker({ date, service, selectedTime, onSelect, onLocationResolved }) {
  const [slots, setSlots] = useState([])
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true)
      setError(null)
      setLocation(null)

      const [y, m, d] = date.split('-').map(Number)
      const dateObj = new Date(y, m - 1, d)
      const dayOfWeek = dateObj.getDay()

      const [hoursRes, blocksRes, recurringRes, apptsRes, overrideRes, openingRes] = await Promise.all([
        supabase
          .from('weekly_hours')
          .select('*, locations(id, name, address)')
          .eq('day_of_week', dayOfWeek)
          .single(),
        supabase.from('availability_blocks').select('*').eq('date', date),
        supabase.from('recurring_blocks').select('*').eq('day_of_week', dayOfWeek),
        supabase
          .from('appointments')
          .select('start_time, end_time')
          .eq('appointment_date', date)
          .neq('status', 'cancelled'),
        supabase
          .from('location_overrides')
          .select('*, locations(id, name, address)')
          .eq('date', date)
          .maybeSingle(),
        supabase
          .from('availability_openings')
          .select('*')
          .eq('date', date)
          .maybeSingle(),
      ])

      if (hoursRes.error || blocksRes.error || recurringRes.error || apptsRes.error) {
        setError('Could not load availability.')
        setLoading(false)
        return
      }

      let resolvedLocation = null
      if (overrideRes.data?.locations) {
        resolvedLocation = overrideRes.data.locations
      } else if (hoursRes.data?.locations) {
        resolvedLocation = hoursRes.data.locations
      }

      setLocation(resolvedLocation)
      if (onLocationResolved) onLocationResolved(resolvedLocation)

      const computed = computeTimeSlots(
        hoursRes.data,
        blocksRes.data || [],
        recurringRes.data || [],
        apptsRes.data || [],
        service.duration_minutes,
        new Date(),
        date,
        openingRes.data || null
      )

      setSlots(computed)
      setLoading(false)
    }

    fetchAvailability()
  }, [date, service])

  if (loading) return <p className="text-neutral-500">Loading available times...</p>
  if (error) return <p className="text-red-400">{error}</p>

  if (slots.length === 0) {
    return (
      <div>
        <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-3">
          Available times
        </h2>
        <p className="text-neutral-500 py-8 text-center">
          The shop is closed on this day. Please pick another date.
        </p>
      </div>
    )
  }

  const anyAvailable = slots.some((s) => s.available)

  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-3">
        Available times
      </h2>

      {location && (
        <div className="flex items-start gap-2 mb-4 px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300">
          <span className="mt-0.5">📍</span>
          <div>
            <span className="font-medium text-neutral-100">{location.name}</span>
            {location.address && (
              <span className="text-neutral-500"> · {location.address}</span>
            )}
          </div>
        </div>
      )}

      {!anyAvailable && (
        <p className="text-neutral-500 mb-3">
          No times available on this day. Please pick another date.
        </p>
      )}

      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time
          let classes = 'py-2.5 text-center text-sm rounded-lg border transition '
          if (isSelected) classes += 'bg-neutral-100 text-black border-neutral-100 font-medium'
          else if (!slot.available) classes += 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
          else classes += 'bg-neutral-950 border-neutral-800 hover:border-neutral-600 cursor-pointer text-neutral-200'

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
