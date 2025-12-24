@echo off
echo Testing BeyondChats System...

echo.
echo === Testing Laravel API ===
echo Testing scrape endpoint...
curl -X POST http://localhost:8000/api/scrape

echo.
echo Testing articles endpoint...
curl http://localhost:8000/api/articles

echo.
echo === Testing NodeJS Script ===
cd nodejs-script
echo Running article processor...
node index.js

echo.
echo === Testing React Frontend ===
echo Frontend should be running at http://localhost:3000
echo Check browser for article display

echo.
echo === Test Complete ===
pause