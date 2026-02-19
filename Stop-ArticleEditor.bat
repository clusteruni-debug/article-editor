@echo off
echo [INFO] Article Editor 서버를 종료합니다...

:: 포트 3000을 사용하는 프로세스 찾아서 종료
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo [INFO] 서버가 종료되었습니다.
timeout /t 2 >nul
