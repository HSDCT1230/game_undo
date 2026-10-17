# 局部放大核对（最近邻，不糊）。输出默认进 %TEMP%\vibe_undo\，不要写进工程。
# powershell -File zoom.ps1 -Src <图> -X 700 -Y 430 -W 400 -H 330 -K 2 [-Grid] [-Out <路径>]
param([string]$Src, [int]$X, [int]$Y, [int]$W = 200, [int]$H = 200, [int]$K = 3, [switch]$Grid, [string]$Out = '')
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
if (-not $Out) {
  New-Item -ItemType Directory -Force "$env:TEMP\vibe_undo" | Out-Null
  $Out = "$env:TEMP\vibe_undo\zoom-" + [IO.Path]::GetFileNameWithoutExtension($Src) + "-$X-$Y.png"
}
$s = [System.Drawing.Image]::FromFile($Src)
$b = New-Object System.Drawing.Bitmap ($W * $K), ($H * $K)
$g = [System.Drawing.Graphics]::FromImage($b)
$g.InterpolationMode = "NearestNeighbor"
$g.PixelOffsetMode = "Half"
$g.DrawImage($s, (New-Object System.Drawing.Rectangle 0, 0, ($W * $K), ($H * $K)), (New-Object System.Drawing.Rectangle $X, $Y, $W, $H), "Pixel")
if ($Grid) {
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(160, 255, 0, 0)), 1
  $f = New-Object System.Drawing.Font "Arial", 9
  for ($i = 0; $i -le $W; $i += 10) { $g.DrawLine($pen, $i * $K, 0, $i * $K, $H * $K); $g.DrawString("$($X + $i)", $f, [System.Drawing.Brushes]::Red, $i * $K + 1, 1) }
  for ($j = 0; $j -le $H; $j += 10) { $g.DrawLine($pen, 0, $j * $K, $W * $K, $j * $K); $g.DrawString("$($Y + $j)", $f, [System.Drawing.Brushes]::Red, 1, $j * $K + 1) }
}
$s.Dispose()
$b.Save($Out)
$Out
