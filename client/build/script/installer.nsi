!macro customInstallMode
  # set $isForceMachineInstall or $isForceCurrentInstall 
  # to enforce one or the other modes.
  Section
    ${If} ${RunningX64}
      //电脑为64为操作系统时，调用相应的外部安装程序
      ExecShell "" "$INSTDIR\dotNetFx40_Full_setup.exe" "/quiet"
      ExecShell "" "$INSTDIR\NDP451-KB2858728-x86-x64-AllOS-ENU.exe" "/quiet"
    ${Else}
      ExecShell "" "$INSTDIR\dotNetFx40_Full_setup.exe" "/quiet"
      ExecShell "" "$INSTDIR\NDP451-KB2858728-x86-x64-AllOS-ENU.exe" "/quiet"
    ${EndIf}
  SectionEnd
!macroend