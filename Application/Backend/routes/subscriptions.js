const express = require('express');
const router = express.Router();
const map = require('../models/map');
const user = require('../models/user');
const folder = require('../models/folder');
var mail = require('../models/mail');
var schedule = require('node-schedule');

router.post('/private/addNewSubscriber', async function (req, res) {
    if (req.body.mapID && req.body.userID) {
        user.findOne({ '_id': req.body.userID }, function (err, result) {
            if (result) {
                // user exist!
                map.findOneAndUpdate({ _id: req.body.mapID }, { $addToSet: { ["Subscribers"]: result._id.toString() } }, function (err, resultUpadte) {
                    if (err) {
                        console.log(err);
                        res.statusCode = 500;
                        res.end();
                    } else {
                        res.statusCode = 200;
                        res.end();
                    }
                });

            } else {
                res.status(404).send("Could not find the requested User.");
            }
        })
    } else {
        // res.status(400).send(`Missing map id`);
        res.statusCode = 400;
        res.end();
    }

});

router.delete('/private/removeSubscriber/:mapID&:userID', async function (req, res) {
    if (req.params.mapID && req.params.userID) {
        user.findOne({ '_id': req.params.userID }, function (err, userResult) {
            if (userResult) {
                map.findOneAndUpdate({ _id: req.params.mapID }, { $pull: { ["Subscribers"]: req.params.userID } }, function (err, mapResult) {
                    if (err) {
                        console.log(err);
                        res.statusCode = 500;
                        res.end();
                    } else {
                        res.statusCode = 200;
                        res.end();
                    }
                });
            }
            else {
                console.log("User not found");

                res.statusCode = 400;
                res.end();
            }
        });

    } else {
        // res.status(400).send(`Missing map id`);
        res.statusCode = 400;
        res.end();
    }

});

function startNotifyToSubscribers() {
    try {
        var yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
        var today = new Date();
        let modifiedMaps = []
        map.find({ "LastModifiedTime": { "$gte": yesterday, "$lt": today } }, async function (err, result) {
            if (result) {
                // console.log(result);
                result.forEach(map => {
                    modifiedMaps.push(map);
                })
                getAllSubscribersAndSendEmail(modifiedMaps)
            } else {
                console.log("Theres are no modified maps");
            }
        });
    } catch (e) {
        console.log(e)
    }

}

function getAllSubscribersAndSendEmail(modifiedMaps) {
    let usersList = {};
    modifiedMaps.forEach(map => {
        map.Subscribers.forEach(subscriber => {
            if (!usersList[subscriber]) {
                usersList[subscriber] = [];
            }
            usersList[subscriber].push(map.MapName)
        })
        // usersList.push({
        //     mapName: map.MapName,
        //     subscribers: map.Subscribers
        // })
    })
    Object.keys(usersList).map(currUser => {
        let usersMapsListTxt = ""
        usersList[currUser].forEach(map => {
            usersMapsListTxt += "<br />'" + map + "'"
        })
        user.findOne({ '_id': currUser }, function (err, result) {
            if (result) {
                var mailSubject = "Subscriptions Notification"
                var text = "<div style='text-align: center; direction: ltr;'><h3>Hi There, " + result.FirstName + " " + result.LastName + ". </h3>" +
                    "\n\nYou are a subscriber of the maps:" + usersMapsListTxt +
                    '<br />And there was some new changes in them at the last day. <br><br>You are welcome to log in to the site and watch it <a href="http://132.72.65.112:4200"> in this link</a>.<br><br>Have a great day!<br> ME-Maps system</div>'

                try {
                    var mailObjects = mail.sendEmail(result.Username, mailSubject, text)
                    mailObjects[0].sendMail(mailObjects[1], function (error, info) {
                        if (error) {
                            console.log(error);

                        } else {
                            console.log(info);


                        }
                    });
                } catch (e) {
                    console.log(`problem: ${e}`);
                }
            }
        })


    });

}

schedule.scheduleJob({ hour: 00, minute: 00 }, function () {
    console.log('Time to notify subscribers!');
    startNotifyToSubscribers()
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

module.exports = router;