const express = require('express');
const router = express.Router();
const user = require('../models/user')
const folder = require('../models/folder')
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

router.post('/login', async function (req, res) {
        try {
            await user.find({
                'Username': req.body.Username,
                'Password': req.body.Password
            }, function (err, result) {
                if (result) {
                    if (result.length > 0) {
                        let payload = {username: req.body.Username, _id: result[0]._id, fullName: result[0].FirstName + " " + result[0].LastName};
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
            'Username': req.body.email.toLowerCase()
        }, function (err, result) {
            if (result) {
                // Enforce email address in Users' collection is unique
                if (result.length > 0) {
                    res.status(409).send(`Email address is already registered`)
                } else {
                        const newUser = new user({
                            Username: req.body.email.toLowerCase(),
                            FirstName: req.body.FirstName,
                            LastName: req.body.LastName,
                            getPermissionUpdate: req.body.getPermissionUpdate,
                            Password: req.body.pwd,
                        });
                        newUser.save(function (err,saveRes) {
                            if (err) {
                                console.log(err)
                                res.status(500).send(`Server error occured.`)
                            } else {
                                // create user Root folder


                                const rootFolder = new folder({
                                    Name: "userRootFolder",
                                    MapsInFolder: [],
                                    SubFolder: [],
                                    Creator: saveRes._id.toString(),
                                    CreationTime: new Date(),
                                    Description: "rootFolder",
                                    ParentDir: "/",
                                });
                                rootFolder.save(function(err,saveRes) {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).send(`Server error occured while creation root folder.`);
                                    } else {
                                        res.status(200).send("User successfully registered")
                                    }
                                });   
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


// Tfor brings names
router.get('/private/getUsersDetailsByIds/:ids', async function (req, res) {

    try {
        // records = await user.find().where('_id').in(ids).exec();
        // console.log(records)
        // user.findOne({'_id': req.params.userID}, function(err, result) {
        //     if (result) {
        //         var answer = {"FirstName": result.FirstName, "LastName" :result.LastName}
        //         res.writeHead(200, {"Content-Type": "application/json"});
        //         res.end(JSON.stringify(answer));
        //         res.status(200).send()
        //     } else {
        //         res.status(400).send(`problem: ${err}`);
        //     }
        // })
    } catch (e) {
        res.status(400).send(`problem: ${e}`);
    }
});


router.post('/private/sendMailToUser', async function (req, res) {

    try {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'me.maps.system',
              pass: 'memaps123'
            }
          });
          
          var mailOptions = {
            from: 'me.maps.system@gmail.com',
            to: req.body.reciever_mail,
            subject: req.body.subject,
            html: req.body.text
          };
        //   console.log(mailOptions)
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              res.status(500).send(`Server error occured while send email`)
              
            } else {
              res.status(200).send('Email sent: ' + info.response)
            }
          });
    } catch (e) {
        res.status(400).send(`problem: ${e}`);
    }
});

router.post('/private/restorePassword', async function (req, res) {
    try {
        user.findOne({'Username': req.body.userName}, function(err, result) {
            if (result) {
                res.status(200).send({"Description" :result.Description})
            } else {
                res.status(400).send(`problem: ${err}`);
            }
        })
    } catch (e) {
        res.status(400).send(`problem: ${e}`);
    }
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
module.exports = router;
