const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../Backend/app');
const should = chai.should();
const dbHandler = require('./db-handler');
const user = require('../Backend/models/user')

chai.use(chaiHttp);
const serverAddress = "http://localhost:3000";
const existingUsername = 'a';
const existingUserPass = 'a';
const missingUsername = 'noSuchUser';
const missingUserPass = 'noSuchPass';

describe('Users', function() {

    /**
     * Connect to a new in-memory database before running any tests.
     * Then, insert a test user.
     */
    before(async function(){
        await dbHandler.connect({ useUnifiedTopology: true, });
        var newMap = new user({
            Username: "a",
            Password: "a",
            FirstName: "FirstName",
            LastName: "LastName",
            City: "City",
            Country: "Country"
        })
        newMap.save(function (err) {});
    });


    /**
     * Clear all test data after every test.
     */
    afterEach(async () => await dbHandler.clearDatabase());

    /**
     * Remove and close the db and server.
     */
    after(async () => await dbHandler.closeDatabase());

    it('should return the user\'s full name, and a token', function(done) {

        chai.request(serverAddress)
            .post('/login')
            .send({ Username: existingUsername,
                    Password: existingUserPass
                })
            .end(function(err, res, body){
                res.statusCode.should.equal(200);
                res.body.full_name.should.equal("FirstName LastName");

                done();
            }
        );
    });

    it('should not find such user', function(done) {
        chai.request(serverAddress)
            .post('/login')
            .send({ Username: missingUsername,
                Password: missingUserPass
            })
            .end(function(err, res, body){
                    res.statusCode.should.equal(200);
                    res.text.should.equal("No such user");

                    done();
                }
            );
    });
});