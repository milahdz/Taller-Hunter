#!/bin/bash
echo ""
echo " ================================"
echo "  TALLER HUNTER - Servidor Local"
echo " ================================"
echo ""
echo " Iniciando servidor en http://localhost:8000"
echo " Presiona Ctrl+C para detener"
echo ""

# Abrir navegador automáticamente
if command -v xdg-open &> /dev/null; then
    sleep 1 && xdg-open "http://localhost:8000" &
elif command -v open &> /dev/null; then
    sleep 1 && open "http://localhost:8000" &
fi

# Usar Python si está disponible
if command -v python3 &> /dev/null; then
    echo " [OK] Usando Python 3"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo " [OK] Usando Python"
    python -m http.server 8000
elif command -v npx &> /dev/null; then
    echo " [OK] Usando npx serve"
    npx serve -p 8000 .
else
    echo " [ERROR] No se encontró Python ni Node.js"
    echo " Instala Python desde https://python.org"
fi
