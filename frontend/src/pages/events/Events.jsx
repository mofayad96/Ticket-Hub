import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true })

export default function Events() {
  const [events, setEvents] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('upcoming')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchEvents() }, [])

  async function fetchEvents() {
    setLoading(true)
    try {
      const { data } = await api.get('/events', { params: { q, status } })
      setEvents(data.events)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    if (date < now) return 'bg-red-100 text-red-800'
    if (date.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    if (date < now) return 'Past'
    if (date.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return 'Today'
    return 'Upcoming'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="loading-spinner w-12 h-12"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Events Page Logo */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Amazing Events</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect event for you and book your tickets instantly on TicketHub
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input 
                className="input-modern" 
                placeholder="Search events..." 
                value={q} 
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select 
              className="input-modern md:w-48" 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="upcoming">Upcoming Events</option>
              <option value="past">Past Events</option>
              <option value="">All Events</option>
            </select>
            <button 
              className="btn-primary md:w-auto" 
              onClick={fetchEvents}
            >
              Search
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or check back later.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(ev => (
              <Link key={ev._id} to={`/events/${ev._id}`} className="event-card group">
                <div className="relative">
                  {/* Event Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <svg className="w-16 h-16 mx-auto mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-sm opacity-90">{ev.venue}</p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ev.date)}`}>
                    {getStatusText(ev.date)}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {ev.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {ev.description || 'Join us for an amazing experience!'}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">{formatDate(ev.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm">{ev.venue}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">${ev.price}</span>
                    <span className="text-sm text-gray-500">
                      {ev.seats?.filter(s => !s.isBooked).length || 0} seats left
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


