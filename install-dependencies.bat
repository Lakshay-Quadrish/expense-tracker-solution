@echo off
echo ========================================
echo  Installing Dependencies
echo ========================================
echo.

cd server

if exist "node_modules\" (
    echo Dependencies already installed!
    echo.
) else (
    echo Installing backend dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies
        echo.
        echo Try running this in Command Prompt instead of PowerShell
        pause
        exit /b 1
    )
    echo.
    echo ✅ Dependencies installed successfully!
    echo.
)

echo Ready to start the server!
echo Run start-mobile.bat to start the backend server
echo.
pause
