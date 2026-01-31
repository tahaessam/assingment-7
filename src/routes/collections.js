const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // 1. Create explicit collection 'books' with validation
  router.post('/books', async (req, res) => {
    try {
      const validator = {
        $jsonSchema: {
          bsonType: 'object',
          required: ['title'],
          properties: { title: { bsonType: 'string', minLength: 1 } }
        }
      };
      await db.createCollection('books', { validator });
      res.status(201).json({ ok: true, message: 'Collection books created with validator' });
    } catch (err) {
      if (err.codeName === 'NamespaceExists') return res.status(200).json({ ok: true, message: 'Collection books already exists' });
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 2. Create implicit collection by inserting into 'authors'
  router.post('/authors', async (req, res) => {
    try {
      const doc = req.body && Object.keys(req.body).length ? req.body : { name: 'Unknown Author' };
      const result = await db.collection('authors').insertOne(doc);
      res.status(201).json({ ok: true, insertedId: result.insertedId });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 3. Create capped collection 'logs' with size 1MB
  router.post('/logs/capped', async (req, res) => {
    try {
      await db.createCollection('logs', { capped: true, size: 1024 * 1024 });
      res.status(201).json({ ok: true, message: 'Capped collection logs created' });
    } catch (err) {
      if (err.codeName === 'NamespaceExists') return res.status(200).json({ ok: true, message: 'Collection logs already exists' });
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 4. Create index on books.title
  router.post('/books/index', async (req, res) => {
    try {
      const idx = await db.collection('books').createIndex({ title: 1 });
      res.status(201).json({ ok: true, index: idx });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  return router;
};
