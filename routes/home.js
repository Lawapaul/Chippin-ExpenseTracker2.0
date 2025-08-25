const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const {isLoggedIn} = require('../Methods/isLoggedIn.js');

router.get("/",isLoggedIn,async(req,res)=>{
    if (req.session.guestMode) {
        // Handle guest user
        res.render("Home/Home-page",{userEntered: "Guest User"});
    } else {
        // Handle authenticated user
        req.session.detail = await User.findOne({username: req.session.passport.user});
        res.render("Home/Home-page",{userEntered: req.session.detail.name});
    }
})

module.exports = router;

