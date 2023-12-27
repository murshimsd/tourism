const Tour = require('../models/tourModel')
const User = require('./../models/userModel')
const catchasync = require('../utils/catchAsync')
const tourController = require('./tourController')
const AppError = require('../utils/appError')



exports.getOverview = catchasync(async (req, res,next) => {
    const tours = await Tour.find()

    res.status(200).render("overview",{
        title:'All Tours',

      tours
    });
  })


exports.getTourDetails = catchasync(async (req, res,next) => {
  const tour = await Tour.findOne({slug:req.params.slug}).populate({
    path:'reviews',
    field:'review rating user'
  })
  if(!tour){
    return next(new AppError("No Tour in This Name !",404))
  }
    res.status(200).render("tour",{
      title:`${tour.name} tour`,
      tour
    });
  })

exports.login = (req,res)=>{
  res.status(200).render('login',{
    title:'Log into your account'
  })
}

exports.getAccount= (req,res) =>{
  res.status(200).render('account',{
    title:'your account'
  })
}


exports.updateAccount =catchasync(async(req,res,next) =>{
  
  const updatedUser = await User.findByIdAndUpdate(req.user.id,{
    name:req.body.name,
    email:req.body.email
  },{
    new:true,
    runValidators:true
  })
  res.status(200).render("account",{
    title:`Your Account`,
    user:updatedUser
  });
})