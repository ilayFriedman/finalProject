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



var port = 3000;


//chrome exp handle
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Origin, X-Requested-With,Content-Type, Accept");
    next();
})

// set connection to DB
mongoose.connect('mongodb://localhost:27017/ourDB', function (err, db) {
    console.log('Connect to DB')
})
mongoose.connection.on('connected', () => console.log('Connected'));
mongoose.connection.on('error', () => console.log('Connection failed with - ',err));

// PORT LISTENER
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});

// Decode token and continue to other methods
app.use('/private', function (req, res, next) {
    const token = req.header("token");
    // no token
    if (!token) res.status(401).send("Access denied. No token provided.");
    // verify token
    try {
        const decoded = jwt.verify(token, secret);
        req.decoded = decoded;
    } catch (exception) {
        res.status(400).send("Invalid token.");
    }
    next()
})

//Call routes
app.post('/login', usersRoute);
app.get('/private/getMap', mapsRoute);
app.post('/private/createMap', mapsRoute);
app.delete('/private/deleteMap', mapsRoute);

