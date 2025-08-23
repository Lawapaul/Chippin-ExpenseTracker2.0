const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn} = require('../Methods/isLoggedIn.js');
const profile = require("../Controllers/profile.js")

router.get("/", isLoggedIn, wrapAsync(profile.profileGet));
router.post("/logout",profile.logout);

router.route("/Update",isLoggedIn)
.get(profile.updateGet)
.post(wrapAsync(profile.updatePost))

module.exports = router