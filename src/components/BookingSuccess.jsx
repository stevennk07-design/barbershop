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
      <div className="text-5xl mb-4 text-neutral-100">✓</div>
      <h2 className="text-2xl font-bold mb-2 text-neutral-100">You're booked!</h2>
      <p className="text-neutral-500 mb-6">
        We'll see you soon.
      </p>

      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-left mb-6">
        <div className="flex justify-between py-1.5 border-b border-neutral-900 text-sm">
          <span className="text-neutral-500">Name</span>
          <span className="text-neutral-200">{booking.customerName}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-neutral-900 text-sm">
          <span className="text-neutral-500">Service</span>
          <span className="text-neutral-200">{booking.service.name}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-neutral-900 text-sm">
          <span className="text-neutral-500">Date & time</span>
          <span className="text-neutral-200">{formatDate(booking.date)} · {formatTime(booking.time)}</span>
        </div>
        {booking.location && (
          <div className="flex justify-between py-1.5 border-b border-neutral-900 text-sm">
            <span className="text-neutral-500">Location</span>
            <span className="text-neutral-200 text-right">
              <span className="font-medium">{booking.location.name}</span>
              {booking.location.address && (
                <span className="block text-neutral-500 text-xs mt-0.5">{booking.location.address}</span>
              )}
            </span>
          </div>
        )}
        <div className="flex justify-between py-1.5 text-sm">
          <span className="text-neutral-500">Total</span>
          <span className="font-medium text-neutral-100">${booking.service.price}</span>
        </div>
      </div>

      <button
        onClick={onBookAnother}
        className="px-6 py-2 border border-neutral-800 rounded-lg text-sm hover:bg-neutral-900 text-neutral-300"
      >
        Book another →
      </button>
    </div>
  )
}
