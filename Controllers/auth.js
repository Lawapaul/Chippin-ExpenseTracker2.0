const express = require('express');
const emailVerification = require('../Methods/nodemailer.js');
const User = require('../models/User.js');
const codeGenerator = () => Math.floor(100000 + Math.random() * 900000);


module.exports.loginGet = (req, res) => {
  res.render('Login/user_login', {
    title: "Chippin - Log In",
    style_path: "./style.css",
  });
}

module.exports.loginPost = (req, res) => {
    req.flash("success", "Welcome to Chippin");
    return res.redirect("/home");
}
module.exports.createGet = (req, res) => {
  res.render('Login/register', {
    title: "Create Account",
    style_path: "/create-account.css",
  });
}
module.exports.createPost = (req, res) => {
  const { name, username, password, email, pno } = req.body;
  req.session.details = { name, username, password, email, pno };
  req.session.OTP = codeGenerator();
  req.session.emailSent = false;
  return res.redirect("/auth/verify");
}
module.exports.verifyGet = async (req, res, next) => {
  if (!req.session.details || !req.session.details.email || !req.session.OTP) {
    req.flash("error", "Session expired. Please register again.");
    return res.redirect("/auth/create");
  }

  // Only send email if it hasn't been sent yet
  if (!req.session.emailSent) {
    res.locals.wrong_flag = false;

    const innerText = `
      Welcome to Chippin! 👋 <br><br> We're so excited to have you on board.<br><br> Please find the OTP to activate your account:<br>
      <b>${req.session.OTP}</b><br><br>
      Happy Sharing 😄
    `;

    try {
      await emailVerification(
        req.session.details.email,
        "🎉 Welcome to Chippin - Let's Split Smarter!",
        innerText
      );
        req.session.emailSent = true;
        await req.session.save();
    } catch (err) {
      return next(err);
    }
  }

  return res.render('Login/new_account_verification', {
    title: "Chippin - Verify",
    style_path: "/auth-reset.css"
  });
}

module.exports.verifyPost = async (req, res, next) => {
  const { i_code } = req.body;
  if (!req.session.details || !req.session.OTP) {
    req.flash("error", "Session expired. Please register again.");
    return res.redirect("/auth/create");
  }
  const { name, username, password, email, pno } = req.session.details;
  
  if (i_code === req.session.OTP.toString()) {
    try {
      const newUser = new User({
        name,
        username,
        email,
        phone: pno
      });
      await User.register(newUser, password);
      req.flash("success", "Welcome to our family! Login to continue.");
      return res.redirect("/auth");
    } catch (err) {
      return next(err);
    }
  } else {
    req.flash("error", "Invalid OTP");
    return res.redirect("/auth/verify");
  }
}

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      req.flash('error', 'Error during logout');
      return res.redirect('/profile');
    }
    req.flash('success', 'Logged out successfully');
    return res.redirect('/auth');
  });
}

// Add guest login functionality
module.exports.guestLogin = async (req, res, next) => {
  try {
    // Generate a unique guest identity
    const timestamp = Date.now();
    const guestUsername = `guest_${timestamp}`;
    const guestEmail = `${guestUsername}@guest.local`;

    // Create and register a real user so downstream routes work normally
    const newUser = new User({
      name: "Guest User",
      username: guestUsername,
      email: guestEmail,
      phone: "0000000000"
    });

    // Use a random password since guest won't use it
    const randomPassword = Math.random().toString(36).slice(-12);
    await User.register(newUser, randomPassword);

    // Log in the newly created guest user
    req.login(newUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Chippin! You're logged in as a guest.");
      return res.redirect("/home");
    });
  } catch (err) {
    return next(err);
  }
}