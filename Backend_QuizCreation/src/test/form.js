const express = require('express');
const router = express.Router();
const Form = require('../../models/form'); // Import Form model

// POST - Create a new form
router.post('/create', async (req, res) => {
  try {
    const newForm = new Form({
      form_id: req.body.form_id,
      form_type: req.body.form_type,
      is_form_open: req.body.is_form_open,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      cover_page_id: req.body.cover_page_id,
      section_id: req.body.section_id,
      result_id: req.body.result_id,
      user_id: req.body.user_id,
      theme_id: req.body.theme_id,
      response: req.body.response,
    });

    const savedForm = await newForm.save();
    res.status(201).send(savedForm);
  } catch (err) {
    res.status(500).send({ message: 'Error creating form', error: err.message });
  }
});

// GET - Retrieve all forms
router.get('/', async (req, res) => {
  try {
    const forms = await Form.find();
    res.status(200).send(forms);
  } catch (err) {
    res.status(500).send({ message: 'Error fetching forms', error: err.message });
  }
});

// GET - Retrieve a form by ID
router.get('/:form_id', async (req, res) => {
  try {
    const form = await Form.findOne({ form_id: req.params.form_id });
    if (!form) {
      return res.status(404).send({ message: 'Form not found' });
    }
    res.status(200).send(form);
  } catch (err) {
    res.status(500).send({ message: 'Error fetching form by ID', error: err.message });
  }
});

// PUT - Update a form
router.put('/update/:form_id', async (req, res) => {
  try {
    const updatedForm = await Form.findOneAndUpdate(
      { form_id: req.params.form_id },
      req.body,
      { new: true } // Return the updated document
    );

    if (!updatedForm) {
      return res.status(404).send({ message: 'Form not found' });
    }
    res.status(200).send(updatedForm);
  } catch (err) {
    res.status(500).send({ message: 'Error updating form', error: err.message });
  }
});

// DELETE - Delete a form
router.delete('/delete/:form_id', async (req, res) => {
  try {
    const deletedForm = await Form.findOneAndDelete({ form_id: req.params.form_id });
    if (!deletedForm) {
      return res.status(404).send({ message: 'Form not found' });
    }
    res.status(200).send({ message: 'Form deleted successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error deleting form', error: err.message });
  }
});

module.exports = router;
