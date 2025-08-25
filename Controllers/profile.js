const User = require('../models/User.js');
module.exports.profileGet = async (req, res) => {
    const user = await User.findOne({ username: req.session.passport.user });
    req.session.result = user;
    res.render("Settings/settings", { user: user ,title: 'Profile', style_path: '/Settings-Styles/style.css'});
}

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        return next(err);
    })
    req.flash("success", "Successfully logged out!");
    return res.redirect('/auth');
}

module.exports.updateGet = (req, res) => {
    if (!req.session.result) {
        req.flash('error', 'Please access profile first');
        return res.redirect('/profile');
    }
    res.render('./Settings/Update.ejs', { result: req.session.result ,title: 'Update Profile', style_path: '/Settings-Styles/style.css'});
}

module.exports.updatePost = async(req,res,next)=>{
    const { name, username, email, phone_number } = req.body;
    const existingUser = await User.findOne({ 
        username: username, 
        _id: { $ne: req.session.result._id } 
    });
    
    if (existingUser) {
        req.flash('error', 'Username already taken');
        return res.redirect('/profile/Update');
    }
    const existingEmail = await User.findOne({ 
        email: email, 
        _id: { $ne: req.session.result._id } 
    });
    
    if (existingEmail) {
        req.flash('error', 'Email already registered');
        return res.redirect('/profile/Update');
    }
    
    const updatedUser = await User.findByIdAndUpdate(
        req.session.result._id,
        { name, username, email, phone_number },
        { new: true, runValidators: true }
    );
    updatedUser.save();
    req.flash("success","Information Updated Successfully");
    req.logout((err)=>{
        next(err);
    })
    return res.redirect('/auth')
}