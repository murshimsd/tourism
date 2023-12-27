// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");
const AppError = require("../utils/appError");
const Tour = require("./../models/tourModel");
const Razorpay = require("razorpay");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
 
  // 1) Get the tour details
  const tour = await Tour.findById(req.params.tourId);
  console.log(typeof tour.price);

  // 2) Create data to be passed in the notes field
  const orderData = {
    tourId: req.params.tourId,
    tourName: tour.name,
    tourSummary: tour.summary,
    tourImage:[ `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`]
  };

  // 3) Create Razorpay order with additional data in the notes field
  const order = await razorpay.orders.create({
    amount: tour.price * 100, // amount in paise
    currency: "INR", // currency code
    receipt: `tour_${req.params.tourId}`,
    payment_capture: 1, // auto-capture
    notes: {
      tourData: JSON.stringify(orderData),
    },
  });

  // 4) Create session as response
  res.status(200).json({
    status: 'success',
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    tourName: orderData.tourName,
  });
});



// exports.getCheckoutSession = catchAsync(async (req, res, next) => {
//     // 1) Get the
//     const tour = await Tour.findById(req.params.tourId);
//     console.log(typeof(tour.price))
  
//     // 2) Create checkout session
//     const session = await stripe.checkout.sessions.create({
      
//       success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
//       cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
//       customer_email: req.user.email,
//       client_reference_id: req.params.tourId,
//        line_items: [
//       {
//         price_data: {
//           currency: 'usd',
//           unit_amount: tour.price * 100,
//           product_data: {
//             name: tour.name,
//             description: tour.summary,
//             images: [
//               `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
//             ],
//           },
//         },
//         quantity:1
//       }
//     ],
//     mode: 'payment',

//     });
  
//     // 3) Create session as response
//     res.status(200).json({
//       status: 'success',
//       session:session
//     });
//   });