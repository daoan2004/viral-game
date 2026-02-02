@echo off
echo ================================================
echo Facebook Messenger Invoice Bot - Starting...
echo ================================================
echo.

REM Kiểm tra virtual environment
if not exist "venv" (
    echo [ERROR] Virtual environment chua duoc tao!
    echo Vui long chay: setup.bat
    pause
    exit /b 1
)

REM Kiểm tra file .env
if not exist ".env" (
    echo [ERROR] File .env chua duoc tao!
    echo Vui long chay: setup.bat
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Chạy FastAPI server
echo Starting FastAPI server...
echo Server URL: http://localhost:8080
echo Health check: http://localhost:8080/health
echo.
echo Nhan Ctrl+C de dung server
echo ================================================
echo.

cd python
python main.py
