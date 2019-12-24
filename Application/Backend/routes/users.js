const express = require('express');
const router = express.Router();
const user = require('../models/user')
const jwt = require('jsonwebtoken');

// const secret = "memapsrules"

// router.use(function (req, res, next) {
//     next();
// });

//TODO If user is not found, return an error (perhaps 404)

router.post('/login', async function (req, res) {
        try {
            await user.find({
                'Username': req.body.Username,
                'Password': req.body.Password
            }, function (err, result) {
                if (result) {
                    console.log(result)
                    if (result.length > 0) {
                        let payload = {username: req.body.Username};
                        let options = {expiresIn: "1d"};
                        const token = jwt.sign(payload, secret, options);
                        console.log(user)
                        res.send({"token": token, "full_name": result[0].FirstName + " " + result[0].LastName});
                    } else {
                        res.send("No such user")
                    }
                } else {
                    console.log(err)
                    res.status(500).send(`problem: ${err}`)
                }
            })
        } catch (e) {
            console.log(e);
            res.status(500).send(`problem: ${e}`)
        }
        // console.log(req.body);
    }
);


module.exports = router;