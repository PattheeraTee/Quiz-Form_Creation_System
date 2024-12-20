const express = require('express');
const router = express.Router();
const Section = require('../../models/section'); // Import Section model

// POST - Create a new section
router.post('/create', async (req, res) => {
  try {
    const newSection = new Section({
      section_id: req.body.section_id,
      number: req.body.number || 1, // Default to 1 if not provided
      title: req.body.title,
      description: req.body.description,
      form_id: req.body.form_id,
      questions: req.body.questions || [], // Default to empty array if not provided
    });

    const savedSection = await newSection.save();
    res.status(201).send(savedSection);
  } catch (err) {
    res.status(500).send({ message: 'Error creating section', error: err.message });
  }
});

// GET - Retrieve all sections
router.get('/', async (req, res) => {
  try {
    const sections = await Section.find();
    res.status(200).send(sections);
  } catch (err) {
    res.status(500).send({ message: 'Error fetching sections', error: err.message });
  }
});

// GET - Retrieve a section by ID
router.get('/:section_id', async (req, res) => {
  try {
    const section = await Section.findOne({ section_id: req.params.section_id });
    if (!section) {
      return res.status(404).send({ message: 'Section not found' });
    }
    res.status(200).send(section);
  } catch (err) {
    res.status(500).send({ message: 'Error fetching section by ID', error: err.message });
  }
});

// PUT - Update a section
router.put('/update/:section_id', async (req, res) => {
  try {
    const updatedSection = await Section.findOneAndUpdate(
      { section_id: req.params.section_id },
      req.body,
      { new: true } // Return the updated document
    );

    if (!updatedSection) {
      return res.status(404).send({ message: 'Section not found' });
    }
    res.status(200).send(updatedSection);
  } catch (err) {
    res.status(500).send({ message: 'Error updating section', error: err.message });
  }
});

// DELETE - Delete a section
router.delete('/delete/:section_id', async (req, res) => {
  try {
    const deletedSection = await Section.findOneAndDelete({ section_id: req.params.section_id });
    if (!deletedSection) {
      return res.status(404).send({ message: 'Section not found' });
    }
    res.status(200).send({ message: 'Section deleted successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error deleting section', error: err.message });
  }
});

module.exports = router;
