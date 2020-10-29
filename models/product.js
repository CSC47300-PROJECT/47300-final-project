const mongoose = require('./db')

const ProductSchema = mongoose.Schema({
    ProductName: {
        type: String,
        required: true
    },
    species: String,
    amount: Number,
    price: Number,
    Qty: Number,
    unit: String,
    description: String,
    img_id : String,
    img_name: String
});

module.exports = mongoose.model('Product', ProductSchema);
