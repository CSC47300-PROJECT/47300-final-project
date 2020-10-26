const mongoose = require('./db')
const passportLocalMongooseEmail = require('passport-local-mongoose-email')

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String
    },
    password: {
        type: String
    } 
});


UserSchema.plugin(passportLocalMongooseEmail, {
    usernameField: 'email'
});

module.exports = mongoose.model('User', UserSchema);