require('dotenv').config()
//
const mongoose = require('mongoose')
const express = require('express')
const User = require('./Models/User_Models')
const app = express()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')
const multer = require('multer')
const Product = require('./Models/Products_Model')
const { updateuser, logoutfunction, addproduct, getallusers, getuser, checklogin, login, addtocart, getallcategories } = require('./Controllers/Controllers')
const stripekey = process.env.STRIPE_KEY
const port = process.env.PORT;
const stripe = require('stripe')(stripekey)
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
})); app.use(cookieParser())
app.use(express.json())

app.use('/images', express.static('upload/images'));

mongoose.connect(`${process.env.DATABASE_URL}`)
    .then(() => console.log('DataBase Created'))
    .catch((err) => console.log(err))

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,           // Replace with your actual Cloudinary cloud name
    api_key: process.env.API_KEY,       // Replace with your actual Cloudinary API key
    api_secret: process.env.API_SECRETKEY // Replace with your actual Cloudinary API secret
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        if (!file.mimetype.startsWith('image/')) {
            throw new Error('File is not an image');
        }
        return {
            folder: 'all_images',
            public_id: file.originalname.split('.')[0],
            format: file.originalname.split('.').pop()
        };
    },
});
const uploadfile = multer({ storage: storage });

// const storage = multer.diskStorage({
//     destination: 'upload/images', // Assuming 'uploads' is in the root of your project
//     filename: (req, file, cb) => {
//         return cb(null, `${file.originalname}_${Date.now()}${path.extname(file.originalname)}`)
//     }
// });
// const uploadfile = multer({ storage: storage });


app.post('/register', async (req, res) => {
    const { UserName, email, password } = req.body;
    const Users = await User.create({
        UserName, email, password

    })

    const token = jwt.sign({ id: Users._id }, process.env.JWT_KEY)
    res.json({ success: true, Users, token })
})



//Middleware for verification of user jwt token

const userverification = (req, res, next) => {
    const getCookieValue = (cookieString, cookieName) => {
        if (!cookieString) {
            return null; // Return null if the cookie string is undefined or empty
        }

        const cookies = cookieString.split('; ');
        for (let cookie of cookies) {
            const [name, value] = cookie.split('=');
            if (name === cookieName) {
                return value;
            }
        }
        return null;
    }

    const cookieString = req.headers.cookie;
    const token = getCookieValue(cookieString, 'Hamza');


    if (!token) {
        res.json({ status: 400, message: 'Token Missing' })
    }
    else
        jwt.verify(token, 'thisisisisismy', (err, decode) => {
            req.getuserid = decode.id
            next()
        })

}
app.post('/login', login)
app.get('/user', userverification, getuser)
app.get('/checklogin', checklogin)
app.get('/getalluser', userverification, getallusers)
app.patch('/updateuser', userverification, updateuser)
app.post('/logout', userverification, logoutfunction);
app.post('/upload', uploadfile.array('image', 5), addproduct);
app.get('/getcategories', getallcategories)
app.post('/addtocart', userverification, addtocart)

app.get('/getallproducts', async (req, res) => {
    try {
        const getallp = await Product.find({})
        res.json({ message: 'Success', status: 202, success: true, getallp })

    }
    catch {
        res.json({ message: 'error', status: 404, success: false })
    }

})




app.post('/deletecart', userverification, async (req, res) => {
    const id = req.body.id;



    const updateuser = await User.findOneAndUpdate({ _id: req.getuserid }, { $pull: { cart: id } }, { new: true })
    res.json({ success: true, message: 'Successfuly removed from cart !' })

})


app.post('/updateItems', uploadfile.array('image'), async (req, res) => {

    const { oldprice, newprice, description, title, _id } = req.body

    const imageUrls = req.files.map(file => file.path);
    const finda = await Product.findOneAndUpdate({ _id }, { oldprice, newprice, description, title }, { new: true })


})
app.post('/stripe-payment', async (req, res) => {
    try {
        // Validate request body
        if (!Array.isArray(req.body) || !req.body.every(e => e.title && e.newprice)) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        // Log titles


        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: req.body.map(e => ({
                price_data: {
                    currency: 'usd', // Specify your currency
                    product_data: {
                        name: e.title,
                    },
                    unit_amount: e.newprice * 100, // Amount in cents
                },
                quantity: 1,
            })),
            mode: 'payment',
            success_url: 'http://localhost:3000/paymentsuccess',
            cancel_url: 'http://localhost:3000/page',
        });

        // Respond with session ID
        res.json({ id: session.id });

    } catch (error) {
        console.error('Error creating Stripe session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.delete('/clear-cart', userverification, async (req, res) => {
    const _id = req.getuserid
    const getuseranddeletecart = await User.findByIdAndUpdate({ _id }, { cart: [] }, { new: true })
})


app.listen(port, (() => {

    console.log('listen to the', port)
}))


