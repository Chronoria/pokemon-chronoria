@echo off
setlocal
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"

echo === Hole aktuelle Daten aus dem Spiel ===
call npm run sync-data
if errorlevel 1 goto :error

echo.
echo === Baue Item-Uebersicht.xlsx und Pokemon-Uebersicht.xlsx neu ===
call npm run build-data
if errorlevel 1 (
    echo.
    echo Fehler beim Neubauen der Daten - ist Item-Uebersicht.xlsx oder Pokemon-Uebersicht.xlsx
    echo gerade in Excel geoeffnet? Bitte schliessen und nochmal versuchen.
    goto :error
)

echo.
echo === Pruefe Aenderungen ===
git add -A
git diff --cached --quiet
if errorlevel 1 goto :commit

rem Keine neuen Aenderungen - aber vielleicht ist ein frueherer Push
rem gescheitert (z.B. GitHub-Fehler) und ein Commit wartet noch.
set "AHEAD=0"
for /f %%n in ('git rev-list --count @{u}..HEAD 2^>nul') do set "AHEAD=%%n"
if "%AHEAD%"=="0" (
    echo Keine Aenderungen an den Quelldaten - nichts zu committen/pushen.
    echo Item-Uebersicht.xlsx und Pokemon-Uebersicht.xlsx wurden trotzdem gerade neu gebaut.
    goto :end
)
echo Keine neuen Aenderungen, aber %AHEAD% Commit noch nicht hochgeladen - pushe ihn jetzt.
goto :push

:commit
echo.
echo === Committe ===
git commit -m "Daten aktualisiert"
if errorlevel 1 goto :error

:push
echo.
echo === Pushe ===
git push
if errorlevel 1 goto :error

echo.
echo Fertig! Item-Uebersicht.xlsx und Pokemon-Uebersicht.xlsx sind aktuell.
echo Die Online-Wiki baut sich jetzt ebenfalls automatisch neu (ca. 30-60 Sekunden).
echo Fortschritt: https://github.com/Chronoria/pokemon-chronoria/actions
goto :end

:error
echo.
echo Es ist ein Fehler aufgetreten - siehe Meldung oben.

:end
echo.
pause
