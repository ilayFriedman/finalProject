const express = require('express');
const router = express.Router();
const user = require('../models/user')
const folder = require('../models/folder')
const folderModule = require('./folders')
const jwt = require('jsonwebtoken');
var mail = require('../models/mail');

router.post('/login', async function (req, res) {
    try {
        await user.find({
            'Username': req.body.Username,
            'Password': req.body.Password
        }, function (err, result) {
            if (result) {
                if (result.length > 0) {
                    let payload = { username: req.body.Username, _id: result[0]._id, fullName: result[0].FirstName + " " + result[0].LastName };
                    let options = { expiresIn: "1d" };
                    const token = jwt.sign(payload, secret, options);
                    res.send({ "token": token, "fullName": result[0].FirstName + " " + result[0].LastName, "_id": result[0]._id });
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
                        FirstName: req.body.FirstName[0].toUpperCase() + req.body.FirstName.slice(1),
                        LastName: req.body.LastName[0].toUpperCase() + req.body.LastName.slice(1),
                        getPermissionUpdate: req.body.getPermissionUpdate,
                        Password: req.body.pwd,
                    });
                    newUser.save(function (err, saveRes) {
                        if (err) {
                            console.log(err)
                            res.status(500).send(`Server error occured.`)
                        } else {
                            // create user Root folder
                            folderModule.createRootFolder(saveRes._id.toString(), function (err, saveRes) {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send(`Server error occured while creating root folder.`);
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
    if (!req.body.FirstName || !req.body.LastName || !req.body.pwd || !req.body.getPermissionUpdate) {
        res.status(400).send("Could not update user information. The fields FirstName, LastName and pwd are required.");
    }
    try {
        user.findOneAndUpdate({ "_id": req.decoded._id }, { $set: { 'FirstName': req.body.FirstName, 'LastName': req.body.LastName, 'Password': req.body.pwd, 'getPermissionUpdate': req.body.getPermissionUpdate } }, function (err, mongoRes) {
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


router.get('/private/getUserDetails', async function (req, res) {

    try {
        user.findOne({ '_id': req.decoded._id }, function (err, result) {
            if (result) {
                var answer = { "FirstName": result.FirstName, "LastName": result.LastName, "Username": result.Username, getPermissionUpdate: result.getPermissionUpdate }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(answer));
            } else {
                console.log("server problem while searching user")
                res.status(400).send(`problem: ${err}`);
            }
        })
    } catch (e) {
        res.status(400).send(`problem: ${e}`);
    }
});


router.post('/restorePassword', async function (req, res) {
    if (req.body.Username) {
        try {
            user.findOne({ 'Username': req.body.Username }, function (err, result) {
                if (result) {
                    var mailSubject = "Restore Your Password"
                    var text = "<div style='text-align: center; direction: ltr;'><h3>Hi There, " + result.FirstName + " " + result.LastName + ". Did you forgot your details? </h3>\n\nUser Name: " +
                        "<b>" + result.Username + "</b>" + '\nPassword: "<b>' + result.Password + '</b>".<br><br>Please log in for more details in <a href="http://132.72.65.112:4200">this link</a>.<br><br>Have a great day!<br> ME-Maps system</div>'
                    try {
                        var mailObjects = mail.sendEmail(req.body.Username, mailSubject, text)
                        mailObjects[0].sendMail(mailObjects[1], function (error, info) {
                            if (error) {
                                console.log(error);
                                res.status(500).send(`Server error occured while send email`)
                                res.end()
                            } else {
                                res.status(200).send(`password sent successfully `)
                                res.end();

                            }
                        });
                    } catch (e) {
                        res.status(400).send(`problem: ${e}`);
                        res.end()
                    }

                } else {
                    res.status(404).send("don't find such user");
                    res.end()
                }
            })
        } catch (e) {
            res.status(500).send(`problem: ${e}`);
            res.end()
        }
    }
    else {
        res.status(400).send("bad request. need to send Username");
        res.end()
    }
});

router.delete('/private/removeUser', async function (req, res) {
    folder.deleteMany({ 'Creator': req.decoded._id }, function (err, result) {
        if (err) {
            console.log(err);
            res.status(500).send(`Server error occured while delete userFolders`)
            res.end()
        } else {

            user.deleteOne({ '_id': req.decoded._id }, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(500).send(`Server error occured while delete user`)
                    res.end()
                } else {
                    res.status(200).send(`user deleted successfully `)
                    res.end();

                }
            });

        }
    });

});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
module.exports = router;

