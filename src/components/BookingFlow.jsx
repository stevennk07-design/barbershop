import { useState } from 'react'
import ServicePicker from './ServicePicker'
import DatePicker from './DatePicker'
import TimePicker from './TimePicker'
import ConfirmBooking from './ConfirmBooking'
import BookingSuccess from './BookingSuccess'

export default function BookingFlow() {
  const [step, setStep] = useState(1)
  const [booking, setBooking] = useState({ service: null, date: null, time: null })
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
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <header className="text-center mb-10 pb-6 border-b border-neutral-800">
            <h1 className="text-4xl font-bold tracking-tight">Matanza Cutz</h1>
            {/* <p className="text-sm text-neutral-400 mt-2">Tagline goes here</p> */}
          </header>

          {confirmedBooking ? (
            <BookingSuccess booking={confirmedBooking} onBookAnother={resetFlow} />
          ) : (
            <>
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
                          ? 'bg-neutral-100 border-neutral-100 text-black'
                          : step > s.n
                          ? 'bg-neutral-800 border-neutral-700 text-neutral-300'
                          : 'bg-transparent border-neutral-800 text-neutral-500'
                      }`}
                    >
                      {s.n} · {s.label}
                    </div>
                    {i < 3 && <span className="text-neutral-700">›</span>}
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
                    className="w-full mt-6 py-3 rounded-lg bg-neutral-100 text-black font-medium disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white"
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
                      className="px-6 py-3 rounded-lg border border-neutral-800 text-neutral-300 font-medium hover:bg-neutral-900"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!booking.date}
                      className="flex-1 py-3 rounded-lg bg-neutral-100 text-black font-medium disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white"
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
                      className="px-6 py-3 rounded-lg border border-neutral-800 text-neutral-300 font-medium hover:bg-neutral-900"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      disabled={!booking.time}
                      className="flex-1 py-3 rounded-lg bg-neutral-100 text-black font-medium disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white"
                    >
                      Continue →
                    </button>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <ConfirmBooking booking={booking} onConfirmed={setConfirmedBooking} />
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => setStep(3)}
                      className="px-6 py-2 text-sm text-neutral-500 hover:text-neutral-300"
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

      <footer className="border-t border-neutral-800 mt-10">
        <div className="max-w-2xl mx-auto px-8 py-6 text-center text-sm text-neutral-500">
          <div className="space-x-4">
            <span>123 Example St, City</span>
            <span>·</span>
            <span>(555) 555-5555</span>
          </div>
        </div>
      </footer>
    </div>
  )
}