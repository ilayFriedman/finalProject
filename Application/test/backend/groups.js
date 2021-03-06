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
    getPermissionUpdate: true
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
                .send({_id: result[0]._id, description: "updated test group", groupName: testGroupData.groupName})
                .then((res, err) => {
                    res.statusCode.should.equal(200);
                    res.text.should.equal('Group description and name updated successfully.');
                    
                    // Assert that DB is actually changed.
                    return group.findById(result[0]).exec()
                    .then(updatedGroup => {
                            updatedGroup.Description.should.equal("updated test group");
                            updatedGroup.Name.should.equal(testGroupData.groupName);
                    })
                    .catch();
                })
        })
    });

    
    it('should disallow update group description due to insufficient permissions', function () {
        const newUserData = {
            Username: "b",
            Password: "a",
            FirstName: "FirstName",
            LastName: "LastName",
            getPermissionUpdate: false
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
                    .send({_id: result[0]._id, description: "not updated", groupName: "not updated"})
                    .then((res, err) =>{
                        return group.findById(result[0]).exec()
                        .then(updatedGroup => {
                            res.statusCode.should.equal(400);
                            res.text.should.equal("Could not find the requested map, or the user has insufficient permissions to perform this action.");
                            updatedGroup.Description.should.not.equal("not updated");   
                            updatedGroup.Name.should.not.equal("not updated");                             
                        })
                        .catch()
                    });     
            }
        });
    });

    it('should disallow update group memebrs due to insufficient permissions', function () {
        const newUserData = {
            Username: "c",
            Password: "a",
            FirstName: "FirstName",
            LastName: "LastName",
            getPermissionUpdate: true
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
                .post('/private/addUserToGroup')
                .set('token', newUserToken)
                .send({groupId: result[0]._id, username: testUserData.Username, permission_To: "Manager"})
                .then((res, err) =>{
                    return group.findById(result[0]).exec()
                    .then(updatedGroup => {
                        res.statusCode.should.equal(403);
                        res.text.should.equal("The user's permissions are insufficient to set requested permission.");
                        updatedGroup.Members.Owner[0].should.equal(testUserId);                                
                    })
                });     
        });
    });

    it('should allow update group memebrs', function () {
        const newUserData = {
            Username: "d",
            Password: "a",
            FirstName: "FirstName",
            LastName: "LastName",
            getPermissionUpdate: true
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
                .post('/private/addUserToGroup')
                .set('token', testUserToken)
                .send({groupId: result[0]._id, username: newUserData.Username, permission_To: "Manager"})
                .then((res, err) =>{
                    return group.findById(result[0]).exec()
                    .then(updatedGroup => {
                        res.statusCode.should.equal(200);
                        updatedGroup.Members.Manager[0].should.equal(otherUserId);                                
                    })
                });     
        });
    });

    it('should GetGroupsMembers', function () {
        return group.findOne({'Name': testGroupData.groupName}).exec()
        .then((result, err) => {
            return chai.request(serverAddress)
            .get('/private/GetGroupsMembers/' + result._id)
            .set('token', testUserToken)
            .send()
            .then((res, err) => {

                res.statusCode.should.equal(200);
                res = JSON.parse(res.text);

                res.Manager.length.should.equal(1);
                res.Manager[0].Username.should.equal('d');

                res.Member.length.should.equal(0);

                res.Owner.length.should.equal(1);
                res.Owner[0].Username.should.equal('a');

            })
        })             
    });

    it('should getMyGroups', function () {
        let groupId;
        return group.find({'Name': testGroupData.groupName}).exec()
        .then((result, err) => {
            expectedResponse = [{
                GroupId: result[0].id,
                text: result[0].Name,
                GroupDescription: result[0].Description,
                permission: 'Manager'
            }];

            return chai.request(serverAddress)
            .get('/private/getMyGroups')
            .set('token', otherUserToken)
            .send()
            .then((res, err) => {
                res.statusCode.should.equal(200);
                res.body.should.deep.equal(expectedResponse);
            })  
        });
    });
    
    it('should disallow revoking Owner permission by non-owner', function () {
        return group.find({'Name': testGroupData.groupName}).exec()
        .then(result => {
            return chai.request(serverAddress)
                .delete('/private/RemoveUserFromGroup/' + result[0]._id + "&" + testUserId + "&" + "Owner")
                .set('token', otherUserToken)
                .send()
                .then((res, err) =>{
                    return group.findById(result[0]).exec()
                    .then(updatedGroup => {
                        res.statusCode.should.equal(403);
                        res.text.should.equal("The user's permissions are insufficient to revoke Owner permission.");
                        updatedGroup.Members.Owner[0].should.equal(testUserId);                                 
                    })
                });     
        });
    });

    it('should revoke Manager permission', function () {
        return group.find({'Name': testGroupData.groupName}).exec()
        .then(result => {
            return chai.request(serverAddress)
                .delete('/private/RemoveUserFromGroup/' + result[0]._id + "&" + otherUserId + "&" + "Manager")
                .set('token', testUserToken)
                .send()
                .then((res, err) =>{
                    return group.findById(result[0]).exec()
                    .then(updatedGroup => {
                        res.statusCode.should.equal(200);
                        res.text.should.equal("User successfully deleted from group.");
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
