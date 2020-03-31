const express = require('express');
const router = express.Router();
const folder = require('../models/folder')
const jwt = require('jsonwebtoken');
const user = require('../models/user');

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
                            res.status(200).send('Folder created successfully. Parent updated');
                        }});
                }
                else{
                    res.status(200).send('Folder created successfully. Parent updated');
                }
                }

        });
     
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
})

router.post('/private/getFolderContents', async function(req, res) {
    try {
        folder.findOne({'_id': req.body.FolderID}, function(err, result) {
            if (result) {
                res.status(200).send({"MapsInFolder": result.MapsInFolder, "SubFolders" :result.SubFolders})
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
        folder.deleteOne({'_id': req.body.FolderID},{$pop:{"MapID" : req.body.MapID}}, function(err, result) {
            if (err) {
                console.log(err);
                res.status(500).send("Server error occurred.");
            } else {
                res.status(200).send("map removed successfully.");
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


module.exports = router;