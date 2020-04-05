const express = require('express');
const router = express.Router();
const context = require('../models/context');
const jwt = require('jsonwebtoken');

//TODO
router.get('/private/getAllContexts', async function (req, res) {
    try {
        context.find({}, function (err, result) {
            if (result) {
                res.status(200).send(result)
            } else {
                res.status(400).send(`problem: ${err}`);
            }
        })
    } catch (e) {
        res.status(500).send(`problem: ${e}`);
    }
});

//TODO
router.post('/private/createContext', async function (req, res) {
    try {
        const CreatorId = req.decoded._id;
        const newCtx = new context({
            Title: req.body.Title,
            CreatorId: CreatorId,
            CreationTime: new Date()
        });
        newCtx.save(function (err) {
            if (err) {
                console.log(err);
                res.status(500).send(`Server error occured.`);
            } else {
                res.status(200).send('Context added successfully');
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
})


module.exports = router;