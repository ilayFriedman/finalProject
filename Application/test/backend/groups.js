const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../Backend/app');
const should = chai.should();
const dbHandler = require('./db-handler');
const user = require('../../Backend/models/user')
const group = require('../../Backend/models/group')
const jwt = require('jsonwebtoken');



chai.use(chaiHttp);
const serverAddress = "http://localhost:3000";

const testUserData = {
    Username: "a",
    Password: "a",
    FirstName: "FirstName",
    LastName: "LastName",
    City: "City",
    Country: "Country"
}

const testGroupData = {
    groupName: "group",
    description: "test group"
}

let testUserId = "";
let testUserToken;

function getTestUserId(){
    return testUserId;
}

function createUser(userData = testUserData, ) {
    try {
        const newUser = new user(userData);
        return new Promise(function(resolve, reject){
            newUser.save(function (err, savedUser) {
                if (savedUser) {
                    testUserId = savedUser.id;
                    let payload = {username: savedUser.Username, _id: savedUser.id};
                    let options = {expiresIn: "1d"};
                    testUserToken = jwt.sign(payload, secret, options);
                    resolve();
                }
                return (reject(err))
            });
        });
    } catch (e) {
        console.log(e)
    }
};


describe('Groups', function () {

    /**
     * Connect to a new in-memory database before running any tests.
     * Then, insert a test group.
     */
    before(async function () {
        await dbHandler.connect({useUnifiedTopology: true,});
        // await createUser();
    });

    /**
     * Remove and close the db and server.
     */
    after(async function () {
        await dbHandler.clearDatabase()
        await dbHandler.closeDatabase()
    });

    it('should add a group', function (done) {
        createUser()
            .then(function() {
                chai.request(serverAddress)
                    .post('/private/createGroup')
                    .set('token', testUserToken)
                    .send(testGroupData)
                    .end(function (err, res) {
                        try{
                            res.statusCode.should.equal(200);
                            res.text.should.equal("Group created successfully.");

                            done();
                        }
                        catch(e){
                            done(e)
                        }
                    });
            })
            .catch();
    });

    it('should find and update group', function () {
        return group.find({
            'Name': testGroupData.groupName
        }).exec()
        .then(result => {

            return chai.request(serverAddress)
                .post('/private/updateGroupProperties')
                .set('token', testUserToken)
                .send({_id: result[0]._id, description: "updated test group"})
                .then((res, err) => {
                    res.statusCode.should.equal(200);
                    res.text.should.equal("Group description updated successfully.");
                    
                    // Assert that DB is actually changed.
                    return group.findById(result[0]).exec()
                    .then(updatedGroup => {
                            return updatedGroup.Description.should.equal("updated test group");
                    })
                    .catch();
                })
        })
    });

    
    it('should disallow update group description due to insufficient permissions', function () {
        const newUserData = {
            Username: "b",
            Password: "b",
            FirstName: "FirstName",
            LastName: "LastName",
            City: "City",
            Country: "Country"
        }
        const newUser = new user(newUserData);
        let newUserToken;
        p = new Promise(function(resolve, reject){
            newUser.save(function (err, savedUser) {
                if (savedUser) {
                    let payload = {username: savedUser.Username, _id: savedUser._id};
                    let options = {expiresIn: "1d"};
                    newUserToken = jwt.sign(payload, secret, options);
                    resolve();
                }
                return (reject(err))
            });
        });

        return p
        .then(function(){return group.find({'Name': testGroupData.groupName}).exec()})
        .then(result => {
            if (result) {
                return chai.request(serverAddress)
                    .post('/private/updateGroupProperties')
                    .set('token', newUserToken)
                    .send({_id: result[0]._id, description: "not updated"})
                    .then((res, err) =>{
                        return group.findById(result[0]).exec()
                        .then(updatedGroup => {
                            res.statusCode.should.equal(403);
                            res.text.should.equal("The user's permissions are insufficient to update the group's description.");
                            updatedGroup.Description.should.not.equal("not updated");                                
                        })
                        .catch()
                    });     
            }
        });
    });

    it('should disallow update group memebrs due to insufficient permissions', function () {
        const newUserData = {
            Username: "c",
            Password: "c",
            FirstName: "FirstName",
            LastName: "LastName",
            City: "City",
            Country: "Country"
        }
        const newUser = new user(newUserData);
        let newUserToken;
        p = new Promise(function(resolve, reject){
            newUser.save(function (err, savedUser) {
                if (savedUser) {
                    let payload = {username: savedUser.Username, _id: savedUser._id};
                    let options = {expiresIn: "1d"};
                    newUserToken = jwt.sign(payload, secret, options);
                    resolve();
                }
                return (reject(err))
            });
        });

        return p
        .then(function() {return group.find({'Name': testGroupData.groupName}).exec()})
        .then(result => {
            return chai.request(serverAddress)
                .post('/private/SetUserPermissionForGroup')
                .set('token', newUserToken)
                .send({_id: result[0]._id, userId: testUserId, permission: "Manager"})
                .then((res, err) =>{
                    return group.findById(result[0]).exec()
                    .then(updatedGroup => {
                        res.statusCode.should.equal(403);
                        res.text.should.equal("The user's permissions are insufficient to set requested permission.");
                        updatedGroup.Members.Owner[0].userId.should.equal(testUserId);                                
                    })
                    //.catch()
                });     
        });
    });

    it('should sallow update group memebrs', function () {
        const newUserData = {
            Username: "d",
            Password: "d",
            FirstName: "FirstName",
            LastName: "LastName",
            City: "City",
            Country: "Country"
        }
        const newUser = new user(newUserData);
        let newUserToken;
        let newUserId;
        p = new Promise(function(resolve, reject){
            newUser.save(function (err, savedUser) {
                if (savedUser) {
                    newUserId = savedUser.id
                    let payload = {username: savedUser.Username, _id: savedUser.id};
                    let options = {expiresIn: "1d"};
                    newUserToken = jwt.sign(payload, secret, options);
                    resolve();
                }
                return (reject(err))
            });
        });

        return p
        .then(function() {return group.find({'Name': testGroupData.groupName}).exec()})
        .then(result => {
            return chai.request(serverAddress)
                .post('/private/SetUserPermissionForGroup')
                .set('token', testUserToken)
                .send({_id: result[0]._id, userId: newUserId, permission: "Manager"})
                .then((res, err) =>{
                    return group.findById(result[0]).exec()
                    .then(updatedGroup => {
                        res.statusCode.should.equal(200);
                        res.text.should.equal("Group permissions has been updated successfully.");
                        updatedGroup.Members.Manager[0].userId.should.equal(newUserId);                                
                    })
                    //.catch()
                });     
        });
    });

    it('should remove group', function () {
        return group.findOne({Name: "group"}).exec()
        .then (result => {
            let groupId = result._id.toString();
            return chai.request(serverAddress)
                .delete('/private/deleteGroup')
                .set('token', testUserToken)
                .send({_id: groupId})
                .then((res, err) => {
                    res.statusCode.should.equal(200);
                    res.text.should.equal("Group deleted successfully.");                            
                });
        });
    });

    it('should not find group to remove', function (done) {
        let groupId = "noSuchID";
        chai.request(serverAddress)
            .delete('/private/deleteGroup')
            .set('token', testUserToken)
            .send({_id: groupId})
            .end(function (err, res) {
                try{
                    res.statusCode.should.equal(404);
                    res.text.should.equal("Could not find the requested group.");

                    done();
                }
                catch(e){
                    done(e);
                }
                    
                }
            );
    });

    it('should not find an _id in deleteGroup', function (done) {
        chai.request(serverAddress)
            .delete('/private/deleteGroup')
            .set('token', testUserToken)
            .send()
            .end(function (err, res) {
                try{
                    res.statusCode.should.equal(400);
                    res.text.should.equal("Missing group id.");

                    done();
                }
                catch(e){
                    done(e);
                }
                    
                }
            );
    });
});
