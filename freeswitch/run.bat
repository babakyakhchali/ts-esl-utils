@echo off
title This is your first batch script!
echo Welcome to batch scripting!
set filepath=%~dp0
echo %filepath:~0,-1%
set wd=%filepath:~0,-1%
set fsdir=C:\Users\babak\Projects\freeswitch-1.10\Win32\Debug
set rc=%fsdir%\FreeSwitchConsole.exe -base %wd% -mod %fsdir%\mod -nonat -nonatmap -log %wd%/log
start "Minimal Freeswitch" %rc%
pause