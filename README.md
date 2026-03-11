# Expense Tracker - Full Stack Application

A beautiful, modern expense tracking application with MongoDB database integration.

## 🚀 Features

- ✅ Track expenses by category (Food, Travel, Shopping, Bills, Others)
- ✅ Monthly expense overview with interactive charts
- ✅ Filter expenses by category and month
- ✅ Beautiful glassmorphism UI design
- ✅ MongoDB database for persistent storage
- ✅ RESTful API backend
- ✅ Real-time data synchronization

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - Choose one:
  - **Local MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
  - **MongoDB Atlas** (Free cloud database) - [Sign up here](https://www.mongodb.com/cloud/atlas)

## 🛠️ Installation

### Step 1: Install Node.js

1. Download Node.js from https://nodejs.org/
2. Run the installer and follow the instructions
3. Verify installation:
   ```bash
   node -v
   npm -v
   ```

### Step 2: Install MongoDB

**Option A: Local MongoDB**
1. Download MongoDB Community Server
2. Install and start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Recommended)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Get your connection string
4. Update `server/.env` with your connection string

### Step 3: Install Dependencies

```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install
```

### Step 4: Configure Environment

Edit `server/.env` file:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/expense-tracker

# OR for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker

PORT=3000
NODE_ENV=development
```

## 🎯 Running the Application

### Start the Backend Server

```bash
# From the server directory
cd server

# Development mode (auto-restart on changes)
npm run dev

# OR production mode
npm start
```

You should see:
```
✅ Connected to MongoDB successfully
🚀 Server running on http://localhost:3000
```

### Open the Frontend

1. Open `index.html` in your web browser
2. Or use a local server:
   ```bash
   # From the project root
   npx serve .
   ```

## 📦 Migrating Existing Data

If you have existing data in localStorage:

1. Ensure the backend server is running
2. Open `migrate-data.html` in your browser
3. Click "Start Migration"
4. After successful migration, click "Clear localStorage"

## 📁 Project Structure

```
my-expense-tracker/
├── client/                    # Frontend files
│   ├── index.html            # Main HTML file
│   ├── app.js                # Frontend application logic
│   ├── api.js                # API client
│   ├── style.css             # Styles
│   └── migrate-data.html     # Data migration tool
├── server/                    # Backend files
│   ├── server.js             # Express server
│   ├── models/
│   │   └── Expense.js        # Mongoose expense model
│   ├── routes/
│   │   └── expenses.js       # API routes
│   ├── .env                  # Environment variables
│   └── package.json          # Backend dependencies
└── README.md                 # This file
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/expenses` | Get all expenses (with optional filters) |
| `GET` | `/api/expenses/:id` | Get single expense |
| `POST` | `/api/expenses` | Create new expense |
| `PUT` | `/api/expenses/:id` | Update expense |
| `DELETE` | `/api/expenses/:id` | Delete expense |
| `GET` | `/api/expenses/stats/monthly` | Get monthly statistics |

### Example API Calls

**Get all expenses:**
```javascript
GET http://localhost:3000/api/expenses
```

**Get expenses for a specific month:**
```javascript
GET http://localhost:3000/api/expenses?month=2026-02
```

**Create new expense:**
```javascript
POST http://localhost:3000/api/expenses
Content-Type: application/json

{
  "amount": 500,
  "category": "Food",
  "date": "2026-02-12",
  "notes": "Lunch with team"
}
```

## 🐛 Troubleshooting

### Backend won't start

**Error: `npm: command not found`**
- Solution: Install Node.js

**Error: `Cannot connect to MongoDB`**
- Solution: Ensure MongoDB is running or check your connection string

### Frontend shows "Cannot connect to server"

- Ensure backend is running on http://localhost:3000
- Check browser console for errors
- Verify CORS is enabled in server.js

### Data not persisting

- Check MongoDB connection in server logs
- Verify database name in connection string
- Check server console for errors

## 🚀 Deployment

### Deploy Backend (Heroku)

```bash
cd server
heroku create your-app-name
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
git push heroku main
```

### Deploy Frontend (Vercel/Netlify)

1. Update `api.js` with your production API URL
2. Deploy using Vercel or Netlify CLI

## 📝 Future Enhancements

- [ ] User authentication (JWT)
- [ ] Offline mode with Service Workers
- [ ] Data export/import (CSV, JSON)
- [ ] Budget tracking and alerts
- [ ] Recurring expenses
- [ ] Multi-currency support
- [ ] Mobile app (React Native)

## 📄 License

ISC

## 👨‍💻 Author

Created with ❤️ for better expense management
