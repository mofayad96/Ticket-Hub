import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import useAuthStore from '../../store/auth'

const api = axios.create({ baseURL: import.meta.env?.VITE_API_URL || '/1api', withCredentials: true })

export default function EventDetails() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [seat, setSeat] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const { token, user } = useAuthStore()

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get(`/events/${id}`)
      setEvent(data.event)
    } catch (error) {
      console.error('Failed to load event:', error)
    } finally {
      setLoading(false)
    }
  }

  async function book() {
    if (!user) {
      setMessage('Please login to book tickets')
      return
    }
    
    setMessage('')
    setBooking(true)
    
    try {
      await api.post(`/tickets/book/${id}`, { seatNumber: seat }, { headers: { Authorization: `Bearer ${token}` } })
      setMessage('🎉 Ticket booked successfully! Check My Tickets')
      setSeat('')
      load()
    } catch (error) {
      setMessage('❌ Booking failed. Please try again.')
      console.error('Booking error:', error)
    } finally {
      setBooking(false)
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
    if (date < now) return 'Past Event'
    if (date.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return 'Today'
    return 'Upcoming'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
          <Link to="/events" className="btn-primary">Back to Events</Link>
        </div>
      </div>
    )
  }

  const available = event.seats?.filter(s => !s.isBooked) || []
  const isPastEvent = new Date(event.date) < new Date()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/events" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </Link>
        </div>

        {/* Event Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="h-64 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center relative">
            <div className="text-white text-center">
              <svg className="w-24 h-24 mx-auto mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-lg opacity-90">{event.venue}</p>
            </div>
            
            {/* Status Badge */}
            <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(event.date)}`}>
              {getStatusText(event.date)}
            </div>
          </div>
          
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
            <p className="text-xl text-gray-600 mb-6">{event.description || 'Join us for an amazing experience!'}</p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{formatDate(event.date)}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">{event.venue}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium">{available.length} seats available</span>
                </div>
              </div>
              
              {/* Price */}
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600 mb-2">${event.price}</div>
                <p className="text-gray-500">per ticket</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        {!isPastEvent && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Your Ticket</h2>
            
            {!user ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Please login to book tickets for this event</p>
                <div className="space-x-4">
                  <Link to="/login" className="btn-primary">Login</Link>
                  <Link to="/register" className="btn-outline">Create Account</Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Your Seat
                  </label>
                  <select 
                    className="input-modern" 
                    value={seat} 
                    onChange={(e) => setSeat(e.target.value)}
                    disabled={available.length === 0}
                  >
                    <option value="">Choose a seat...</option>
                    {available.map(s => (
                      <option key={s.seatNumber} value={s.seatNumber}>
                        Seat {s.seatNumber}
                      </option>
                    ))}
                  </select>
                  {available.length === 0 && (
                    <p className="text-red-600 text-sm mt-2">No seats available for this event</p>
                  )}
                </div>
                
                {seat && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900">Selected: Seat {seat}</p>
                        <p className="text-sm text-blue-700">Total: ${event.price}</p>
                      </div>
                      <button 
                        onClick={book} 
                        disabled={booking || !seat}
                        className="btn-primary flex items-center"
                      >
                        {booking ? (
                          <>
                            <div className="loading-spinner w-5 h-5 mr-2"></div>
                            Booking...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            Book Ticket
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                {message && (
                  <div className={`p-4 rounded-lg text-sm font-medium ${
                    message.includes('successfully') 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Event Organizer Info */}
        {event.createdBy && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Organizer</h3>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">O</span>
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">TicketHub Studio</p>
                <p className="text-sm text-gray-500">Professional Event Management</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


