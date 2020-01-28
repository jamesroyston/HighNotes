// set up server dependencies
const express = require('express')
const app = express()
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')

require('dotenv/config')

// middlewares
app.use(cors())
app.use(express.json())
app.use(cookieParser())

const isAuthenticated = (req, res, next) => {
  if (req.session.userId || req.session.isAuthenticated) {
    return next()
  }
}

// import models
const { User } = require('./models/user.schema')
const { Note } = require('./models/user.schema')

// connect to DB
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true, dbName: 'notes-app' })
  .then(() => console.log('db connected!'))
  .catch(err => console.log(`db connection error: ${err.message}`))

// reuse current mongoose connection for session store
app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  }),
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 * 2, // two weeks
  }
}))

// POST signup
app.post('/api/signup', async (req, res) => {
  console.log(req.body)
  const { username, password } = req.body
  const user = new User({ username, password })
  try {
    await user.save().catch(err => {
      throw err;
    })
    res.status(200).send('registration successful')
  } catch (err) {
    if (err.toString() === 'Error: There was a duplicate key error') {
      res.status(302).json({ error: "duplicate username, maybe try resetting your password" })
    } else {
      res.status(500).json({ error: `internal error, ${err}` })
    }
  }
})

// POST login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  User.findOne({ username }, function (err, user) {
    if (err) {
      console.error(err)
      return res.status(500)
        .json({
          error: 'internal error please try again'
        })
    }
    if (!user) {
      return res.status(401)
        .json({
          error: 'incorrect username or password'
        })
    }
    user.isCorrectPassword(password, function (err, isSamePassword) {
      if (err) {
        res.status(500)
          .json({
            error: 'internal error please try again'
          })
      } else if (!isSamePassword) {
        res.status(401)
          .json({
            isSamePassword: `${isSamePassword}`,
            error: 'incorrect username or password'
          })
      } else {
        // log them in, update session with user._id
        req.session.userId = user._id
        req.session.username = user.username
        req.session.isAuthenticated = true
        res.status(200).json({
          isAuthenticated: isAuthenticated,
          username: user.username
        })

      }
    })
  })
})

// GET still auth
app.get('/api/sessioncheck', (req, res) => {
  if (req.session.userId || req.session.isAuthenticated) {
    return res.status(200).json({
      isAuthenticated: req.session.isAuthenticated,
      username: req.session.username
    })
  }
  res.sendStatus(404)
})


// GET username / profile if logged in
app.get('/api/profile', isAuthenticated, (req, res, next) => {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          const localArr = [...user.notes]
          const notes = localArr.filter(note => {
            return note.deleted === false
          }).reverse()

          const deleted = localArr.filter(note => {
            return note.deleted === true
          }).reverse()
          res.status(200).json({
            isAuthenticated: isAuthenticated,
            username: user.username,
            notes: {
              length: notes.length,
              notes: notes
            },
            deleted: {
              length: deleted.length,
              notes: deleted
            }
          })
        }
      }
    })
})

// GET all users
app.get('/api/showallusers', isAuthenticated, function (req, res) {
  if (req.session) {
    User.find({}, function (err, users) {
      let userArray = []

      users.forEach(function (user) {
        userArray.push({
          username: user.username,
          userId: user._id
        })
      })

      res.json({ users: [...userArray] })
    });
  }
  if (!req.session) res.send('sorry, you must log in to see other users')
})

// GET logout 
app.get('/api/logout', isAuthenticated, async function (req, res, next) {
  await req.session.destroy()
  await res.sendStatus(200)
  return
})

// POST new note to user
app.post('/api/newnote', isAuthenticated, function (req, res) {
  console.log(req.body.title, req.body.description)
  const { title, description } = req.body
  const user = User.findById(req.session.userId)
  user.exec(function (error, user) {
    if (error) {
      return res.send(error)
    }

    if (user === null) {
      var err = new Error('Not logged in!!');
      err.status = 400;
      return res.send(err)
    }

    const note = {
      title,
      description
    }

    user.notes.push(note)
    console.log(user.notes)
    user.save()
    res.json({
      user: user.username,
      notes: user.notes.reverse()
    })

  }
  )
})

