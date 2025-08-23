const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passwordCheck = require("../Methods/newPasswordCheck.js");
const forgot = require("../Controllers/forgot.js");

router.route("/")
.get(forgot.forgotGet)
.post(wrapAsync(forgot.forgotPost));

router.route("/verify_email")
    .get(forgot.verifyemailGet)
    .post(wrapAsync(forgot.verifyemailPost));


router.route("/newPassword",passwordCheck.newPassword)
    .get(forgot.newPasswordGet)
    .post(wrapAsync(forgot.newPasswordPost));

module.exports = router;