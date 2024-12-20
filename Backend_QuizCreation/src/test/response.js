const express = require('express');
const router = express.Router();
const Response = require('../../models/response'); // Import Response model

// POST - Create a new response
router.post('/create', async (req, res) => {
  try {
    const newResponse = new Response({
    //   response_id: req.body.response_id,
      email: req.body.email,
      answers: req.body.answers || [], // Default to empty array if not provided
      submitted_at: req.body.submitted_at || new Date(),
      score: req.body.score,
      form_id: req.body.form_id,
      result_id: req.body.result_id,
    });

    const savedResponse = await newResponse.save();
    res.status(201).send(savedResponse);
  } catch (err) {
    res.status(500).send({ message: 'Error creating response', error: err.message });
  }
});

// GET - Retrieve all responses
router.get('/', async (req, res) => {
  try {
    const responses = await Response.find();
    res.status(200).send(responses);
  } catch (err) {
    res.status(500).send({ message: 'Error fetching responses', error: err.message });
  }
});

// GET - Retrieve a response by ID
router.get('/:response_id', async (req, res) => {
  try {
    const response = await Response.findOne({ response_id: req.params.response_id });
    if (!response) {
      return res.status(404).send({ message: 'Response not found' });
    }
    res.status(200).send(response);
  } catch (err) {
    res.status(500).send({ message: 'Error fetching response by ID', error: err.message });
  }
});

// PUT - Update a response
router.put('/update/:response_id', async (req, res) => {
  try {
    const updatedResponse = await Response.findOneAndUpdate(
      { response_id: req.params.response_id },
      req.body,
      { new: true } // Return the updated document
    );

    if (!updatedResponse) {
      return res.status(404).send({ message: 'Response not found' });
    }
    res.status(200).send(updatedResponse);
  } catch (err) {
    res.status(500).send({ message: 'Error updating response', error: err.message });
  }
});

// DELETE - Delete a response
router.delete('/delete/:response_id', async (req, res) => {
  try {
    const deletedResponse = await Response.findOneAndDelete({ response_id: req.params.response_id });
    if (!deletedResponse) {
      return res.status(404).send({ message: 'Response not found' });
    }
    res.status(200).send({ message: 'Response deleted successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error deleting response', error: err.message });
  }
});

module.exports = router;
