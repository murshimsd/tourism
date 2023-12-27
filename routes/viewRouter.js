const express = require("express");
const router = express.Router();
const viewController = require('../controllers/viewController')
const authController = require('../controllers/authController')



  


  router.get("/",authController.isLoggedIn,viewController.getOverview);
  router.get("/login",authController.isLoggedIn,viewController.login);
  router.get("/tour/:slug",authController.isLoggedIn,viewController.getTourDetails);
  router.get("/me",authController.isLoggedIn,viewController.getAccount);
  router.post("/submit-user-data",authController.protect,viewController.updateAccount);
  
module.exports = router;
