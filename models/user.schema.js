const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const mongooseDelete = require('mongoose-delete')

const saltRounds = 10

const NoteSchema = new mongoose.Schema({
    title: String,
    description: String,
}, {timestamps: true})

NoteSchema.plugin(mongooseDelete)

const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
        type: String,
        required: true
    },
    notes: [NoteSchema]
})

UserSchema.pre('save', function(next) {
    // Check if document is new or a new password has been set
    if (this.isNew || this.isModified('password')) {
      // Saving reference to this because of changing scopes
      const document = this;
      bcrypt.hash(document.password, saltRounds,
        function(err, hashedPassword) {
        if (err) {
          return next(err)
        } else {
          document.password = hashedPassword;
          next()
        }
      })
    } else {
      next()
    }
  })

  UserSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
      next(new Error('There was a duplicate key error'))
    } else {
      next(error)
    }
  });

UserSchema.methods.isCorrectPassword = function(password, cb) {
    bcrypt.compare(password, this.password, function(err, same) {
        if (err) {
            cb(err)
        } else {
            cb(err, same)
        }
    })
}

UserSchema.methods.delete = function() {
    NoteSchema.delete()
}

const User = mongoose.model('User', UserSchema)
const Note = mongoose.model('Note', NoteSchema)
module.exports = {
    User: User,
    Note: Note
}
