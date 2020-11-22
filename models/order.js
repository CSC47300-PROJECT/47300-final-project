const mongoose = require('./db')

const OrderSchema = mongoose.Schema({
    userInfo:{
      username: String,
      shippingAddress: String,
      state: String,
      zipcode: Number,
      city: String,
    },
    product: [{
      quantity: Number,
      productName: String,
      img_id : String, 
    }]
});

module.exports = mongoose.model('Order', OrderSchema);