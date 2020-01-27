import React, { useState, useContext } from 'react'
import { withRouter } from 'react-router-dom'
// import axios from 'axios'
import { AuthContext } from '../../../contexts/AuthContext'
import { useEffect } from 'react'
import Axios from 'axios'

const Login = (props) => {
  const { login, isAuth, setIsAuth } = useContext(AuthContext)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const updateUser = e => {
    setUsername(e.target.value)
  }

  const updatePass = e => {
    setPassword(e.target.value)
  }

  const handleSubmit = e => {
    e.preventDefault()
    // function redirectToHome () {
    //   const historyProp = props
    //   return historyProp.history.push('/')
    // }
    login(username, password)
  }

  useEffect(() => {
      if (isAuth) {
        props.history.push('/')
      }
  }, [isAuth])

  return (
    <div>
      <div>
        <h1>Please log in: </h1>
        <form onSubmit={e => handleSubmit(e)}>
          <input type="text" name="username" id="username" value={username} onChange={updateUser} required />
          <input type="password" name="password" id="password" value={password} onChange={updatePass} required />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  )
}

export default withRouter(Login)