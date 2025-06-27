# Permamind Installation Script for Windows PowerShell
# Usage: Invoke-WebRequest -Uri "https://raw.githubusercontent.com/ALLiDoizCode/Permamind/main/scripts/install.ps1" -OutFile "install.ps1"; .\install.ps1

param(
    [string]$Version = "latest",
    [switch]$Help
)

$ErrorActionPreference = "Stop"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Show-Help {
    Write-Host "Permamind Installation Script for Windows"
    Write-Host ""
    Write-Host "Usage: .\install.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Version VERSION   Install specific version (default: latest)"
    Write-Host "  -Help             Show this help message"
    Write-Host ""
    Write-Host "Example:"
    Write-Host "  .\install.ps1                    # Install latest version"
    Write-Host "  .\install.ps1 -Version 1.2.0    # Install specific version"
    Write-Host ""
}

function Test-Dependencies {
    Write-Status "Checking dependencies..."
    
    # Check for Node.js
    try {
        $nodeVersion = node --version
        $nodeMajor = ($nodeVersion -replace 'v', '').Split('.')[0]
        
        if ([int]$nodeMajor -lt 20) {
            Write-Error "Node.js version $nodeVersion is not supported. Please upgrade to Node.js 20 or higher."
            Write-Error "Download from: https://nodejs.org/"
            exit 1
        }
        
        Write-Success "Node.js version $nodeVersion is supported"
    }
    catch {
        Write-Error "Node.js is not installed or not in PATH."
        Write-Error "Please install Node.js 20+ from https://nodejs.org/"
        exit 1
    }
    
    # Check for npm
    try {
        $npmVersion = npm --version
        Write-Success "npm version $npmVersion found"
    }
    catch {
        Write-Error "npm is not installed or not in PATH."
        exit 1
    }
}

function Install-Permamind {
    Write-Status "Installing Permamind globally..."
    
    try {
        if ($Version -eq "latest") {
            npm install -g permamind
        }
        else {
            npm install -g "permamind@$Version"
        }
        
        Write-Success "Permamind installed successfully!"
    }
    catch {
        Write-Error "Failed to install Permamind: $($_.Exception.Message)"
        exit 1
    }
}

function Test-Installation {
    Write-Status "Verifying installation..."
    
    try {
        $installedVersion = permamind --version
        Write-Success "Permamind $installedVersion is installed and available"
    }
    catch {
        Write-Error "Installation verification failed. Permamind command not found."
        Write-Error "You may need to restart your PowerShell session or add npm global bin to your PATH."
        exit 1
    }
}

function Start-Setup {
    Write-Status "Would you like to run the setup wizard now? (y/n): " -NoNewline
    $response = Read-Host
    
    if ($response -match '^[yY]([eE][sS])?$') {
        Write-Status "Running setup wizard..."
        try {
            permamind --setup
        }
        catch {
            Write-Warning "Setup wizard failed. You can run it later with: permamind --setup"
        }
    }
    else {
        Write-Status "Setup skipped. You can run it later with: permamind --setup"
    }
}

function Main {
    Write-Host ""
    Write-Host "🧠 Permamind Installer" -ForegroundColor Cyan
    Write-Host "======================"
    Write-Host ""
    
    Test-Dependencies
    Install-Permamind
    Test-Installation
    
    Write-Host ""
    Write-Success "Installation complete!"
    Write-Host ""
    Write-Status "Next steps:"
    Write-Host "  1. Run 'permamind --setup' to configure your installation"
    Write-Host "  2. Start the server with 'permamind'"
    Write-Host "  3. Get help with 'permamind --help'"
    Write-Host ""
    
    Start-Setup
}

# Handle help flag
if ($Help) {
    Show-Help
    exit 0
}

# Check if running as Administrator (recommended for global npm installs)
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Not running as Administrator. If installation fails, try running PowerShell as Administrator."
}

Main