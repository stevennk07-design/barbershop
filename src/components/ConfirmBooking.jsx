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

    // Re-check that the slot is still free (race condition guard)
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

    // Insert the appointment
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

  return (
    <div>
      <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-3">
        Your details
      </h2>
      <input
        type="text"
        placeholder="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2.5 mb-2 rounded-lg border border-gray-200 focus:border-gray-400 focus:outline-none"
      />
      <input
        type="tel"
        placeholder="Phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full px-3 py-2.5 mb-2 rounded-lg border border-gray-200 focus:border-gray-400 focus:outline-none"
      />
      <input
        type="email"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2.5 mb-4 rounded-lg border border-gray-200 focus:border-gray-400 focus:outline-none"
      />

      <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-3 mt-4">
        Booking summary
      </h2>
      <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
        <SummaryRow label="Service" value={booking.service.name} />
        <SummaryRow label="Date" value={formatDate(booking.date)} />
        <SummaryRow label="Time" value={formatTime(booking.time)} />
        <SummaryRow label="Duration" value={`${booking.service.duration_minutes} min`} />
        <SummaryRow label="Price" value={`$${booking.service.price}`} bold />
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-3 p-3 bg-red-50 border border-red-200 rounded">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-3 rounded-lg bg-gray-900 text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
      >
        {submitting ? 'Booking...' : 'Confirm booking →'}
      </button>
    </div>
  )
}

function SummaryRow({ label, value, bold }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-100 last:border-0 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? 'font-medium' : ''}>{value}</span>
    </div>
  )
}