const express = require('express');
const router = express.Router();
const folder = require('../models/folder')
const jwt = require('jsonwebtoken');
const user = require('../models/user');

createRootFolder = function(userId, callback) {
    const rootFolder = new folder({
        Name: "userRootFolder",
        MapsInFolder: [],
        SubFolder: [],
        Creator: userId,
        CreationTime: new Date(),
        Description: "rootFolder",
        ParentDir: "/",
    });
    rootFolder.save(callback);
};

router.post('/private/createFolder', async function(req, res) {
    if(!(req.body.folderName && req.body.Description && req.body.ParentDir)){
        res.status(400).send("Request is missing one of the necessary fields: folderName, Description, ParentDir");
        res.end();

        return;
    }

    try {
        const CreatorId = req.decoded._id;
        const newFolder = new folder({
            Name: req.body.folderName,
            MapsInFolder: [],
            SubFolder: [],
            Creator: CreatorId,
            CreationTime: new Date(),
            Description: req.body.Description,
            ParentDir: req.body.ParentDir,
        });
        newFolder.save(function(err,saveRes) {
            if (err) {
                console.log(err);
                res.status(500).send(`Server error occured while creation.`);
            } else {
                if(saveRes.ParentDir != "/"){
                    // Update parent folder with new sub-folder
                    folder.findOneAndUpdate({'_id': saveRes.ParentDir},{$addToSet:{'SubFolders': {"folderID" : saveRes._id.toString(), "folderName": saveRes.Name}}}, function(err, result) {
                        if (err) {
                            folder.deleteOne({'_id': saveRes._id}, function (err) {
                                if (err) {
                                    console.log(err);
                                    result.status(500).send(`Server error occured while delete. & Server error occured when look parent. `);
                                    
                                }
                                else{
                                    res.status(500).send(`Server error occured when look parent.`);
                                }
                            });
                        }
                        else{
                            res.writeHead(200, {"Content-Type": "application/json"});
                            res.end(JSON.stringify(saveRes));
                        }
                    });
                }
                else{
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end(JSON.stringify(saveRes));
                }
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
})

/**
 * @param FolderID 
 * @returns mapsInFolder-list and subFolders-list
 */
router.post('/private/getFolderContentsLists', async function(req, res) {
    try {
        folder.findOne({'_id': req.body.FolderID}, function(err, result) {
            if (result) {

                var answer = {"MapsInFolder": result.MapsInFolder, "SubFolders" :result.SubFolders}
                
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(answer));
                res.status(200).send()
            } else {
                res.status(400).send(`problem: ${err}`);
            }
        })
    } catch (e) {
        res.status(400).send(`problem: ${e}`);
    }
});



router.get('/private/getFolderDescription/:FolderID', async function(req, res) {
    try {
        folder.findOne({'_id': req.params.FolderID}, function(err, result) {
            if (result) {
                res.status(200).send({"Description" :result.Description})
            } else {
                res.status(400).send(`problem: ${err}`);
            }
        })
    } catch (e) {
        res.status(400).send(`problem: ${e}`);
    }
});


router.post('/private/updateFolderProperties', async function(req, res) {
    try {
        folder.findOneAndUpdate({'_id': req.body.folderID},{$set:{"Name" : req.body.folderName, "Description": req.body.Description}}, function(err, result) {
            if (err) {
                console.log(err);
                res.status(500).send("Server error occurred.");
            } else {
                folder.updateOne({'_id': req.body.parentFolderID,'SubFolders.folderID': req.body.folderID},{$set: {"SubFolders.$.folderName": req.body.folderName}}, function(err, result) {
                    // console.log(result)
                    if (err) {
                        res.status(500).send(`Server error occured.`);
                    } else {
                        res.status(200).send("Folder properties was update successfully.");
                    }
                });
            }
        });
    } catch (e) {
        res.status(400).send(`problem: ${e}`);
    }
});


router.delete('/private/removeFolderFromFolder/:parentID&:folderID', async function(req, res) {
    try {
        folder.findOneAndUpdate({_id: req.params.parentID},{$pull:{'SubFolders': {"folderID" : req.params.folderID}}}, function(err, result) {
            if (err) {
                console.log(err);
                res.status(500).send("Server error occurred: while pop from parent folder");
            } else {
                // res.status(200).send("folder deleted successfully (with update parent).");
                // console.log(req.params.parentID)
                // console.log(result)
                    folder.deleteOne({ _id: req.params.folderID }, function(err) {
                            if (err) {
                                res.status(500).send(`Server error occured.`);
                            } else {
                                res.status(200).send("folder deleted successfully (with update parent).");
                            }
                        });
            }
        });
    } catch (e) {
        res.status(400).send(`problem: ${e}`);
    }

});




router.get('/private/getRootFolderById', async function(req, res) {
    try {
        user.findOne({
            '_id': req.decoded._id
        }, function(err, result) {
            if (result) {
                folder.findOne({'Creator': result._id, 'ParentDir': "/"}, function(err, result) {
                    if (result) {
                        res.status(200).send(result);
                    } else {
                        res.status(400).send(`problem: ${err}`);
                    }
                });
            } else {
                res.status(400).send("No such user")
            }
        });
    } catch (e) {
        res.status(400).send(`problem: ${e}`);
    }
});


router.post('/private/addExistMapToFolder', async function(req, res) {
    try {
        folder.findOneAndUpdate({'_id': req.body.folderID}, {$addToSet:{'MapsInFolder': { $each: req.body.mapsList}}}, function(err, result) {
            if (result) {
                res.status(200).send("existing map was added successfully! ")
            } else {
                res.status(400).send(`problem: ${err}`);
            }
        })
    } catch (e) {
        res.status(400).send(`problem: ${e}`);
    }
});

module.exports = router;
module.exports.createRootFolder = createRootFolder;