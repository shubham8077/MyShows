const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected to Cluster0 (myshows db)...'))
  .catch(err => console.error('MongoDB connection error:', err));

const BookmarkSchema = new mongoose.Schema({
  showId: { type: String, required: true, unique: true },
  title: String,
  poster: String,
  genre: [String],
  description: String,
  category: String,
  status: { type: String, default: 'wishlist' },
  rating: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now }
});

const Bookmark = mongoose.model('Bookmark', BookmarkSchema);

// GET all bookmarks
app.get('/api/bookmarks', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find().sort({ createdAt: -1 });
    res.json({ success: true, data: bookmarks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST add bookmark
app.post('/api/bookmarks', async (req, res) => {
  try {
    const { showId } = req.body;
    const bookmark = await Bookmark.findOneAndUpdate(
      { showId },
      { ...req.body },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: bookmark });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update bookmark status/rating
app.put('/api/bookmarks/:showId', async (req, res) => {
  try {
    const { showId } = req.params;
    const bookmark = await Bookmark.findOneAndUpdate({ showId }, req.body, { new: true });
    if (!bookmark) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: bookmark });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE bookmark
app.delete('/api/bookmarks/:showId', async (req, res) => {
  try {
    const { showId } = req.params;
    await Bookmark.findOneAndDelete({ showId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
