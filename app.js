const express = require('express')
const bodyParser = require('body-parser')
// const passport = require('passport')
// const flash = require('express-flash')
// const session = require('express-session')
const multer = require('multer');
const GridFsStorage = require("multer-gridfs-storage");
const path = require('path')
const cors = require('cors')
const crypto = require("crypto");
const favicon = require('serve-favicon')

// create server
const app = express(); 

// LocalStrategy
const LocalStrategy = require('passport-local').Strategy;

// require router.js
const router = require('./router')

// art-template engine
app.engine('html', require('express-art-template'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// static path
app.use(express.static(__dirname + '/public'))
app.use('/node_modules/', express.static(__dirname + '/node_modules'))

app.use(cors());

// models - User
// const User = require('./models/user')


// calling router.js
app.use(router)


app.listen(5000, (req, res) => {
    console.log('47300 is running at port 5000')
})