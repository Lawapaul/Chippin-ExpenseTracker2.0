// let Expense = document.querySelector('.addExpense');
// let btn = document.querySelector(".btn-search");
// let searchBox = document.querySelector(".search_box");
// let searchFriend = document.querySelector(".search-friend");
// let title = document.querySelector(".title");

// // Form validation for search form
// const searchForm = document.querySelector('.from-search-friend');
// searchForm.addEventListener('submit', function(event) {
//     if (!searchForm.checkValidity()) {
//         event.preventDefault();
//         event.stopPropagation();
//     }
//     searchForm.classList.add('was-validated');
// });

// // Form validation for expense form
// const expenseForm = document.querySelector('.form-add-expense');
// expenseForm.addEventListener('submit', function(event) {
//     if (!expenseForm.checkValidity()) {
//         event.preventDefault();
//         event.stopPropagation();
//     }
//     expenseForm.classList.add('was-validated');
// });

// // Amount input validation
// const amountInput = document.querySelector('.amount');
// amountInput.addEventListener('input', function() {
//     if (this.value < 0) {
//         this.setCustomValidity('Amount cannot be negative');
//     } else {
//         this.setCustomValidity('');
//     }
// });

// btn.addEventListener('click', (event) => {
//     event.preventDefault();
//     if (searchForm.checkValidity()) {
//         title.innerHTML = "<h2>Friends Account</h2>"
//         searchFriend.style.display = "none";
//         console.log("Clicked");
//         Expense.style.display = 'block';
//     } else {
//         searchForm.classList.add('was-validated');
//     }
// });