import { useState } from 'react'
import { supabase } from '../supabaseClient'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const mer = h < 12 ? 'AM' : 'PM'
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hr}:${String(m).padStart(2, '0')} ${mer}`
}

function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m + minutes
  const newH = Math.floor(total / 60)
  const newM = total % 60
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

export default function ConfirmBooking({ booking, onConfirmed }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const canSubmit = name.trim() && phone.trim() && !submitting

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const endTime = addMinutes(booking.time, booking.service.duration_minutes)

    const { data: conflicts, error: checkErr } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', booking.date)
      .neq('status', 'cancelled')
      .lt('start_time', endTime)
      .gt('end_time', booking.time)

    if (checkErr) {
      setError('Could not verify availability. Please try again.')
      setSubmitting(false)
      return
    }

    if (conflicts && conflicts.length > 0) {
      setError('Sorry, that time was just booked by someone else. Please pick another time.')
      setSubmitting(false)
      return
    }

    const { data, error: insertErr } = await supabase
      .from('appointments')
      .insert({
        service_id: booking.service.id,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim() || null,
        appointment_date: booking.date,
        start_time: booking.time,
        end_time: endTime,
        location_id: booking.location?.id || null,
      })
      .select()
      .single()

    if (insertErr) {
      setError('Could not save the booking. Please try again.')
      setSubmitting(false)
      return
    }

    onConfirmed({ ...booking, customerName: name.trim(), confirmationId: data.id })
  }

  const inputClass = "w-full px-3 py-2.5 mb-2 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 placeholder-neutral-600 focus:border-neutral-600 focus:outline-none"

  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-3">
        Your details
      </h2>
      <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      <input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
      <input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass + ' mb-4'} />

      <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-3 mt-4">
        Booking summary
      </h2>
      <div className="border border-neutral-800 rounded-lg p-4 mb-4 bg-neutral-950">
        <SummaryRow label="Service" value={booking.service.name} />
        <SummaryRow label="Date" value={formatDate(booking.date)} />
        <SummaryRow label="Time" value={formatTime(booking.time)} />
        {booking.location && (
          <SummaryRow
            label="Location"
            value={
              booking.location.address
                ? `${booking.location.name} · ${booking.location.address}`
                : booking.location.name
            }
          />
        )}
        <SummaryRow label="Duration" value={`${booking.service.duration_minutes} min`} />
        <SummaryRow label="Price" value={`$${booking.service.price}`} bold />
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-3 p-3 bg-red-950 border border-red-900 rounded">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-3 rounded-lg bg-neutral-100 text-black font-medium disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white"
      >
        {submitting ? 'Booking...' : 'Confirm booking →'}
      </button>
    </div>
  )
}

function SummaryRow({ label, value, bold }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-neutral-900 last:border-0 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className={bold ? 'font-medium text-neutral-100' : 'text-neutral-200'}>{value}</span>
    </div>
  )
}
