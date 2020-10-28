const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const GridFsStorage = require("multer-gridfs-storage")
const Grid = require('gridfs-stream')
const path = require('path')
const methodOverride = require('method-override')
const cors = require('cors')
const crypto = require("crypto")
const favicon = require('serve-favicon')

// create server
const app = express(); 

// LocalStrategy
const LocalStrategy = require('passport-local').Strategy;

// require router.js
const index = require('./api/routes/index')
const product = require('./api/routes/product')

// art-template engine
app.engine('html', require('express-art-template'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// Middleware parse application/json
app.use(bodyParser.json())
app.use(methodOverride('_method'))

// static path
app.use(express.static(__dirname + '/public'))
app.use('/node_modules/', express.static(__dirname + '/node_modules'))

app.use(cors());

// calling router.js
app.use(index)
app.use(product)


app.listen(5000, (req, res) => {
    console.log('47300 is running at port 5000')
})