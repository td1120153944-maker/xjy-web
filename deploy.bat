@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  XJY-Web deployment
REM  Uses the evanhq alias from the local SSH configuration.
REM ============================================================

set SERVER=evanhq
set SITE_DOMAIN=evanhq.cn
set SITE_PATH=/xjy/
set REMOTE_DIR=/opt/xjy
set ARCHIVE=.deploy\xjy.tar.gz

echo.
echo ============================================================
echo   Deploy XJY-Web to %SERVER%
echo ============================================================
echo.

echo [1/4] Building with base path %SITE_PATH% ...
call npm run build -- --base=/xjy/
if errorlevel 1 (
    echo.
    echo !! Build failed. Deployment stopped.
    exit /b 1
)
if not exist "dist\index.html" (
    echo !! dist\index.html was not generated.
    exit /b 1
)
echo     Build completed.
echo.

echo [2/4] Creating deployment archive ...
if not exist ".deploy" mkdir ".deploy"
if exist "%ARCHIVE%" del /q "%ARCHIVE%"
tar --force-local -czf "%ARCHIVE%" -C dist .
if errorlevel 1 (
    echo !! Failed to create the deployment archive.
    exit /b 1
)
echo     Archive created: %ARCHIVE%
echo.

echo [3/4] Uploading archive ...
scp "%ARCHIVE%" %SERVER%:/home/ubuntu/xjy.tar.gz
if errorlevel 1 (
    echo !! Upload failed. Check the evanhq SSH configuration.
    exit /b 1
)
echo     Upload completed.
echo.

echo [4/4] Activating release ...
ssh %SERVER% "bash -s" < "%~dp0deploy-remote.sh"
if errorlevel 1 (
    echo !! Remote activation failed.
    exit /b 1
)

del /q "%ARCHIVE%" 2>nul

echo.
echo ============================================================
echo   Deployment completed
echo   URL: https://%SITE_DOMAIN%%SITE_PATH%
echo   Path: %REMOTE_DIR%/dist
echo ============================================================
echo.
endlocal
