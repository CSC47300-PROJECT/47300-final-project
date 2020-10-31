const mongoose = require('./db')

const ProductSchema = mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    species: String,
    amount: Number,
    price: Number,
    netweight: String,
    desc: String,
    img_id : String,
    sold: { type: Number,
            default: 0
    }
});

module.exports = mongoose.model('Product', ProductSchema);
