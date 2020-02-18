const express = require('express');
const router = express.Router();
const user = require('../models/user')
const jwt = require('jsonwebtoken');

router.post('/login', async function (req, res) {
        try {
            await user.find({
                'Username': req.body.Username,
                'Password': req.body.Password
            }, function (err, result) {
                if (result) {
                    if (result.length > 0) {
                        let payload = {username: req.body.Username, _id: result[0]._id};
                        let options = {expiresIn: "1d"};
                        const token = jwt.sign(payload, secret, options);
                        res.send({"token": token, "fullName": result[0].FirstName + " " + result[0].LastName});
                    } else {
                        res.status(400).send("No such user")
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
    }
);

// {"email": String, "FirstName":string, "LastName":string, "pwd":string}
router.post('/register', async function (req, res) {
    try {
        await user.find({
            'Username': req.body.email
        }, function (err, result) {
            if (result) {
                // Enforce email address in Users' collection is unique
                if (result.length > 0) {
                    res.status(409).send(`Email address is already registered`)
                } else {
                        const newUser = new user({
                            Username: req.body.email,
                            FirstName: req.body.FirstName,
                            LastName: req.body.LastName,
                            Password: req.body.pwd
                        });
                        newUser.save(function (err) {
                            if (err) {
                                console.log(err)
                                res.status(400).send(`problem: ${err}`)
                            } else {
                                res.status(200).send("user successfully registered")
                            }
                        });
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
}
);

module.exports = router;
