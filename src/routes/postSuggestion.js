const express = require('express');

const router = express.Router();

const postSuggestion = require('../controllers/postSuggestion')

router.post('/add', postSuggestion.addPost);
router.post('/getPosts',postSuggestion.getSuggestedPosts);

module.exports = router;