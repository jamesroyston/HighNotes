import React, { useState, useContext } from 'react'
import { withRouter, Redirect, Link } from 'react-router-dom'
import { AuthContext } from '../../../contexts/AuthContext'

const SignUp = (props) => {
  const { signup, isAuth } = useContext(AuthContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const updateUser = e => {
    setUsername(e.target.value)
  }

  const updatePass = e => {
    setPassword(e.target.value)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    await signup(username, password)
    if (isAuth) {
      await props.history.push('/profile')
    }
  }

  return (
    <div>
      {isAuth ? <Redirect to="/profile" /> :
        (<div>
          <div className="container">
            <h1>Not a user? Sign up below: </h1>
            <form onSubmit={e => handleSubmit(e)}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input className="form-control" id="username" type="text" placeholder="Enter username" name="username" value={username} onChange={updateUser} required />

              </div>

              <div className="form-group">

                <label htmlFor="password">Password</label>
                <input className="form-control" placeholder="Password" type="password" name="password" id="password" value={password} onChange={updatePass} required />
              </div>
              <button className="btn btn-primary" type="submit">Submit</button>
            </form>
            <p>Already a user? &nbsp;<Link to="/login">Login</Link></p>
          </div>
        </div>)
      }
    </div>
  )
}

export default withRouter(SignUp)