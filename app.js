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

// import models
const User = require('./models/user.schema')

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
        maxAge: 1000 * 60 * 60 * 24 * 7 * 2 // two weeks,
    }
}))

// POST signup
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body
    console.log('asdfasdf', req.body)
    const user = new User({ username, password })
    try {
        await user.save().catch(err => {
            throw err;
        })
        res.status(200).json('registration successful')
    } catch (err) {
        if (err.toString() === 'Error: There was a duplicate key error') {
            res.status(200).json({ error: "duplicate username, maybe try resetting your password" })
        } else {
            res.status(500).json({ error: `internal error, ${err}` })
        }
    }
})

// POST login
app.post('/api/login', (req, res) => {
    console.log(req.body)
    console.log(req.session)
    console.log(req.cookies)
    const { username, password } = req.body
    User.findOne({ username }, function (err, user) {
        console.log(user)
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
                res.status(200).json({
                    sameVal: `isSamePassword value: ${isSamePassword}`,
                    response: `user: ${user.username} logged in successfully`
                })
            }
        })
    })
})


// GET username / profile if logged in
app.get('/api/profile', async (req, res, next) => {
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
                    res.json({
                        username: user.username,
                        notes: [...user.notes]
                    })
                }
            }
        })
})

// GET all users
app.get('/api/showallusers', function (req, res) {
    if (req.session) {
        User.find({}, function (err, users) {
            var userMap = {};

            users.forEach(function (user) {
                userMap[user._id] = user.username;
            });

            res.send(userMap);
        });
    }
    res.send('sorry, you must log in to see other users')
})

// GET logout 
app.get('/api/logout', function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err)
            } else {
                return User.findById(req.session.userId)
                    .exec(function (error, user) {
                        if (error) {
                            return next(error);
                        } else {
                            if (user === null) {
                                var err = new Error('Not authorized! Go back!');
                                err.status = 400;
                                return next(err);
                            } else {
                                return res.send(`user: ${user.username}`)
                            }
                        }
                    })
            }
        })
    }
})

// POST new note to user
app.post('/api/newnote', function (req, res) {
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
        res.send(`user notes updated. here's the notes: ${user.note}`)

    }
    )
})

// PATCH update notes

// DELETE hard-delete notes
app.delete('/api/:noteId', async function (req, res) {
    console.log(req.params)
    if (req.session) {

        User.findById(req.session.userId, function (err, user) {
            console.log(user)
            if (err) {
                return res.json({ err: err, gay: 'yup' })
            }
            if (user === null) {
                let err = new Error('Not logged in!!')
                err.status = 400
                return res.send(err)
            }
            console.log('length before', user.notes.length)
            user.notes = user.notes.filter(note => note._id.toString() !== req.params.noteId.toString())
            console.log('length after', user.notes.length)
            console.log(user.notes)
            user.save()
            res.send(`user note deleted`)
        })
    }
})

// serve static assets from client
// app.use(express.static(path.join(__dirname, 'client/build')))

// serve index.html from client build folder
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname + '/client/build/index.html'))
// })

app.listen(process.env.PORT, () => console.log(`listening on port ${process.env.PORT}`))