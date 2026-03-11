@echo off
echo ========================================
echo  Expense Tracker - Frontend Server
echo ========================================
echo.

echo Starting HTTP server for mobile access...
echo.
echo Access from your phone: http://192.168.1.4:8080
echo.

npx -y serve . -p 8080
