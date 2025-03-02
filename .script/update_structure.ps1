# Ruta del proyecto y archivo de salida
$projectPath = "C:\Users\lucas\.cursor-tutor-3\AdoptMe"
$outputFile = "C:\Users\lucas\.cursor-tutor-3\.cursor\rules\project_structure.mdc"

# Función para obtener la estructura del directorio
function Get-DirectoryStructure {
    param (
        [string]$path,
        [int]$indent = 0
    )
    
    # Excluir 'node_modules' o cualquier otra carpeta que no desees guardar
    $excludeFolders = @('node_modules')

    $items = Get-ChildItem -Path $path | Sort-Object Name
    
    foreach ($item in $items) {
        # Si la carpeta está en la lista de exclusión, no procesarla
        if ($item.PSIsContainer -and $excludeFolders -contains $item.Name) {
            continue
        }

        $prefix = '  ' * $indent
        if ($item.PSIsContainer) {
            "$prefix$($item.Name)/" | Out-File -Append -FilePath $outputFile -Encoding utf8
            Get-DirectoryStructure -path $item.FullName -indent ($indent + 1)
        } else {
            "$prefix$($item.Name)" | Out-File -Append -FilePath $outputFile -Encoding utf8
        }
    }
}

# Generar la estructura del directorio en formato Markdown
"# Estructura del Proyecto" | Out-File -FilePath $outputFile -Encoding utf8
"" | Out-File -Append -FilePath $outputFile -Encoding utf8
'```' | Out-File -Append -FilePath $outputFile -Encoding utf8

Get-DirectoryStructure -path $projectPath

'```' | Out-File -Append -FilePath $outputFile -Encoding utf8

Write-Host "Estructura del proyecto guardada en $outputFile"