@echo off
echo ===================================
echo   Building Vellor Perfumes App
echo ===================================

echo.
echo [1/2] Compiling React Frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Error building frontend!
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo [2/2] Packaging with PyInstaller...
cd backend
REM We use --onedir for PyQt6 WebEngine because --onefile is too slow to extract 150MB+ of DLLs every time
call venv\Scripts\pyinstaller --noconfirm --onedir --windowed --add-data "../frontend/dist;dist" --name "Vellor System" main.py
if %errorlevel% neq 0 (
    echo Error building backend!
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo ===================================
echo   Build Complete Successfully!
echo ===================================
echo Your application is located in:
echo d:\Vellor\backend\dist\Vellor System\
echo.
echo You can create a shortcut of "Vellor System.exe" and place it on your Desktop.
pause
