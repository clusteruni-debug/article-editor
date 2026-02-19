# Article Editor 시작 스크립트
# PowerShell -ExecutionPolicy Bypass -File "Start-ArticleEditor.ps1"

$Host.UI.RawUI.WindowTitle = "Article Editor"
Set-Location $PSScriptRoot

# 포트 확인
$port = 3000
$connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($connection) {
    Write-Host "[INFO] 서버가 이미 실행 중입니다." -ForegroundColor Yellow
    Start-Process "http://localhost:$port"
    exit
}

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       Article Editor 시작 중...        ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  종료: Ctrl+C 또는 창 닫기             ║" -ForegroundColor Cyan
Write-Host "║  주소: http://localhost:3000           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 2초 후 브라우저 열기
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3000"
} | Out-Null

# 서버 시작
npm run dev
