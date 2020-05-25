const express = require('express');
const router = express.Router();
const group = require('../models/group')
const jwt = require('jsonwebtoken');
const user = require('../models/user');

function UserHasMemberPermissionForGroup(resGroup, userId, checkIfUserHasExactlyMemberPermission = false) {
    if (!checkIfUserHasExactlyMemberPermission) {
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
            if (element == userId) {
                return true;
            }
        }
    }

    return false;
}

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

    if (group.Members.Member) {
        for (let i = 0; i < group.Members.Member.length; i++) {
            const element = group.Members.Member[i];
            if (element.userId == userId) {
                group.Members.Member.splice(i, 1);
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
            group.Members.Owner.push({ "userId": userId });
            permissionGiven = true;

            break;

        case "Manager":
            if (!group.Members.Manager) {
                group.Members.Manager = [];
            }
            group.Members.Manager.push({ "userId": userId });
            permissionGiven = true;

            break;

        case "Member":
            if (!group.Members.Member) {
                group.Members.Member = [];
            }
            group.Members.Member.push({ "userId": userId });
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

router.post('/private/addUserToGroup', async function (req, res) {
    if (req.body.groupId && req.body.username && req.body.permission_To) {
        user.findOne({ 'Username': req.body.username }, function (err, result) {
            if (result) {
                // user exist!
                group.findOneAndUpdate({ _id: req.body.groupId }, { $addToSet: { ["Members." + req.body.permission_To]: result._id.toString() } }, function (err, resultUpadte) {
                    if (err) {
                        res.status(500).send("Server error occurred.");
                        res.end();
                    } else {
                        console.log("here!")
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify(result));
                    }
                });
            } else {
                res.status(404).send("Could not find the requested User.");
            }
        })
    } else {
        res.status(400).send("worng/missing parameters");
        res.end();
    }

});

router.post('/private/updateGroupProperties', async function (req, res) {
    if (req.body._id && req.body.description && req.body.groupName) {
        group.findOneAndUpdate({ '_id': req.body._id, 'Members.Owner':req.decoded._id}, { 'Description': req.body.description , 'Name': req.body.groupName}, function (err, mongoRes) {
            if (err) {
                res.status(500).send("Server error occurred.");
            } else {
                res.status(200).send('Group description updated successfully.');
            }
        });
    }
    else {
        res.status(400).send("No group ID or description attached to request.");
    }
});


router.delete('/private/RemoveUserFromGroup/:groupId&:usersId&:permission', async function (req, res) {
    group.findOneAndUpdate({ _id: req.params.groupId }, { $pull: { ["Members." + req.params.permission]: req.params.usersId } }, function (err, resultUpadte) {
        if (err) {
            res.status(500).send("Server error occurred.");
            res.end();
        } else {
            res.status(200).send("user deleted successfully from this group");
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
                    // res.writeHead(200, {"Content-Type": "application/json"});
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
            if (result) {
                var sharedUserGroups = []
                result.forEach(group => {
                    if (group.Members.Owner.indexOf(req.decoded._id) > -1) {
                        sharedUserGroups.push({ GroupId: group._id, text: group.Name, GroupDescription: group.Description, permission: "Owner" })
                    } else if (group.Members.Manager.indexOf(req.decoded._id) > -1) {
                        sharedUserGroups.push({ GroupId: group._id, text: group.Name, GroupDescription: group.Description, permission: "Manager" })
                    } else {
                        sharedUserGroups.push({ GroupId: group._id, text: group.Name, GroupDescription: group.Description, permission: "Member" })
                    }
                });
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(sharedUserGroups))
            } else {
                res.status(404).send("Theres not such user");
            }
        })
    } catch (e) {
        console.log(e)
        res.status(500).send('Server error occured.');
    }
});


router.post('/private/updateGroupUserPermission', async function (req, res) {
    if (req.body.groupId && req.body.userID && req.body.permission_From && req.body.permission_To) {
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
           
    } else {
        res.status(400).send("worng/missing parameters");
        res.end();
    }

});

module.exports = router;