const emailVerification = require('../Methods/nodemailer.js');
const User = require('../models/User.js');
const codeGenerator = () => Math.floor(100000 + Math.random() * 900000);


module.exports.forgotGet = (req, res) => {
    res.render('./Login/request_email_reset.ejs', {
        title: "Forgot", 
        style_path: "/create_style.css"
    });
}

module.exports.forgotPost = async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({ username: username });
    if (!user) {
        req.flash("error", "User not found. Please check your username.");
        return res.redirect("/forgot");
    }
    const OTP = codeGenerator();
    req.session.OTP = OTP;
    req.session.details = user;
    req.session.emailSent = false;
    const text = `We've received a request to reset your Chipping password.
              Please follow the instructions below to proceed:<br></br><br></br>
              🔐 Reset Code: ${OTP} <br></br>
              ➡️ Enter this code in the password reset page.<br></br>
              🆕 Create a new password of your choice. <br></br>
              ✅ Once done, log in again with your new credentials.
                
                <br></br><br></br>
                 Happy Sharing! 😄 <br></br>
                — The Chippin Team`;

    try {
        await emailVerification(user.email, "Reset Your Chipping Password", text);
        req.session.emailSent = true;
        res.redirect("/forgot/verify_email");
    } catch (err) {
        req.flash("error", "Failed to send email. Please try again.");
        res.redirect("/forgot");
    }
}
module.exports.verifyemailGet = (req, res) => {
        res.render('./Login/verify_email_reset', {
            title: "Verify Email",
            style_path: "/auth-reset.css"
        });
}

module.exports.verifyemailPost = (req, res) => {
        let { i_code } = req.body;
        if (!req.session.OTP || !req.session.details) {
            req.flash("error", 'Session expired. Please try again.');
            return res.redirect('/forgot');
        }
        if (i_code === req.session.OTP.toString()) {
            res.redirect('/forgot/newPassword');
        } else {
            req.flash('error', "Invalid OTP");
            res.redirect('/forgot/verify_email');
        }
}

module.exports.newPasswordGet = (req, res) => {
        res.render('./Login/new_password_request.ejs', {
            wrongp_flag: false, 
            next_flag: false,
            title: "New Password",
            style_path: "/auth-reset.css"
        });
    }

module.exports.newPasswordPost = async (req, res, next) => {
    if (!req.session.OTP || !req.session.details) {
      req.flash("error", "Session expired. Please try again.");
      return res.redirect("/forgot");
    }

    let { new_pass, confirm_pass } = req.body;
    if (new_pass !== confirm_pass) {
      return res.render("./Login/new_password_request.ejs", {
        wrongp_flag: true,
        next_flag: false,
        title: "New Password",
        style_path: "/auth-reset.css",
      });
    } else {
      try {
        const user = await User.findById(req.session.details._id);
        await user.setPassword(new_pass);
        await user.save();

        req.flash("success", "Password Changed Successfully");
        delete req.session.OTP;
        delete req.session.details;
        delete req.session.emailSent;
        return res.redirect("/auth");
      } catch (error) {
        return next(error);
      }
    }
}