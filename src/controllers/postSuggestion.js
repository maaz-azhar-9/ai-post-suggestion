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
            model: 'text-embedding-3-small',
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

exports.getSuggestedPosts = (req,res,next) =>{
    //TODO: implement get suggested posts controller
    res.status(200).json({
        message:"Yeah, we are going to implement AI post suggestion"
    })
}