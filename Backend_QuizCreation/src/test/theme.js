const express = require('express');
const router = express.Router();
const Theme = require('../../models/theme'); // Import Theme model

// POST - Create a new theme
router.post('/create', async (req, res) => {
  try {
    const newTheme = new Theme({
      theme_id: req.body.theme_id,
      primary_color: req.body.primary_color || '#FFFFFF', // Default to white if not provided
      form_id: req.body.form_id,
    });

    const savedTheme = await newTheme.save();
    res.status(201).send(savedTheme);
  } catch (err) {
    res.status(500).send({ message: 'Error creating theme', error: err.message });
  }
});

// GET - Retrieve all themes
router.get('/', async (req, res) => {
  try {
    const themes = await Theme.find();
    res.status(200).send(themes);
  } catch (err) {
    res.status(500).send({ message: 'Error fetching themes', error: err.message });
  }
});

// GET - Retrieve a theme by ID
router.get('/:theme_id', async (req, res) => {
  try {
    const theme = await Theme.findOne({ theme_id: req.params.theme_id });
    if (!theme) {
      return res.status(404).send({ message: 'Theme not found' });
    }
    res.status(200).send(theme);
  } catch (err) {
    res.status(500).send({ message: 'Error fetching theme by ID', error: err.message });
  }
});

// PUT - Update a theme
router.put('/update/:theme_id', async (req, res) => {
  try {
    const updatedTheme = await Theme.findOneAndUpdate(
      { theme_id: req.params.theme_id },
      req.body,
      { new: true } // Return the updated document
    );

    if (!updatedTheme) {
      return res.status(404).send({ message: 'Theme not found' });
    }
    res.status(200).send(updatedTheme);
  } catch (err) {
    res.status(500).send({ message: 'Error updating theme', error: err.message });
  }
});

// DELETE - Delete a theme
router.delete('/delete/:theme_id', async (req, res) => {
  try {
    const deletedTheme = await Theme.findOneAndDelete({ theme_id: req.params.theme_id });
    if (!deletedTheme) {
      return res.status(404).send({ message: 'Theme not found' });
    }
    res.status(200).send({ message: 'Theme deleted successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error deleting theme', error: err.message });
  }
});

module.exports = router;
