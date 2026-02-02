const express = require('express');

const router = express.Router();

const postSuggestion = require('../controllers/postSuggestion')

router.post('/add', postSuggestion.addPost);
router.post('/getPosts',postSuggestion.getSuggestedPosts);
router.delete('/deletePost/:id', postSuggestion.deletePost)

module.exports = router;