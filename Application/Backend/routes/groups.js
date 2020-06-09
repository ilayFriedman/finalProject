const express = require('express');
const router = express.Router();
const group = require('../models/group')
const jwt = require('jsonwebtoken');
const user = require('../models/user');
const map = require('../models/map');
const maps = require('../routes/maps');
var mail = require('../models/mail');

const possiblePermissions = ['Member', 'Owner', 'Manager']

function UserHasManagerPermissionForGroup(resGroup, userId, checkIfUserHasExactlyManagerPermission = false) {
    if (!checkIfUserHasExactlyManagerPermission) {
        if (UserHasOwnerPermissionForGroup(resGroup, userId)) {
            return true;
        }
    }

    if (resGroup.Members.Manager) {
        for (let i = 0; i < resGroup.Members.Manager.length; i++) {
            const element = resGroup.Members.Manager[i];
            if (element == userId) {
                return true;
            }
        }
    }

    return false;
}

function UserHasOwnerPermissionForGroup(resGroup, userId) {

    if (resGroup.Members.Owner) {
        for (let i = 0; i < resGroup.Members.Owner.length; i++) {
            const element = resGroup.Members.Owner[i];
            if (element == userId) {
                return true;
            }
        }
    }

    return false;
}


router.post('/private/createGroup', async function (req, res) {
    try {
        const CreatorId = req.decoded._id;
        const newGroup = new group({
            Name: req.body.groupName,
            Creator: CreatorId,
            CreationTime: new Date(),
            Description: req.body.description,
            Members: {
                Owner: [CreatorId],
                Manager: [],
                Member: []
            },
        });
        newGroup.save(function (err, saveRes) {
            if (err) {
                console.log(err);
                res.status(500).send(`Server error occured.`);
            } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(saveRes));
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

router.delete('/private/deleteGroup/:id', async function (req, res) {
    if (req.params.id) {
        group.findOne({ _id: req.params.id }, function (err, result) {
            if (result) {
                if (UserHasOwnerPermissionForGroup(result, req.decoded._id)) {
                    group.deleteOne({ _id: result._id }, function (err) {
                        if (err) {
                            console.log(err);
                            res.status(500).send(`Server error occured.`);
                        } else {
                            // delete all group users from group-permission-maps
                            // get all maps that groups has permission to
                            var groupUsers = maps.getAllGroupMember(result,req.decoded._id,false) // UsersList in group
                            var groupElem = [{ id: req.params.id, type: "Group" }]
                            map.updateMany({$or: [{ 'Permission.Owner': {id: req.params.id.toString(), type: "Group"} }, { 'Permission.Write': {id: req.params.id.toString(), type: "Group"} },
                            { 'Permission.Read': {id: req.params.id.toString(), type: "Group"} }]},
                            { $pullAll: { ["Permission.Write"]: groupUsers.concat(groupElem),  ["Permission.Read"]: groupUsers.concat(groupElem),["Permission.Owner"]: groupUsers.concat(groupElem)} }, async function (err, mapResult) {
                               if(err){
                                
                                   res.status(500).send('Server error occured.');
                               }
                               else{
                                    //send mail to all
                                    var promises = []
                                    groupUsers.forEach(async (element) => {
                                        promises.push(user.findOne({ "_id": element.id }, async function (err, userRes) {
                                            if (userRes.getPermissionUpdate) {
                                                var mailSubject = "Map Permission Revocation: Group Removal"
                                                var text = "<div style='text-align: center; direction: ltr;'><h3>Hi There, " + userRes.FirstName + " " + userRes.LastName + "!</h3>\n\nWe wanted to update you that "
                                                    + " Following deletion of a group that you were a member of: There are changes to permissions you have for different maps.<br><br>Please log in for more details in <a href='http://132.72.65.112:4200'>this link</a>.<br><br>Have a great day!<br> ME-Maps system</div>"
                                                try {
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
                                                    res.status(400).send(`problem: ${e}`);
                                                }
                                            }
                                        }));
                                    });
                                    Promise.all(promises).then(() => {
                                        res.status(200).send("Group deleted successfully.");
                                        res.end();
                                    }
                                    );
                                //    var mapsList = result.map(({ _id }) => id)
                               }
                               });
                        }
                    });
                }
                else {
                    res.status(403).send("The user's permissions are insufficient to delete group.");
                }
            }
            else {
                res.status(404).send(`Could not find the requested group.`);
            }
        })
    } else {
        res.status(400).send(`Missing group id.`);
    }

});

router.post('/private/addUserToGroup', async function (req, res) {
    // Check request params
    if (!(req.body.groupId && req.body.username && req.body.permission_To && possiblePermissions.includes(req.body.permission_To))) {
        res.status(400).send("Request is missing one of the necessary fields: groupId, username, permission_To");
        res.end();

        return;
    }
    
    // Ensure logged in user can grant permissions on group
    result = await group.findOne({ _id: req.body.groupId }).exec();
    
    const canUserGrantPermissions = UserHasManagerPermissionForGroup(result, req.decoded._id);
    if(!canUserGrantPermissions){
        res.status(403).send("The user's permissions are insufficient to set requested permission.");
        res.end();

        return;
    }
    

    // Grant new permission
    user.findOne({ 'Username': req.body.username }, function (err, result) {
        if (result) {
            // user exist!
            // console.log(req.body.rootsList)
            // map.find({_id: { $in: req.body.rootsList }, $or: [{ 'Permission.Owner.id': req.body.groupId }, { 'Permission.Write.id': req.body.groupId }, { 'Permission.Read.id': req.body.groupId }]},function (err, rootsRes) {
            //     if(rootsRes){
            //         console.log(rootsRes)
            //     }
            // });
            
            // {$addToSet:{id: result._id, type: "GroupPermission"}}
            group.findOneAndUpdate({ _id: req.body.groupId }, { $addToSet: { ["Members." + req.body.permission_To]: result._id.toString() } }, {new: true}, function (err, resultUpadte) {
                if (err) {
                    res.status(500).send("Server error occurred.");
                    res.end();
                } else if (resultUpadte) {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(result));
                } else{
                    res.status(404).send("Could not find the requested Group Id.");
                }
            });
        } else {
            res.status(404).send("Could not find the requested User.");
        }
    });

});



router.post('/private/updateGroupProperties', async function (req, res) {
    if (req.body._id && req.body.description && req.body.groupName) {
        group.findOneAndUpdate({ '_id': req.body._id, 'Members.Owner':req.decoded._id}, { 'Description': req.body.description , 'Name': req.body.groupName}, function (err, mongoRes) {
            if (err) {
                res.status(500).send("Server error occurred.");
            } else if(mongoRes){
                res.status(200).send('Group description and name updated successfully.');
            } else{
                res.status(400).send('Could not find the requested map, or the user has insufficient permissions to perform this action.')
            }
        });
    }
    else {
        res.status(400).send("No group ID, description or name attached to request.");
    }
});


router.delete('/private/RemoveUserFromGroup/:groupId&:usersId&:permission', async function (req, res) {
    // Ensure logged in user can grant permissions on group
    requestedGroup = await group.findOne({ _id: req.params.groupId }).exec();
        
    const canUserRevokePermissions = req.params.permission == 'Owner' ? UserHasOwnerPermissionForGroup(requestedGroup, req.decoded._id) : UserHasManagerPermissionForGroup(requestedGroup, req.decoded._id);
    if(!canUserRevokePermissions){
        res.status(403).send("The user's permissions are insufficient to revoke Owner permission.");
        res.end();

        return;
    }

    group.findOneAndUpdate({ _id: req.params.groupId }, { $pull: { ["Members." + req.params.permission]: req.params.usersId } }, function (err, resultUpadte) {
        if (err) {
            res.status(500).send("Server error occurred.");
            res.end();
        } else {
            res.status(200).send("User successfully deleted from group.");
            res.end();
        }
    });


});

router.get('/private/GetGroupsMembers/:id', async function (req, res) {
    if (req.params.id) {
       await group.findOne({'_id': req.params.id}, async function (err, result) {
            if (result) {
                    Member = await user.find().select('_id Username FirstName LastName').where('_id').in(result.Members.Member).exec()
                    Manager = await user.find().select('_id Username FirstName LastName').where('_id').in(result.Members.Manager).exec()
                    Owner = await user.find().select('_id Username FirstName LastName').where('_id').in(result.Members.Owner).exec()

                    res.send({ Member: Member, Manager: Manager, Owner: Owner })
            } else {
                res.status(500).send("Server error occurred.");
            }
        })
    }
    else {
        res.status(400).send("No group Id, user Id or permission level attached to request.");
    }
});


router.get('/private/getMyGroups/', async function (req, res) {
    try {
        group.find({ $or: [{ 'Members.Owner': req.decoded._id }, { 'Members.Manager': req.decoded._id }, { 'Members.Member': req.decoded._id }] }, async function (err, result) {
            if(err){
                res.status(500).send('Server error occured.');
                return;
            }
            
            var sharedUserGroups = [];
            
            if (result) {
                result.forEach(group => {
                    if (group.Members.Owner.indexOf(req.decoded._id) > -1) {
                        sharedUserGroups.push({ GroupId: group._id, text: group.Name, GroupDescription: group.Description, permission: "Owner" })
                    } else if (group.Members.Manager.indexOf(req.decoded._id) > -1) {
                        sharedUserGroups.push({ GroupId: group._id, text: group.Name, GroupDescription: group.Description, permission: "Manager" })
                    } else {
                        sharedUserGroups.push({ GroupId: group._id, text: group.Name, GroupDescription: group.Description, permission: "Member" })
                    }
                });
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(sharedUserGroups));
        });
    } catch (e) {
        console.log(e)
        res.status(500).send('Server error occured.');
    }
});


router.post('/private/updateGroupUserPermission', async function (req, res) {
    if (!(req.body.groupId && req.body.userID && req.body.permission_From && req.body.permission_To)) {
        res.status(400).send("worng/missing parameters");
        res.end();

        return;
    }
        
    group.findOneAndUpdate({ _id: req.body.groupId }, { $pull: { ["Members." + req.body.permission_From]: req.body.userID }, $addToSet: { ["Members." + req.body.permission_To]: req.body.userID } }, function (err, result) {
        if (err) {
            console.log(err);
            res.status(500).send('Server error occured.');
            res.end();

        } else {
            res.status(200).send("user's permission updated!");
            res.end();
        }
    });

});

router.get('/private/getSingleOwnerPermission', async function (req, res) {
    var promises = []
    group.find({"Creator": req.decoded._id, "Members.Owner": [req.decoded._id.toString()], "Members.Owner" : {$size: 1} }, async function (err, result) {
        if(err){
            res.status(500).send('Server error occured.');
        }
        else{
            var ans = result.map(({ _id }) => _id)
            console.log(ans)
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(ans));

        }
    });
});


module.exports = router;