const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // 5. Insert one document into books
  router.post('/', async (req, res) => {
    try {
      const doc = req.body;
      const result = await db.collection('books').insertOne(doc);
      res.status(201).json({ ok: true, insertedId: result.insertedId });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 6. Insert multiple documents into books
  router.post('/batch', async (req, res) => {
    try {
      const docs = Array.isArray(req.body) ? req.body : req.body.docs || [];
      if (!docs.length) return res.status(400).json({ ok: false, error: 'Provide an array of documents' });
      const result = await db.collection('books').insertMany(docs);
      res.status(201).json({ ok: true, insertedCount: result.insertedCount });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 8. Update the book with title -> change year to 2022
  router.patch('/:title', async (req, res) => {
    try {
      const title = req.params.title;
      const result = await db.collection('books').updateOne({ title }, { $set: { year: 2022 } });
      res.json({ ok: true, matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 9. Find a Book by title
  router.get('/title', async (req, res) => {
    try {
      const title = req.query.title;
      const doc = await db.collection('books').findOne({ title });
      res.json({ ok: true, doc });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 10. Find all books published between from and to
  router.get('/year', async (req, res) => {
    try {
      const from = parseInt(req.query.from, 10);
      const to = parseInt(req.query.to, 10);
      const docs = await db.collection('books').find({ year: { $gte: from, $lte: to } }).toArray();
      res.json({ ok: true, docs });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 11. Find books where the genre includes provided genre
  router.get('/genre', async (req, res) => {
    try {
      const genre = req.query.genre;
      const docs = await db.collection('books').find({ genres: { $in: [genre] } }).toArray();
      res.json({ ok: true, docs });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 12. Skip first two, limit next three, sorted by year desc
  router.get('/skip-limit', async (req, res) => {
    try {
      const docs = await db.collection('books').find().sort({ year: -1 }).skip(2).limit(3).toArray();
      res.json({ ok: true, docs });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 13. Find books where the year field stored as an integer
  router.get('/year-integer', async (req, res) => {
    try {
      const docs = await db.collection('books').aggregate([
        { $match: { $expr: { $eq: [{ $type: '$year' }, 'int'] } } }
      ]).toArray();
      res.json({ ok: true, docs });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 14. Find all books where genres does NOT include Horror or Science Fiction
  router.get('/exclude-genres', async (req, res) => {
    try {
      const docs = await db.collection('books').find({ $nor: [{ genres: 'Horror' }, { genres: 'Science Fiction' }] }).toArray();
      res.json({ ok: true, docs });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 15. Delete all books published before given year
  router.delete('/before-year', async (req, res) => {
    try {
      const year = parseInt(req.query.year, 10);
      const result = await db.collection('books').deleteMany({ year: { $lt: year } });
      res.json({ ok: true, deletedCount: result.deletedCount });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 16. Aggregation: Filter books published after 2000 and sort desc
  router.get('/aggregate1', async (req, res) => {
    try {
      const docs = await db.collection('books').aggregate([
        { $match: { year: { $gt: 2000 } } },
        { $sort: { year: -1 } }
      ]).toArray();
      res.json({ ok: true, docs });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 17. Aggregation: Find books after 2000 and project title, author, year
  router.get('/aggregate2', async (req, res) => {
    try {
      const docs = await db.collection('books').aggregate([
        { $match: { year: { $gt: 2000 } } },
        { $project: { _id: 0, title: 1, author: 1, year: 1 } }
      ]).toArray();
      res.json({ ok: true, docs });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 18. Aggregation: unwind genres array into separate docs
  router.get('/aggregate3', async (req, res) => {
    try {
      const docs = await db.collection('books').aggregate([
        { $unwind: '$genres' },
        { $project: { _id: 0, title: 1, genres: 1 } }
      ]).toArray();
      res.json({ ok: true, docs });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 19. Aggregation: Join books with logs
  router.get('/aggregate4', async (req, res) => {
    try {
      const docs = await db.collection('books').aggregate([
        { $lookup: { from: 'logs', localField: 'title', foreignField: 'bookTitle', as: 'logs' } }
      ]).toArray();
      res.json({ ok: true, docs });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  return router;
};
