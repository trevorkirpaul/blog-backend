const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const SALT_WORK_FACTOR = 10

const { Schema, model } = mongoose

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
})

// hash password

userSchema.pre('save', function(next) {
  let user = this

  // only hash pw if new
  if (!user.isModified('password')) return next()

  // generate salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err)

    //hash the pw using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err)

      //overwrite the cleartext password with the hashed one
      user.password = hash
      next()
    })
  })
})

userSchema.methods.comparePassword = function(candidatePassword) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (isMatch) {
      return true
    }

    return false
  })
}

const Model = model('user', userSchema)

module.exports = Model
