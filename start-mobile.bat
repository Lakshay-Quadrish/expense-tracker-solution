@echo off
echo ========================================
echo  Expense Tracker - Mobile Server Setup
echo ========================================
echo.

cd server

echo Checking for dependencies...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies
        echo Please run: npm install
        pause
        exit /b 1
    )
)

echo.
echo Starting server...
echo.
echo Your phone should connect to: http://192.168.1.4:3000
echo.

node server.js
