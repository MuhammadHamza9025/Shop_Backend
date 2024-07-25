const userverification = (req, res, next) => {

    const token = req.headers.cookie.split('=')[1]
    if (!token) {
        res.json({ status: 400, message: 'Token Missing' })
    }
    else
        jwt.verify(token, 'thisisisisismy', (err, decode) => {
            req.getuserid = decode.id

            next()
            console.log('success')
        })
    // if (getuserid) {
    //     console.log(getuserid.id)

    // }
}

module.exports = userverification;