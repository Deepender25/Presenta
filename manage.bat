@echo off
title Presenta Manager
cls

:menu
cls
echo ==================================================
echo              Presenta Management Tool
echo ==================================================
echo.
echo    [1] Run Application (FastAPI Server)
echo    [2] Install Python Dependencies
echo    [3] Build Landing Page (Frontend)
echo    [4] Exit
echo.
echo ==================================================
set /p choice="Enter option (1-4): "

if "%choice%"=="1" goto run_app
if "%choice%"=="2" goto install_deps
if "%choice%"=="3" goto build_frontend
if "%choice%"=="4" goto exit

echo.
echo Invalid choice. Please try again.
pause
goto menu

:run_app
cls
echo Starting Presenta Server...
echo Access at: http://127.0.0.1:8000
echo.
python main.py
pause
goto menu

:install_deps
cls
echo Installing Python dependencies from requirements.txt...
pip install -r requirements.txt
echo.
echo Done.
pause
goto menu

:build_frontend
cls
echo Building Presenta Landing Page...
echo.
cd Presenta_Landing_page
call npm install
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Build failed!
    cd ..
    pause
    goto menu
)
cd ..

echo.
echo Copying build artifacts...
if exist "static\landing\index.html" (
    copy "static\landing\index.html" "templates\index.html" /Y
    echo Updated templates/index.html
) else (
    echo Error: static\landing\index.html not found.
)

echo.
echo Build and update complete.
pause
goto menu

:exit
exit
