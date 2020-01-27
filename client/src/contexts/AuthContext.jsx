import React, { useState, createContext } from 'react'
import { Redirect } from 'react-router-dom'
import axios from 'axios'
import { useEffect } from 'react'

const AuthContext = createContext()

const AuthProvider = (props) => {
  const [isAuth, setIsAuth] = useState(false)
  const [user, setUser] = useState('')
  // do i want to store userID from backend call in here?

  const login = (user, pass, next) => {
    axios.post('api/login', { username: user, password: pass })
      .then(res => {
        if (res.status === 200 || res.data.isAuthenticated === true) {
          setIsAuth(true)
        }
      })
      .catch(err => console.log(err))  
    }

  const logout = () => {
    axios.get('api/logout')
      .then(res => {
        if (res.status === 200) {
          setIsAuth(false)
          setUser('')
        }
      })
      .catch(err => console.log(err))
  }
  return (
    <AuthContext.Provider
      value={{
        isAuth, setIsAuth, login, logout
      }}
    >
      {props.children}
    </AuthContext.Provider>
  )
}

export { AuthProvider, AuthContext }
