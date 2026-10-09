@echo off
chcp 65001 >nul
rem ============================================
rem  上传 NAS 前执行：确保预压缩文件是最新的
rem ============================================
echo.
echo [1/2] 重建预压缩文件（.gz / .br）...
echo.
node build\precompress.js
if errorlevel 1 (
    echo.
    echo [失败] 未找到 Node.js。请安装 Node.js 后重试。
    echo        也可以直接上传，但若服务器开了 gzip_static，
    echo        可能返回改动前的旧内容。
    pause
    exit /b 1
)

echo.
echo [2/2] 上传清单
echo.
echo ------------------------------------------------------------
echo  上传到 NAS 的网站根目录（Web Station 站点文件夹）：
echo.
echo    要传：  index.html
echo            css\  js\  templates\  lib\
echo            *.gz  *.br      ^<-- 必须一起传
echo.
echo    不用传：.git\  .workbuddy\  docs\superpowers\
echo            build\  pre-upload.bat  start-server.bat
echo            .gitignore  README.md  output.html
echo ------------------------------------------------------------
echo.
echo  为什么必须传 .gz / .br：
echo    它们是预压缩好的版本。服务器开启 gzip_static 后会直接
echo    返回它们，首屏从 4.5MB 降到约 1.1MB。
echo    就算服务器没开这个功能，多传 6MB 也不会有任何问题。
echo.
echo  【重要】以后每次改完 js\ css\ 或 lib\ 下的文件，
echo          都要先跑一遍这个脚本再上传，否则服务器可能
echo          返回改动之前的旧内容。
echo.
pause
