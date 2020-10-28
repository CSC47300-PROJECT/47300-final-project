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
    img: {
        data: Buffer,
        contentType: String
    }

});

module.exports = mongoose.model('Product', ProductSchema);
