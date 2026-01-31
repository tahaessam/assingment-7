const { connect } = require('./db/mongo');
const createApp = require('./app');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'assignment8db';

(async () => {
  try {
    const { client, db } = await connect(MONGO_URI, DB_NAME);
    const app = createApp(db);
    app.locals.db = db;
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
