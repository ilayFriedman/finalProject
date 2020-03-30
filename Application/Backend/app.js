const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors');

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
secret = "memapsrules";

//Import routes
const usersRoute = require('./routes/users');
const mapsRoute = require('./routes/maps');
const groupsRoute = require('./routes/groups');
const referencesRoute = require('./routes/references');
const foldersRoute = require('./routes/folders')




var port = 3000;


//chrome exp handle
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content-Type, Accept");
    next();
})

// set connection to DB
mongoose.connect('mongodb://localhost:27017/ourDB', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, function(err, db) {
    console.log('Connect to DB')
});

// PORT LISTENER
app.listen(port, function() {
    console.log('Example app listening on port ' + port);
});

// Decode token and continue to other methods
app.use('/private', function(req, res, next) {
    const token = req.header("token");
    // no token
    if (!token) {
        res.status(401).send("Access denied. No token provided.");
    } else {
        // verify token
        try {
            const decoded = jwt.verify(token, secret);
            req.decoded = decoded;
        } catch (exception) {
            res.status(400).send("Invalid token.");
        }
        next();
    }
})

//Call routes
app.post('/login', usersRoute);
app.post('/register', usersRoute);
app.post('/private/changeInfo', usersRoute);

app.get('/private/getMap', mapsRoute);
app.get('/private/getAllUserMaps', mapsRoute);
app.post('/private/createMap', mapsRoute);
app.delete('/private/removeMap', mapsRoute);
app.put('/private/updateMap', mapsRoute);

app.post("/private/createGroup", groupsRoute);
app.post("/private/updateGroupProperties", groupsRoute);
app.post("/private/SetUserPermissionForGroup", groupsRoute);
app.get("/private/GetGroupsMembers", groupsRoute);
app.get("/private/GetGroupsUserBlongsTo", groupsRoute);
app.get("/private/GetGroupsUserOwns", groupsRoute);
app.delete("/private/deleteGroup", groupsRoute);
app.delete("/private/RemoveUserFromGroup", groupsRoute);

app.post('/private/createReference', referencesRoute);
app.get('/private/getAllReferences', referencesRoute);

app.post('/private/createFolder', foldersRoute)
app.post('/private/getFolderContents', foldersRoute)
app.post('/private/getFolderProperties', foldersRoute)
app.post('/private/addMapToFolder', foldersRoute)
app.post('/private/updateFolderProperties', foldersRoute)
app.delete('/private/removeMapFromFolder', foldersRoute)
app.get('/private/getRootFolderById', foldersRoute)

