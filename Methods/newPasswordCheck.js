module.exports.newPassword = (req, res, next) => {
    if (!req.session.OTP || !req.session.details) {
        return next(new expressError(404, 'Unauthorized Access'));
    }
    next();
};