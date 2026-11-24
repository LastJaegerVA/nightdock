; Nightdock — Windows installer
; Per-user install (no administrator rights), branded pages, 8 languages,
; removes the old "Hangar" version, and an uninstaller that only deletes
; the files it installed. Built by build/make-installer.py.

Unicode true
ManifestDPIAware true
SetCompressor /SOLID lzma
SetCompressorDictSize 64

!define APPNAME   "Nightdock"
!define EXENAME   "Nightdock.exe"
!define PUBLISHER "LastJaegerVA"
!define UNINSTEXE "Uninstall Nightdock.exe"
!define UNINSTKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\Nightdock"
!define REGKEY    "Software\Nightdock"
!define OLDKEY    "Software\Microsoft\Windows\CurrentVersion\Uninstall\Hangar"
!ifndef VERSION
  !define VERSION "1.0.0"
!endif

Name "${APPNAME}"
Caption "${APPNAME} ${VERSION}"
OutFile "${OUTFILE}"
InstallDir "$LOCALAPPDATA\Programs\${APPNAME}"
InstallDirRegKey HKCU "${REGKEY}" "InstallDir"
RequestExecutionLevel user
BrandingText "${APPNAME} ${VERSION}"
ShowInstDetails hide
ShowUninstDetails hide

VIProductVersion "${VERSION}.0"
VIAddVersionKey /LANG=0 "ProductName" "${APPNAME}"
VIAddVersionKey /LANG=0 "FileDescription" "${APPNAME} Setup"
VIAddVersionKey /LANG=0 "CompanyName" "${PUBLISHER}"
VIAddVersionKey /LANG=0 "FileVersion" "${VERSION}"
VIAddVersionKey /LANG=0 "ProductVersion" "${VERSION}"
VIAddVersionKey /LANG=0 "LegalCopyright" "© ${PUBLISHER}"

!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "x64.nsh"
!include "WinVer.nsh"

; ── look ──────────────────────────────────────────────────────────────
!define MUI_ICON   "icon.ico"
!define MUI_UNICON "icon.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "installer-sidebar.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "installer-sidebar.bmp"
!define MUI_WELCOMEFINISHPAGE_BITMAP_STRETCH AspectFitHeight
!define MUI_UNWELCOMEFINISHPAGE_BITMAP_STRETCH AspectFitHeight
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_RIGHT
!define MUI_HEADERIMAGE_BITMAP "installer-header.bmp"
!define MUI_HEADERIMAGE_UNBITMAP "installer-header.bmp"
!define MUI_HEADERIMAGE_BITMAP_STRETCH AspectFitHeight
!define MUI_HEADERIMAGE_UNBITMAP_STRETCH AspectFitHeight
!define MUI_ABORTWARNING
!define MUI_UNABORTWARNING
!define MUI_COMPONENTSPAGE_SMALLDESC
!define MUI_FINISHPAGE_NOREBOOTSUPPORT

; ── installer pages ───────────────────────────────────────────────────
!define MUI_WELCOMEPAGE_TITLE "$(WelcomeTitle)"
!define MUI_WELCOMEPAGE_TEXT "$(WelcomeText)"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\${EXENAME}"
!define MUI_FINISHPAGE_RUN_TEXT "$(RunText)"
!insertmacro MUI_PAGE_FINISH

; ── uninstaller pages ─────────────────────────────────────────────────
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_COMPONENTS
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; ── languages (Windows picks the one matching the computer) ───────────
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "Norwegian"
!insertmacro MUI_LANGUAGE "Swedish"
!insertmacro MUI_LANGUAGE "Danish"
!insertmacro MUI_LANGUAGE "German"
!insertmacro MUI_LANGUAGE "French"
!insertmacro MUI_LANGUAGE "Spanish"
!insertmacro MUI_LANGUAGE "PortugueseBR"
!include "nsis-gen\languages.nsh"
!include "nsis-gen\strings.nsh"

; ── helpers ───────────────────────────────────────────────────────────
!macro CloseApp
  nsExec::Exec 'taskkill /IM "${EXENAME}"'
  Sleep 800
  nsExec::Exec 'taskkill /F /IM "${EXENAME}"'
  Sleep 300
!macroend

