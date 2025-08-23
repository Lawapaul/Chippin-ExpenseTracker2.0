# Deployment Guide: Chippin Expense Tracker

This guide will help you deploy your expense tracker application to Render for free using MongoDB Atlas.

## Prerequisites

1. A GitHub account
2. A Render account (free)
3. A MongoDB Atlas account (free)

## Step 1: Set up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new project

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create"

3. **Set up Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Set privileges to "Read and write to any database"
   - Click "Add User"

4. **Set up Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `expense-tracker`

## Step 2: Prepare Your Code

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Update Environment Variables**
   - Create a `.env` file locally with your MongoDB connection string
   - Keep this file private (don't commit to GitHub)

## Step 3: Deploy to Render

1. **Sign up for Render**
   - Go to [Render](https://render.com)
   - Sign up with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your expense tracker repository

3. **Configure the Service**
   - **Name**: `chippin-expense-tracker` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node app.js`
   - **Plan**: Free

4. **Set Environment Variables**
   - Click "Environment" tab
   - Add the following variables:
     - `mongoATLAS`: Your MongoDB Atlas connection string
     - `SECRET`: A random secret string for sessions
     - `NODE_ENV`: `production`

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - Wait for the build to complete (usually 2-5 minutes)

## Step 4: Test Your Deployment

1. **Check the Logs**
   - In Render dashboard, click on your service
   - Go to "Logs" tab to see if there are any errors

2. **Test the Application**
   - Click on your service URL
   - Test registration, login, and expense tracking features

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check your MongoDB Atlas connection string
   - Ensure your IP is whitelisted in Atlas
   - Verify database user credentials

2. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure `app.js` is the main entry point

3. **Environment Variables**
   - Double-check all environment variables are set in Render
   - Ensure no typos in variable names

### Environment Variables Reference:

```bash
mongoATLAS=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority
SECRET=your-super-secret-key-here
NODE_ENV=production
```

## Free Tier Limitations

- **Render**: 750 hours/month (enough for 24/7 uptime)
- **MongoDB Atlas**: 512MB storage, shared RAM
- **Auto-sleep**: Your app may sleep after 15 minutes of inactivity

## Next Steps

1. **Custom Domain**: Add a custom domain in Render settings
2. **SSL Certificate**: Automatically provided by Render
3. **Monitoring**: Use Render's built-in monitoring tools
4. **Backups**: Set up regular database backups in MongoDB Atlas

## Support

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js Documentation](https://nodejs.org/docs/)

Your app will be live at: `https://your-app-name.onrender.com` 