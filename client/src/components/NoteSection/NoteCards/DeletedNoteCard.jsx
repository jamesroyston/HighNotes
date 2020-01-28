import React from 'react'
import moment from 'moment'

const DeletedNoteCard = props => (
  <div key={props.dataNoteId} data-note-id={props.dataNoteId} className="card">
    <div className="card-body">
      <h5 className="card-title">{props.title}</h5>
      <p className="card-text">{props.description}</p>
      <button onClick={e => props.restoreNote(e)} type="button" className="btn-sm btn-outline-secondary">Restore</button>
      <p className="card-text"><small className="text-muted">Created {moment(props.updatedAt).format("MMMM Do YYYY, h:mm a")}</small></p>
      <p className="card-text"><small className="text-muted">Last updated {moment(props.updatedAt).fromNow()}</small></p>
    </div>
  </div>
)

export default DeletedNoteCard