const express = require('express');
const collectionsRouter = require('./routes/collections');
const booksRouter = require('./routes/books');
const logsRouter = require('./routes/logs');

function createApp(db) {
  const app = express();
  app.use(express.json());

  app.use('/collection', collectionsRouter(db));
  app.use('/books', booksRouter(db));
  app.use('/logs', logsRouter(db));

  return app;
}

module.exports = createApp;
