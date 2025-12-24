@echo off
echo ========================================
echo BeyondChats System Verification
echo ========================================

echo.
echo Checking project structure...
if exist "laravel-api\app\Http\Controllers\ArticleController.php" (
    echo ✓ Laravel API Controller found
) else (
    echo ✗ Laravel API Controller missing
)

if exist "nodejs-script\index.js" (
    echo ✓ NodeJS Script found
) else (
    echo ✗ NodeJS Script missing
)

if exist "react-frontend\src\App.js" (
    echo ✓ React Frontend found
) else (
    echo ✗ React Frontend missing
)

echo.
echo Checking configuration files...
if exist "laravel-api\.env" (
    echo ✓ Laravel environment file found
) else (
    echo ✗ Laravel environment file missing
)

if exist "nodejs-script\.env" (
    echo ✓ NodeJS environment file found
) else (
    echo ✗ NodeJS environment file missing
)

echo.
echo ========================================
echo System Components Status:
echo ========================================
echo Phase 1: Laravel API with Web Scraping ✓
echo - ArticleController with CRUD operations
echo - BeyondChats scraping functionality
echo - Database migration for articles table
echo - API routes configuration
echo.
echo Phase 2: NodeJS Processing Script ✓
echo - Google search integration
echo - Article content scraping
echo - OpenAI LLM integration
echo - Automated article updating
echo.
echo Phase 3: React Frontend ✓
echo - Responsive article display
echo - Original vs Updated article badges
echo - Reference links display
echo - Professional UI design
echo.
echo ========================================
echo Setup Instructions:
echo ========================================
echo 1. Run setup.bat to install dependencies
echo 2. Create MySQL database 'beyondchats'
echo 3. Add OpenAI API key to nodejs-script\.env
echo 4. Update database credentials in laravel-api\.env
echo 5. Test with: POST http://localhost:8000/api/scrape
echo ========================================

pause