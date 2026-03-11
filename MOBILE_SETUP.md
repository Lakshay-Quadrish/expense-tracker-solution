# 📱 Mobile Setup Guide - Expense Tracker

This guide will help you access your Expense Tracker app from your mobile phone.

## Prerequisites

✅ Your computer and phone must be on the **same Wi-Fi network**  
✅ Backend server must be running  
✅ Your computer's firewall must allow port 3000

## Step 1: Start the Backend Server

Open a terminal/command prompt and run:

```bash
cd c:\Users\Dell\Antigravity\my-expense-tracker\server
npm start
```

You should see:
```
🚀 Server running on:
   Local:   http://localhost:3000
   Network: http://192.168.1.6:3000
📝 Environment: development

📱 Mobile Access: Connect your phone to the same Wi-Fi and use the Network URL
```

**Keep this terminal window open** - the server needs to stay running.

## Step 2: Prepare the Frontend for Mobile

You have two options:

### Option A: Use a Simple HTTP Server (Recommended)

1. Open a **new** terminal/command prompt
2. Navigate to the project folder:
   ```bash
   cd c:\Users\Dell\Antigravity\my-expense-tracker
   ```
3. Start a simple HTTP server:
   ```bash
   npx serve . -p 8080
   ```
4. The server will show you the network URL (should be `http://192.168.1.6:8080`)

### Option B: Modify the API Configuration

1. Open `index.html` in a text editor
2. Change the script tag from:
   ```html
   <script src="api.js"></script>
   ```
   to:
   ```html
   <script src="api.mobile.js"></script>
   ```
3. Save the file
4. Transfer the entire project folder to your phone or use a file sharing service

## Step 3: Access from Your Phone

### If using Option A (HTTP Server):

1. **Connect your phone to the same Wi-Fi** as your computer
2. Open your phone's browser (Chrome, Safari, etc.)
3. Go to: `http://192.168.1.6:8080`
4. You should see the Expense Tracker app!

### If using Option B (Modified Files):

1. Open the `index.html` file on your phone
2. The app should connect to your computer's backend

## Step 4: Test the App

Try these actions on your phone:
- ✅ Add a new expense
- ✅ View expenses by category
- ✅ Delete an expense
- ✅ Check monthly statistics

## 🔧 Troubleshooting

### "Cannot connect to server" error

**Problem:** Your phone can't reach your computer's server.

**Solutions:**
1. **Check Wi-Fi:** Ensure both devices are on the same network
2. **Check Server:** Make sure the backend is still running (check the terminal)
3. **Check IP Address:** Your computer's IP might have changed. Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to verify
4. **Firewall:** Windows Firewall might be blocking the connection

### Firewall Issues (Windows)

If you can't connect, you may need to allow Node.js through Windows Firewall:

1. Open **Windows Defender Firewall**
2. Click **Allow an app or feature through Windows Defender Firewall**
3. Click **Change settings** (requires admin)
4. Find **Node.js** in the list and check both **Private** and **Public**
5. If Node.js isn't listed:
   - Click **Allow another app...**
   - Browse to Node.js installation (usually `C:\Program Files\nodejs\node.exe`)
   - Add it and check both network types

### App loads but shows errors

**Problem:** Frontend loads but can't fetch data.

**Solutions:**
1. Open browser console on your phone (use Chrome DevTools via USB debugging)
2. Check if the API URL is correct (should be `http://192.168.1.6:3000/api`)
3. Verify the backend server is responding by visiting `http://192.168.1.6:3000` directly

### IP Address Changed

If your computer's IP address changes (common with DHCP):

1. Find your new IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" under your Wi-Fi adapter

2. Update the files:
   - Edit `server/server.js` line 80 (update the console.log message)
   - Edit `api.mobile.js` line 3 (update the API_BASE_URL)

## 📝 Notes

- **Battery Usage:** Running the server on your computer will use some battery if it's a laptop
- **Network Security:** The app is only accessible on your local network, not from the internet
- **Performance:** Mobile performance should be similar to desktop since the backend does the heavy lifting

## 🎯 Quick Reference

| What | URL |
|------|-----|
| **Backend API** | `http://192.168.1.6:3000` |
| **Frontend (with serve)** | `http://192.168.1.6:8080` |
| **Your Computer's IP** | `192.168.1.6` |

## 🚀 Next Steps

Once you verify everything works:
- Consider deploying to a cloud service for access anywhere
- Set up a static IP for your computer to avoid IP changes
- Add HTTPS for secure connections (requires SSL certificate)

---

**Need Help?** Check the main [README.md](README.md) for more information about the app.
