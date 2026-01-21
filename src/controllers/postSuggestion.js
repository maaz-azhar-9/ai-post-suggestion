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
    const semanticSearchText = req.body.semanticSearchText;
    const maxPostCount = req.body.maxPostCount
    const embeddingsResponse = await openai.embeddings.create({
        model: process.env.EMBEDDING_MODEL,
        input: semanticSearchText
    })
    const result = await qdrant.search('posts', {
        vector: embeddingsResponse.data[0].embedding,
        limit: maxPostCount,
    })
    response = result.map((vector) => vector.payload.postId);
    res.status(200).json({
        response
    })
}