// POST share note with other user after a GET for all users
app.post('/api/share', isAuthenticated, function (req, res) {
  console.log(req.body.userId, req.body.noteId)
  if (!req.body.userId || !req.body.noteId) {
    return res.sendStatus(404).send('error: missing noteId or userId')
  }
  const targetUser = req.body.userId
  const noteToShareId = req.body.noteId
  let newNoteBasedOnSharedNote = {}

  let sender = User.findById(req.session.userId)
  let recipient = User.findById(targetUser)
  // find logged in user

  sender.exec(async function (error, user) {
    try {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          // copy notes array and find the note to share by filtering with noteId
          const localArr = [...user.notes]
          const { title, description } = await localArr.filter(note => note._id.toString() === noteToShareId.toString())[0]
          newNoteBasedOnSharedNote = {
            title,
            description
          }
          console.log('new note based on old note', newNoteBasedOnSharedNote)
          await recipient.exec(function (error, user) {
            if (error) {
              return next(error);
            } else {
              if (user === null) {
                var err = new Error('Not authorized! Go back!');
                err.status = 400;
                return next(err);
              } else {
                // update their notes array with our note
                console.log('copy', newNoteBasedOnSharedNote)
                // user.notes = []
                const note = new Note(newNoteBasedOnSharedNote)
                user.notes.push(note)
                console.log(user.notes)
                user.save()
              }
            }
            res.json({
              user: user.username,
              notes: user.notes
            })
          })
        }
      }
    } catch (e) {
      res.json({ error: e })
    }

  })
})

// DELETE notes
app.patch('/api/delete', isAuthenticated, async function (req, res) {
  const { noteId } = req.body
  if (req.session) {
    User.findById(req.session.userId, function (err, user) {
      if (err) {
        return res.json({ err: err })
      }
      if (user === null) {
        let err = new Error('Not logged in!!')
        err.status = 400
        return res.send(err)
      }
      console.log('length before', user.notes.length)
      user.notes.map(note => {
        if (note._id.toString() === noteId.toString()) {
          note.deleted = !note.deleted
        }
      })
      const localArr = [...user.notes]
      const notes = localArr.filter(note => {
        return note.deleted === false
      }).reverse()

      const deleted = localArr.filter(note => {
        return note.deleted === true
      }).reverse()
      user.save()
      res.status(200).json({
        username: user.username,
        notes: {
          length: notes.length,
          notes: notes
        },
        deleted: {
          length: deleted.length,
          notes: deleted
        }
      })
    })
  }
})

// RESTORE notes
app.patch('/api/restore', isAuthenticated, async function (req, res) {
  const { noteId } = req.body
  if (req.session) {
    User.findById(req.session.userId, function (err, user) {
      if (err) {
        return res.json({ err: err })
      }
      if (user === null) {
        let err = new Error('Not logged in!!')
        err.status = 400
        return res.send(err)
      }
      console.log('length before', user.notes.length)
      user.notes.map(note => {
        if (note._id.toString() === noteId.toString()) {
          note.deleted = !note.deleted
        }
      })
      const localArr = [...user.notes]
      const notes = localArr.filter(note => {
        return note.deleted === false
      }).reverse()

      const deleted = localArr.filter(note => {
        return note.deleted === true
      }).reverse()
      user.save()
      res.status(200).json({
        username: user.username,
        notes: {
          length: notes.length,
          notes: notes
        },
        deleted: {
          length: deleted.length,
          notes: deleted
        }
      })
    })
  }
})

/*
** NOTE: ONLY UNCOMMENT THE LINES BELOW ONCE YOU'RE READY 
** TO SERVE THE REACT BUILD
*/

// **serve static assets from client
app.use(express.static(path.join(__dirname, 'client/build')))

// **serve index.html from client build folder
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'))
})

app.listen(process.env.PORT, () => console.log(`listening on port ${process.env.PORT}`))