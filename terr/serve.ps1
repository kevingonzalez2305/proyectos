param(
  [int]$Port = 5173
)

function Get-ContentType($path) {
  switch ([System.IO.Path]::GetExtension($path).ToLower()) {
    ".html" { return "text/html" }
    ".htm"  { return "text/html" }
    ".css"  { return "text/css" }
    ".js"   { return "application/javascript" }
    ".json" { return "application/json" }
    ".png"  { return "image/png" }
    ".jpg"  { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".svg"  { return "image/svg+xml" }
    default  { return "application/octet-stream" }
  }
}

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$prefix = "http://localhost:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Servidor estático escuchando en $prefix" -ForegroundColor Green

try {
  while ($true) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.AbsolutePath
    if ([string]::IsNullOrEmpty($path) -or $path -eq "/") {
      $path = "/index.html"
    }
    $filePath = Join-Path -Path $baseDir -ChildPath ($path.TrimStart('/'))

    if (Test-Path $filePath -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $response.ContentType = Get-ContentType $filePath
      $response.StatusCode = 200
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $msg = "404 Not Found"
      $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
      $response.StatusCode = 404
      $response.ContentType = "text/plain"
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    }
    $response.OutputStream.Close()
  }
} finally {
  $listener.Stop()
}