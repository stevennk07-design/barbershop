import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

const FIELDS = [
  { key: 'shop_name', label: 'Shop name', placeholder: 'e.g. Matanza Cutz', required: true },
  { key: 'tagline', label: 'Tagline', placeholder: 'e.g. Classic cuts · Downtown · Est. 2018' },
  { key: 'address', label: 'Address', placeholder: 'e.g. 123 Main St, City, State' },
  { key: 'phone', label: 'Phone', placeholder: 'e.g. (555) 555-5555' },
  { key: 'email', label: 'Email', placeholder: 'e.g. contact@shop.com' },
]

export default function SettingsEditor() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingField, setSavingField] = useState(null)
  const [saved, setSaved] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)
    const { data, error } = await supabase.from('shop_settings').select('*').eq('id', 1).single()
    if (!error) setSettings(data)
    setLoading(false)
  }

  function updateLocal(field, value) {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  async function saveField(field, value) {
    if (field === 'shop_name' && !value.trim()) {
      alert('Shop name cannot be empty.')
      fetchSettings()
      return
    }

    setSavingField(field)
    const { error } = await supabase
      .from('shop_settings')
      .update({ [field]: value.trim() || null })
      .eq('id', 1)

    if (error) {
      alert('Could not save: ' + error.message)
      fetchSettings()
    } else {
      setSaved(field)
      setTimeout(() => setSaved((curr) => (curr === field ? null : curr)), 1500)
    }
    setSavingField(null)
  }

  if (loading) return <p className="text-neutral-500">Loading settings...</p>
  if (!settings) return <p className="text-red-400">Could not load settings.</p>

  const inputClass = "w-full px-3 py-2 rounded border border-neutral-800 bg-neutral-950 text-neutral-100 placeholder-neutral-600 focus:border-neutral-600 focus:outline-none"

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        This information shows on your customer-facing booking page. Changes save automatically when you click out of a field.
      </p>

      <div className="space-y-3">
        {FIELDS.map((f) => (
          <div key={f.key} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                {f.label}{f.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {savingField === f.key && <span className="text-xs text-neutral-500">Saving...</span>}
              {saved === f.key && <span className="text-xs text-emerald-400">Saved ✓</span>}
            </div>
            <input
              type="text"
              placeholder={f.placeholder}
              value={settings[f.key] || ''}
              onChange={(e) => updateLocal(f.key, e.target.value)}
              onBlur={(e) => saveField(f.key, e.target.value)}
              className={inputClass}
            />
          </div>
        ))}
      </div>
    </div>
  )
}