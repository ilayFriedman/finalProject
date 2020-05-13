const express = require('express');
const router = express.Router();
const reference = require('../models/reference');
const jwt = require('jsonwebtoken');

router.get('/private/getAllReferences', async function(req, res) {
    try {
        reference.find({}, function(err, result) {
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

router.post('/private/createReference', async function(req, res) {
    try {
        const CreatorId = req.decoded._id;
        const newRef = new reference({
            Title: req.body.Title,
            CreatorId: CreatorId,
            CreationTime: new Date(),
            Authors: req.body.Authors,
            Publication: req.body.Publication,
            Description: req.body.Description,
            Link: req.body.Link
        });
        newRef.save(function(err) {
            if (err) {
                console.log(err);
                res.status(500).send(`Server error occured.`);
            } else {
                res.status(200).send('Reference added successfully');
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
})


module.exports = router;