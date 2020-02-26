const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = new MongoMemoryServer();

let isConnected = false;
/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
    const uri = await mongod.getConnectionString();

    const mongooseOpts = {
        useNewUrlParser: true,
        //autoReconnect: true,
        //reconnectTries: Number.MAX_VALUE,
        //reconnectInterval: 1000,
        useUnifiedTopology: true
    };

    await mongoose.connect(uri, mongooseOpts);
    isConnected = true;
};

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
    isConnected = false;
};

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
};