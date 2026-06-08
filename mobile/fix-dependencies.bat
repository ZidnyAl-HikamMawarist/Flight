@echo off
echo ========================================
echo   FIX FLUTTER DEPENDENCIES
echo ========================================
echo.

echo Step 1: Cleaning Flutter project...
flutter clean

echo.
echo Step 2: Getting dependencies...
flutter pub get

echo.
echo Step 3: Checking for outdated packages...
flutter pub outdated

echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
echo If still error, try:
echo   flutter pub upgrade --major-versions
echo.

pause
