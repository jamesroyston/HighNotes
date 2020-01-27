import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext'
import { Container } from 'reactstrap'
import axios from 'axios'
import './NoteSection.css'

const NoteSection = () => {

  const [notes, setNotes] = useState([])
  const [deletedNotes, setDeletedNotes] = useState([])
  const { isAuth, setIsAuth } = useContext(AuthContext)
  const [user, setUser] = useState('')

  useEffect(() => {
    axios.get('api/profile')
      .then(res => {
        setNotes([...res.data.notes.notes])
        setDeletedNotes([...res.data.deleted.notes])
        setUser(res.data.username)
      })
      .catch(err => console.log(err))
  }, [])

  return (
    <Container fluid={true} className="notes-container">
      <h1>Hello, {user}</h1>

      {/*  */}
      <div>
        Notes:
        {notes.map(note => (
          <ul>
            <li>{note.title}</li>
            <li>{note.description}</li>
            <li>created: {new Date(note.createdAt).toLocaleString()}</li>
            <li>deleted: {new Date(note.updatedAt).toLocaleString()}</li>
          </ul>
          )
        )}

        Deleted: 
        {deletedNotes.map(note => (
          <ul>
            <li>{note.title}</li>
            <li>{note.description}</li>
            <li>created: {new Date(note.createdAt).toLocaleString()}</li>
            <li>deleted: {new Date(note.updatedAt).toLocaleString()}</li>
          </ul>
          )
        )}
      </div>
    </Container>
  );
}

export default NoteSection;