Function .onInit
  ${IfNot} ${RunningX64}
  ${OrIfNot} ${AtLeastWin10}
    MessageBox MB_ICONSTOP "$(NeedWin10)"
    Abort
  ${EndIf}
FunctionEnd

Function un.onInit
FunctionEnd

; ── install ───────────────────────────────────────────────────────────
Section "-Prepare"
  !insertmacro CloseApp
  ; Remove the old version that was called "Hangar".
  ReadRegStr $0 HKCU "${OLDKEY}" "InstallLocation"
  ${If} $0 != ""
  ${AndIf} ${FileExists} "$0\Uninstall Hangar.exe"
    nsExec::Exec 'taskkill /F /IM "Hangar.exe"'
    ExecWait '"$0\Uninstall Hangar.exe" /S _?=$0'
    Delete "$0\Uninstall Hangar.exe"
    RMDir "$0"
  ${EndIf}
  DeleteRegKey HKCU "${OLDKEY}"
  DeleteRegKey HKCU "Software\Hangar"
  ; Clear out app folders from an earlier Nightdock so no stale files stay behind.
  ${If} ${FileExists} "$INSTDIR\${EXENAME}"
    RMDir /r "$INSTDIR\resources"
    RMDir /r "$INSTDIR\locales"
  ${EndIf}
SectionEnd

Section "${APPNAME}" SecApp
  SectionIn RO
  !include "nsis-gen\install-files.nsh"
  SetOutPath "$INSTDIR"
  WriteUninstaller "$INSTDIR\${UNINSTEXE}"

  WriteRegStr HKCU "${REGKEY}" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayName" "${APPNAME}"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${UNINSTKEY}" "Publisher" "${PUBLISHER}"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayIcon" "$INSTDIR\${EXENAME}"
  WriteRegStr HKCU "${UNINSTKEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNINSTKEY}" "UninstallString" '"$INSTDIR\${UNINSTEXE}"'
  WriteRegStr HKCU "${UNINSTKEY}" "QuietUninstallString" '"$INSTDIR\${UNINSTEXE}" /S'
  WriteRegDWORD HKCU "${UNINSTKEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNINSTKEY}" "NoRepair" 1
  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  IntFmt $0 "0x%08X" $0
  WriteRegDWORD HKCU "${UNINSTKEY}" "EstimatedSize" "$0"
SectionEnd

Section "$(SecStart)" SecStart
  CreateShortcut "$SMPROGRAMS\${APPNAME}.lnk" "$INSTDIR\${EXENAME}" "" "$INSTDIR\${EXENAME}" 0
SectionEnd

Section "$(SecDesk)" SecDesk
  CreateShortcut "$DESKTOP\${APPNAME}.lnk" "$INSTDIR\${EXENAME}" "" "$INSTDIR\${EXENAME}" 0
SectionEnd

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SecApp} "$(DescApp)"
  !insertmacro MUI_DESCRIPTION_TEXT ${SecStart} "$(DescStart)"
  !insertmacro MUI_DESCRIPTION_TEXT ${SecDesk} "$(DescDesk)"
!insertmacro MUI_FUNCTION_DESCRIPTION_END

; ── uninstall ─────────────────────────────────────────────────────────
Section "un.${APPNAME}" UnSecApp
  SectionIn RO
  !insertmacro CloseApp
  Delete "$SMPROGRAMS\${APPNAME}.lnk"
  Delete "$DESKTOP\${APPNAME}.lnk"
  ; Login item written by the app's "Start with your computer" setting.
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "electron.app.Nightdock"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${APPNAME}"
  !include "nsis-gen\uninstall-files.nsh"
  Delete "$INSTDIR\${UNINSTEXE}"
  RMDir "$INSTDIR"
  DeleteRegKey HKCU "${UNINSTKEY}"
  DeleteRegKey HKCU "${REGKEY}"
SectionEnd

Section /o "un.$(UnData)" UnSecData
  RMDir /r "$APPDATA\${APPNAME}"
SectionEnd

!insertmacro MUI_UNFUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${UnSecApp} "$(UnDescApp)"
  !insertmacro MUI_DESCRIPTION_TEXT ${UnSecData} "$(UnDescData)"
!insertmacro MUI_UNFUNCTION_DESCRIPTION_END
