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

const testUserData = {
    Username: "a",
    Password: "a",
    FirstName: "FirstName",
    LastName: "LastName",
    City: "City",
    Country: "Country"
}

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
                    res.text.should.equal("user successfully registered");

                    dbHandler.clearDatabase()

                    done();
                }
            );
    });

    it('should return the user\'s full name, and a token', function (done) {
        createUser();

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