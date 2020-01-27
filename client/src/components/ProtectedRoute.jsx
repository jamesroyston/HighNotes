import React, { useContext, useEffect } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import axios from 'axios'

const ProtectedRoute = ({ component: Component, ...rest }) => {

  const { isAuth } = useContext(AuthContext)
  console.log(isAuth)

  return <div>
    <Route
      render={props =>
        isAuth ? <Component {...props} /> : <Redirect to="/login" />
      }
      {...rest}
    />
  </div>
}

export default ProtectedRoute
