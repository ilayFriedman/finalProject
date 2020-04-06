const express = require('express');
const router = express.Router();
const folder = require('../models/folder')
const jwt = require('jsonwebtoken');
const user = require('../models/user');
var mongoose = require('mongoose');

router.post('/private/createFolder', async function(req, res) {
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
                    folder.findOneAndUpdate({'_id': saveRes.ParentDir},{$addToSet:{'SubFolders': {"folderID" : saveRes._id, "folderName": saveRes.Name}}}, function(err, result) {
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
                        }});
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

router.post('/private/addMapToFolder', async function(req, res) {
    try {
        folder.findOneAndUpdate({'_id': req.body.FolderID},{$addToSet:{'MapsInFolder': {"mapID" : req.body.MapID, "mapName": req.body.mapName}}}, function(err, result) {
            if (err) {
                console.log(err);
                res.status(500).send("Server error occurred.");
            } else {
                res.status(200).send("Map added successfully To Folder.");
            }
        });
    } catch (e) {
        res.status(400).send(`problem: ${e}`);
    }
});



router.post('/private/getFolderProperties', async function(req, res) {
    try {
        folder.findOne({'_id': req.body.FolderID}, function(err, result) {
            if (result) {
                res.status(200).send({"FolderName": result.Name, "FolderDescription" :result.Description})
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
        folder.findOneAndUpdate({'_id': req.body.FolderID},{$set:{"Name" : req.body.FolderName, "Description": req.body.Description}}, function(err, result) {
            if (err) {
                console.log(err);
                res.status(500).send("Server error occurred.");
            } else {
                res.status(200).send("Folder properties was update successfully.");
            }
        });
    } catch (e) {
        res.status(400).send(`problem: ${e}`);
    }
});



router.delete('/private/removeMapFromFolder', async function(req, res) {
    try {
        folder.findOneAndUpdate({'_id': req.body.FolderID},{$pull:{'MapsInFolder': {"mapID": req.body.mapID}}}, function(err, result) {
            if (err) {
                console.log(err);
                res.status(500).send("Server error occurred while pop from parent folder.");
            } else {
                res.status(200).send("map removed successfully from folder.");
            }
        });
    } catch (e) {
        res.status(400).send(`problem: ${e}`);
    }
});

router.delete('/private/removeFolderFromFolder/:parentID&:folderID', async function(req, res) {
    console.log(req.params.folderID);
    console.log(req.params.parentID);
    res.status(200).send("ok!")
    
    
    // try {
    //     folder.findOneAndUpdate({'_id': req.params.parentID},{$pull:{'SubFolders': {"folderID" : req.params.folderID}}}, function(err, result) {
    //         if (err) {
    //             console.log(err);
    //             res.status(500).send("Server error occurred: while pop from parent folder");
    //         } else {
    //                 folder.deleteOne({ _id: req.params.FolderID }, function(err) {
    //                         if (err) {
    //                             res.status(500).send(`Server error occured.`);
    //                         } else {
    //                             res.status(200).send("folder deleted successfully (with update parent).");
    //                         }
    //                     });
    //         }
    //     });
    // } catch (e) {
    //     res.status(400).send(`problem: ${e}`);
    // }

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


module.exports = router;