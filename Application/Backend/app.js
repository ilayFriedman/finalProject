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
const contextRoute = require('./routes/contexts');
const foldersRoute = require('./routes/folders')
const subscriptionsRoute = require('./routes/subscriptions')
const connectionsRoute = require('./routes/connections')
const commentsRoute = require('./routes/comments')




var port = 3000;


//chrome exp handle
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content-Type, Accept");
    next();
})

// set connection to DB
mongoose.connect('mongodb://localhost:27017/ourDB', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, function (err, db) {
    console.log('Connect to DB')
});

// PORT LISTENER
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});

// Decode token and continue to other methods
app.use('/private', function (req, res, next) {
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
app.post('/restorePassword', usersRoute);
app.post('/private/changeInfo', usersRoute);
app.get('/private/getUsers', usersRoute);
app.get('/private/getUserDetails', usersRoute);
app.delete('/private/removeUser', usersRoute);

app.get('/private/getMap/:mapID', mapsRoute);
app.get('/private/getMapDescription/:mapID', mapsRoute);
app.get('/private/getUsersPermissionsMap/:mapID', mapsRoute);
app.post('/private/createMap', mapsRoute);
app.put('/private/updateMap', mapsRoute);
app.put('/private/updateMapInuse', mapsRoute);
app.get('/private/getMapInUseStatus/:mapID', mapsRoute);
app.post('/private/updateMapProperties', mapsRoute);
app.delete('/private/removeMap/:mapID&:userPermission&:folderID', mapsRoute);

app.put('/private/addLikeToComment', commentsRoute);
app.put('/private/addNewComment', commentsRoute);
app.put('/private/updateComment', commentsRoute);
app.put('/private/deleteComment', commentsRoute);

app.delete('/private/removeUserPermission/:mapID&:userID&:permission', mapsRoute)
app.delete('/private/removeGroupPermission/:mapID&:groupID', mapsRoute)
app.post('/private/addNewPermission', mapsRoute)
app.get('/private/getSharedMaps/:userID', mapsRoute);
app.get('/private/searchNodes/:nodeName', mapsRoute);
app.get('/private/searchMaps/:mapName', mapsRoute);


app.put('/private/addNewConnection', connectionsRoute);
app.put('/private/deleteConnection', connectionsRoute);

app.post('/private/addNewSubscriber', subscriptionsRoute)
app.delete('/private/removesubscriber/:mapID', subscriptionsRoute)


app.put('/private/addNewConnection', connectionsRoute);
app.put('/private/deleteConnection', connectionsRoute);

app.post('/private/addNewSubscriber', subscriptionsRoute)
app.delete('/private/removesubscriber/:mapID&:userID', subscriptionsRoute)


app.get("/private/getMyGroups", groupsRoute);
app.post("/private/createGroup", groupsRoute);
app.delete("/private/deleteGroup/:id", groupsRoute);
app.post("/private/updateGroupProperties", groupsRoute);
app.get("/private/GetGroupsMembers/:id", groupsRoute);
app.post('/private/addUserToGroup', groupsRoute);
app.delete("/private/RemoveUserFromGroup/:groupId&:userID&:permission", groupsRoute);
app.post('/private/updateGroupUserPermission', groupsRoute);
app.get('/private/getSingleOwnerPermission', groupsRoute);

app.post('/private/createReference', referencesRoute);
app.get('/private/getAllReferences', referencesRoute);

app.post('/private/createContext', contextRoute);
app.get('/private/getAllContexts', contextRoute);

app.post('/private/createFolder', foldersRoute)
app.post('/private/getFolderContentsLists', foldersRoute)
app.post('/private/updateFolderProperties', foldersRoute)
app.get('/private/getFolderDescription/:FolderID', foldersRoute)
app.get('/private/getRootFolderById', foldersRoute)
app.post('/private/addExistMapToFolder', foldersRoute)
app.delete('/private/removeFolderFromFolder/:parentID&:folderID', foldersRoute)


