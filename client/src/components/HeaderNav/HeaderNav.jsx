import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import { useEffect } from 'react'

const HeaderNav = (props) => {

  const { isAuth, logout } = useContext(AuthContext)

  const [collapse, setCollapse] = useState(true)

  const toggleCollapse = () => setCollapse(!collapse)

  const navLinks = (
    isAuth ? <li className="nav-item">
      <Link onClick={() => { logout(); setCollapse(true) }} className="nav-link" to="/logout">Logout</Link>
    </li> :
      <>
        <li className="nav-item">
          <Link onClick={() => setCollapse(true)} className="nav-link" to="/login">Login</Link>
        </li>
        <li className="nav-item">
          <Link onClick={() => setCollapse(true)} className="nav-link" to="/signup">Sign Up</Link>
        </li>
      </>
  )

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/">HighNotes</Link>
      <button onClick={toggleCollapse} className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className={collapse ? "collapse navbar-collapse" : "navbar-collapse"} id="navbarText">
        <ul className="navbar-nav mr-auto">
          {navLinks}
        </ul>
      </div>
    </nav>

  );
}

export default HeaderNav;