    module.exports.isLoggedIn = ((req,res,next)=>{
        if(!req.isAuthenticated() && !req.session.guestMode){
            req.flash("error","Logged Out! Log in to Continue..");
            return res.redirect('/auth');
        }
        next()
    })