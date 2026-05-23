import { useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) setError(error.message)
    setLoading(false)
  }

  const inputClass = "w-full px-3 py-2.5 mb-2 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 placeholder-neutral-600 focus:border-neutral-600 focus:outline-none"

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-sm bg-neutral-950 rounded-lg border border-neutral-800 p-6">
        <h1 className="text-2xl font-bold text-neutral-100 mb-1 tracking-tight">Admin sign in</h1>
        <p className="text-sm text-neutral-500 mb-6">Matanza Cutz</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass + ' mb-4'}
            required
          />

          {error && (
            <p className="text-red-400 text-sm mb-3 p-3 bg-red-950 border border-red-900 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-neutral-100 text-black font-medium hover:bg-white disabled:opacity-30"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}