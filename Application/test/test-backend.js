const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../Backend/app');
const should = chai.should();
const dbHandler = require('./db-handler');
const user = require('../Backend/models/user')
const map = require('../Backend/models/map')
const jwt = require('jsonwebtoken');


chai.use(chaiHttp);
const serverAddress = "http://localhost:3000";

const missingUsername = 'noSuchUser';
const missingUserPass = 'noSuchPass';

const testUserData = {
    Username: "a",
    Password: "a",
    FirstName: "FirstName",
    LastName: "LastName",
    City: "City",
    Country: "Country"
}
const testMapData = {
    MapName: "oren4",
    Description: "shit1",
    Model: {
        class: "go.GraphLinksModel",
        modelData: {position: "-658 -379"},
        nodeDataArray: [
            {
                category: "Task",
                text: "Task",
                fill: "#ffffff",
                stroke: "#000000",
                strokeWidth: 1,
                description: "Add a Description",
                key: -1,
                loc: "-221.515625 -280",
                refs: [],
                ctxs: [],
                comment: "5e01d8ce58d49412d0a5cba0"
            },
            {
                category: "Quality",
                text: "Quality",
                fill: "#ffffff",
                stroke: "#000000",
                strokeWidth: 1,
                description: "Add a Description",
                key: -2,
                loc: "-217.515625 -132",
                refs: [],
                ctxs: [],
                comment: null
            }
        ],
        linkDataArray: [{
            category: "Association",
            text: "",
            toArrow: "",
            routing: {class: "go.EnumValue", classType: "Link", name: "Normal"},
            description: "Add a Description",
            points: [-221.0908251994365, -264.28240737915036, -217.96977391360795, -148.80350980349422],
            from: -1,
            to: -2,
            refs: [],
            ctxs: [],
            comment: null
        }]
    }
}
const testChangeMapModel = {
    class: "go.GraphLinksModel",
    modelData: {position: "-658 -379"},
    nodeDataArray: [
        {
            category: "Task",
            text: "Change",
            fill: "#ffffff",
            stroke: "#000000",
            strokeWidth: 1,
            description: "Add a Description",
            key: -1,
            loc: "-221.515625 -280",
            refs: [],
            ctxs: [],
            comment: "5e01d8ce58d49412d0a5cba0"
        },
        {
            category: "Quality",
            text: "Quality",
            fill: "#ffffff",
            stroke: "#000000",
            strokeWidth: 1,
            description: "Add a Description",
            key: -2,
            loc: "-217.515625 -132",
            refs: [],
            ctxs: [],
            comment: null
        }
    ],
    linkDataArray: [{
        category: "Association",
        text: "",
        toArrow: "",
        routing: {class: "go.EnumValue", classType: "Link", name: "Normal"},
        description: "Add a Description",
        points: [-221.0908251994365, -264.28240737915036, -217.96977391360795, -148.80350980349422],
        from: -1,
        to: -2,
        refs: [],
        ctxs: [],
        comment: null
    }]
}
let testUserId = "";
let testUserToken;
let testMap;

async function createUser(userData = testUserData) {
    try {
        const newUser = new user(userData);
        await newUser.save(function (err, savedUser) {
            if (savedUser) {
                testUserId = savedUser._id;
                let payload = {username: savedUser.Username, _id: savedUser._id};
                let options = {expiresIn: "1d"};
                testUserToken = jwt.sign(payload, secret, options);
            }
        });
    } catch (e) {
        console.log(e)
    }
};

async function createMap(mapData = testMapData) {
    try {
        let mapDataCopy = {...mapData};
        mapDataCopy.CreatorId = testUserId;
        mapDataCopy.CreationTime = new Date();
        mapDataCopy.Permission = {
                "Owner": {"userId": testUserId, "permission": "owner"},
                "Users": [{"userId": testUserId, "permission": "owner"}],
                    "Groups": []
            },
        mapDataCopy.Subscribers = [];
        mapDataCopy.ContainingFolders = [];
        const newMap = new usermap(mapDataCopy);
        await newMap.save(function (err, savedMap) {
            if (savedMap) {
                testMap = savedMap;
            }
        });
    } catch (e) {
        console.log(e)
    }
};

