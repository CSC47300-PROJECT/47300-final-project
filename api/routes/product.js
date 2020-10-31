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


// @route GET /
// @desc Display home page
router.get('/', (req, res) => {
    Product.find((err, products) => {
        if (err) {
            req.session.flash = { type: 'danger', text: err.message }
            res.redirect('/')
        }
        res.render('index.html', {
            products: products
        })
    })
});

// @route GET /products
// @desc Display product page
router.get('/products', (req, res) => {
    Product.find((err, products) => {
        if (err) {
            req.session.flash = { type: 'danger', text: err.message }
            res.redirect('/products')
        }
        res.render('products.html', {
            products: products
        })
    })    
});


// @route GET /add-products
// @desc Add products
router.get('/add-products', (req, res) => {
    res.render('add-products.html');
})

// @route POST /upload
// @desc Uploads file to DB
router.post('/upload-product', upload.single('file'), (req, res) => {
    Product.findOne({
        productName: req.body.productName,
        netweight: req.body.netweight
    }, (err, product) => {
        if (err) {
            req.session.flash = { type: 'danger', text: err.message }
            res.redirect('back')
        } else if (product) {
            gfs.delete(req.file.id, (err) => {
                if (err) {
                    req.session.flash = { type: 'danger', text: err.message }
                    res.redirect('back')
                }
                req.session.flash = { type: 'danger', text: 'Product already exist'}
                res.redirect('back')
            })
        } else {
            let productInfo = {
                ...req.body,
                img_id: req.file.id
            }
            Product.create(productInfo, (err) => {
                if (err) {
                    req.session.flash = { tpye: 'danger', text: err.message }
                    res.redirect('back')
                }
                req.session.flash = { type: 'success', text: 'Add product successfully!'}
                res.redirect('back')
            });
        };
    });   
});
    
// @route GET /show-products
// @desc Display modify products
router.get('/modify-products', (req, res) => {
    Product.find((err, products) => {
        if (err) {
            req.session.flash = { type: 'danger', text: err.message }
            res.redirect('/modify-products')
        }
        console.log(products)
        res.render('modify-products.html', {
            products: products
        })
    })
})

// @route GET /modify-products/:id
// @desc Display modify product page
router.get('/modify-products/:id', (req, res) => {
    Product.findById(req.params.id, (err, products) => {
        if (err) {
            req.session.flash = { type: 'danger', text: err.message }
            res.redirect('back')
        }
        res.render('update-product.html', {
            products: products
        })
        
    })
});

// @route POST /modify-produts/:id
// @desc Modify product by product id
router.post('/modify-product/:id', upload.single('file'), (req, res) => {
   let updatedProduct;
   if (req.file) {
    let oldImage_id = mongoose.Types.ObjectId(req.body.img_id);
    gfs.delete(oldImage_id, (err) => {
        if (err) {
            console.log(err.message)
        }
    });
    updatedProduct = {
        ...req.body,
        img_id: req.file.id
    };
   } else {
       updatedProduct = {
           ...req.body
       }
   }
   Product.findByIdAndUpdate(req.params.id, updatedProduct, (err) => {
    if (err) {
        req.session.flash = { type: 'danger', text: 'update product failed' }
        res.redirect('back')
    } else {
        req.session.flash = { type: 'success', text: 'update product successfully!'}
        res.redirect('back')
    }
    });
});

// @route POST /delete-products/:id
// @desc Delete product
router.delete('/delete-product/:id', (req, res) => {
    let oldImage_id = mongoose.Types.ObjectId(req.body.img_id);
    gfs.delete(oldImage_id, (err) => {
        if (err) {
            console.log(err.message)
        }
    });
    Product.remove({
        _id: req.params.id
    }, (err) => {
        if (err) {
            req.session.flash = { type: 'danger', text: err.message }
            res.redirect('back')
        }
        req.session.flash = { type: 'success', text: 'Delete product successfully!' }
        res.redirect('/modify-products')
    });
});


// @route GET /files
// @desc Display all files in JSON
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
// @desc Display single files in JSON
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
// @desc Display image
router.get('/image/:fileid', (req, res) => {
    let _id = mongoose.Types.ObjectId(req.params.fileid);
    gfs.find({ _id: _id }).toArray((err, file) => {
        // console.log(file)
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exist'
            });
        }
        // image only
        if (file[0].contentType === 'image/jpeg' || file[0].contentType === 'image/png') {
            // files exist
            // console.log('file', file)
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