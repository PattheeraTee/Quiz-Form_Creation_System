const express = require('express');
const router = express.Router();
const Question = require('../../models/question'); // Import Question model

// POST - Create a new question
router.post('/create', async (req, res) => {
  try {
    const newQuestion = new Question({
    //   question_id: req.body.question_id,
      type: req.body.type,
      question: req.body.question,
      question_image: req.body.question_image,
      points: req.body.points,
      required: req.body.required || false,
      limit: req.body.limit,
      correct_answer: req.body.correct_answer || [],
      options: req.body.options || [], // Default to empty array if not provided
      section_id: req.body.section_id,
    });

    const savedQuestion = await newQuestion.save();
    res.status(201).send(savedQuestion);
  } catch (err) {
    res.status(500).send({ message: 'Error creating question', error: err.message });
  }
});

// GET - Retrieve all questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).send(questions);
  } catch (err) {
    res.status(500).send({ message: 'Error fetching questions', error: err.message });
  }
});

// GET - Retrieve a question by ID
router.get('/:question_id', async (req, res) => {
  try {
    const question = await Question.findOne({ question_id: req.params.question_id });
    if (!question) {
      return res.status(404).send({ message: 'Question not found' });
    }
    res.status(200).send(question);
  } catch (err) {
    res.status(500).send({ message: 'Error fetching question by ID', error: err.message });
  }
});

// PUT - Update a question
router.put('/update/:question_id', async (req, res) => {
  try {
    const updatedQuestion = await Question.findOneAndUpdate(
      { question_id: req.params.question_id },
      req.body,
      { new: true } // Return the updated document
    );

    if (!updatedQuestion) {
      return res.status(404).send({ message: 'Question not found' });
    }
    res.status(200).send(updatedQuestion);
  } catch (err) {
    res.status(500).send({ message: 'Error updating question', error: err.message });
  }
});

// DELETE - Delete a question
router.delete('/delete/:question_id', async (req, res) => {
  try {
    const deletedQuestion = await Question.findOneAndDelete({ question_id: req.params.question_id });
    if (!deletedQuestion) {
      return res.status(404).send({ message: 'Question not found' });
    }
    res.status(200).send({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error deleting question', error: err.message });
  }
});

module.exports = router;
