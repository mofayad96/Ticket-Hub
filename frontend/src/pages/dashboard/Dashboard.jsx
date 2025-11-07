import { useEffect, useState } from 'react'
import axios from 'axios'
import useAuthStore from '../../store/auth'

const apiBaseUrl = import.meta.env?.VITE_API_URL || '/api'

const api = axios.create({ baseURL: apiBaseUrl, withCredentials: true })

export default function Dashboard() {
  const [stats, setStats] = useState({ events: 0, tickets: 0, revenue: 0 })
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [venue, setVenue] = useState('')
  const [price, setPrice] = useState('')
  const [totalSeats, setTotalSeats] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { token } = useAuthStore()

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const [eventsRes, ticketsRes] = await Promise.all([
        api.get('/events'),
        api.get('/tickets/mine', { headers: { Authorization: `Bearer ${token}` } }).catch(()=>({ data:{ tickets:[] } }))
      ])
      const events = eventsRes.data.events
      const tickets = ticketsRes.data.tickets
      const revenue = tickets.reduce((sum,t)=>sum + (t.pricePaid||0),0)
      setStats({ events: events.length, tickets: tickets.length, revenue })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  async function createEvent(e) {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    
    try {
      await api.post('/events', { 
        title, 
        description,
        date, 
        venue, 
        price: Number(price), 
        totalSeats: Number(totalSeats) 
      }, { headers: { Authorization: `Bearer ${token}` } })
      
      setMessage('Event created successfully! 🎉')
      setTitle(''); setDate(''); setVenue(''); setPrice(''); setTotalSeats(''); setDescription('')
      load()
    } catch (error) {
      setMessage('Failed to create event. Please try again.')
      console.error('Create event error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              {/* Dashboard Logo */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TicketHub Admin</h1>
              <p className="text-gray-600 mt-1">Manage your events and track performance</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  label="Total Events" 
                  value={stats.events} 
                  icon="calendar"
                  color="blue"
                />
                <StatCard 
                  label="Total Tickets" 
                  value={stats.tickets} 
                  icon="ticket"
                  color="green"
                />
                <StatCard 
                  label="Revenue" 
                  value={`$${stats.revenue.toLocaleString()}`} 
                  icon="currency-dollar"
                  color="purple"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary">
                  View All Events
                </button>
                <button className="w-full btn-outline">
                  Export Data
                </button>
                <button className="w-full btn-outline">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Create Event Form */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Event</h2>
            <form onSubmit={createEvent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title
                  </label>
                  <input 
                    className="input-modern" 
                    placeholder="Enter event title" 
                    value={title} 
                    onChange={(e)=>setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date & Time
                  </label>
                  <input 
                    className="input-modern" 
                    type="datetime-local" 
                    value={date} 
                    onChange={(e)=>setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <input 
                    className="input-modern" 
                    placeholder="Enter venue" 
                    value={venue} 
                    onChange={(e)=>setVenue(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Ticket
                  </label>
                    <input 
                      className="input-modern" 
                      type="number" 
                      placeholder="0.00" 
                      value={price} 
                      onChange={(e)=>setPrice(e.target.value)}
                      required
                    />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Seats
                  </label>
                  <input 
                    className="input-modern" 
                    type="number" 
                    placeholder="Enter total seats" 
                    value={totalSeats} 
                    onChange={(e)=>setTotalSeats(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea 
                    className="input-modern" 
                    placeholder="Enter event description" 
                    value={description} 
                    onChange={(e)=>setDescription(e.target.value)}
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner w-5 h-5 mr-2"></div>
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Event
                    </>
                  )}
                </button>
                
                {message && (
                  <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    message.includes('successfully') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      red: 'text-red-600 bg-red-100'
    }
    return colors[color] || colors.blue
  }

  const getIcon = (iconName) => {
    const icons = {
      calendar: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      ticket: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      'currency-dollar': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    }
    return icons[iconName] || icons.calendar
  }

  return (
    <div className="stat-card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${getIconColor(color)}`}>
          {getIcon(icon)}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}


