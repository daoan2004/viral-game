@echo off
echo ================================================
echo Viral Game - Web Setup Script (Frontend & Backend)
echo ================================================
echo.

REM Check for Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js (LTS version) from: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/2] Installing Client dependencies (src/client)...
cd src\client
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install client dependencies.
    pause
    exit /b 1
)
cd ..\..
echo.

echo [2/2] Installing Server dependencies (src/server)...
cd src\server
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install server dependencies.
    pause
    exit /b 1
)
cd ..\..
echo.

echo ================================================
echo Web Setup Completed!
echo ================================================
echo Next steps:
echo 1. Run 'run_web.bat' to start the dashboard and backend.
echo.
pause
