exports.addPost  = (req,res,next) =>{
    //TODO: implement adding post controller
    res.status(200).json(({
        message: 'post added'
    }))
}

exports.getSuggestedPosts = (req,res,next) =>{
    //TODO: implement get suggested posts controller
    res.status(200).json({
        message:"Yeah, we are going to implement AI post suggestion"
    })
}