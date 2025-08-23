const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn} = require('../Methods/isLoggedIn.js');
const expense = require("../Controllers/expenses.js");


router.route("/")
.get(isLoggedIn, wrapAsync(expense.homeGET))
.post(isLoggedIn, wrapAsync(expense.homePost));

router.delete("/delete/:id", isLoggedIn, wrapAsync(expense.deleteExpense));

module.exports = router;


