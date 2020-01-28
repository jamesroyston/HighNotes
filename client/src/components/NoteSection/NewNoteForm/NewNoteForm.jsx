import React from 'react'

const NewNoteForm = props => (<div className="card">
<form className="card-body" onSubmit={e => props.handleSubmit(e)}>
  <div className="card-title input-group">
    <input autoComplete="off" value={props.title} onChange={props.updateTitle} id="title" name="title" type="text" placeholder="Title..." />
  </div>
  <div className="card-text input-group">
    <textarea autoComplete="off" value={props.description} onChange={props.updateDescription} placeholder="Description..." id="description" name="description" className="form-control" aria-label="With textarea"></textarea>
  </div>
  <button type="submit" className="btn-sm btn-outline-success">Submit</button>
</form>
</div>)

export default NewNoteForm
