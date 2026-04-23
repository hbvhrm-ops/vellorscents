@echo off
echo Starting Vellor Perfumes Application...

set EXE_PATH="%~dp0backend\dist\Vellor System\Vellor System.exe"

if exist %EXE_PATH% (
    start "" %EXE_PATH%
) else (
    echo.
    echo The desktop application has not been built yet!
    echo Please run build.bat first to compile it.
    pause
)

