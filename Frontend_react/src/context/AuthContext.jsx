import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser } from '../api/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const login = (userData) => {
    setUser(userData)
    if (userData.rememberMe) {
      localStorage.setItem('token', userData.token)
    } else {
      sessionStorage.setItem('token', userData.token)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}