const express = require('express')
const Stripe = require('stripe')
const dotenv = require('dotenv')
<<<<<<< HEAD
=======
const bodyParser = require('body-parser')
>>>>>>> Jiande_Li
// .env setup
dotenv.config()

// stripe api key set up
<<<<<<< HEAD
// const stripePublicKey = process.STRIPE_PUBLIC_KEY
// const stripeSecretKey = process.STRIPE_SECRET_KEY
=======
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

const stripe = require('stripe')(stripeSecretKey);
>>>>>>> Jiande_Li

// Create a router container
const router = express.Router();

<<<<<<< HEAD
// importing User Schema
const Product = require('../../models/product')
=======
// importing db Schema
const Product = require('../../models/product')
const Order = require('../../models/order')
const User = require('../../models/user')
const { session } = require('passport')
const product = require('../../models/product')


// router.get('/cart', (req, res) => {
//   res.render('cart.html')
// })

// @route POST /
// @desc POST shopping cart items
router.post('/cart', (req, res) => {
  // console.log(req.body)
  let product = {product: req.body}
  Order.create(product, (err, orderList) => {
    if (err) {
      console.log(err)
    } else {
      // console.log(orderList._id)
      res.redirect(`/checkout/${orderList._id}`)
    }
  });
});

// @route GET /
// @desc Display checkout page 
router.get("/checkout/:id", (req, res) => {
  let orderId = req.params.id
  Order.findOne({_id:orderId}, (err, orderList) => {
    if (err) {
      console.log(err)
    } 
    if (orderList) {
      var products = orderList.product
      var str = JSON.stringify(products)
      products = JSON.parse(str)
      res.render('checkout.html', {
        products: products,
        publicKey: stripePublicKey,
        orderId: orderId
      });
    } else {
      res.redirect('back');
    } 
  })
})

// @route POST /
// @desc Create stripe sessoon and rederict to stripe checkout page
router.post('/create-session', async (req, res) => {
  let orderId = req.body[2]
  // console.log('orderId!!!:' ,orderId)
  let userinfo = req.body[1]
  let product = req.body[0]
  var products = []
  // console.log('images: :', product[0].price_data.product_data.images)
  for (let i = 0; i < product.length; i++) {
    products.push({
      productName : product[i].price_data.product_data.name,
      unit_amount: product[i].price_data.unit_amount,
      img_id: product[i].price_data.product_data.images[0],
      quantity : product[i].quantity
    }); 
  }
  let username = userinfo[0].firstName + " " + userinfo[0].lastName
  let shippingAddress = userinfo[0].shippingAddress
  let state = userinfo[0].state
  let zipcode = userinfo[0].zip
  let city = userinfo[0].city
  let orderList = {
    userInfo: {
      username,
      shippingAddress,
      state,
      zipcode,
      city
    },
    product: [products[0],]
  }
  if (products.length > 1) {
    for (let j = 1; j < products.length; j++) {
      orderList.product.push(products[j])
    }  
  }
  // console.log('orderList', orderList)
  Order.findByIdAndUpdate(orderId, orderList, (err) => {
    if (err) {
      console.log(err)
    } 
  })

  // console.log('body', req.body[0])
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: 
      req.body[0],
    mode: 'payment',
    success_url: `http://127.0.0.1:5000/order/success/${orderId}`,
    cancel_url: `http://127.0.0.1:5000/order/cancel/${orderId}`,
  });
  
  res.json({ id: session.id });
  // console.log(session.id)
});

// @route GET /
// @desc Display order success info and display item details agian
// update Product.amount data base
router.get("/order/success/:id", async (req, res) => {
  Order.findById(req.params.id, (err, orderList) => {
    if (err) {
      console.log(err)
    }
    if (orderList) {
      var products = orderList.product
      var products = orderList.product
      var str = JSON.stringify(products)
      products = JSON.parse(str)
      var productname = []
      var productAmount = []
      for (let i = 0; i < products.length; i++) {
        productname.push(products[i].productName)
        productAmount.push(products[i].quantity)
      }
      Product.find({'productName':{ $in:productname}}, (err, docs) => {
        if (err) {
          console.log(err)
        }
        if (docs) {
          for (let j = 0; j < docs.length; j++) {
            if (docs[j].amount - productAmount <= 0) {
              docs[j].amount = 'sold out'
            } 
            else {
              docs[j].amount -= productAmount[j]
            }
            docs[j].sold += productAmount[j]
            docs[j].save()
          }
        }
      })
      res.render('success.html', {
        products: products
      } )
    } else {
      res.render('success.html')
    }
  })
})

// @route GET /
// @desc Display cancel page
router.get("/order/cancel/:id", (req, res) => {
  res.render('cancel.html')
})


// export module
module.exports = router
>>>>>>> Jiande_Li
