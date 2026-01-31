const { MongoClient } = require('mongodb');

async function connect(uri, dbName) {
  const client = new MongoClient(uri);
  await client.connect();
  return { client, db: client.db(dbName) };
}

module.exports = { connect };
