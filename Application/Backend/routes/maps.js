const express = require('express');
const router = express.Router();
const map = require('../models/map');
const jwt = require('jsonwebtoken');
const user = require('../models/user');
const folder = require('../models/folder')

function UserHasReadPermissionForMap(resMap, userId) {
    if (resMap.Permission.Owner.userId == userId) {
        return true;
    }

    if (resMap.Permission.Write) {
        for (let i = 0; i < resMap.Permission.Write.length; i++) {
            const element = resMap.Permission.Write[i];
            if (element.userId == userId) {
                return true;
            }
        }
    }

    if (resMap.Permission.Read) {
        for (let i = 0; i < resMap.Permission.Read.length; i++) {
            const element = resMap.Permission.Read[i];
            if (element.userId == userId) {
                return true;
            }
        }
    }

    return false;
}

function UserHasWritePermissionForMap(resMap, userId) {
    if (resMap.Permission.Owner.userId == userId) {
        return true;
    }

    if (resMap.Permission.Write) {
        for (let i = 0; i < resMap.Permission.Write.length; i++) {
            const element = resMap.Permission.Write[i];
            if (element.userId == userId) {
                return true;
            }
        }
    }

    return false;
}

function UserHasOwnerPermissionForMap(resMap, userId) {

    if (resMap.Permission.Owner.userId == userId) {
        return true;
    }

    return false;
}

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
                Owner: { "userId": CreatorId },
                Write: [],
                Read: []
            },
            Subscribers: [],
            ContainingFolders: []
        });
        newMap.save(function (err, saveRes) {
            if (err) {
                console.log(err);
                res.status(500).send(`Server error occured.`);
            } else {
                // update parent folder
                folder.findOneAndUpdate({ '_id': req.body.folderID }, { $addToSet: { 'MapsInFolder': { "mapID": saveRes._id.toString(), "mapName": saveRes.MapName } } }, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.status(500).send("Server error occurred.");
                    } else {
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify(saveRes));
                    }
                });
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

router.get('/private/getMap/:mapID', async function (req, res) {
    try {
        await map.find({
            '_id': req.params.mapID
        }, function (err, result) {
            if (result) {
                // console.log(result)
                // console.log(result[0])
                if (UserHasReadPermissionForMap(result[0], req.decoded._id)) {
                    res.send(result[0]);
                } else {
                    res.status(403).send("The user's permissions are insufficient to retrieve map");
                }
            } else {
                res.status(404).send("Could not find the requested map.");
            }
        })
    } catch (e) {
        res.status(500).send('Server error occured.');
    }
});


router.get('/private/getMapDescription/:mapID', async function (req, res) {
    try {
        await map.findOne({ '_id': req.params.mapID }, function (err, result) {
            if (result) {
                // console.log(result)
                if (UserHasReadPermissionForMap(result, req.decoded._id)) {
                    // console.log(result)
                    res.send({ "Description": result.Description });
                } else {
                    res.status(403).send("The user's permissions are insufficient to retrieve map");
                }
            } else {
                res.status(404).send("Could not find the requested map.");
            }
        })
    } catch (e) {
        res.status(500).send('Server error occured.');
    }
});

router.get('/private/getMapPermission/:mapID', async function (req, res) {
    try {
        await map.findOne({'_id': req.params.mapID}, async function(err, result) {
            if (result) {
                // console.log(result)
                if (UserHasReadPermissionForMap(result, req.decoded._id)) {
                    read = await user.find().select('_id Username FirstName LastName').where('_id').in(result.Permission.Read).exec()
                    write = await user.find().select('_id Username FirstName LastName').where('_id').in(result.Permission.Write).exec()
                    // console.log(result.Permission.Read)
                    res.send({read: read, write: write})
                    // res.send(result.Permission);
                } else {
                    res.status(403).send("The user's permissions are insufficient to retrieve map");
                }
            } else {
                res.status(404).send("Could not find the requested map.");
            }
        })
    } catch (e) {
        res.status(500).send('Server error occured.');
    }
});



router.delete('/private/removeMap/:mapID&:folderID', async function (req, res) {
    if (req.params.mapID) {
        map.findOne({ _id: req.params.mapID }, function (err, result) {
            if (result) {
                if (UserHasOwnerPermissionForMap(result, req.decoded._id)) {
                    map.deleteOne({ _id: result._id }, function (err) {
                        if (err) {
                            // res.status(500).send(`Server error occured.`);
                            res.statusCode = 500;
                        } else {
                            // update parent
                            folder.findOneAndUpdate({ _id: req.params.folderID }, { $pull: { 'MapsInFolder': { "mapID": req.params.mapID } } }, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    // res.status(500).send("Server error occurred while pop from parent folder.");
                                    res.statusCode = 500;
                                    res.end();
                                } else {
                                    // res.status(200).send("Map deleted successfully. && map removed successfully from folder.");
                                    res.statusCode = 200;
                                    res.end();
                                }
                            });
                        }
                    });
                } else {
                    // res.status(403).send("The user's permissions are insufficient to delete map");
                    res.statusCode = 403;
                    res.end();
                }
            } else {
                // res.status(404).send(`Could not find the requested map.`);
                res.statusCode = 404;
                res.end();
            }
        })
    } else {
        // res.status(400).send(`Missing map id`);
        res.statusCode = 400;
        res.end();
    }



});

