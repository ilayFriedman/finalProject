const express = require('express');
const router = express.Router();
const map = require('../models/map');
const jwt = require('jsonwebtoken');
const user = require('../models/user');
const folder = require('../models/folder')

function UserHasReadPermissionForMap(resMap, userId) {
    if (resMap.Permission.Owner.indexOf(userId) != -1) {
        return true;
    }

    if (resMap.Permission.Write) {
        if (resMap.Permission.Write.indexOf(userId) != -1) {
            return true;
        }

    }
    // console.log(resMap.Permission.Read);

    if (resMap.Permission.Read) {
        if (resMap.Permission.Read.indexOf(userId) != -1) {
            return true;
        }
    }

    return false;
}

function UserHasWritePermissionForMap(resMap, userId) {
    if (resMap.Permission.Owner.indexOf(userId) != -1) {
        return true;
    }

    if (resMap.Permission.Write) {
        if (resMap.Permission.Write.indexOf(userId) != -1) {
            return true;
        }

    }

    return false;
}

function UserHasOwnerPermissionForMap(resMap, userId) {
    if (resMap.Permission.Owner.indexOf(userId) != -1) {
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
                Owner: [CreatorId],
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

router.get('/private/getUsersPermissionsMap/:mapID', async function (req, res) {
    try {
        await map.findOne({ '_id': req.params.mapID }, async function (err, result) {
            if (result) {
                // console.log(result)
                if (UserHasReadPermissionForMap(result, req.decoded._id)) {
                    read = await user.find().select('_id Username FirstName LastName').where('_id').in(result.Permission.Read).exec()
                    write = await user.find().select('_id Username FirstName LastName').where('_id').in(result.Permission.Write).exec()
                    owner = await user.find().select('_id Username FirstName LastName').where('_id').in(result.Permission.Owner).exec()
                    // console.log(result.Permission.Read)
                    res.send({ read: read, write: write, owner: owner})
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



router.delete('/private/removeMap/:mapID&:userPermission&:folderID', async function (req, res) {
    if (req.params.mapID) {
        map.findOne({ _id: req.params.mapID }, function (err, result) {
            if (result) {
                // owner permission: can delete map from DB
                if (UserHasOwnerPermissionForMap(result, req.decoded._id)) {
                    map.deleteOne({ _id: result._id }, function (err) {
                        if (err) {
                            // res.status(500).send(`Server error occured.`);
                            res.statusCode = 500;
                            res.end();
                        }
                        else{
                            // update all parent
                            folder.updateMany({},{ $pull: { 'MapsInFolder': { "mapID": req.params.mapID } } }, function (err, result) {
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
                    // write/read permission on map: remove my ID from permission but not delete map
                } else{
                    map.updateOne({ _id: result._id }, { $pull: { ["Permission." + req.params.userPermission]: req.decoded._id } }, function (err, result) {
                        if (err) {
                            console.log(err);
                            // res.status(500).send("Server error occurred while pop from parent folder.");
                            res.statusCode = 500;
                            res.end();
                        }
                        else{
                            //update only my parent
                            folder.updateOne({ _id: req.params.folderID },{ $pull: { 'MapsInFolder': { "mapID": req.params.mapID } } }, function (err, result) {
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
                            folder.updateMany({'MapsInFolder.mapID': req.body.mapID }, { $set: { "MapsInFolder.$.mapName": req.body.mapName } }, function (err, result) {
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


router.delete('/private/removeUserPermission/:mapID&:userID&:permission', async function (req, res) {
    if (req.params.mapID && req.params.userID && req.params.permission) {
        map.findOneAndUpdate({ _id: req.params.mapID }, { $pull: { ["Permission." + req.params.permission]: req.params.userID } }, function (err, result) {
            if (err) {
                console.log(err);
                // res.status(500).send("Server error occurred while pop from parent folder.");
                res.statusCode = 500;
                res.end();
            } else {
                // delete from otherUser folders
                folder.updateMany({'Creator': req.params.userID, 'MapsInFolder.mapID': req.params.mapID }, { $pull: { 'MapsInFolder': { "mapID": req.params.mapID } } }, function (err, result) {
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
        // res.status(400).send(`Missing map id`);
        res.statusCode = 400;
        res.end();
    }

});

router.post('/private/updateUserPermission', async function (req, res) {
    if (req.body.mapID && req.body.userID && req.body.permission_From && req.body.permission_To) {
        map.findOneAndUpdate({ _id: req.body.mapID }, { $pull: { ["Permission." + req.body.permission_From]: req.body.userID }, $addToSet: { ["Permission." + req.body.permission_To]: req.body.userID } }, function (err, result) {
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
    } else {
        // res.status(400).send(`Missing map id`);
        res.statusCode = 400;
        res.end();
    }

});

router.post('/private/addNewPermission', async function (req, res) {
    if (req.body.mapID && req.body.username && req.body.permission_To) {
        // console.log("here")
        user.findOne({'Username': req.body.username}, function (err, result) {
            if (result) {
                // user exist!
                map.findOneAndUpdate({ _id: req.body.mapID }, {$addToSet: { ["Permission." + req.body.permission_To]: result._id.toString() } }, function (err, resultUpadte) {
                    if (err) {
                        console.log(err);
                        // res.status(500).send("Server error occurred while pop from parent folder.");
                        res.statusCode = 500;
                        res.end();
                    } else {
                        // res.status(200).send("Map deleted successfully. && map removed successfully from folder.");
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify(result));
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

router.get('/private/getSharedMaps/:userID', async function (req, res) {
    try {
        map.find( { $or:[ {'Permission.Owner' : req.params.userID}, {'Permission.Write': req.params.userID}, {'Permission.Read': req.params.userID} ]} , async function (err, result) {
             if (result) {
                 var sharedUserMap = []
                // {id: result._id, Owner: result.Permission.Owner, Write: result.Permission.Write, Read: result.Permission.Read}
                result.forEach(map => {
                    if(map.Permission.Owner.indexOf(req.params.userID) > -1){
                        sharedUserMap.push({mapID: map._id, MapName: map.MapName, permission: "Owner"})
                    } else if (map.Permission.Write.indexOf(req.params.userID) > -1){
                        sharedUserMap.push({mapID: map._id, MapName: map.MapName, permission: "Write"})
                    } else{
                        sharedUserMap.push({mapID: map._id, MapName: map.MapName, permission: "Read"})
                    }
                });
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(sharedUserMap))
             }else {
                res.status(403).send("Theres not such user");
            }
        })
    } catch (e) {
        console.log(e)
        res.status(500).send('Server error occured.');
    }
});



// comments

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


router.put('/private/updateComment', async function (req, res) {
    if (req.body.mapId) {
        map.findOne({
            '_id': req.body.mapId
        }, function (err, result) {
            if (result) {
                let currModel = JSON.parse(result.Model)
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
                map.updateOne({ '_id': req.body.mapId }, { $set: { 'Model': JSON.stringify(currModel) } }, function (err, mongoRes) {
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
                let currModel = JSON.parse(result.Model)
                for (let index = 0; index < currModel.nodeDataArray.length; index++) {
                    const element = currModel.nodeDataArray[index];
                    if (element.id == req.body.nodeId) {
                        let idx = currModel.nodeDataArray[index].comment.indexOf(req.body.commentId)
                        currModel.nodeDataArray[index].comment.splice(idx, 1);


                        // for (let commentIdx = 0; commentIdx < element.comment.length; commentIdx++) {
                        //     let currComment = currModel.nodeDataArray[index].comment[commentIdx]
                        //     if (currComment.id == req.body.commentId) {
                        //         currModel.nodeDataArray[index].comment[commentIdx].Content = req.body.newContent;
                        //     }
                        // }
                    }
                }
                map.updateOne({ '_id': req.body.mapId }, { $set: { 'Model': JSON.stringify(currModel) } }, function (err, mongoRes) {
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