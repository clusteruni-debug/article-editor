' Article Editor - 숨김 모드로 서버 시작
' 이 파일을 더블클릭하면 터미널 창 없이 서버가 실행됩니다.

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' 현재 스크립트 위치
strPath = fso.GetParentFolderName(WScript.ScriptFullName)

' 배치 파일 실행 (최소화)
WshShell.Run chr(34) & strPath & "\ArticleEditor.bat" & chr(34), 7, False

' 7 = 최소화된 창으로 실행
