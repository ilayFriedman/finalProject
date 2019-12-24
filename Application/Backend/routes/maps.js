const express = require('express');
const router = express.Router();
const map = require('../models/map')
const jwt = require('jsonwebtoken');

router.get('/private/getMap', async function (req, res) {
    try {
        await map.find({
            '_id': req.headers._id
        }, function (err, result) {
            if (result) {
                console.log(result);
                res.send(result);
            } else {
                res.status(400).send(`problem: ${err}`)
            }
        })
    } catch (e) {
        res.status(400).send(`problem: ${e}`)
    }
})

router.post('/private/createMap', async function (req, res) {
    try {
        var Creator = req.decoded.username;
        var newMap = new map({
            Name: req.body.Name,
            Creator: Creator,
            CreationTime: new Date(),
            Description: req.body.Description,
            Model: req.body.Model
        })
        newMap.save(function (err) {
            if (err){
                console.log(err)
                res.status(400).send(`problem: ${err}`)
            }else{
                res.status(200).send("map added successfully")
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).send(`problem: ${e}`)
    }
})


module.exports = router;