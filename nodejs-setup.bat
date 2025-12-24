@echo off
echo BeyondChats Setup - Node.js Only (No PHP Required)

echo.
echo === Step 1: Database Setup ===
echo Please create MySQL database and run:
echo mysql -u root -p ^< database-setup.sql
echo.
pause

echo.
echo === Step 2: Node.js API Server ===
cd nodejs-api
echo Installing API dependencies...
npm install
echo Starting API server...
start cmd /k "npm start"

echo.
echo === Step 3: NodeJS Processing Script ===
cd ..\nodejs-script
echo Installing script dependencies...
npm install

echo.
echo === Step 4: React Frontend ===
cd ..\react-frontend
echo Installing React dependencies...
npm install
echo Starting React development server...
start cmd /k "npm start"

echo.
echo === Setup Complete ===
echo API Server: http://localhost:8000
echo React Frontend: http://localhost:3000
echo.
echo Test the system:
echo 1. POST http://localhost:8000/api/scrape (add articles)
echo 2. GET http://localhost:8000/api/articles (view articles)
echo 3. cd nodejs-script && npm start (process articles)
echo 4. Open http://localhost:3000 (view in browser)
echo.
echo Make sure to add your OpenAI API key to nodejs-script/.env
pause