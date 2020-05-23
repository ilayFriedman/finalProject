const express = require('express');
const router = express.Router();
const map = require('../models/map');

// ############ CONNECTIONS #####################

router.put('/private/addNewConnection', async function (req, res) {
    if (req.body.mapId) {
        map.findOne({
            '_id': req.body.mapId
        }, function (err, result) {
            if (result) {
                let currModel = result.Model
                for (let index = 0; index < currModel.nodeDataArray.length; index++) {
                    const element = currModel.nodeDataArray[index];
                    if (element.id == req.body.nodeId) {
                        req.body.connections.forEach(newConn => {
                            if (currModel.nodeDataArray[index].connections.findIndex(conn => conn.MapName == newConn.MapName) > -1) {
                                return;
                            }
                            else {
                                currModel.nodeDataArray[index].connections.push(newConn);
                            }
                        });


                    }
                }
                map.updateOne({ '_id': req.body.mapId }, { $set: { 'Model': currModel, "LastModifiedTime": new Date() } }, function (err, mongoRes) {
                    if (err) {
                        res.status(500).send("Server error occurred.");
                    } else {
                        res.status(200).send("Connection added successfully.")
                    }
                });

            } else {
                res.status(404).send("Could not find map.");
            }
        })
    } else {
        res.status(400).send("No map ID attached to request.");
    }
});

router.put('/private/deleteConnection', async function (req, res) {
    if (req.body.mapId) {
        map.findOne({
            '_id': req.body.mapId
        }, function (err, result) {
            if (result) {
                let currModel = result.Model
                for (let index = 0; index < currModel.nodeDataArray.length; index++) {
                    const element = currModel.nodeDataArray[index];
                    if (element.id == req.body.nodeId) {
                        let idx = currModel.nodeDataArray[index].connections.findIndex(conn => conn.MapName === req.body.MapName)
                        currModel.nodeDataArray[index].connections.splice(idx, 1);
                    }
                }
                map.updateOne({ '_id': req.body.mapId }, { $set: { 'Model': currModel, "LastModifiedTime": new Date() } }, function (err, mongoRes) {
                    if (err) {
                        res.status(500).send("Server error occurred.");
                    } else {
                        res.status(200).send("Connection deleted successfully.")
                    }
                });

            } else {
                res.status(404).send("Could not find map.");
            }
        })
    } else {
        res.status(400).send("No map ID attached to request.");
    }
});

module.exports = router;