const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const {isLoggedIn} = require('../Methods/isLoggedIn.js');

router.get("/",isLoggedIn,async(req,res)=>{
    req.session.detail = await User.findOne({username: req.session.passport.user});
    res.render("./Home/home-page.ejs",{userEntered: req.session.detail.name});
})
module.exports = router;

