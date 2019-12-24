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
});

router.post('/private/createMap', async function (req, res) {
    try {
        const CreatorId = req.decoded._id;
        const newMap = new map({
            MapName: req.body.MapName,
            CreatorId: CreatorId,
            CreationTime: new Date(),
            Description: req.body.Description,
            Model: req.body.Model,
            Permission: {
                "Owner": {"userId": CreatorId, "permission": "owner"},
                "Users": [{"userId": CreatorId, "permission": "owner"}],
                "Groups": []
            },
            Subscribers: [],
            ContainingFolders: []
        });
        newMap.save(function (err) {
            if (err) {
                console.log(err)
                res.status(400).send(`problem: ${err}`)
            } else {
                res.status(200).send("map added successfully")
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).send(`problem: ${e}`)
    }
});

router.delete('/private/removeMap', async function (req, res) {
    if (req.body._id) {
        map.remove({_id: req.body._id}, function (err) {
            if (err) {
                console.log(err);
                res.status(400).send(`problem: ${err}`);
            } else {
                res.status(200).send("map deleted successfully");
            }
        });
    }
});

router.get('/private/getAllUserMaps', async function (req, res) {
    try {
        await map.find({
            'CreatorId': req.decoded._id
        }, function (err, result) {
            if (result) {
                res.send(result);
            } else {
                res.status(400).send(`problem: ${err}`);
            }
        });
    } catch (e) {
        res.status(400).send(`problem: ${e}`);
    }
});

router.put('/private/updateMap', async function (req, res){
    if(req.body._id){
        map.findOneAndUpdate({"_id": req.body._id}, {'Model': req.body.model}, function(err) {
            if (err) {
                console.log(err);
                res.status(400).send(`problem: ${err}`);
            } else {
                res.status(200).send("map deleted successfully");
            }
        });
    }

});


module.exports = router;