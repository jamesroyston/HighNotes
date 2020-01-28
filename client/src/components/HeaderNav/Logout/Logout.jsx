import React from 'react'
import { Link } from 'react-router-dom'

const Logout = () => {
  return (
    <div className="container">
      <h1>You've logged out successfully. To sign back in, click&nbsp;
        <Link to="/login">here.</Link>
      </h1>
    </div>
  )
}

export default Logout