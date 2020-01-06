// set up server dependencies
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const cookieParser = require('cookie-parser')

app.use(express.json())
app.use(cookieParser())

// import any routes

// middlewares

// connect to DB
const db = ''
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('db connected!'))
    .catch(err => console.log(`db connection error: ${err.message}`))

// serve static assets from client
app.use(express.static(path.join(__dirname, 'client/build')))

// if build is missing, send index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'))
})

const port = 4001

app.listen(port, () => console.log(`listening on port ${port}`))