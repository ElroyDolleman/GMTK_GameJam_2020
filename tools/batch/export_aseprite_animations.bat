SET root=%~dp0..\..
SET sourceFolder=%root%\assets_source\aseprite\animations
SET outputFolder=%root%\assets_source\texturepacker\animations

FOR /D %%G IN (%sourceFolder%\*) DO (
    FOR %%I IN (%%G\*.*) DO (
        aseprite -b %%I --save-as %outputFolder%\%%~nxG\%%~nI_00.png
    )
)

SET sourceFolder=%root%\assets_source\texturepacker\animations\
SET outputFolder=%root%\dist\assets\

FOR /D %%G IN (%sourceFolder%\*) DO (
    texturepacker %%G --format phaser --data %outputFolder%\%%~nxG_sheet.json --sheet %outputFolder%\%%~nxG_sheet.png --extrude 0 --force-squared --disable-rotation
)



SET sourceFolder=%root%\assets_source\aseprite\sheets
SET outputFolder=%root%\assets_source\texturepacker\images

FOR /D %%G IN (%sourceFolder%\*) DO (
    FOR %%I IN (%%G\*.*) DO (
        aseprite -b %%I --save-as %outputFolder%\%%~nxG\%%~nI.png
    )
)

SET sourceFolder=%root%\assets_source\texturepacker\images\
SET outputFolder=%root%\dist\assets\

FOR /D %%G IN (%sourceFolder%\*) DO (
    texturepacker %%G --format phaser --data %outputFolder%\%%~nxG_sheet.json --sheet %outputFolder%\%%~nxG_sheet.png --extrude 0 --force-squared --disable-rotation
)