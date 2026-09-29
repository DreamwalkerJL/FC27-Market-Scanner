$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Install and start Docker Desktop, then run this script again."
}
docker info *> $null
if ($LASTEXITCODE -ne 0) {
  throw "Start Docker Desktop, then run this script again."
}

docker compose up -d db
if ($LASTEXITCODE -ne 0) { throw "Could not start PostgreSQL." }

$ready = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
  docker compose exec -T db pg_isready -U fc27 -d fc27 *> $null
  if ($LASTEXITCODE -eq 0) { $ready = $true; break }
  Start-Sleep -Seconds 1
}
if (-not $ready) { throw "PostgreSQL did not become ready." }

Get-Content -Raw database/schema.sql | docker compose exec -T db psql -v ON_ERROR_STOP=1 -U fc27 -d fc27
if ($LASTEXITCODE -ne 0) { throw "Could not create database tables." }

if (-not (Test-Path .env.local)) {
  $settings = (Get-Content -Raw .env.example).Replace("MARKET_DATA_PROVIDER=mock", "MARKET_DATA_PROVIDER=postgres")
  [IO.File]::WriteAllText((Join-Path (Get-Location) ".env.local"), $settings)
  Write-Host "Created .env.local. Add your Parse.bot API key to PARSE_API_KEY= (do not share or commit it)."
} else {
  Write-Host ".env.local already exists; your settings were left untouched."
}

Write-Host "Database is ready. Next: npm install, add your key in .env.local, then npm run discover."
