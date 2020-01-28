import React, { useContext } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import LoadingScreen from 'react-loading-screen'

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isAuth, sessionCheck, sessionChecking } = useContext(AuthContext)

  sessionCheck()

  return (<div>
    <Route
      render={props => {
        if (sessionChecking) {
          return <LoadingScreen loading={sessionChecking}
            bgColor='#f1f1f1'
            spinnerColor='#9ee5f8'
            textColor='#676767'
            text='Grabbing your notes. Hang tight.' />
        } else {
          if (isAuth) { return <Component {...props} /> }
          else { return <Redirect to="/login" /> }
        }
      }}
      {...rest}
    />
  </div>)
}

export default ProtectedRoute
