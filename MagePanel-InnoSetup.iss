; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "MagePanel"
#define MyAppShortName "MagePanel"
#define MyAppVersion "1.7"
#define MyAppPublisher "Erinç İnci"
#define MyAppURL "http://erincinci.github.io/magepanel/l"
#define MyAppExeName "browser.bat"
#define MyAppIcon "magepanel.ico"              

#define NSSM32 "dependencies\nssm-x86.exe"
#define NSSM64 "dependencies\nssm.exe"
#define NSSM "dependencies\nssm.exe"
#define NODE32 "dependencies\node-v0.10.4-x86.msi"
#define NODE64 "dependencies\node-v0.10.4-x64.msi"
#define NODE "dependencies\node-v0.10.4-x64.msi"
#define CYGWIN "dependencies\cygwin-setup-x86_64.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{2C73A08E-5543-47E5-B8D6-AB8529CE3043}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName=C:\{#MyAppName}
DisableDirPage=yes
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
LicenseFile=.\Installers\Windows\LICENSE.TXT
InfoBeforeFile=.\Installers\Windows\README.TXT
OutputDir=C:\Users\erinci\Downloads
OutputBaseFilename=MagePanelSetup-v{#MyAppVersion}
SetupIconFile=.\Installers\Windows\installer.ico
Compression=lzma
SolidCompression=yes 

[Code]
#ifdef UNICODE
  #define AW "W"
#else
  #define AW "A"
#endif
const  
  LOGON32_LOGON_INTERACTIVE = 2;
  LOGON32_LOGON_NETWORK = 3;
  LOGON32_LOGON_BATCH = 4;
  LOGON32_LOGON_SERVICE = 5;
  LOGON32_LOGON_UNLOCK = 7;
  LOGON32_LOGON_NETWORK_CLEARTEXT = 8;
  LOGON32_LOGON_NEW_CREDENTIALS = 9;

  LOGON32_PROVIDER_DEFAULT = 0;
  LOGON32_PROVIDER_WINNT40 = 2;
  LOGON32_PROVIDER_WINNT50 = 3;

  ERROR_SUCCESS = 0;
  ERROR_LOGON_FAILURE = 1326;

// Global Variables
var
  userNameDomain: string;
  userPass: string;
  ServerDetailsPage: TInputQueryWizardPage;

// Return found user name and domain
function ReturnUserNameDomain(Value: string): string;
begin
  Result := userNameDomain;
end;

// Return found user name and domain
function ReturnUserPass(Value: string): string;
begin
  Result := userPass;
end;

// Find user name and domain from system
procedure FindUserNameDomain;
begin
  userNameDomain := AddBackslash(GetEnv('USERDOMAIN')) + GetUserNameString;
  //MsgBox('User Name & Domain is "' + userNameDomain + '"', mbInformation, MB_OK);
end;

// LogOn User
function LogonUser(lpszUsername, lpszDomain, lpszPassword: string;
  dwLogonType, dwLogonProvider: DWORD; var phToken: THandle): BOOL;
  external 'LogonUser{#AW}@advapi32.dll stdcall';

// Try LogOn for User
function TryLogonUser(const Domain, UserName, Password: string; 
  var ErrorCode: Longint): Boolean;
var
  Token: THandle;
begin
  Result := LogonUser(UserName, Domain, Password, LOGON32_LOGON_INTERACTIVE,
    LOGON32_PROVIDER_DEFAULT, Token);
  ErrorCode := DLLGetLastError;
end;

procedure InitializeWizard;
var
  UserName: string;
begin
  UserName := AddBackslash(GetEnv('USERDOMAIN')) + GetUserNameString;
  ServerDetailsPage := CreateInputQueryPage(wpWelcome, 
    '', '', 'Please enter your user password and click next for local service creation.');
  ServerDetailsPage.Add('Domain Name\User Name', False);
  ServerDetailsPage.Add('Password', True);
  ServerDetailsPage.Values[0] := UserName;
end;

procedure ParseDomainUserName(const Value: string; var Domain,
  UserName: string);
var
  DelimPos: Integer;
begin
  DelimPos := Pos('\', Value);
  if DelimPos = 0 then
  begin
    Domain := '.';
    UserName := Value;
  end
  else
  begin
    Domain := Copy(Value, 1, DelimPos - 1);
    UserName := Copy(Value, DelimPos + 1, MaxInt);
  end;
end;

function ServerDetailsLogonUser: Boolean; 
var
  Domain: string;
  UserName: string;
  Password: string;
  ErrorCode: Longint;
begin
  ParseDomainUserName(ServerDetailsPage.Values[0], Domain, UserName);
  Password := ServerDetailsPage.Values[1];
  Result := TryLogonUser(Domain, UserName, Password, ErrorCode);

  case ErrorCode of
    ERROR_SUCCESS:
      //MsgBox('Logon successful!', mbInformation, MB_OK);
      userPass := Password;
    ERROR_LOGON_FAILURE:
      MsgBox('The user name or password is incorrect!', mbError, MB_OK);
  else
    MsgBox('Login failed!' + #13#10 + SysErrorMessage(DLLGetLastError),
      mbError, MB_OK);
  end;
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;

  if CurPageID = ServerDetailsPage.ID then
    Result := ServerDetailsLogonUser;
end;

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "turkish"; MessagesFile: "compiler:Languages\Turkish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 0,6.1

[Files]
; NOTE: Don't use "Flags: ignoreversion" on any shared system files
; Windows specific files
Source: ".\Installers\Windows\browser.bat"; DestDir: "{app}"; BeforeInstall: FindUserNameDomain; Flags: ignoreversion
Source: ".\Installers\Windows\LICENSE.TXT"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\Installers\Windows\README.TXT"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\Installers\Windows\magepanel.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\Installers\Windows\msie-app.hta"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\Installers\Windows\msie-app-secure.hta"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\Installers\Windows\node-v0.10.4-x64.msi"; DestDir: "{app}\dependencies"; Flags: ignoreversion
Source: ".\Installers\Windows\cygwin-setup-x86_64.exe"; DestDir: "{app}\dependencies"; Flags: ignoreversion
Source: ".\Installers\Windows\nssm.exe"; DestDir: "{app}\dependencies"; Flags: ignoreversion
Source: ".\Installers\Windows\nssm-x86.exe"; DestDir: "{app}\dependencies"; Flags: ignoreversion
; Application files
Source: ".\app.js"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\common.js"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\config.json"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\package.json"; DestDir: "{app}"; Flags: ignoreversion
; Application dirs
Source: ".\dbs\.gitignore"; DestDir: "{app}\dbs"; Flags: ignoreversion
Source: ".\logs\.gitignore"; DestDir: "{app}\logs"; Flags: ignoreversion
Source: ".\models\*"; DestDir: "{app}\models"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: ".\node_modules\*"; DestDir: "{app}\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: ".\public\*"; DestDir: "{app}\public"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: ".\routes\*"; DestDir: "{app}\routes"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: ".\util\*"; DestDir: "{app}\util"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: ".\views\*"; DestDir: "{app}\views"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{commonprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppIcon}"
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:ProgramOnTheWeb,{#MyAppName}}"; Filename: "{#MyAppURL}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: quicklaunchicon

[Run]
; post-install
Filename: "{app}\{#CYGWIN}"; Parameters: "--quiet-mode";
Filename: "{sys}\msiexec.exe"; Parameters: "/passive /i ""{app}\{#NODE}""";
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall add rule name=""Node In"" program=""{pf64}\nodejs\node.exe"" dir=in action=allow enable=yes"; Flags: runhidden;
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall add rule name=""Node Out"" program=""{pf64}\nodejs\node.exe"" dir=out action=allow enable=yes"; Flags: runhidden;
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: shellexec postinstall skipifsilent runhidden
Filename: "{app}\{#NSSM}"; Parameters: "install {#MyAppShortName} ""{pf64}\nodejs\node.exe"" ""{app}\app.js"""; Flags: runhidden;
Filename: "{app}\{#NSSM}"; Parameters: "set {#MyAppShortName} AppDirectory {app}"; Flags: runhidden;
Filename: "{app}\{#NSSM}"; Parameters: "set {#MyAppShortName} ObjectName {code:ReturnUserNameDomain} {code:ReturnUserPass}"; Flags: runhidden;
Filename: "{app}\{#NSSM}"; Parameters: "start {#MyAppShortName}"; Flags: runhidden;

[Registry]
Root: HKCU; Subkey: HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\services\{#MyAppShortName}\Parameters; ValueType: string; ValueName: AppDirectory; ValueData: {app}

[UninstallRun]
; pre-uninstall
Filename: "{app}\{#NSSM}"; Parameters: "stop {#MyAppShortName}"; Flags: runhidden;
Filename: "{app}\{#NSSM}"; Parameters: "remove {#MyAppShortName} confirm"; Flags: runhidden;