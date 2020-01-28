import React, { useState, createContext } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const AuthProvider = (props) => {
  const [isAuth, setIsAuth] = useState(false)
  const [sessionChecking, setSessionChecking] = useState(true)

  const signup = (user, pass) => {
    axios.post('api/signup', { username: user, password: pass })
      .then(res => {
        if (res.status === 200) {
          console.log('registration success!')
        }
      })
      .then(() => login(user, pass))
      .catch(err => err)
  }

  const login = (user, pass) => {
    axios.post('api/login', { username: user, password: pass })
      .then(res => {
        if (res.status === 200 || res.data.isAuthenticated === true) {
          return setIsAuth(true)
        }
      })
      .catch(err => console.log(err))
  }

  const logout = () => {
    // debugger
    axios.get('api/logout')
      .then(res => {
        if (res.status === 200 || res.status === 304) {
          setIsAuth(false)
          console.log('logged out....')
        }
      })
      .catch(err => console.log(err))
  }

  const sessionCheck = () => {
    return axios.get('api/sessioncheck')
      .then(res => {
        if (res.status === 200 || res.data.isAuthenticated === true || res.data.username) {
          setIsAuth(true)
          setSessionChecking(false)
        }
        if (res.status === 404) {
          setIsAuth(false)
          setSessionChecking(false)
        }
      })
      .catch(err => console.log(err))
  }

  return (
    <AuthContext.Provider
      value={{
        isAuth, setIsAuth, login, logout, sessionCheck, sessionChecking, signup
      }}
    >
      {props.children}
    </AuthContext.Provider>
  )
}

export { AuthProvider, AuthContext }
