@echo off
echo Quick Start - BeyondChats (No Composer Required)

echo.
echo === Step 1: Database Setup ===
echo Please run the following in MySQL:
echo mysql -u root -p ^< database-setup.sql
echo.
pause

echo.
echo === Step 2: Starting Laravel API (Simple PHP Server) ===
cd laravel-api
start cmd /k "php -S localhost:8000 simple-server.php"

echo.
echo === Step 3: NodeJS Script Setup ===
cd ..\nodejs-script
echo Installing NodeJS dependencies...
npm install

echo.
echo === Step 4: React Frontend Setup ===
cd ..\react-frontend
echo Installing React dependencies...
npm install
echo Starting React development server...
start cmd /k "npm start"

echo.
echo === Quick Start Complete ===
echo Laravel API: http://localhost:8000 (Simple PHP Server)
echo React Frontend: http://localhost:3000
echo.
echo Test the API:
echo curl -X POST http://localhost:8000/api/scrape
echo curl http://localhost:8000/api/articles
echo.
echo To run NodeJS script:
echo cd nodejs-script
echo npm start
pause