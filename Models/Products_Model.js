const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    category: {
        type: String,
    },
    title: {
        type: String
    },
    image: [{
        type: String
    }],
    description: {
        type: String
    },
    oldprice: {
        type: Number,
    },
    newprice: {
        type: Number,
    }
});

const Product = mongoose.model('Products', ProductSchema)

module.exports = Product;
