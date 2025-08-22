import { useEffect, useState, useCallback } from 'react'
import { getEvents, addEvent } from './api'
import EventsList from './components/EventsList'
import AddEventForm from './components/AddEventForm'
import LoadingError from './components/LoadingError'

export default function App() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getEvents()
      const sorted = [...data].sort((a, b) =>
        String(a.date).localeCompare(String(b.date))
      )
      setEvents(sorted)
    } catch (e) {
      setError(e?.message || 'Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async (payload) => {
    const tempId = `temp-${Date.now()}`
    const optimistic = { id: tempId, ...payload }
    setEvents(prev => [...prev, optimistic].sort((a, b) => String(a.date).localeCompare(String(b.date))))

    try {
      const res = await addEvent(payload)
      setEvents(prev => {
        const withoutTemp = prev.filter(e => e.id !== tempId)
        return [...withoutTemp, res.event].sort((a, b) => String(a.date).localeCompare(String(b.date)))
      })
    } catch (e) {
      setEvents(prev => prev.filter(e => e.id !== tempId))
      alert(e?.message || 'Failed to add event')
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Campus Events</h1>
        <p className="subtitle">React ↔ Flask API Integration</p>
      </header>

      <section className="card">
        <h2>Events</h2>
        <LoadingError loading={loading} error={error} onRetry={load} />

        {!loading && !error && (
          <EventsList events={events} />
        )}
      </section>

      <section className="card">
        <h2>Add New Event</h2>
        <AddEventForm onSubmit={handleAdd} />
      </section>

      <footer>
        <small>API Base: {import.meta.env.VITE_API_BASE_URL}</small>
      </footer>
    </div>
  )
}