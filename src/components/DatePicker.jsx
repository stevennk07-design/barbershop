import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function DatePicker({ selectedDate, onSelect }) {
  const [weeklyHours, setWeeklyHours] = useState([])
  const [openingDates, setOpeningDates] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [viewMonth, setViewMonth] = useState(() => {
    const today = new Date()
    return { year: today.getFullYear(), month: today.getMonth() }
  })

  useEffect(() => {
    async function fetchData() {
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      const [hoursRes, openingsRes] = await Promise.all([
        supabase.from('weekly_hours').select('*'),
        supabase.from('availability_openings').select('date').gte('date', todayStr),
      ])
      if (!hoursRes.error) setWeeklyHours(hoursRes.data)
      if (!openingsRes.error) setOpeningDates(new Set((openingsRes.data || []).map((o) => o.date)))
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <p className="text-neutral-500">Loading calendar...</p>

  const openDays = {}
  weeklyHours.forEach((row) => {
    openDays[row.day_of_week] = row.is_open
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { year, month } = viewMonth
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function changeMonth(delta) {
    let newMonth = month + delta
    let newYear = year
    if (newMonth < 0) { newMonth = 11; newYear-- }
    if (newMonth > 11) { newMonth = 0; newYear++ }
    setViewMonth({ year: newYear, month: newMonth })
  }

  function selectDate(day) {
    const date = new Date(year, month, day)
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    onSelect(iso)
  }

  const canGoBack =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth())

  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-3">
        Pick a date
      </h2>

      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => changeMonth(-1)}
          disabled={!canGoBack}
          className="px-3 py-1 text-sm rounded border border-neutral-800 hover:bg-neutral-900 disabled:opacity-20 disabled:cursor-not-allowed"
        >
          ←
        </button>
        <div className="font-medium">{MONTH_NAMES[month]} {year}</div>
        <button
          onClick={() => changeMonth(1)}
          className="px-3 py-1 text-sm rounded border border-neutral-800 hover:bg-neutral-900"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs text-neutral-500 py-1">{d}</div>
        ))}

        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(year, month, day)
          const dow = date.getDay()
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

          const isPast = date < today
          const normallyOpen = openDays[dow] !== false
          const hasSpecialOpening = openingDates.has(iso)
          const isClosed = !normallyOpen && !hasSpecialOpening
          const isToday = date.getTime() === today.getTime()
          const isSelected = selectedDate === iso
          const disabled = isPast || isClosed

          let classes = 'text-center text-sm py-2 rounded transition relative '
          if (isSelected) classes += 'bg-neutral-100 text-black font-medium'
          else if (disabled) classes += 'text-neutral-700 cursor-not-allowed' + (isClosed && !isPast ? ' line-through' : '')
          else if (hasSpecialOpening && !normallyOpen) classes += 'hover:bg-emerald-950 cursor-pointer text-emerald-300 ring-1 ring-emerald-800'
          else classes += 'hover:bg-neutral-900 cursor-pointer text-neutral-200'
          if (isToday && !isSelected) classes += ' ring-1 ring-neutral-700'

          return (
            <button
              key={day}
              onClick={() => !disabled && selectDate(day)}
              disabled={disabled}
              className={classes}
            >
              {day}
            </button>
          )
        })}
      </div>

      {openingDates.size > 0 && (
        <p className="text-xs text-emerald-700 mt-3">
          Highlighted dates have special hours.
        </p>
      )}
    </div>
  )
}
