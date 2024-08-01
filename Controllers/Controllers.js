require('dotenv').config()
const User = require('../Models/User_Models')
const bcrypt = require("bcrypt")
const cookie = require('cookie-parser')
const jwt = require('jsonwebtoken')
const Product = require('../Models/Products_Model')
const port = 1000;
const key = process.env.JWT_KEY

const login = async (req, res) => {
    const { email, password } = req.body;

    //Finding the email exists in Datavse or not.
    const finduser = await User.findOne({ email })
    if (finduser) {
        const compare_pass = await bcrypt.compare(password, finduser.password)
        if (compare_pass) {
            const token = jwt.sign({ id: finduser._id }, key)
            res.cookie('Hamza', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 3 * 60 * 60 * 1000, // 3 hours
                path: '/'
            })
            res.json({ success: true, message: 'Login Successfull', token, user: finduser.UserName, key })
        }
        else
            res.json({ success: false, message: 'Passwrd Wrong !' })
    }
    else
        res.json({ success: false, message: 'Email Wrong !' })

}
//////////////////////////////////////////////
const logoutfunction = async (req, res) => {
    const getcookie = req.cookies; // Use req.cookies to get cookies parsed by cookie-parser
    console.log('hiiii');

    res.clearCookie('Hamza'); // Clear the specific cookie

    res.json({ message: 'Logout successful' }); // Respond with a success message
}

/////////////////////////////////////////////////////////////////////////
const updateuser = async (req, res) => {

    const userupdate = await User.findByIdAndUpdate({ _id: req.body.id }, { role: req.body.options }, { new: true })
    console.log(userupdate.role)
}
const getallusers = async (req, res) => {
    const a = req.getuserid
    const allusers = await User.find({})

    allusers.map(e => e.password = undefined)
    allusers.map(e => e.Profile = undefined)
    const filteredusers = allusers.filter(e => e._id != a)

    // console.log(req.getuserid)
    res.json(filteredusers)
    console.log(filteredusers.length)
}
///////////////////////////////////////////////////////////////////////////////////////////////////

const addtocart = async (req, res) => {
    const id = req.body.id;
    const token = req.cookies
    if (!token) {
        res.json({ success: false, message: 'Please Login !' })
    }
    // const findproduct = await User.findOne({ _id: req.getuserid })
    // console.log(findproduct.cart.findOne({ _id: id }))
    const updateuser = await User.findOneAndUpdate({ _id: req.getuserid }, { $push: { cart: id } }, { new: true })
    res.json({ success: true, message: 'Successfuly added to cart !' })


}
////////////////////////////////////////////////////////
const getallcategories = async (req, res) => {
    const categories = await Product.distinct("category");
    // const fetchallp = await Product.find({}, { oldprice: 0, newprice: 0, description: 0, title: 0 })

    const fetchallp = await Promise.all(categories.map(async (category) => {
        const product = await Product.findOne({ category }, { image: 1 });
        return { category, image: product.image[0] };
    }));
    res.json(fetchallp)
}
///////////////////////////////////////////
const checklogin = async (req, res) => {
    const getcookie = req.cookies;
    console.log('coop33 cde3kie', getcookie)
    if (getcookie) {
        res.json({ message: 'found', success: true })
    }
    else { res.json({ message: 'not found', success: false }) }
}


const getuser = async (req, res) => {

    const getuser = await User.findOne({ _id: req.getuserid })
    getuser.password = undefined
    res.json({ user: getuser, success: true })

}
const addproduct = (req, res) => {



    const imageUrls = req.files.map(file => file.path);

    const Allproducts = Product.create({
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        oldprice: req.body.oldprice,
        newprice: req.body.newprice,
        image: imageUrls
    }).then(() => res.json({ message: 'Product Added !', status: 202, success: true })).catch((err) => res.json(err))

}
////////////////
module.exports = { logoutfunction, updateuser, addproduct, getuser, getallusers, login, addtocart, getallcategories, checklogin } 