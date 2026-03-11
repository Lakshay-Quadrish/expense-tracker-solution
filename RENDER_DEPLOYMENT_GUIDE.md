# 🚀 Expense Tracker Deployment Guide

I have prepared your application for deployment! Since you don't have Git installed, we will use a very simple Web-based drag-and-drop approach.

I have created a ZIP file on your computer at:
`C:\Users\Dell\Antigravity\my-expense-tracker\expense-tracker-web-deploy.zip`

Please follow these 3 simple steps to get your app live on the internet!

---

## Step 1: Upload to GitHub
Render needs a place to read your code from. GitHub is the standard for this.

1. Go to [GitHub.com](https://github.com) and log in (or create a free account).
2. Click the **`+`** icon in the top right corner and select **"New repository"**.
3. Name it `expense-tracker` and click **"Create repository"**.
4. On the next page, look for the small link that says: **"uploading an existing file"** (near the top) and click it.
5. Unzip `expense-tracker-web-deploy.zip` that I just created.
6. Drag and drop **ALL the files inside the unzipped folder** into the GitHub web page.
7. Wait for the upload to finish, then click the green **"Commit changes"** button.

---

## Step 2: Deploy to Render
Render will host your backend and frontend.

1. Go to [Render.com](https://render.com) and log in (Create a free account using your GitHub account).
2. Click **"New"** button in the dashboard and select **"Web Service"**.
3. Select **"Build and deploy from a Git repository"** and click Next.
4. Render will ask to connect your GitHub account. Allow it, and select your `expense-tracker` repository.
5. Fill out the form:
   - **Name:** `my-expense-tracker`
   - **Branch:** `main`
   - **Build Command:** It should auto-fill as `npm run build`
   - **Start Command:** It should auto-fill as `npm start`
   - **Instance Type:** Select the **Free** tier
6. Scroll down to **Environment Variables**, click **"Add Environment Variable"** and add these two:
   - Key: `MONGODB_URI` | Value: *(Enter your MongoDB Atlas connection string here)*
   - Key: `JWT_SECRET`  | Value: `your_super_secret_jwt_key_here`
7. Click the **"Create Web Service"** button!

---

## Step 3: Test Your Live App!
1. Render will start building your app (this usually takes 2-4 minutes).
2. Look for the green **"Live"** status in the top left corner.
3. Once it's Live, click the URL provided near the top left (it will look something like `https://my-expense-tracker-abcd.onrender.com`).
4. Your Expense Tracker is now live on the internet! 

> **Important Note:** On Render's free tier, the app might take 30-50 seconds to "wake up" the very first time you visit it if no one has used it for a while.

---
*Let me know when you've reached Step 3 or if you get stuck on any step!*
