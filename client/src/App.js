import React, { useState, useEffect } from 'react';
import HeaderNav from './components/HeaderNav/HeaderNav'
import NoteSection from './components/NoteSection/NoteSection'
import Login from './components/HeaderNav/Login/Login'
import SignUp from './components/HeaderNav/SignUp/SignUp'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'

function App() {

  return (
    <Router>
      <AuthProvider>

        <div className="App">
          <HeaderNav />
          <Switch>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/signup">
              <SignUp />
            </Route>
            <Route path="logout">
              <Login />
            </Route>
            <ProtectedRoute path="/" component={NoteSection} />
          </Switch>

        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
