const express = require('express');
const router = express.Router();
const folder = require('../models/folder')
const jwt = require('jsonwebtoken');

router.post('/private/createFolder', async function(req, res) {
    try {
        const CreatorId = req.decoded._id;
        const newFolder = new folder({
            Name: req.body.Name,
            MapsInFolder: [],
            SubFolder: [],
            Creator: CreatorId,
            CreationTime: new Date(),
            Description: req.body.Description,
            ParentDir: req.body.ParentDir,
            UserRootFolder: req.body.UserRootFolder
        });
        newFolder.save(function(err) {
            if (err) {
                console.log(err);
                res.status(500).send(`Server error occured.`);
            } else {
                res.status(200).send('Folder added successfully.');
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
})

router.get('/private/getFolderContents', async function(req, res) {
    try {
        folder.find({'_id': req.body._id}, function(err, result) {
            if (result) {
                res.status(200).send(result)
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
        folder.find({'_id': req.body._id}, function(err, result) {
            if (result) {
                    // console.log((result[0].MapsInFolder.includes(req.body.mapID)))
                    folder.status(200).send(result)
                    folder.MapsInFolder.push("d")
                    res.save();
            } else {
                res.status(400).send(`problem: ${err}`);
            }
        })
    } catch (e) {
        res.status(400).send(`problem: ${e}`);
    }
});



module.exports = router;