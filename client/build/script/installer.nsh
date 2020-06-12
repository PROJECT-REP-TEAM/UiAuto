!macro preInit
	SetRegView 64
	WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\UiAuto"
	WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\UiAuto"
	SetRegView 32
	WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\UiAuto"
	WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\UiAuto"
!macroend

!macro customInstall
    ExecShell "" "$INSTDIR\dotNetFx40_Full_setup.exe" "/quiet"
    ExecShell "" "$INSTDIR\NDP451-KB2858728-x86-x64-AllOS-ENU.exe" "/quiet"
!macroend