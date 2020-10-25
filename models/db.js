// connect mongoDB 
const mongoose = require('mongoose')
const dotenv = require('dotenv')
// .env setup
dotenv.config()
const mongoURI = process.env.MONGO_DB_URI

mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err) {
    if (err) {
        console.log(err)
    } else {
        console.log('DB connected!')
    }
});

module.exports = mongoose