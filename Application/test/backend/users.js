const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../Backend/app');
const should = chai.should();
const dbHandler = require('./db-handler');
const user = require('../../Backend/models/user')
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
    City: "City",
    Country: "Country"
}

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

describe('Users', function () {

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

    it('should register a new user', function (done) {
        chai.request(serverAddress)
            .post('/register')
            .send({
                email: testUserData.Username,
                FirstName: testUserData.FirstName,
                LastName: testUserData.LastName,
                pwd: testUserData.Password
            })
            .end(function (err, res, body) {
                    res.statusCode.should.equal(200);
                    res.text.should.equal("User successfully registered");

                    dbHandler.clearDatabase()

                    done();
                }
            );
    });

    it('should not allow registration with email that is already used', function (done) {
        createUser()
        .then(function(){
            chai.request(serverAddress)
            .post('/register')
            .send({
                email: testUserData.Username,
                FirstName: testUserData.FirstName,
                LastName: testUserData.LastName,
                pwd: testUserData.Password
            })
            .end(function (err, res, body) {
                    res.statusCode.should.equal(409);
                    res.text.should.equal("Email address is already registered");

                    dbHandler.clearDatabase();

                    done();
                }
            );
        });
    });

    it('should return the user\'s full name, and a token', function (done) {
        createUser()
        .then(function(){
            chai.request(serverAddress)
            .post('/login')
            .send({
                Username: testUserData.Username,
                Password: testUserData.Password
            })
            .end(function (err, res, body) {
                    res.statusCode.should.equal(200);
                    res.body.fullName.should.equal(testUserData.FirstName + " " + testUserData.LastName);

                    dbHandler.clearDatabase();

                    done();
                }
            );
        });
    });

    it('should not find such user', function (done) {
            chai.request(serverAddress)
                .post('/login')
                .send({
                    Username: missingUsername,
                    Password: missingUserPass
                })
                .end(function (err, res) {
                        res.statusCode.should.equal(404);
                        res.text.should.equal("No such user");

                        done();
                    }
                );
        }
    );

    it("Should update the user's information", function (done) {
        createUser()
        .then(function(){
            chai.request(serverAddress)
            .post('/private/changeInfo')
            .set('token', testUserToken)
            .send({
                FirstName: "Change",
                LastName: "Change",
                pwd: "Change"
            })
            .end(function (err, res, body) {
                    res.statusCode.should.equal(200);
                    res.text.should.equal("User information updated successfully.");

                    user.findById(jwt.verify(testUserToken, secret)._id, function (err, updatedUser) {
                        if(updatedUser){
                            updatedUser.LastName.should.equal("Change");
                            updatedUser.FirstName.should.equal("Change");
                            updatedUser.Password.should.equal("Change");

                            done();
                        }
                    });   
                }  
            );
        });
    });
});