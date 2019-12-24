var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../Backend/app');
var should = chai.should();

chai.use(chaiHttp);


describe('Users', function() {
    it('should return the user\'s full name, and a token', function(done) {
        chai.request("http://localhost:3000")
            .post('/login')
            .send({ "Username": 'a',
                    Password: 'a'
                })
            .end(function(err, res, body){
                res.statusCode.should.equal(200);
                res.body.full_name.should.equal("oren shor");

                done();
            });
    });
});