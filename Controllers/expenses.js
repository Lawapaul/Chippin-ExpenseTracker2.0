const User = require('../models/User.js');
const Expense = require("../models/Expenses.js");
const ValidationSchema = require("../models/ValidateSchema.js");

module.exports.homeGET = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/auth');
        }
        const expenses = await Expense.find({ user: user._id }).sort({ spend_date: -1 });
        const totalSum = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const currentDate = new Date();
        const currentMonthExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.spend_date);
            return expenseDate.getMonth() === currentDate.getMonth() && 
                   expenseDate.getFullYear() === currentDate.getFullYear();
        });
        const currentMonthSum = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        res.render("Expenses/expenses-home", {
            title: "All Expenses",
            style_path: "/Expenses-Style/style.css",
            result: expenses,
            resultSum: [{ t_sum: totalSum }],
            currentMonthSum: [{ t_sum: currentMonthSum }]
        });
    } catch (error) {
        req.flash('error', 'Failed to load expenses:');
        res.redirect('/home');
    }
}

module.exports.homePost = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            req.flash('error', 'User not authenticated');
            return res.redirect('/auth');
        }
        const { btnradio, amount, description, date } = req.body;
        const validationData = {
            amount: parseFloat(amount),
            description,
            currency: btnradio,
            date
        };
        const { error } = ValidationSchema.validate(validationData);
        if (error) {
            req.flash('error', error.details[0].message);
            return res.redirect('/expenses');
        }
        const newExpense = new Expense({
            amount: parseFloat(amount),
            description,
            currency: btnradio,
            spend_date: new Date(date),
            user: req.user._id
        });
        await newExpense.save();
        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { expenses: newExpense._id } }
        );
        req.flash('success', 'Expense added successfully');
        res.redirect("/expenses");
    } catch (error) {
        req.flash('error', 'Failed to add expense: ' + error.message);
        res.redirect('/expenses');
    }
}

module.exports.deleteExpense = async (req, res) => {
    try {
        const expenseId = req.params.id;
        const expense = await Expense.findOne({ 
            _id: expenseId, 
            user: req.user._id 
        });
        if (!expense) {
            req.flash('error', 'Expense not found or unauthorized');
            return res.redirect('/expenses');
        }
        await Expense.findByIdAndDelete(expenseId);
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { expenses: expenseId } }
        );
        req.flash('success', 'Expense deleted successfully');
        res.redirect('/expenses');
    } catch (error) {
        req.flash('error', 'Failed to delete expense');
        res.redirect('/expenses');
    }
}