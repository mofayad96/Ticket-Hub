import { create } from 'zustand'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || '/1api',
  withCredentials: true
})

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
    set({ user: data.user, token: data.token })
  },
  
  async register(payload) {
    const { data } = await api.post('/auth/register', payload)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
    set({ user: data.user, token: data.token })
  },
  
  async me() {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const { data } = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user })
    } catch {}
  },
  
  logout() {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null })
  }
}))

export default useAuthStore