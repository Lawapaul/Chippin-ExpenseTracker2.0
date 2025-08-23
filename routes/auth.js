const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapAsync = require("../utils/wrapAsync.js");
const auth = require("../Controllers/auth.js");

router.route("/")
.get(auth.loginGet)
.post(
  passport.authenticate('local', {
    failureRedirect: '/auth',
    failureFlash: true
  }),
  wrapAsync(auth.loginPost)
);


router.route("/create")
.get(auth.createGet)
.post(auth.createPost);


router.route("/verify")
.get(wrapAsync(auth.verifyGet))
.post(wrapAsync(auth.verifyPost));

// Logout route
router.post("/logout", auth.logout);

module.exports = router;