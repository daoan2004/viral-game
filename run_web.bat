@echo off
echo ================================================
echo Viral Game - Start Web Components
echo ================================================
echo.

echo Starting Server (NestJS) on port 3001...
start "Viral Game Server" cmd /k "cd src\server && npm run start"

echo Starting Client (Vite/React) on port 3000...
start "Viral Game Client" cmd /k "cd src\client && npm run dev"

echo.
echo ================================================
echo Services are starting in separate windows.
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:3001
echo ================================================
echo.
