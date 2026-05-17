@echo off
title Taller Hunter - Servidor Local
color 0A
echo.
echo  ================================
echo   TALLER HUNTER - Servidor Local
echo  ================================
echo.
echo  Iniciando servidor en http://localhost:8000
echo  Presiona Ctrl+C para detener el servidor
echo.

:: Intentar con Python 3
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Python encontrado - usando http.server
    echo.
    start "" "http://localhost:8000"
    python -m http.server 8000
    goto :end
)

:: Intentar con Python 3 explícito
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Python3 encontrado
    echo.
    start "" "http://localhost:8000"
    python3 -m http.server 8000
    goto :end
)

:: Intentar con Node.js (npx serve)
npx --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Node.js encontrado - usando npx serve
    echo.
    start "" "http://localhost:8000"
    npx serve -p 8000 .
    goto :end
)

echo  [ERROR] No se encontro Python ni Node.js
echo.
echo  Opciones para solucionar:
echo  1. Instala Python desde https://python.org
echo  2. Instala Node.js desde https://nodejs.org
echo  3. Usa la extension "Live Server" en VS Code
echo.
pause

:end
