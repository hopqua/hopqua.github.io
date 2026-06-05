$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

if (-not (Get-Command ruby -ErrorAction SilentlyContinue)) {
    $rubyBin = "C:\Ruby40-x64\bin"
    if (Test-Path "$rubyBin\ruby.exe") {
        $env:Path = "$rubyBin;" + $env:Path
    } else {
        Write-Error "Không tìm thấy Ruby. Cài Ruby từ https://rubyinstaller.org"
    }
}

$env:BUNDLE_GEMFILE = Join-Path $root "Gemfile.local"

Write-Host "Đang cài gem (lần đầu có thể mất vài phút)..." -ForegroundColor Cyan
bundle install

Write-Host ""
Write-Host "Mở trình duyệt:" -ForegroundColor Green
Write-Host "  http://127.0.0.1:4000/" -ForegroundColor Yellow
Write-Host "  http://127.0.0.1:4000/blog/" -ForegroundColor Yellow
Write-Host "Dừng server: Ctrl+C" -ForegroundColor Gray
Write-Host ""

bundle exec jekyll serve --livereload --host 127.0.0.1
