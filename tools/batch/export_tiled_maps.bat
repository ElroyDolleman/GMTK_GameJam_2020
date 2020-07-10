SET root=%~dp0..\..
SET sourceFolder=%root%\assets_source\maps
SET outputFolder=%root%\assets_source\maps\export

FOR %%I IN (%sourceFolder%\*.*) DO (
    Tiled --export-map %%I %outputFolder%\%%~nI.json
)