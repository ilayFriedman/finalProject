const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../Backend/app');
const should = chai.should();
const assert = require('assert');
const dbHandler = require('./db-handler');
const user = require('../../Backend/models/user')
const reference = require('../../Backend/models/reference')
const jwt = require('jsonwebtoken');


chai.use(chaiHttp);
const serverAddress = "http://localhost:3000";

const missingUsername = 'noSuchUser';
const missingUserPass = 'noSuchPass';
let testUserToken;

const testUserData = {
    Username: "a",
    Password: "a",
    FirstName: "FirstName",
    LastName: "LastName",
    getPermissionUpdate: false
}

const testRefData = {
                Title: "Title",
                Authors: "Authors",
                Publication: "Publication",
                Description: "Description",
                Link: "Link"
            };

function createUser(userData = testUserData) {
    try {
        const newUser = new user(userData);
        return new Promise(function(resolve, reject){
            newUser.save(function (err, savedUser) {
                if (savedUser) {
                    testUserId = savedUser._id;
                    let payload = {username: savedUser.Username, _id: savedUser._id};
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

describe('References', function () {

    /**
     * Connect to a new in-memory database before running any tests.
     * Then, insert a test user.
     */
    before(async function () {
        await dbHandler.connect();
    });

    /**
     * Remove and close the db and server.
     */
    after(async function () {
        await dbHandler.clearDatabase()
        await dbHandler.closeDatabase()
    });

    it('should create a new reference', function () {
        return createUser()
        .then(function(){
            return chai.request(serverAddress)
            .post('/private/createReference')
            .set('token', testUserToken)
            .send(testRefData)
            .then((res, err) => {
                res.statusCode.should.equal(200);
                res.text.should.equal("Reference added successfully");

                return reference.findOne({ 'Title': testRefData.Title }).exec()
                .then((newRef, err) => {
                    newRef.Title.should.equal(testRefData.Title);
                    newRef.CreatorId.should.equal(testUserId.toString());
                    newRef.Authors.should.equal(testRefData.Authors);
                    newRef.Publication.should.equal(testRefData.Publication);
                    newRef.Description.should.equal(testRefData.Description);
                    newRef.Link.should.equal(testRefData.Link);
                }); 
            });
        });
    });

    it('should fail to add reference without Publication field', function () {
        testRefData.Publication = undefined;
        return createUser()
        .then(function(){
            return chai.request(serverAddress)
            .post('/private/createReference')
            .set('token', testUserToken)
            .send(testRefData)
            .then((res, err) => {
                res.statusCode.should.equal(500);
                
                return reference.find({ 'Title': testRefData.Title }).exec()
                .then((newRef, err) => {
                    newRef.length.should.equal(1); //No reference added after this operation
                }); 
            });
        });
    });

    it('should get all references', function () {
        return chai.request(serverAddress)
        .get('/private/getAllReferences')
        .set('token', testUserToken)
        .then((res, err) => {
            res.statusCode.should.equal(200);
            res.body.length.should.equal(1);

            return reference.findOne({ 'Title': testRefData.Title }).exec()
                    .then((result, err) => {
                res.body[0].Title.should.equal(result.Title);;
                res.body[0].CreatorId.should.equal(result.CreatorId);
                res.body[0].Authors.should.equal(result.Authors);
                res.body[0].Publication.should.equal(result.Publication);
                res.body[0].Description.should.equal(result.Description);
                res.body[0].Link.should.equal(result.Link);
            });
        });
    });
});