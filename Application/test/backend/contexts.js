const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../Backend/app');
const should = chai.should();
const assert = require('assert');
const dbHandler = require('./db-handler');
const user = require('../../Backend/models/user')
const context = require('../../Backend/models/context')
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

const testCtxData = {
                Title: "Title",
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

describe('Contexts', function () {

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

    it('should create a new context', function () {
        return createUser()
        .then(function(){
            return chai.request(serverAddress)
            .post('/private/createContext')
            .set('token', testUserToken)
            .send(testCtxData)
            .then((res, err) => {
                res.statusCode.should.equal(200);
                res.text.should.equal("Context added successfully");

                return context.findOne({ 'Title': testCtxData.Title }).exec()
                .then((newCtx, err) => {
                    newCtx.Title.should.equal(testCtxData.Title);
                }); 
            });
        });
    });

    it('should fail to add context without Title field', function () {
        return createUser()
        .then(function(){
            return chai.request(serverAddress)
            .post('/private/createContext')
            .set('token', testUserToken)
            .send()
            .then((res, err) => {
                res.statusCode.should.equal(400);
                res.text.should.equal("Cannot create a Context without a Title field.");
                
                return context.find({ 'Title': testCtxData.Title }).exec()
                .then((newCtx, err) => {
                    newCtx.length.should.equal(1); //No context added after this operation
                }); 
            });
        });
    });

    it('should get all contexts', function () {
        return chai.request(serverAddress)
        .get('/private/getAllContexts')
        .set('token', testUserToken)
        .then((res, err) => {
            res.statusCode.should.equal(200);
            res.body.length.should.equal(1);

            return context.findOne({ 'Title': testCtxData.Title }).exec()
                    .then((result, err) => {
                res.body[0].Title.should.equal(result.Title);
            });
        });
    });
});