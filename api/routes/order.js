const express = require('express')
const Stripe = require('stripe')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
// .env setup
dotenv.config()

// stripe api key set up
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

const stripe = require('stripe')(stripeSecretKey);

// Create a router container
const router = express.Router();

// importing db Schema
const Product = require('../../models/product')
const Order = require('../../models/order')
const User = require('../../models/user')
const { session } = require('passport')
const product = require('../../models/product')


router.get('/cart', (req, res) => {
  res.render('cart.html')
})

router.post('/cart', (req, res) => {
  console.log(req.body)
  let product = {product: req.body}
  Order.create(product, (err, orderList) => {
    if (err) {
      console.log(err)
    } else {
      console.log(orderList._id)
      res.redirect(`/checkout/${orderList._id}`)
    }
  });
});


router.get("/checkout/:id", (req, res) => {
  res.render('checkout.html', {
    publicKey: stripePublicKey
  })
})

router.post('/create-session', async (req, res) => {
  let userinfo = req.body[1]
  let product = req.body[0]
  // console.log(product[0].price_data.product_data.name)
  // console.log(product[0].quantity)
  var products = [];
  for (let i = 0; i < product.length; i++) {
    products.push({productName : product[i].price_data.product_data.name, quantity : product[i].quantity }); 
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
  console.log('orderList', orderList)
  Order.create(orderList, (err, order) => {
    if (err) {
      console.log(err)
    } 
  })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: 
      req.body[0],
    // line_items: [
    //   {
    //     price_data: {
    //       currency: 'usd',
    //       product_data: {
    //         name: 'Stubborn Attachments',
    //         images: ['https://i.imgur.com/EHyR2nP.png'],
    //       },
    //       unit_amount: 2000,
    //     },
    //     quantity: 1,
    //   },
  
    mode: 'payment',
    success_url: `http://127.0.0.1:5000/order/success/${req.params.id}`,
    cancel_url: `http://127.0.0.1:5000/order/cancel/${req.params.id}`,
  });

  res.json({ id: session.id });
  console.log(session.id)
});


router.get("/order/success/:id", async (req, res) => {
  console.log(req.params.id)
  res.render('success.html')
})

router.get("/order/cancel/:id", (req, res) => {
  console.log(req.params.id)
  res.render('cancel.html')
})


// export module
module.exports = router