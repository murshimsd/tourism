const User = require("./../models/userModel");
const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const path = require("path");

// const multerStorage = multer.diskStorage({
//   destination:(req,file,cb)=>{
//     cb(null,'public/img/users')
//   },
//   filename:(req,file,cb)=>{
//     const ext = file.mimetype.split('/')[1]
//     cb(null,`user-${req.user.id}-${Date.now()}-${ext}`)
//   }
// })

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("not an image! please upload valid image", false));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj = (obj, ...allowedFields) => {
  //it contains an array of arguments which wanted passed in
  //used in updateMe function below
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  ///create error if user post password data . cause we set update password and forgot password separately
  console.log(req.file);
  console.log(req.body);
  if (req.body.password || req.body.confirmPassword) {
    next(
      new AppError("cannot use password update here . there is another", 400)
    );
  }

  //cause we doont want updated entire body like other data . need only name and email . we can if we want in above
  const filterBody = filterObj(req.body, "name", "email");
  if (req.file) filterBody.photo = req.file.filename;
  //we are getting this id from session beacuse this function only work after loggined .
  //  so there how we are getting id

  //update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.addUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route not defined yet . please signup",
  });
};

// exports.getAllUsers = catchAsync(async (req, res) => {
//   const users = await User.find();

//   // SEND RESPONSE
//   res.status(200).json({
//     status: "success",
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });

// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: "error",
//     message: "not defindes yet",
//   });
// };

// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: "error",
//     message: "not defindes yet",
//   });
// };

//do not use change password with this . cause we set changing password which is not by findbyidandupdate . its separate cause need more security
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getAllUsers = factory.getAll(User);
//cannot create user here . its in signup
