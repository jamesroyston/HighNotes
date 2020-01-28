import React from 'react'
import moment from 'moment'

const NoteCard = props => (<div key={props.dataNoteId} data-note-id={props.dataNoteId} className="card">
  <div className="card-body">
    <h5 className="card-title">{props.title}</h5>
    <p className="card-text">{props.description}</p>
    <button onClick={e => props.deleteNote(e)} type="button" className="btn-sm btn-outline-danger">Delete</button>
    <button onClick={e => props.toggleShareForm(e)} type="button" className="btn-sm btn-outline-success">Share</button>
    {
      props.showShareFormId === props.dataNoteId ? (
        <form className="input-group" onSubmit={e => props.shareNote(e)}>
          <div className="input-group-prepend">
            <button className="btn-sm btn-info" type="submit">Send note to: </button>
          </div>
          <select
            id="userSelect"
            onChange={e => {
              return props.updateRecipient(e)
            }}
            value={props.recipient} className="custom-select" placeholder="users...">
            {props.userList.map(user => <option
              key={user.userId}
              value={user.userId}
              data-user-name={user.username}
            >
              {user.username}
            </option>)
            }
          </select>
        </form>) : ''
    }
    <p className="card-text"><small className="text-muted">Created {moment(props.updatedAt).format("MMMM Do YYYY, h:mm a")}</small></p>
    <p className="card-text"><small className="text-muted">Last updated {moment(props.updatedAt).fromNow()}</small></p>
  </div>
</div>)

export default NoteCard