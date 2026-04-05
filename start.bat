@echo off
cd /d "%~dp0"
echo Starting AutoPress server...
node node_modules\next\dist\bin\next dev
pause
