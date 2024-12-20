const express = require('express');
const router = express.Router();
const Coverpage = require('../../models/coverpage'); // Import Coverpage model

// POST - Create a new coverpage
router.post('/create', async (req, res) => {
  try {
    const newCoverpage = new Coverpage({
      cover_page_id: req.body.cover_page_id,
      title: req.body.title,
      description: req.body.description,
      text_button: req.body.text_button || 'เริ่มทำ', // Default value if not provided
      cover_page_image: req.body.cover_page_image,
      form_id: req.body.form_id,
    });

    const savedCoverpage = await newCoverpage.save();
    res.status(201).send(savedCoverpage);
  } catch (err) {
    res.status(500).send({ message: 'Error creating coverpage', error: err.message });
  }
});

// GET - Retrieve all coverpages
router.get('/', async (req, res) => {
  try {
    const coverpages = await Coverpage.find();
    res.status(200).send(coverpages);
  } catch (err) {
    res.status(500).send({ message: 'Error fetching coverpages', error: err.message });
  }
});

// GET - Retrieve a coverpage by ID
router.get('/:cover_page_id', async (req, res) => {
  try {
    const coverpage = await Coverpage.findOne({ cover_page_id: req.params.cover_page_id });
    if (!coverpage) {
      return res.status(404).send({ message: 'Coverpage not found' });
    }
    res.status(200).send(coverpage);
  } catch (err) {
    res.status(500).send({ message: 'Error fetching coverpage by ID', error: err.message });
  }
});

// PUT - Update a coverpage
router.put('/update/:cover_page_id', async (req, res) => {
  try {
    const updatedCoverpage = await Coverpage.findOneAndUpdate(
      { cover_page_id: req.params.cover_page_id },
      req.body,
      { new: true } // Return the updated document
    );

    if (!updatedCoverpage) {
      return res.status(404).send({ message: 'Coverpage not found' });
    }
    res.status(200).send(updatedCoverpage);
  } catch (err) {
    res.status(500).send({ message: 'Error updating coverpage', error: err.message });
  }
});

// DELETE - Delete a coverpage
router.delete('/delete/:cover_page_id', async (req, res) => {
  try {
    const deletedCoverpage = await Coverpage.findOneAndDelete({ cover_page_id: req.params.cover_page_id });
    if (!deletedCoverpage) {
      return res.status(404).send({ message: 'Coverpage not found' });
    }
    res.status(200).send({ message: 'Coverpage deleted successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error deleting coverpage', error: err.message });
  }
});

module.exports = router;
