const express = require('express');
const router = express.Router();
const map = require('../models/map');
const jwt = require('jsonwebtoken');
const user = require('../models/user');
const folder = require('../models/folder');
const group = require('../models/group');
var nodemailer = require('nodemailer');
var mail = require('../models/mail');

function UserHasReadPermissionForMap(resMap, userId) {

    for (let i = 0; i < resMap.Permission.Owner.length; i++) {
        const element = resMap.Permission.Owner[i];
        if (element.id == userId) {
            return true;
        }
    }

    
    for (let i = 0; i < resMap.Permission.Write.length; i++) {
        const element = resMap.Permission.Write[i];
        if (element.id == userId) {
            return true;
        }
    }

    
    for (let i = 0; i < resMap.Permission.Read.length; i++) {
        const element = resMap.Permission.Read[i];
        if (element.id == userId) {
            return true;
        }
    }

    return false;
}

function UserHasWritePermissionForMap(resMap, userId) {
    for (let i = 0; i < resMap.Permission.Write.length; i++) {
        const element = resMap.Permission.Write[i];
        if (element.id == userId) {
            return true;
        }
    }

    
    for (let i = 0; i < resMap.Permission.Read.length; i++) {
        const element = resMap.Permission.Read[i];
        if (element.id == userId) {
            return true;
        }
    }

    return false;
}

function UserHasOwnerPermissionForMap(resMap, userId) {
    for (let i = 0; i < resMap.Permission.Read.length; i++) {
        const element = resMap.Permission.Read[i];
        if (element.id == userId) {
            return true;
        }
    }

    return false;
}

function getSublistById(res,permissionType){
    var list = []
    for (let i = 0; i < res["Permission"][permissionType].length; i++) {
        list.push(res["Permission"][permissionType][i].id)
    }
    return list
}

function getAllPersonalIds(mapRes, usersList){
    var idsList = usersList.map(({ id }) => id);
    var duplicateIds = []
    mapRes.Permission.Owner.forEach(element => {
        if(element.type == "PersonalPermission" && idsList.indexOf(element.id) != -1){
            duplicateIds.push({id: element.id, type: "PersonalPermission"})
        }
    });
    mapRes.Permission.Write.forEach(element => {
        if(element.type == "PersonalPermission" && idsList.indexOf(element.id) != -1){
            duplicateIds.push({id: element.id, type: "PersonalPermission"})
        }
    });
    mapRes.Permission.Read.forEach(element => {
        if(element.type == "PersonalPermission" && idsList.indexOf(element.id) != -1){
            duplicateIds.push({id: element.id, type: "PersonalPermission"})
        }
    });
    return duplicateIds

}


