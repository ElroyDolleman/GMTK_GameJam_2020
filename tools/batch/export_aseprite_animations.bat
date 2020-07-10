SET root=%~dp0..\..
SET sourceFolder=%root%\assets_source\aseprite
SET outputFolder=%root%\assets_source\animations

FOR /D %%G IN (%sourceFolder%\*) DO (
    FOR %%I IN (%%G\*.*) DO (
        aseprite -b %%I --save-as %outputFolder%\%%~nxG\%%~nI_00.png
    )
)

SET sourceFolder=%root%\assets_source\animations\
SET outputFolder=%root%\dist\assets\

FOR /D %%G IN (%sourceFolder%\*) DO (
    texturepacker %%G --format phaser --data %outputFolder%\%%~nxG.json --sheet %outputFolder%\%%~nxG.png --extrude 0 --force-squared --disable-rotation
)