# Expense Tracker Application

A web application for tracking expenses and managing shared expenses between friends.

## Features

- User authentication
- Expense tracking
- Friend management
- Shared expense splitting
- Email notifications

## Deployment Instructions

### 1. Database Setup

1. Create a MySQL database on a free hosting service like [PlanetScale](https://planetscale.com/) or [Railway](https://railway.app/)
2. Create the following databases:
   - expense_tracker
   - expenses
   - ChippinSettlements

### 2. Deploy to Render.com

1. Create a free account on [Render.com](https://render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the following settings:
   - Name: expense-tracker (or your preferred name)
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free

5. Add the following environment variables in Render:
   ```
   DB_HOST=your-database-host
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   DB_NAME=expense_tracker
   DB_NAME_EXPENSES=expenses
   DB_NAME_SETTLEMENTS=ChippinSettlements
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-app-password
   ```

### 3. Email Setup

1. Use a Gmail account for sending emails
2. Enable 2-factor authentication
3. Generate an App Password:
   - Go to Google Account settings
   - Security
   - 2-Step Verification
   - App passwords
   - Generate a new app password for "Mail"

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file
4. Run the development server:
   ```bash
   npm run dev
   ```

## Technologies Used

- Node.js
- Express.js
- MySQL
- EJS
- Nodemailer 