const Reviews = require('./../models/reviewModel')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')

exports.setUserIds = (req,res,next) =>{
    //allow nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId
    if(!req.body.user) req.body.user = req.user.id
    next()
   }

   exports.getAllReviews = factory.getAll(Reviews)
// exports.getAllReviews =catchAsync(async (req,res) =>{
//     filter = {}
//     if(req.params.tourId) filter = {tour:req.params.tourId}
//     const reviews =await  Reviews.find(filter)
//     res.status(200).json({
//         success:'success',
//         results:reviews.length,
//         data:{
//             reviews
//         }
//     })
// })



// exports.postReview = catchAsync(async(req,res)=>{
   
//     const newreview = await req.body
//     Reviews.create(newreview)
//     res.status(200).json({
//         status:'success',
//         review:{
//             newreview
//         }
//     })

// })
exports.getReview = factory.getOne(Reviews)
exports.deleteReview = factory.deleteOne(Reviews)
exports.updateReview = factory.updateOne(Reviews)
exports.postReview = factory.createOne(Reviews)


