const express = require('express')
const multer = require('multer')
const GridFsStorage = require("multer-gridfs-storage")
const crypto = require("crypto")
const path = require('path')
const dotenv = require('dotenv')
// .env setup
dotenv.config()
const mongoURI = process.env.MONGO_DB_URI

// Create a router container
const router = express.Router();

// importing User Schema
const Product = require('../../models/product')
const mongoose = require('../../models/db')

// mongoose connection
const conn = mongoose.createConnection(mongoURI, {
    useUnifiedTopology: true,
    useNewUrlParser:true,
    useCreateIndex:true,
});

// Init gfs
let gfs;
conn.once('open', () => {
    // Init stream
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
});

// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    options: {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({ storage });

// product page
router.get('/products', (req, res) => {
    res.render('products.html');    
});


// @route GET /add-products
// @desc Add products
router.get('/add-products', (req, res) => {
    res.render('add-products.html');
})

// @route POST /upload
// @desc Uploads file to DB
router.post('/upload-product', upload.single('file'), (req, res) => {
    res.json({ file: req.file })
})

// @route GET /files
// desc Display all files in JSON
router.get('/files', (req, res) => {
    gfs.find().toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }
        // files exist
        return res.json(files)
    })
});

// @route GET /files/:filename
// desc Display single files in JSON
router.get('/files/:fileid', (req, res) => {
    let _id = mongoose.Types.ObjectId(req.params.fileid);
    gfs.find({ _id: _id }).toArray((err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exist'
            });
        }
        // files exist
        return res.json(file)
    });
});

// @route GET /image/:filename
// desc Display image
router.get('/image/:fileid', (req, res) => {
    let _id = mongoose.Types.ObjectId(req.params.fileid);
    gfs.find({ _id: _id }).toArray((err, file) => {
        if (!file || file[0].length === 0) {
            return res.status(404).json({
                err: 'No file exist'
            });
        }
        // image only
        if(file[0].contentType === 'image/jpeg' || file[0].contentType === 'image/png') {
            // files exist
            console.log('file', file)
            // Read output to brower
            gfs.openDownloadStream(_id).pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    });
});

  
// export module
module.exports = router