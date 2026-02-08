@echo off
title Article Editor Server
cd /d "%~dp0"

:: 포트 3000이 사용 중인지 확인
netstat -ano | findstr :3000 >nul
if %errorlevel%==0 (
    echo [INFO] 서버가 이미 실행 중입니다. 브라우저를 엽니다...
    start http://localhost:3000
    exit
)

:: 브라우저 열기 (2초 후)
start /b cmd /c "timeout /t 2 >nul && start http://localhost:3000"

:: 서버 시작
echo [INFO] Article Editor 서버를 시작합니다...
echo [INFO] 종료하려면 이 창을 닫으세요.
echo.
npm run dev
