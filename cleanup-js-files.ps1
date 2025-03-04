# PowerShell Script to remove JavaScript files that have TypeScript versions
# This helps clean up the codebase after TypeScript migration

# Get all TypeScript files in the utils directory
$tsFiles = Get-ChildItem -Path "src\utils" -Filter "*.ts" | Select-Object -ExpandProperty BaseName

# For each TypeScript file, check if there's a corresponding JavaScript file
foreach ($tsFile in $tsFiles) {
    $jsFile = "src\utils\$tsFile.js"
    if (Test-Path $jsFile) {
        Write-Host "Removing duplicate JavaScript file: $jsFile"
        Remove-Item $jsFile
    }
}

# Check for other converted JS files that might have TS versions
$convertedFiles = @(
    "src\core\config\queryClient.js",
    "src\core\config\supabase.js",
    "src\api\database.js",
    "src\services\supabaseClient.js",
    "src\store\userStore.js"
)

foreach ($file in $convertedFiles) {
    $tsFile = $file -replace "\.js$", ".ts"
    if ((Test-Path $tsFile) -and (Test-Path $file)) {
        Write-Host "Removing duplicate JavaScript file: $file"
        Remove-Item $file
    }
}

Write-Host "Clean-up completed successfully!" 