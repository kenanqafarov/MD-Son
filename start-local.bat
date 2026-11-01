@echo off
chcp 65001 > nul
echo ======================================================
echo   Modern Dentistry - Lokal Baslatma Skripti
echo ======================================================

echo [1/3] Docker xidmetleri yoxlanilir ve ise salinir...
docker start postgres-db redis-server > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    wsl -d Ubuntu -e /snap/bin/docker start postgres-db redis-server > nul 2>&1
)

echo [2/3] Backend Spring Boot ise salinir...
start "MD Backend Spring Boot" cmd /k "cd /d %~dp0backend && set JAVA_HOME=C:\Users\User\.jdks\ms-17.0.18 && gradlew.bat bootRun"

echo [3/3] Frontend Vite ise salinir...
start "MD Frontend Vite" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ======================================================
echo Layihe qaldirilir!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5555
echo Admin:    super_admin / super1234
echo ======================================================
