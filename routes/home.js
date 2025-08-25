const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const {isLoggedIn} = require('../Methods/isLoggedIn.js');

router.get("/",isLoggedIn,async(req,res)=>{
    const user = await User.findOne({username: req.session.passport.user});
    res.render("Home/Home-page",{userEntered: user?.name || "User"});
})

module.exports = router;

