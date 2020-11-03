const express = require('express')
const Stripe = require('stripe')
const dotenv = require('dotenv')
// .env setup
dotenv.config()

// stripe api key set up
// const stripePublicKey = process.STRIPE_PUBLIC_KEY
// const stripeSecretKey = process.STRIPE_SECRET_KEY

// Create a router container
const router = express.Router();

// importing User Schema
const Product = require('../../models/product')