import { useState } from 'react'
import ServicePicker from './ServicePicker'

export default function BookingFlow() {
  const [step, setStep] = useState(1)
  const [booking, setBooking] = useState({
    service: null,
    date: null,
    time: null,
  })

  function updateBooking(changes) {
    setBooking((prev) => ({ ...prev, ...changes }))
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

        {/* Step content */}
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
          <p className="text-gray-500">Date picker coming next...</p>
        )}
      </div>
    </div>
  )
}