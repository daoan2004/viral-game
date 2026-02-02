@echo off
echo ================================================
echo Viral Game - Start Web Components
echo ================================================
echo.

echo Starting Server (NestJS)...
start "Viral Game Server" cmd /k "cd src\server && npm run start:dev"

echo Starting Client (Vite/React)...
start "Viral Game Client" cmd /k "cd src\client && npm run dev"

echo.
echo ================================================
echo Services are starting in separate windows.
echo - Frontend: http://localhost:5173 (usually)
echo - Backend: http://localhost:3000 (usually)
echo ================================================
echo.
