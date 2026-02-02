const openai = require('../config/openai');
const qdrant = require('../config/qdrant');
const crypto = require('crypto');

exports.addPost = async (req, res, next) => {
    try {
        if (!req.body.postTitle || !req.body.postContent || !req.body.postId || !req.body.userId) {
            return res.status(400).json({
                message: "something is missing in payload"
            })
        }
        const response = await openai.embeddings.create({
            model: process.env.EMBEDDING_MODEL,
            input: req.body.postTitle + ' ' + req.body.postContent
        })

        await qdrant.upsert('posts', {
            points: [{
                id: crypto.randomUUID(),
                vector: response.data[0].embedding,
                payload: {
                    postId: req.body.postId,
                    userId: req.body.userId,
                    postTitle: req.body.postTitle,
                    createdAt: new Date().toISOString()
                }
            }
            ]
        })

        res.status(200).json(({
            message: "Post Successfully added to qdrant"
        }))
    }
    catch {
        return res.status(500).json({
            message: "internal server error"
        })
    }
}

exports.getSuggestedPosts = async (req, res, next) => {
    try {
      const semanticSearchText = req.body.semanticSearchText;
      let maxPostCount = req.body.maxPostCount;
  
      // Validate input
      if (!semanticSearchText || typeof semanticSearchText !== 'string') {
        return res.status(400).json({ error: 'semanticSearchText is required and must be a string' });
      }
  
      if (!maxPostCount || typeof maxPostCount !== 'number' || maxPostCount <= 0) {
        maxPostCount = 3; // default value
      }
  
      // Get embeddings
      const embeddingsResponse = await openai.embeddings.create({
        model: process.env.EMBEDDING_MODEL,
        input: semanticSearchText
      });
  
      if (
        !embeddingsResponse?.data ||
        !Array.isArray(embeddingsResponse.data) ||
        !embeddingsResponse.data[0]?.embedding
      ) {
        return res.status(500).json({ error: 'Failed to generate embeddings' });
      }
  
      const embeddingVector = embeddingsResponse.data[0].embedding;
  
      // Perform search
      const searchResult = await qdrant.search('posts', {
        vector: embeddingVector,
        limit: maxPostCount,
        with_payload: true
      });
  
      const response = searchResult.map((vector) => {
        return {
          postId: vector.payload.postId,
          postTitle: vector.payload.postTitle ?? "Temporary Title PlaceHolder"
        }
      });
      
      res.status(200).json({ response });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  };

  exports.deletePost = async (req, res) => {
    try {
      const { id: postId } = req.params;
  
      if (!postId) {
        return res.status(400).json({
          message: 'postId is required'
        });
      }
  
      const deleteResult = await qdrant.delete('posts', {
        filter: {
          must: [
            {
              key: 'postId',
              match: {
                value: postId
              }
            }
          ]
        }
      });
  
      return res.status(200).json({
        message: 'Post deleted successfully',
        postId,
        qdrantStatus: deleteResult?.result?.status ?? 'acknowledged'
      });
  
    } catch (error) {
      
      return res.status(500).json({
        message: 'Failed to delete post',
        error: error.message
      });
    }
  };
  
  