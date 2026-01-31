const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // 7. Insert a new log into logs
  router.post('/', async (req, res) => {
    try {
      const doc = req.body || { message: 'log', ts: new Date() };
      const result = await db.collection('logs').insertOne(doc);
      res.status(201).json({ ok: true, insertedId: result.insertedId });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  return router;
};
