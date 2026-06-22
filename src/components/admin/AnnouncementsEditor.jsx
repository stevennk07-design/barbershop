import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function AnnouncementsEditor() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newAnn, setNewAnn] = useState({ title: '', body: '', pinned: false })

  useEffect(() => { fetchAnnouncements() }, [])

  async function fetchAnnouncements() {
    setLoading(true)
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
    if (!error) setAnnouncements(data || [])
    setLoading(false)
  }

  async function updateField(id, field, value) {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)))
    const { error } = await supabase.from('announcements').update({ [field]: value }).eq('id', id)
    if (error) { alert('Could not save: ' + error.message); fetchAnnouncements() }
  }

  async function toggleField(a, field) {
    await updateField(a.id, field, !a[field])
  }

  async function deleteAnnouncement(id) {
    if (!confirm('Delete this announcement?')) return
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) alert('Could not delete: ' + error.message)
    else setAnnouncements((prev) => prev.filter((a) => a.id !== id))
  }

  async function addAnnouncement() {
    if (!newAnn.title.trim()) { alert('Please enter a title'); return }
    const { data, error } = await supabase.from('announcements').insert({
      title: newAnn.title.trim(),
      body: newAnn.body.trim() || null,
      pinned: newAnn.pinned,
      active: true,
    }).select().single()
    if (error) alert('Could not add: ' + error.message)
    else {
      setAnnouncements((prev) => [data, ...prev])
      setNewAnn({ title: '', body: '', pinned: false })
      setAdding(false)
    }
  }

  if (loading) return <p className="text-neutral-500">Loading announcements...</p>

  const inputClass = 'px-2 py-1 rounded border border-neutral-800 bg-neutral-950 text-neutral-100'

  return (
    <div>
      <p className="text-sm text-neutral-400 mb-4">
        Announcements appear on the booking page. Pin important ones to keep them at the top.
        Toggle <strong className="text-neutral-300">Hidden</strong> to remove from the booking page without deleting.
      </p>

      <div className="space-y-2 mb-4">
        {announcements.length === 0 && !adding && (
          <p className="text-neutral-500 py-6 text-center bg-neutral-950 border border-neutral-800 rounded-lg">
            No announcements yet.
          </p>
        )}

        {announcements.map((a) => (
          <div
            key={a.id}
            className={`bg-neutral-950 border border-neutral-800 rounded-lg p-3 ${!a.active ? 'opacity-50' : ''}`}
          >
            <input
              type="text"
              value={a.title}
              onChange={(e) => setAnnouncements((prev) => prev.map((x) => (x.id === a.id ? { ...x, title: e.target.value } : x)))}
              onBlur={(e) => updateField(a.id, 'title', e.target.value)}
              className="w-full px-2 py-1 mb-2 rounded border border-transparent hover:border-neutral-800 focus:border-neutral-600 focus:outline-none font-medium bg-transparent text-neutral-100"
            />
            <textarea
              value={a.body || ''}
              placeholder="Body (optional)"
              rows={2}
              onChange={(e) => setAnnouncements((prev) => prev.map((x) => (x.id === a.id ? { ...x, body: e.target.value } : x)))}
              onBlur={(e) => updateField(a.id, 'body', e.target.value.trim() || null)}
              className="w-full px-2 py-1 mb-2 rounded border border-transparent hover:border-neutral-800 focus:border-neutral-600 focus:outline-none text-sm bg-transparent text-neutral-300 resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleField(a, 'pinned')}
                className={`text-xs px-2 py-1.5 rounded border ${
                  a.pinned
                    ? 'border-amber-800 bg-amber-950 text-amber-300'
                    : 'border-neutral-800 text-neutral-400 hover:bg-neutral-900'
                }`}
              >
                {a.pinned ? 'Pinned' : 'Pin'}
              </button>
              <button
                onClick={() => toggleField(a, 'active')}
                className="text-xs px-2 py-1.5 rounded border border-neutral-800 hover:bg-neutral-900 text-neutral-300"
              >
                {a.active ? 'Visible' : 'Hidden'}
              </button>
              <div className="flex-1" />
              <button
                onClick={() => deleteAnnouncement(a.id)}
                className="text-red-400 hover:bg-red-950 px-2 py-1.5 rounded text-sm"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 mb-2">
          <input
            type="text"
            placeholder="Title"
            value={newAnn.title}
            autoFocus
            onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
            className={inputClass + ' w-full mb-2'}
          />
          <textarea
            placeholder="Body (optional)"
            value={newAnn.body}
            rows={3}
            onChange={(e) => setNewAnn({ ...newAnn, body: e.target.value })}
            className={inputClass + ' w-full mb-2 resize-none text-sm'}
          />
          <label className="flex items-center gap-2 text-sm text-neutral-300 mb-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={newAnn.pinned}
              onChange={(e) => setNewAnn({ ...newAnn, pinned: e.target.checked })}
              className="rounded"
            />
            Pin this announcement
          </label>
          <div className="flex gap-2">
            <button
              onClick={addAnnouncement}
              className="px-4 py-1.5 text-sm bg-neutral-100 text-black rounded hover:bg-white"
            >
              Post
            </button>
            <button
              onClick={() => { setAdding(false); setNewAnn({ title: '', body: '', pinned: false }) }}
              className="px-4 py-1.5 text-sm border border-neutral-800 rounded hover:bg-neutral-900 text-neutral-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="px-4 py-2 text-sm bg-neutral-100 text-black rounded-lg hover:bg-white"
        >
          + Post announcement
        </button>
      )}
    </div>
  )
}
