require('dotenv').config();
const { MongoClient } = require('mongodb');

(async () => {
  const client = await MongoClient.connect(process.env.CONNECTION_STRING);
  const db = client.db(process.env.DB_NAME);
  await db.collection('users').createIndexes([
    { key: { username: 1 }, unique: true }, { key: { email: 1 }, unique: true },
  ]);

  await db.collection('tasks').createIndexes([
    { key: { username: 1 } },
  ]);

  await client.close();
})();
