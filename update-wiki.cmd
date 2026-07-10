@echo off
setlocal
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"

echo === Hole aktuelle Daten aus dem Spiel ===
call npm run sync-data
if errorlevel 1 goto :error

echo.
echo === Pruefe Aenderungen ===
git add -A
git diff --cached --quiet
if not errorlevel 1 (
    echo Keine Aenderungen gefunden - Wiki ist bereits aktuell.
    goto :end
)

echo.
echo === Committe und pushe ===
git commit -m "Daten aktualisiert"
if errorlevel 1 goto :error
git push
if errorlevel 1 goto :error

echo.
echo Fertig! Die Wiki baut sich jetzt automatisch neu (ca. 30-60 Sekunden).
echo Fortschritt: https://github.com/Chronoria/pokemon-chronoria/actions
goto :end

:error
echo.
echo Es ist ein Fehler aufgetreten - siehe Meldung oben.

:end
echo.
pause
