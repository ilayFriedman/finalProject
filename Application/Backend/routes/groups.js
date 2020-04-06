const express = require('express');
const router = express.Router();
const group = require('../models/group')
const jwt = require('jsonwebtoken');

function UserHasMemberPermissionForGroup(resGroup, userId, checkIfUserHasExactlyMemberPermission = false) {
    if(!checkIfUserHasExactlyMemberPermission){
        if (UserHasOwnerPermissionForGroup(resGroup, userId)) {
            return true;
        }
    
        if (UserHasManagerPermissionForGroup(resGroup, userId)) {
            return true;
        }
    }

    if (resGroup.Members.Member) {
        for (let i = 0; i < resGroup.Members.Member.length; i++) {
            const element = resGroup.Members.Member[i];
            if (element.userId == userId) {
                return true;
            }
        }
    }

    return false;
}

function UserHasManagerPermissionForGroup(resGroup, userId,checkIfUserHasExactlyManagerPermission = false) {
    if(!checkIfUserHasExactlyManagerPermission){
        if (UserHasOwnerPermissionForGroup(resGroup, userId)) {
            return true;
        }
    }

    if (resGroup.Members.Manager) {
        for (let i = 0; i < resGroup.Members.Manager.length; i++) {
            const element = resGroup.Members.Manager[i];
            if (element.userId == userId) {
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
            if (element.userId == userId) {
                return true;
            }
        }
    }

    return false;
}

/**
 *  Deletes any existing permission the user has in group.
 * @param {*} group 
 * @param {*} userId 
 */
function deleteUserCurrentPermission(group, userId) {
    if (group.Members.Owner) {
        for (let i = 0; i < group.Members.Owner.length; i++) {
            const element = group.Members.Owner[i];
            if (element.userId == userId) {
                group.Members.Owner.splice(i, 1);
                return;
            }
        }
    }

    if (group.Members.Manager) {
        for (let i = 0; i < group.Members.Manager.length; i++) {
            const element = group.Members.Manager[i];
            if (element.userId == userId) {
                group.Members.Manager.splice(i, 1);
                return;
            }
        }
    }

    if (group.Members.Memeber) {
        for (let i = 0; i < group.Members.Memeber.length; i++) {
            const element = group.Members.Memeber[i];
            if (element.userId == userId) {
                group.Members.Memeber.splice(i, 1);
                return;
            }
        }
    }

    return;

}

/**
 *  Sets a permission to the user on the group.
 * 
 * @param {*} group - the group object
 * @param {*} userId - the user to which permission is given
 * @param {*} permission - "Owner"/"Manager"/"Member" are valid permissions.
 * @return {*} True if permission has been given. False otherwise.
 */
function addUserPermissionOnGroup(group, userId, permission) {
    let permissionGiven = false;
    switch (permission) {
        case "Owner":
            if (!group.Members.Owner) {
                group.Members.Owner = [];
            }
            group.Members.Owner.push({"userId": userId});
            permission = true;

            break;

        case "Manager":
            if (!group.Members.Manager) {
                group.Members.Manager = [];
            }
            group.Members.Manager.push({"userId": userId});
            permissionGiven = true;

            break;

        case "Member":
            if (!group.Members.Member) {
                group.Members.Member = [];
            }
            group.Members.Member.push({"userId": userId});
            permissionGiven = true;

            break;
    }

    return permissionGiven

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
                Owner: [{ "userId": CreatorId }],
                Manager: [],
                Member: []
            },
        });
        newGroup.save(function (err, saveRes) {
            if (err) {
                console.log(err);
                res.status(500).send(`Server error occured.`);
            } else {
                res.writeHead(200, {"Content-Type": "application/json"});
                    res.end(JSON.stringify(saveRes));
                // res.status(200).send('Group created successfully.');
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

// router.delete('/private/deleteGroup', async function (req, res) {
//     if (req.body._id) {
//         group.findOne({ _id: req.body._id }, function (err, result) {
//             if (result) {
//                 if (UserHasOwnerPermissionForGroup(result, req.decoded._id)) {
//                     group.deleteOne({ _id: result._id }, function (err) {
//                         if (err) {
//                             console.log(err);
//                             res.status(500).send(`Server error occured.`);
//                         } else {
//                             res.status(200).send("Group deleted successfully.");
//                         }
//                     });
//                 }
//                 else {
//                     res.status(403).send("The user's permissions are insufficient to delete group.");
//                 }
//             }
//             else {
//                 res.status(404).send(`Could not find the requested group.`);
//             }
//         })
//     } else {
//         res.status(400).send(`Missing group id.`);
//     }

// });

router.delete('/private/deleteGroup/:id', async function (req, res) {
    if(req.params.id){
        console.log(req.params.id)
        group.findOne({ _id: req.params.id }, function (err, result) {
            if (result) {
                if (UserHasOwnerPermissionForGroup(result, req.decoded._id)) {
                    group.deleteOne({ _id: result._id }, function (err) {
                        if (err) {
                            console.log(err);
                            res.status(500).send(`Server error occured.`);
                        } else {
                            res.status(200).send("Group deleted successfully.");
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

router.post('/private/updateGroupProperties', async function (req, res) {
    if (req.body._id && req.body.description) {
        group.findOne({
            '_id': req.body._id
        }, function (err, result) {
            if (result) {
                if (UserHasOwnerPermissionForGroup(result, req.decoded._id)) {
                    group.findOneAndUpdate({ _id: req.body._id }, { 'Description': req.body.description }, function (err, mongoRes) {
                        if (err) {
                            res.status(500).send("Server error occurred.");
                        } else {
                            res.status(200).send('Group description updated successfully.');
                        }
                    });
                }
                else {
                    res.status(403).send("The user's permissions are insufficient to update the group's description.");
                }
            }
            else {
                res.status(404).send("Could not find group.");
            }
        })
    }
    else {
        res.status(400).send("No group ID or description attached to request.");
    }
});

//TODO @Saar Change middleware to work with an array of users.
router.delete('/private/RemoveUserFromGroup', async function (req, res) {
    if(req.body._id && req.body.userId) {
        group.findOne({
            '_id': req.body._id
        }, function (err, result) {
            if(!result){
                res.status(404).send("Could not find map.");
                return;
            }

            isUserGivingPermissionHasSufficientPrivileges = UserHasManagerPermissionForGroup(result, req.decoded._id) && !UserHasOwnerPermissionForGroup(result, req.body.userId); // It takes at least a manager to revoke permission. Cannot revoke Owner permissions.

            if (!isUserGivingPermissionHasSufficientPrivileges){
                res.status(403).send("The user's permissions are insufficient to set requested permission.");
                return;
            }

            deleteUserCurrentPermission(result, req.body.userId);

            group.findOneAndUpdate({ _id: req.body._id }, { 'Members': result.Members }, function (err, mongoRes) {
                if (err) {
                    res.status(500).send("Server error occurred.");
                } else {
                    res.status(200).send('Group permissions has been updated successfully.');
                }
            });

        })
    }
    else {
        res.status(400).send("No group Id, user Id or permission level attached to request.");
    }
});

//TODO @Saar Change middleware to work with an array of users.
router.post('/private/SetUserPermissionForGroup', async function (req, res) {
    if(req.body._id && req.body.userId && req.body.permission) {
        group.findOne({
            '_id': req.body._id
        }, function (err, result) {
            if(!result){
                res.status(404).send("Could not find map.");
                return;
            }

            isUserGivingPermissionHasSufficientPrivileges = UserHasOwnerPermissionForGroup(result, req.decoded._id); // Owner can give any permission.
            isUserGivingPermissionHasSufficientPrivileges = isUserGivingPermissionHasSufficientPrivileges // A Manager can give another user Manager or Memeber permissions.
                                                            || (UserHasManagerPermissionForGroup(result, req.decoded._id) && (req.body.permission == "Manager" || req.body.permission == "Member"));
            if (!isUserGivingPermissionHasSufficientPrivileges){
                res.status(403).send("The user's permissions are insufficient to set requested permission.");
                return;
            }

            deleteUserCurrentPermission(result, req.body.userId);
            let permissionGiven = addUserPermissionOnGroup(result, req.body.userId, req.body.permission);
            if(!permissionGiven){
                res.status(400).send("Unsupported permission requested. Supported permissions are: 'Member', 'Manager' and 'Owner'.");
                return;
            }

            group.findOneAndUpdate({ _id: req.body._id }, { 'Members': result.Members }, function (err, mongoRes) {
                if (err) {
                    res.status(500).send("Server error occurred.");
                } else {
                    res.status(200).send('Group permissions has been updated successfully.');
                }
            });

        })
    }
    else {
        res.status(400).send("No group Id, user Id or permission level attached to request.");
    }
});

router.get('/private/GetGroupsMembers', async function (req, res) {
    if(req.body.groupId) {
        group.findOne({
            '_id': req.body.groupId
        }, function (err, result) {
            if(!result){
                res.status(404).send("Could not find group.");
                return;
            }

            isUserGivingPermissionHasSufficientPrivileges = UserHasManagerPermissionForGroup(result, req.decoded._id); // Manager can view permissions.
            if (!isUserGivingPermissionHasSufficientPrivileges){
                res.status(403).send("The user's permissions are insufficient to set requested permission.");
                return;
            }

            if (err) {
                res.status(500).send("Server error occurred.");
            } else {
                res.status(200).send(result.Members);
            }
        })
    }
    else {
        res.status(400).send("No group Id, user Id or permission level attached to request.");
    }
});

router.get('/private/GetGroupsUserBlongsTo', async function (req, res) {
    group.find({}, function (err, result) {
        if (err) {
            res.status(500).send("Server error occurred.");
            return;
        }    

        let responseArray = [];

        result.forEach(resGroup => {
            let checkIfUserHasExactlyMemberPermission = true;
            if(UserHasMemberPermissionForGroup(resGroup, req.decoded._id, checkIfUserHasExactlyMemberPermission)
            || UserHasManagerPermissionForGroup(resGroup, req.decoded._id, checkIfUserHasExactlyMemberPermission)){
                responseArray.push({
                    "GroupId": resGroup.id,
                    "GroupName": resGroup.Name,
                    "GroupDescription": resGroup.Description
                });
            }
        });

        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(responseArray));
    });
});

router.get('/private/GetGroupsUserOwns', async function (req, res) {
    group.find({}, function (err, result) {
        if (err) {
            res.status(500).send("Server error occurred.");
            return;
        }    

        let responseArray = [];

        result.forEach(resGroup => {
            if(UserHasOwnerPermissionForGroup(resGroup, req.decoded._id)){
                responseArray.push({
                    "GroupId": resGroup.id,
                    "GroupName": resGroup.Name,
                    "GroupDescription": resGroup.Description
                });
            }
        });

        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(responseArray));
    });
});

module.exports = router;