router.put('/private/updateMap', async function (req, res) {
    if (req.body._id) {
        map.findOne({
            '_id': req.body._id
        }, function (err, result) {
            if (result) {
                if (UserHasWritePermissionForMap(result, req.decoded._id)) {
                    map.findOneAndUpdate({ _id: req.body._id }, { 'Model': req.body.model }, function (err, mongoRes) {
                        if (err) {
                            res.status(500).send("Server error occurred.");

                        } else {
                            res.status(200).send('Map updated successfully.');

                        }
                    });
                } else {
                    res.status(403).send("The user's permissions are insufficient to update map");
                }
            } else {
                res.status(404).send("Could not find map.");
            }
        })
    } else {
        res.status(400).send("No map ID attached to request.");
    }
});

router.put('/private/addLikeToComment', async function (req, res) {
    if (req.body.mapId) {
        map.findOne({
            '_id': req.body.mapId
        }, function (err, result) {
            if (result) {
                let currModel = JSON.parse(result.Model)
                for (let index = 0; index < currModel.nodeDataArray.length; index++) {
                    const element = currModel.nodeDataArray[index];
                    if (element.id == req.body.nodeId) {
                        console.log("elementid= " + element.id);
                        for (let commentIdx = 0; commentIdx < element.comment.length; commentIdx++) {
                            let currComment = currModel.nodeDataArray[index].comment[commentIdx]
                            if (currComment.id == req.body.commentId) {
                                currModel.nodeDataArray[index].comment[commentIdx].Likes++;
                            }
                        }
                    }
                }
                map.updateOne({ '_id': req.body.mapId }, { $set: { 'Model': JSON.stringify(currModel) } }, function (err, mongoRes) {
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
                let currModel = JSON.parse(result.Model)
                for (let index = 0; index < currModel.nodeDataArray.length; index++) {
                    const element = currModel.nodeDataArray[index];
                    if (element.id == req.body.nodeId) {
                        console.log("elementid= " + element.id);
                        currModel.nodeDataArray[index].comment.push(req.body.comment);

                        // for (let commentIdx = 0; commentIdx < element.comment.length; commentIdx++) {
                        //     let currComment = currModel.nodeDataArray[index].comment[commentIdx]
                        //     if (currComment.id == req.body.commentId) {
                        //         console.log("commentID= " + element.id);
                        //     }
                        // }
                    }
                }
                map.updateOne({ '_id': req.body.mapId }, { $set: { 'Model': JSON.stringify(currModel) } }, function (err, mongoRes) {
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



router.post('/private/updateMapProperties', async function (req, res) {
    if (req.body.mapID) {
        // console.log(req.body.mapID)
        map.findOne({ '_id': req.body.mapID }, function (err, result) {
            if (result) {
                if (UserHasWritePermissionForMap(result, req.decoded._id)) {
                    map.updateOne({ '_id': req.body.mapID }, { $set: { 'MapName': req.body.mapName, 'Description': req.body.Decription } }, function (err, mongoRes) {
                        if (err) {
                            res.status(500).send("Server error occurred.");
                        } else {
                            folder.updateOne({ '_id': req.body.parentFolderID, 'MapsInFolder.mapID': req.body.mapID }, { $set: { "MapsInFolder.$.mapName": req.body.mapName } }, function (err, result) {
                                // console.log(result)
                                if (err) {
                                    res.status(500).send(`Server error occured.`);
                                } else {
                                    res.status(200).send('Map updated successfully.');
                                }
                            });

                        }
                    });
                } else {
                    res.status(403).send("The user's permissions are insufficient to update map");
                }
            } else {
                res.status(404).send("Could not find map.");
            }
        })
    } else {
        res.status(400).send("No map ID attached to request.");
    }
});





// router.get('/private/getAllUserMaps', async function(req, res) {
//     try {
//         user.findOne({
//             '_id': req.decoded._id
//         }, function(err, result) {
//             if (result) {
//                 map.find({
//                     'CreatorId': result._id
//                 }, function(err, result) {
//                     if (result) {
//                         result = result.filter(mapElem => UserHasReadPermissionForMap(mapElem, req.decoded._id))
//                         res.status(200).send(result);
//                     } else {
//                         res.status(400).send(`problem: ${err}`);
//                     }
//                 });
//             } else {
//                 res.status(400).send("No such user")
//             }
//         });
//     } catch (e) {
//         res.status(400).send(`problem: ${e}`);
//     }
// });
module.exports = router;