// call in save as
router.post('/private/createMap', async function (req, res) {
    try {
        const CreatorId = req.decoded._id;
        let new_model = JSON.parse(req.body.Model)
        new_model['class'] = 'go.GraphLinksModel'

        const newMap = new map({
            MapName: req.body.MapName,
            CreatorId: CreatorId,
            CreationTime: new Date(),
            LastModifiedTime: new Date(),
            Description: req.body.Description,
            Model: new_model,
            Permission: {
                Owner: [{id: CreatorId, type: "PersonalPermission"}],
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
                    read = await user.find().select('_id Username FirstName LastName').where('_id').in(getSublistById(result,"Read")).exec()
                    write = await user.find().select('_id Username FirstName LastName').where('_id').in(getSublistById(result,"Write")).exec()
                    owner = await user.find().select('_id Username FirstName LastName').where('_id').in(getSublistById(result,"Owner")).exec()
                    // console.log(result.Permission.Read)
                    res.status(200).send({ read: read, write: write, owner: owner })
                    res.end()
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
                        else {
                            // update all parent
                            folder.updateMany({}, { $pull: { 'MapsInFolder': { "mapID": req.params.mapID } } }, function (err, result) {
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
                } else {
                    map.updateOne({ _id: result._id }, { $pull: { ["Permission" + [req.params.userPermission]]: {id: req.decoded._id} } }, function (err, result) {
                        if (err) {
                            console.log(err);
                            // res.status(500).send("Server error occurred while pop from parent folder.");
                            res.statusCode = 500;
                            res.end();
                        }
                        else {
                            //update only my parent
                            folder.updateOne({ _id: req.params.folderID }, { $pull: { 'MapsInFolder': { "mapID": req.params.mapID } } }, function (err, result) {
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

// call in save
router.put('/private/updateMap', async function (req, res) {
    let new_model = JSON.parse(req.body.Model)
    new_model['class'] = 'go.GraphLinksModel'
    // console.log(new_model);

    if (req.body._id) {
        map.findOne({
            '_id': req.body._id
        }, function (err, result) {
            if (result) {
                if (UserHasWritePermissionForMap(result, req.decoded._id)) {
                    map.findOneAndUpdate({ _id: req.body._id }, { 'Model': new_model, "LastModifiedTime": new Date() }, function (err, mongoRes) {
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
                    map.updateOne({ '_id': req.body.mapID }, { $set: { 'MapName': req.body.mapName, "LastModifiedTime": new Date(), 'Description': req.body.Decription } }, function (err, mongoRes) {
                        if (err) {
                            res.status(500).send("Server error occurred.");
                        } else {
                            folder.updateMany({ 'MapsInFolder.mapID': req.body.mapID }, { $set: { "MapsInFolder.$.mapName": req.body.mapName } }, function (err, result) {
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
        user.findOne({ '_id': req.params.userID }, function (err, userResult) {
            if (userResult) {
                map.findOneAndUpdate({ _id: req.params.mapID }, { $pull: { ["Permission." + [req.params.permission]]: {id: req.params.userID} }}, function (err, mapResult) {
                    if (err) {
                        console.log(err);
                        // res.status(500).send("Server error occurred while pop from parent folder.");
                        res.statusCode = 500;
                        res.end();
                    } else {
                        // delete from otherUser folders
                        folder.updateMany({ 'Creator': req.params.userID, 'MapsInFolder.mapID': req.params.mapID }, { $pull: { 'MapsInFolder': { "mapID": req.params.mapID } } }, function (err, result) {
                            if (err) {
                                console.log(err);
                                // res.status(500).send("Server error occurred while pop from parent folder.");
                                res.statusCode = 500;
                                res.end();
                            } else {
                                // res.status(200).send("Map deleted successfully. && map removed successfully from folder.");

                                if (userResult.getPermissionUpdate) {
                                    var mailSubject = "Map Permission Revocation"
                                    var text = "<div style='text-align: center; direction: ltr;'><h3>Hi There, " + userResult.FirstName + " " + userResult.LastName + "!</h3>\n\nWe wanted to update you that " + req.decoded.fullName
                                        + " stop sharing with you the map: <b>" + mapResult.MapName + "</b>.<br>For that reason: the map is no longer in your Tree View<br><br>Please log in for more details in <a href='http://132.72.65.112:4200'>this link</a>.<br><br>Have a great day!<br> ME-Maps system</div>"
                                    try {
                                                                        
                                var mailObjects = mail.sendEmail(userResult.Username, mailSubject, text)
                                mailObjects[0].sendMail(mailObjects[1], function (error, info) {
                                    if (error) {
                                        console.log(error);
                                        res.status(500).send(`Server error occured while send email`)
                                        res.end()
                                    } else {
                                        res.status(200).send(`permission updated successfully, email sent successfully `)
                                        res.end();
        
                                    }
                                });
                                    } catch (e) {

                                        res.status(400).send(`problem: ${e}`);
                                        res.end()
                                    }
                                }
                                else {
                                    res.statusCode = 200;
                                    res.end();
                                }
                            }
                        });

                    }
                });
            }
            else {
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

router.post('/private/updateUserPermission', async function (req, res) {
    if (req.body.mapID && req.body.userID && req.body.permission_From && req.body.permission_To) {
        user.findOne({ '_id': req.body.userID }, function (err, userResult) {
            if (userResult) {
                map.findOneAndUpdate({ _id: req.body.mapID }, { $pull: { ["Permission." + [req.body.permission_From]]: {id: req.body.userID} }
                , $addToSet: { ["Permission." +[req.body.permission_To]]: {id: req.body.userID, type: "PersonalPermission"} }  }, function (err, result) {
                    if (err) {
                        console.log(err);
                        // res.status(500).send("Server error occurred while pop from parent folder.");
                        res.statusCode = 500;
                        res.end();
                    } else {
                        // change - now send mail
                        if (userResult.getPermissionUpdate) {
                            var mailSubject = "Map Permission Updates"
                            var text = "<div style='text-align: center; direction: ltr;'><h3>Hi There, " + userResult.FirstName + " " + userResult.LastName + "!</h3>\n\nWe wanted to update you that " + req.decoded.fullName
                                + " changed your permission for map: <b>" + result.MapName + "</b> from <b>" + req.body.permission_From + "</b> to <b>" + req.body.permission_To + "</b>.<br><br>Please log in for more details in <a href='http://132.72.65.112:4200'>this link</a>.<br><br>Have a great day!<br> ME-Maps system</div>"
                            try {
                                
                                var mailObjects = mail.sendEmail(userResult.Username, mailSubject, text)
                                mailObjects[0].sendMail(mailObjects[1], function (error, info) {
                                    if (error) {
                                        console.log(error);
                                        res.status(500).send(`Server error occured while send email`)
                                        res.end()
                                    } else {
                                        res.status(200).send(`permission updated successfully, email sent successfully `)
                                        res.end();
        
                                    }
                                });
                            } catch (e) {

                                res.status(400).send(`problem: ${e}`);
                                res.end()
                            }
                        }
                        else {
                            res.statusCode = 200;
                            res.end();
                        }
                    }
                });
            }
            else {
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

// new version - update done
router.post('/private/addNewPermission', async function (req, res) {
    var status= 200, message="all permission added!";
    var objectToReturn = null;
    if(req.body.mapId && req.body.elementToAdd){
        if(req.body.elementToAdd.type == "Group"){    // means element is a group
            await group.findOne({ 'Name': req.body.elementToAdd.name , 'Creator': req.decoded._id }, async function (err, groupResult) {
                if (groupResult) {
                    //clean same group element
                    await map.findOneAndUpdate({ _id: req.body.mapId },{ $pull: { ["Permission.Owner"]: {id: groupResult._id.toString(), type: "Group"}},async function (err){if(err){res.status(500).send("err in clean group elements read permission");res.end();}}})
                    await map.findOneAndUpdate({ _id: req.body.mapId },{ $pull: { ["Permission.Write"]: {id: groupResult._id.toString(), type: "Group"}},async function (err){if(err){res.status(500).send("err in clean read elements permission");res.end();}}})
                    await map.findOneAndUpdate({ _id: req.body.mapId },{ $pull: { ["Permission.Read"]: {id: groupResult._id.toString(), type: "Group"}},async function (err){if(err){res.status(500).send("err in clean read elements permission");res.end();}}})
                    
                    // add the group element
                    await map.findOneAndUpdate({ _id: req.body.mapId }, {$addToSet: { ["Permission."+req.body.elementToAdd.permission_To]: {id: groupResult._id.toString(), type: req.body.elementToAdd.type} }}, async function (err, addResult) {
                        if(addResult){
                            // add all users in group : without owners! (they are the owners of the group anyway.. and for this map)
                            // important! if there's already "personal permission" user - he change his permission (to the group's one) but not his label!
                            var usersList = []
                            groupResult.Members.Owner.forEach(groupUserId => {
                                if(groupUserId != req.decoded._id){
                                    usersList.push({id: groupUserId, type: "GroupPermission"})
                                }
                            });
                            groupResult.Members.Manager.forEach(groupUserId => {
                                usersList.push({id: groupUserId, type: "GroupPermission"})
                            });
                            groupResult.Members.Member.forEach(groupUserId => {
                                usersList.push({id: groupUserId, type: "GroupPermission"})
                            });
                            // users existence  
                            // clean duplicates GroupPermission users

                            await map.updateOne({ _id: req.body.mapId },{ $pullAll: { ["Permission.Owner"]:usersList}},async function (err){if(err){res.status(500).send("err in clean owner permission");res.end();}})
                            await map.updateOne({ _id: req.body.mapId },{ $pullAll: { ["Permission.Write"]:usersList}},async function (err){if(err){res.status(500).send("err in clean write permission");res.end();}})
                            await map.updateOne({ _id: req.body.mapId },{ $pullAll: { ["Permission.Read"]:usersList}},async function (err){if(err){res.status(500).send("err in clean read permission");res.end();}})
                            // update "personal permission" users
                            var personalUsers = getAllPersonalIds(addResult,usersList)

                            // delete ids from userslist
                            var duplicate_Ids = personalUsers.map(({ id }) => id);
                            
                            usersList = usersList.filter(obj => duplicate_Ids.indexOf(obj.id) == -1)

                            // delete all personal users from exists premissions
                            await map.updateOne({ _id: req.body.mapId },{ $pullAll: { ["Permission.Owner"]:personalUsers}},async function (err){if(err){res.status(500).send("err in delete personalusers owner permission");res.end();}})
                            await map.updateOne({ _id: req.body.mapId },{ $pullAll: { ["Permission.Write"]:personalUsers}},async function (err){if(err){res.status(500).send("err in delete personalusers write permission");res.end();}})
                            await map.updateOne({ _id: req.body.mapId },{ $pullAll: { ["Permission.Read"]:personalUsers}},async function (err){if(err){res.status(500).send("err in delete personalusers read permission");res.end();}})

                            //add personal to the current premission + groupPermission (userLists + personalUsers)
                            await map.updateOne({ _id: req.body.mapId },{ $addToSet: { ["Permission."+req.body.elementToAdd.permission_To]: { $each: usersList.concat(personalUsers)} } }, async function (err) {
                                if(err){
                                    // status = 500;
                                    // message = "Sever err while add users elements"    
                                    res.status(500).send("Sever err while add users elements");res.end();
                                }
                                else{
                                    //send mail to all
                                    var usersReturnObject = []
                                    var promises = []
                                    usersList.concat(personalUsers).forEach(async (element) => {
                                        promises.push(user.findOne({ "_id": element.id }, async function (err, userRes) {
                                            usersReturnObject.push({ id: element.id, type: element.type, name: userRes.FirstName + " " + userRes.LastName, username: userRes.Username });
                                            if (userRes.getPermissionUpdate) {
                                                var mailSubject = "New Permission Request Has Arrived!";
                                                var text = "<div style='text-align: center; direction: ltr;'><h3>Hi There, " + userRes.FirstName + " " + userRes.LastName +
                                                    "!</h3>\n\n" + req.decoded.fullName + " has given you a " + "<b>" + req.body.elementToAdd.permission_To + "</b>" +
                                                    ' permission for map "<b>' + addResult.MapName + '</b>".<br><br>Please log in for more details in <a href="http://132.72.65.112:4200">this link</a>.<br><br>Have a great day!<br> ME-Maps system</div>';
                                                try {
                                                    // console.log(text)
                                                    // console.log(userRes.Username)
                                                    var mailObjects = mail.sendEmail(userRes.Username, mailSubject, text);
                                                    promises.push(mailObjects[0].sendMail(mailObjects[1], function (error, info) {
                                                        if (error) {
                                                            status = 500;
                                                            message = `Server error occured while send email`;
                                                            res.status(500).send("Server error occured while send email");
                                                            res.end();
                                                        }
                                                    }));
                                                }
                                                catch (e) {
                                                    // status = 400
                                                    // message = `problem: ${e}`
                                                    res.status(400).send(`problem: ${e}`);
                                                }
                                            }
                                        }));
                                    });
                                    Promise.all(promises).then(() =>
                                        {
                                            objectToReturn = usersReturnObject;
                                            res.writeHead(200, { "Content-Type": "application/json" });
                                            res.end(JSON.stringify(objectToReturn));
                                        }
                                    );

                                }
                            });
                        }
                        else{
                            res.status(500).send(`Sever err while add Group element`)
                            // status = 500;
                            // message = "Sever err while add Group element"                            
                        }
                    });
                }
                else{
                    res.status(404).send(`Group Not Found`)
                    // status = 404;
                    // message = "Group Not Found"
                }
            });
        }
        else{
            // add user : personal permission
            await user.findOne({ 'Username': req.body.elementToAdd.name },async function (err, userRes) {
                if (userRes) {
                    // delete all GroupPermission users from exists premissions
                    await map.updateOne({ _id: req.body.mapId },{ $pull: { ["Permission.Owner"]:{id: userRes._id.toString(), type: "GroupPermission"}}},async function (err){if(err){status=500;message="err in delete groupPermission owner permission";}})
                    await map.updateOne({ _id: req.body.mapId },{ $pull: { ["Permission.Write"]:{id: userRes._id.toString(), type: "GroupPermission"}}},async function (err){if(err){status=500;message="err in delete groupPermission Write permission";}})
                    await map.updateOne({ _id: req.body.mapId },{ $pull: { ["Permission.Read"]:{id: userRes._id.toString(), type: "GroupPermission"}}},async function (err){if(err){status=500;message="err in delete groupPermission Read permission";}})

                    await map.findOneAndUpdate({ _id: req.body.mapId },
                        { $addToSet: { ["Permission."+req.body.elementToAdd.permission_To]: {id: userRes._id.toString(), type: req.body.elementToAdd.type} } }, async function (err, addResult) {
                        if(addResult){
                            
                            if(userRes.getPermissionUpdate){
                                var mailSubject = "New Permission Request Has Arrived!"
                                var text = "<div style='text-align: center; direction: ltr;'><h3>Hi There, " + userRes.FirstName + " " + userRes.LastName + 
                                    "!</h3>\n\n" + req.decoded.fullName + " has given you a " +"<b>" + req.body.elementToAdd.permission_To + "</b>" + 
                                    ' permission for map "<b>' + addResult.MapName + '</b>".<br><br>Please log in for more details in <a href="http://132.72.65.112:4200">this link</a>.<br><br>Have a great day!<br> ME-Maps system</div>'
                                try {
                                    // console.log(text)
                                    console.log(userRes)
                                    var mailObjects = mail.sendEmail(userRes.Username, mailSubject, text)
                                    await mailObjects[0].sendMail(mailObjects[1], function (error, info) {
                                        if (error) {
                                            status = 500
                                            message = `Server error occured while send email`
                                        } else {
                                            // status = 200
                                            // message = `permission added successfully, email sent to user`
                                                                                            objectToReturn = userRes;
                                                res.writeHead(200, { "Content-Type": "application/json" });
                                                console.log("back: "+objectToReturn)
                                                res.end(JSON.stringify(objectToReturn));
                                            
                                        }
                                    });
                                } catch (e) {
                                    res.status(400).send(`problem: ${e}`)
                                    // status = 400
                                    // message = `problem: ${e}`
                                }

                            }
                        }
                        else{
                            res.status(500).send(`Sever err while add Group element`)
                            // status = 500;
                            // message = "Sever err while add Group element"                            
                        }
                    });
                }
                else{
                    res.status(404).send(`Could not find the requested User.`)
                    // status = 404
                    // message ="Could not find the requested User."
                }
            });

        }
    }
    else {
        res.status(400).send(`some Parameters are missing/sent worng in the request`);
        res.end();
    }


});

// new version - update done
router.get('/private/getSharedMaps/:userID', async function (req, res) {
    try {
        map.find({ $or: [{ 'Permission.Owner.id': req.params.userID }, { 'Permission.Write.id': req.params.userID }, { 'Permission.Read.id': req.params.userID }] }, async function (err, result) {
            if (result) {
                var sharedUserMap = []
                // {id: result._id, Owner: result.Permission.Owner, Write: result.Permission.Write, Read: result.Permission.Read}
                result.forEach(map => {
                    if (getSublistById(map,"Owner").indexOf(req.params.userID) > -1) {
                        sharedUserMap.push({ mapID: map._id, MapName: map.MapName, permission: "Owner" })
                    } else if (getSublistById(map,"Write").indexOf(req.params.userID) > -1) {
                        sharedUserMap.push({ mapID: map._id, MapName: map.MapName, permission: "Write" })
                    } else {
                        sharedUserMap.push({ mapID: map._id, MapName: map.MapName, permission: "Read" })
                    }
                });
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(sharedUserMap))
            } else {
                res.status(403).send("Theres not such user");
            }
        })
    } catch (e) {
        console.log(e)
        res.status(500).send('Server error occured.');
    }
});

router.get('/private/searchNodes/:nodeName', async function (req, res) {
    try {
        let texeReg = new RegExp(`^${req.params.nodeName}$`, 'i');
        map.find({ $or: [{ 'Model.nodeDataArray.text': texeReg }] }, async function (err, result) {
            if (result) {
                var containingMaps = []
                result.forEach(map => {
                    if (UserHasReadPermissionForMap(map, req.decoded._id)) {
                        let nodeId, nodeText, nodeKey;
                        for (let index = 0; index < map.Model.nodeDataArray.length; index++) {
                            const element = map.Model.nodeDataArray[index];
                            if (element.text.toLowerCase() == req.params.nodeName) {
                                nodeId = element.id
                                nodeText = element.text
                                nodeKey = element.key
                            }
                        }
                        let currInfo = {
                            mapID: map._id,
                            MapName: map.MapName,
                            nodeId: nodeId,
                            nodeText: nodeText,
                            nodeKey: nodeKey

                        }
                        containingMaps.push(currInfo)
                    }

                });
                res.status(200).send(containingMaps)
            } else {
                res.status(403).send("This node doesn't exist in DB");
            }

        })

    } catch (e) {
        console.log(e)
        res.status(500).send('Server error occured.');
    }
});




process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
module.exports = router;


