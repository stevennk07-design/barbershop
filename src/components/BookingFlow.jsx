import { useState } from 'react'
import ServicePicker from './ServicePicker'
import DatePicker from './DatePicker'
import TimePicker from './TimePicker'
import ConfirmBooking from './ConfirmBooking'
import BookingSuccess from './BookingSuccess'

export default function BookingFlow() {
  const [step, setStep] = useState(1)
  const [booking, setBooking] = useState({
    service: null,
    date: null,
    time: null,
  })
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  function updateBooking(changes) {
    setBooking((prev) => ({ ...prev, ...changes }))
  }

  function resetFlow() {
    setBooking({ service: null, date: null, time: null })
    setConfirmedBooking(null)
    setStep(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">
            ✦ Marco's Barbershop ✦
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Classic cuts · Downtown · Est. 2018
          </p>
        </header>

        {confirmedBooking ? (
          <BookingSuccess booking={confirmedBooking} onBookAnother={resetFlow} />
        ) : (
          <>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6 text-xs font-medium">
              {[
                { n: 1, label: 'Service' },
                { n: 2, label: 'Date' },
                { n: 3, label: 'Time' },
                { n: 4, label: 'Confirm' },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex-1 text-center px-3 py-2 rounded-full border ${
                      step === s.n
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : step > s.n
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-200 text-gray-500'
                    }`}
                  >
                    {s.n} · {s.label}
                  </div>
                  {i < 3 && <span className="text-gray-300">›</span>}
                </div>
              ))}
            </div>

            {step === 1 && (
              <>
                <ServicePicker
                  selectedService={booking.service}
                  onSelect={(s) => updateBooking({ service: s })}
                />
                <button
                  onClick={() => setStep(2)}
                  disabled={!booking.service}
                  className="w-full mt-6 py-3 rounded-lg bg-gray-900 text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
                >
                  Continue →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <DatePicker
                  selectedDate={booking.date}
                  onSelect={(d) => updateBooking({ date: d })}
                />
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!booking.date}
                    className="flex-1 py-3 rounded-lg bg-gray-900 text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
                  >
                    Continue →
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <TimePicker
                  date={booking.date}
                  service={booking.service}
                  selectedTime={booking.time}
                  onSelect={(t) => updateBooking({ time: t })}
                />
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={!booking.time}
                    className="flex-1 py-3 rounded-lg bg-gray-900 text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
                  >
                    Continue →
                  </button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <ConfirmBooking
                  booking={booking}
                  onConfirmed={setConfirmedBooking}
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}