describe('Users', function () {

    /**
     * Connect to a new in-memory database before running any tests.
     * Then, insert a test user.
     */
    before(async function () {
        await dbHandler.connect();
        // let newUser = new user(testUserData);
        // newUser.save(function (err) {
        // });
        createUser();
    });

    /**
     * Remove and close the db and server.
     */
    after(async function () {
        await dbHandler.clearDatabase()
        await dbHandler.closeDatabase()
    });

    it('should return the user\'s full name, and a token', function (done) {
        chai.request(serverAddress)
            .post('/login')
            .send({
                Username: testUserData.Username,
                Password: testUserData.Password
            })
            .end(function (err, res, body) {
                    res.statusCode.should.equal(200);
                    res.body.fullName.should.equal(testUserData.FirstName + " " + testUserData.LastName);

                    done();
                }
            );
    });

    it('should not find such user', function (done) {
            chai.request(serverAddress)
                .post('/login')
                .send({
                    Username: missingUsername,
                    Password: missingUserPass
                })
                .end(function (err, res) {
                        res.statusCode.should.equal(400);
                        res.text.should.equal("No such user");

                        done();
                    }
                );
        }
    );
});

describe('Maps', function () {

    /**
     * Connect to a new in-memory database before running any tests.
     * Then, insert a test map.
     */
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImEiLCJfaWQiOiI1ZTAxYzhkNDA0Mjg1NjI0MTRkNWFiNWMiLCJpYXQiOjE1NzcxOTQwNDYsImV4cCI6MTU3NzI4MDQ0Nn0.R_dS-qbLhop1UzpsafuSfA_t2plP96Tna1E9uPSy4s0"
    before(async function () {
        await dbHandler.connect({useUnifiedTopology: true,});
    });

    /**
     * Remove and close the db and server.
     */
    after(async function () {
        await dbHandler.clearDatabase()
        await dbHandler.closeDatabase()
    });

    it('should add a map', function (done) {
        chai.request(serverAddress)
            .post('/private/createMap')
            .set('token', testUserToken)
            .send(testMapData)
            .end(function (err, res) {
                    res.statusCode.should.equal(200);
                    res.text.should.equal("map added successfully");

                    done();
                }
            );
    });

    it('should not find a token', function (done) {
            chai.request(serverAddress)
                .post('/private/createMap')
                .send()
                .end(function (err, res) {
                        res.statusCode.should.equal(401);
                        res.text.should.equal("Access denied. No token provided.");

                        done();
                    }
                );
        }
    );

    it('should remove map', function (done) {
            map.findOne({MapName: "oren4"}, function (err, result) {
                if (result) {
                    let mapID = result/*[0]*/._id.toString();
                    chai.request(serverAddress)
                        .delete('/private/removeMap')
                        .set('token', testUserToken)
                        .send({_id: mapID})
                        .end(function (err, res) {
                                res.statusCode.should.equal(200);
                                res.text.should.equal("map deleted successfully");

                                done();
                            }
                        );
                }
            });

        }
    );

    it('should not find map to remove', function (done) {
        let mapID = "noSuchID";
        chai.request(serverAddress)
            .delete('/private/removeMap')
            .set('token', testUserToken)
            .send({_id: mapID})
            .end(function (err, res) {
                    res.statusCode.should.equal(404);
                    res.text.should.equal("Could not find a map with the given _id.");

                    done();
                }
            );
    });

    it('should not find an _id', function (done) {
        chai.request(serverAddress)
            .delete('/private/removeMap')
            .set('token', testUserToken)
            .send()
            .end(function (err, res) {
                    res.statusCode.should.equal(400);
                    res.text.should.equal("Missing id of map");

                    done();
                }
            );
    });

    it('should find the stored map', function (done) {
        chai.request(serverAddress)
            .put('/private/updateMap')
            .set('token', testUserToken)
            .send({_id: testMap._id, model: testChangeMapModel})
            .end(function (err, res) {
                    res.statusCode.should.equal(200);
                    res.text.should.equal("map deleted successfully");

                    map.findById(testMap._id, function (res, err) {
                        // testChangeMapModel = {
                        //     class: "go.GraphLinksModel",
                        //     modelData: {position: "-658 -379"},
                        //     nodeDataArray: [
                        //         {
                        //             category: "Task",
                        //             text: "Change",
                        //             fill: "#ffffff",
                        res.nodeDataArray[0].text.should.equal("Change");
                    })


                    done();
                }
            );
    });

    // router.put('/private/updateMap', async function (req, res){
    //     if(req.body._id){
    //         map.findOneAndUpdate({"_id": req.body._id}, {'Model': req.body.model}, function(err) {
    //             if (err) {
    //                 console.log(err);
    //                 res.status(400).send(`problem: ${err}`);
    //             } else {
    //                 res.status(200).send("map deleted successfully");
    //             }
    //         });
    //     }
    // });
});
