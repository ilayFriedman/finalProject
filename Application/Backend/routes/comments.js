const express = require('express');
const router = express.Router();
const map = require('../models/map');

// ############ COMMENTS #####################

router.put('/private/addLikeToComment', async function (req, res) {
    if (req.body.mapId) {
        map.findOne({
            '_id': req.body.mapId
        }, function (err, result) {
            if (result) {
                let currModel = result.Model
                for (let index = 0; index < currModel.nodeDataArray.length; index++) {
                    const element = currModel.nodeDataArray[index];
                    if (element.id == req.body.nodeId) {
                        for (let commentIdx = 0; commentIdx < element.comment.length; commentIdx++) {
                            let currComment = currModel.nodeDataArray[index].comment[commentIdx]
                            if (currComment.id == req.body.commentId) {
                                currModel.nodeDataArray[index].comment[commentIdx].Likes++;
                            }
                        }
                    }
                }
                map.updateOne({ '_id': req.body.mapId }, { $set: { 'Model': currModel } }, function (err, mongoRes) {
                    if (err) {
                        res.status(500).send("Server error occurred.");
                    } else {
                        res.status(200).send("Like added successfully.")
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

router.put('/private/addNewComment', async function (req, res) {
    if (req.body.mapId) {
        map.findOne({
            '_id': req.body.mapId
        }, function (err, result) {
            if (result) {
                let currModel = result.Model
                for (let index = 0; index < currModel.nodeDataArray.length; index++) {
                    const element = currModel.nodeDataArray[index];
                    if (element.id == req.body.nodeId) {
                        currModel.nodeDataArray[index].comment.push(req.body.comment);
                    }
                }
                map.updateOne({ '_id': req.body.mapId }, { $set: { 'Model': currModel, "LastModifiedTime": new Date() } }, function (err, mongoRes) {
                    if (err) {
                        res.status(500).send("Server error occurred.");
                    } else {
                        res.status(200).send("Comment added successfully.")
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


router.put('/private/updateComment', async function (req, res) {
    if (req.body.mapId) {
        map.findOne({
            '_id': req.body.mapId
        }, function (err, result) {
            if (result) {
                let currModel = result.Model
                for (let index = 0; index < currModel.nodeDataArray.length; index++) {
                    const element = currModel.nodeDataArray[index];
                    if (element.id == req.body.nodeId) {
                        for (let commentIdx = 0; commentIdx < element.comment.length; commentIdx++) {
                            let currComment = currModel.nodeDataArray[index].comment[commentIdx]
                            if (currComment.id == req.body.commentId) {
                                currModel.nodeDataArray[index].comment[commentIdx].Content = req.body.newContent;
                            }
                        }
                    }
                }
                map.updateOne({ '_id': req.body.mapId }, { $set: { 'Model': currModel } }, function (err, mongoRes) {
                    if (err) {
                        res.status(500).send("Server error occurred.");
                    } else {
                        res.status(200).send("Comment edited successfully.")
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

router.put('/private/deleteComment', async function (req, res) {
    if (req.body.mapId) {
        map.findOne({
            '_id': req.body.mapId
        }, function (err, result) {
            if (result) {
                let currModel = result.Model
                for (let index = 0; index < currModel.nodeDataArray.length; index++) {
                    const element = currModel.nodeDataArray[index];
                    if (element.id == req.body.nodeId) {
                        let idx = currModel.nodeDataArray[index].comment.indexOf(req.body.commentId)
                        currModel.nodeDataArray[index].comment.splice(idx, 1);
                    }
                }
                map.updateOne({ '_id': req.body.mapId }, { $set: { 'Model': currModel } }, function (err, mongoRes) {
                    if (err) {
                        res.status(500).send("Server error occurred.");
                    } else {
                        res.status(200).send("Comment deleted successfully.")
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
