const express = require("express");
const router = express.Router();
const { login_user, sign_up_user, logout_user } = require("../../../api/controllers/signup-login");

// User login 
router.post('/user/login', login_user);

// User logout
router.post('/user/logout', logout_user);

// User sign_up
router.post('/user/signup', sign_up_user);


module.exports = router;