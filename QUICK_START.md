# 🔧 Quick Start Guide - Run on Phone

Follow these steps **in order** to run the app on your phone:

## Step 1: Install Dependencies (First Time Only)

Open PowerShell or Command Prompt and run:

```powershell
cd c:\Users\Dell\Antigravity\my-expense-tracker\server
npm install
```

Wait for installation to complete. You should see "added X packages" when done.

---

## Step 2: Start the Backend Server

Keep the same terminal open and run:

```powershell
node server.js
```

You should see:
```
✅ Connected to MongoDB successfully
🚀 Server running on:
   Local:   http://localhost:3000
   Network: http://192.168.1.6:3000
📱 Mobile Access: Connect your phone to the same Wi-Fi and use the Network URL
```

**✅ KEEP THIS WINDOW OPEN!** The server needs to stay running.

---

## Step 3: Start the Frontend Server

Open a **NEW** PowerShell/Command Prompt window and run:

```powershell
cd c:\Users\Dell\Antigravity\my-expense-tracker
npx -y serve . -p 8080
```

You should see:
```
   ┌────────────────────────────────────────┐
   │                                        │
   │   Serving!                             │
   │                                        │
   │   Local:    http://localhost:8080      │
   │   Network:  http://192.168.1.6:8080    │
   │                                        │
   └────────────────────────────────────────┘
```

**✅ KEEP THIS WINDOW OPEN TOO!**

---

## Step 4: Access from Your Phone

1. **Make sure your phone is on the same Wi-Fi** as your computer
2. Open your phone's browser (Chrome, Safari, etc.)
3. Type this URL: **`http://192.168.1.6:8080`**
4. The app should load! 🎉

---

## 🚨 Troubleshooting

### Problem: "npm install" fails

**Solution:** Make sure you're in the correct directory:
```powershell
cd c:\Users\Dell\Antigravity\my-expense-tracker\server
```
Then try again.

### Problem: "Cannot connect to MongoDB"

**Solution:** Check your `.env` file in the server folder. Make sure MongoDB is running or you have a valid MongoDB Atlas connection string.

### Problem: "npm: command not found" or script execution error

**Solution:** Try running PowerShell as Administrator, or use Command Prompt instead.

### Problem: Phone shows "Can't reach this page"

**Check these:**
- ✅ Both servers are running (check both terminal windows)
- ✅ Phone is on the same Wi-Fi network
- ✅ You're using the correct IP: `192.168.1.6`
- ✅ Windows Firewall isn't blocking the connection

**To check firewall:**
1. Search for "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Look for "Node.js" and make sure it's checked for Private networks

### Problem: IP address doesn't work

**Your IP might have changed!** Check your current IP:
```powershell
ipconfig
```
Look for "IPv4 Address" under "Wireless LAN adapter Wi-Fi". If it's different from `192.168.1.6`, use the new IP address instead.

---

## 📝 Quick Checklist

Before accessing from phone, verify:

- [ ] Ran `npm install` in server folder
- [ ] Backend server is running (terminal 1)
- [ ] Frontend server is running (terminal 2)
- [ ] Both terminal windows are still open
- [ ] Phone is on same Wi-Fi as computer
- [ ] Using correct URL: `http://192.168.1.6:8080`

---

## 🎯 Summary

**You need TWO terminal windows open:**

1. **Terminal 1 (Backend):**
   ```
   cd c:\Users\Dell\Antigravity\my-expense-tracker\server
   node server.js
   ```

2. **Terminal 2 (Frontend):**
   ```
   cd c:\Users\Dell\Antigravity\my-expense-tracker
   npx -y serve . -p 8080
   ```

**Then on your phone:** Open browser → Go to `http://192.168.1.6:8080`

---

**Still having issues?** Check [MOBILE_SETUP.md](MOBILE_SETUP.md) for detailed troubleshooting.
