[Setup]
AppName=Vellor System
AppVersion=1.0
DefaultDirName={autopf}\Vellor System
DefaultGroupName=Vellor System
UninstallDisplayIcon={app}\Vellor System.exe
Compression=lzma2
SolidCompression=yes
OutputDir=d:\Vellor\release
OutputBaseFilename=VellorSystem_Setup

[Files]
Source: "d:\Vellor\backend\dist\Vellor System\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Vellor System"; Filename: "{app}\Vellor System.exe"
Name: "{commondesktop}\Vellor System"; Filename: "{app}\Vellor System.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; GroupDescription: "Additional icons:"; Flags: unchecked
