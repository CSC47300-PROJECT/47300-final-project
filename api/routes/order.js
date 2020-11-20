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

// importing User Schema
const Product = require('../../models/product')

router.get("/checkout", (req, res) => {
  res.render('checkout.html', {
    publicKey: stripePublicKey
  })
})

router.get("/order/success", (req, res) => {
  res.render('success.html')
})

router.get("/order/cancel", (req, res) => {
  res.render('cancel.html')
})

router.post('/create-session', async (req, res) => {
  console.log(req.body)
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: 
      req.body,
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
    //   {
    //     price_data: {
    //       currency: 'usd',
    //       product_data: {
    //         name: 'Stubborn Attachments',
    //         images: ['https://i.imgur.com/EHyR2nP.png'],
    //       },
    //       unit_amount: 4000,
    //     },
    //     quantity: 2,
    //   },
    // ],
    mode: 'payment',
    success_url: 'http://127.0.0.1:5000/order/success',
    cancel_url: 'http://127.0.0.1:5000/order/cancel',
  });
  res.json({ id: session.id });
});


// export module
module.exports = router