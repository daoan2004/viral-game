@echo off
echo ================================================
echo Facebook Messenger Invoice Bot - Setup Script
echo ================================================
echo.

REM Kiểm tra Python có được cài đặt không
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python chua duoc cai dat!
    echo Vui long cai Python 3.10+ tu: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [1/4] Kiem tra Python... OK
echo.

REM Tạo virtual environment
echo [2/4] Tao virtual environment...
if not exist "venv" (
    python -m venv venv
    echo Virtual environment da duoc tao!
) else (
    echo Virtual environment da ton tai, bo qua.
)
echo.

REM Activate virtual environment và cài packages
echo [3/4] Cai dat dependencies...
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install -r requirements.txt
echo.

REM Tạo file .env nếu chưa có
echo [4/4] Kiem tra file .env...
if not exist ".env" (
    echo Tao file .env tu template...
    copy .env.example .env
    echo.
    echo ================================================
    echo [QUAN TRONG] Vui long mo file .env va dien:
    echo   - FB_PAGE_ACCESS_TOKEN
    echo   - FB_VERIFY_TOKEN  
    echo   - DEEPSEEK_API_KEY
    echo ================================================
) else (
    echo File .env da ton tai.
)
echo.

echo ================================================
echo Setup hoan tat!
echo ================================================
echo.
echo Buoc tiep theo:
echo 1. Mo file .env va dien API keys
echo 2. Chay: run.bat
echo.
pause
