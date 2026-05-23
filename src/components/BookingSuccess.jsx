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

export default function BookingSuccess({ booking, onBookAnother }) {
  return (
    <div className="text-center py-10">
      <div className="text-5xl mb-4">✓</div>
      <h2 className="text-2xl font-bold mb-2">You're booked!</h2>
      <p className="text-gray-500 mb-6">
        We'll send a reminder before your appointment.
      </p>

      <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
        <div className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
          <span className="text-gray-500">Name</span>
          <span>{booking.customerName}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
          <span className="text-gray-500">Service</span>
          <span>{booking.service.name}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
          <span className="text-gray-500">Date & time</span>
          <span>{formatDate(booking.date)} · {formatTime(booking.time)}</span>
        </div>
        <div className="flex justify-between py-1.5 text-sm">
          <span className="text-gray-500">Total</span>
          <span className="font-medium">${booking.service.price}</span>
        </div>
      </div>

      <button
        onClick={onBookAnother}
        className="px-6 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
      >
        Book another →
      </button>
    </div>
  )
}