const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../Backend/app');
const should = chai.should();
const dbHandler = require('./db-handler');
const user = require('../../Backend/models/user');
const group = require('../../Backend/models/group');
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

let otherUserId = "";
let otherUserToken;

function UserHasManagerPermissionForGroup(resGroup, userId) {

    if (resGroup.Members.Manager) {
        for (let i = 0; i < resGroup.Members.Manager.length; i++) {
            const element = resGroup.Members.Manager[i];
            if (element.userId == userId) {
                return true;
            }
        }
    }

    return false;
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
                            res.body.Name.should.equal(testGroupData.groupName);
                            res.body.Description.should.equal(testGroupData.description);
                            res.body.Creator.should.equal(testUserId);

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
                });     
        });
    });

    it('should allow update group memebrs', function () {
        const newUserData = {
            Username: "d",
            Password: "d",
            FirstName: "FirstName",
            LastName: "LastName",
            City: "City",
            Country: "Country"
        }
        const newUser = new user(newUserData);

        p = new Promise(function(resolve, reject){
            newUser.save(function (err, savedUser) {
                if (savedUser) {
                    otherUserId = savedUser.id
                    let payload = {username: savedUser.Username, _id: savedUser.id};
                    let options = {expiresIn: "1d"};
                    otherUserToken = jwt.sign(payload, secret, options);
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
                .send({_id: result[0]._id, userId: otherUserId, permission: "Manager"})
                .then((res, err) =>{
                    return group.findById(result[0]).exec()
                    .then(updatedGroup => {
                        res.statusCode.should.equal(200);
                        res.text.should.equal("Group permissions has been updated successfully.");
                        updatedGroup.Members.Manager[0].userId.should.equal(otherUserId);                                
                    })
                });     
        });
    });

    it('should GetGroupsMembers', function () {
        return group.find({'Name': testGroupData.groupName}).exec()
        .then((result, err) => {
            return chai.request(serverAddress)
            .get('/private/GetGroupsMembers/' + result[0]._id)
            .set('token', testUserToken)
            .send()
            .then((res, err) => {
                res.statusCode.should.equal(200);
                JSON.parse(res.text).should.deep.equal(result[0].Members);
            })
        })             
    });

    it('should GetGroupsUserBlongsTo', function () {
        let groupId;
        return group.find({'Name': testGroupData.groupName}).exec()
        .then((result, err) => {
            expectedResponse = [{
                "GroupId": result[0].id,
                "GroupName": result[0].Name,
                GroupDescription: result[0].Description
            }];

            return chai.request(serverAddress)
            .get('/private/GetGroupsUserBlongsTo')
            .set('token', otherUserToken)
            .send()
            .then((res, err) => {
                res.statusCode.should.equal(200);
                res.body.should.deep.equal(expectedResponse);
            })  
        });
    });

    it('should GetGroupsUserOwns', function () {
        let groupId;
        return group.find({'Name': testGroupData.groupName}).exec()
        .then((result, err) => {
            expectedResponse = [{
                "GroupId": result[0].id,
                "GroupName": result[0].Name,
                GroupDescription: result[0].Description
            }];

            return chai.request(serverAddress)
            .get('/private/GetGroupsUserOwns')
            .set('token', testUserToken)
            .send()
            .then((res, err) => {
                res.statusCode.should.equal(200);
                res.body.should.deep.equal(expectedResponse);
            })  
        });
    });
    
    it('should disallow revoking Owner permission', function () {
        return group.find({'Name': testGroupData.groupName}).exec()
        .then(result => {
            return chai.request(serverAddress)
                .delete('/private/RemoveUserFromGroup')
                .set('token', otherUserToken)
                .send({_id: result[0]._id, userId: testUserId})
                .then((res, err) =>{
                    return group.findById(result[0]).exec()
                    .then(updatedGroup => {
                        res.statusCode.should.equal(403);
                        res.text.should.equal("The user's permissions are insufficient to set requested permission.");
                        updatedGroup.Members.Owner[0].userId.should.equal(testUserId);                                 
                    })
                });     
        });
    });

    it('should revoke Manager permission', function () {
        return group.find({'Name': testGroupData.groupName}).exec()
        .then(result => {
            return chai.request(serverAddress)
                .delete('/private/RemoveUserFromGroup')
                .set('token', testUserToken)
                .send({_id: result[0]._id, userId: otherUserId})
                .then((res, err) =>{
                    return group.findById(result[0]).exec()
                    .then(updatedGroup => {
                        res.statusCode.should.equal(200);
                        res.text.should.equal("Group permissions has been updated successfully.");
                        UserHasManagerPermissionForGroup(updatedGroup, testUserId).should.equal(false);                                
                    })
                });     
        });
    });

    it('should remove group', function () {
        return group.findOne({Name: "group"}).exec()
        .then (result => {
            let groupId = result._id.toString();
            return chai.request(serverAddress)
                .delete('/private/deleteGroup/' + groupId)
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
            .delete('/private/deleteGroup/' + groupId)
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
            .delete('/private/deleteGroup/')
            .set('token', testUserToken)
            .send()
            .end(function (err, res) {
                try{
                    res.statusCode.should.equal(404);

                    done();
                }
                catch(e){
                    done(e);
                }
                    
                }
            );
    });
});
