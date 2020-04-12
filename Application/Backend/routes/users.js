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
                        res.send({"token": token, "fullName": result[0].FirstName + " " + result[0].LastName, "_id": result[0]._id});
                    } else {
                        res.status(404).send("No such user")
                    }
                } else {
                    console.log(err)
                    res.status(500).send("Server error occured.");
                }
            })
        } catch (e) {
            console.log(e);
            res.status(500).send("Server error occured.")
        }
    }
);

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
                                res.status(500).send(`Server error occured.`)
                            } else {
                                res.status(200).send("User successfully registered")
                            }
                        });
                }
            } else {
                console.log(err)
                res.status(500).send(`Server error occured.`)
            }
        })
    } catch (e) {
        console.log(e);
        res.status(500).send(`Server error occured.`)
    }
});

router.post('/private/changeInfo', async function (req, res) {
    if(!req.body.FirstName || !req.body.LastName || !req.body.pwd){
        res.status(400).send("Could not update user information. The fields FirstName, LastName and pwd are required.");
    }
    try {
        user.findOneAndUpdate({"_id": req.decoded._id}, {$set:{'FirstName': req.body.FirstName, 'LastName': req.body.LastName, 'Password': req.body.pwd }}, function(err, mongoRes) {
            if (err) {
                console.log(err);
                res.status(500).send("Server error occurred.");
            } else {
                res.status(200).send("User information updated successfully.");
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).send(`Server error occured.`)
    }
});

router.get('/private/getUsers', async function (req, res) {
    try {
        //Find all users, but exclude the Password property
        user.find({}).select('-Password').exec()
        .then(result => {
            if (result) {
                res.send(result);
            } else {
                res.status(500).send(`Server error occured.`)
            }
        })
    } catch (e) {
        res.status(500).send(`Server error occured.`)
    }
});

module.exports = router;
