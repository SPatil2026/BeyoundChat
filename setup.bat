@echo off
echo Setting up BeyondChats Project...

echo.
echo === Phase 1: Laravel API Setup ===
cd laravel-api
echo Installing Laravel dependencies...
composer install
echo Generating application key...
php artisan key:generate
echo Running database migrations...
php artisan migrate
echo Starting Laravel server...
start cmd /k "php artisan serve"

echo.
echo === Phase 2: NodeJS Script Setup ===
cd ..\nodejs-script
echo Installing NodeJS dependencies...
npm install

echo.
echo === Phase 3: React Frontend Setup ===
cd ..\react-frontend
echo Installing React dependencies...
npm install
echo Starting React development server...
start cmd /k "npm start"

echo.
echo === Setup Complete ===
echo Laravel API: http://localhost:8000
echo React Frontend: http://localhost:3000
echo.
echo To run the NodeJS script:
echo cd nodejs-script
echo npm start
echo.
echo Make sure to:
echo 1. Set up MySQL database 'beyondchats'
echo 2. Add your OpenAI API key to nodejs-script/.env
echo 3. Update database credentials in laravel-api/.env
pause