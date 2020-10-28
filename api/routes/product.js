const express = require('express')
const multer = require('multer')

// Create a router container
const router = express.Router();

// importing User Schema
const Product = require('../../models/product')

// product page
router.get('/products', (req, res) => {
    res.render('products.html');    
});
  
router.get('/add-products', (req, res) => {
    res.render('add-products.html');
})
  
// export module
module.exports = router