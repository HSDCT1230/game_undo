# 14 关「附件二偷拍照片」「证据-你信紧的医生」：把一张底图做旧成 2004 年相片，贴进两张成图。
# 预览：powershell -File att2-compose.ps1 -Base <底图>      → %TEMP%\vibe_undo\att2-a.png / att2-b.png
# 换图：加 -Apply（换之前把游戏里现有的图存成母版夹的「-上一版.png」，只留一份）
param([string]$Base = "E:\vibe_undo\生成图\示意-附件二偷拍照片-底图-背影.png", [switch]$Apply)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
Add-Type -Path "$PSScriptRoot\age.cs" -ReferencedAssemblies System.Drawing
$M = "E:\vibe_undo\生成图"
$L = "G:\code\active\lab\vibe_undo\图\游戏\14-拿笔记-9月7日"
$W = "$env:TEMP\vibe_undo"
New-Item -ItemType Directory -Force $W | Out-Null

function LoadBmp($p) {
  $im = [System.Drawing.Image]::FromFile($p)
  $bm = New-Object System.Drawing.Bitmap $im.Width, $im.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bm); $g.DrawImage($im, 0, 0, $im.Width, $im.Height); $g.Dispose(); $im.Dispose()
  return $bm
}

$src = LoadBmp $Base
$ph1 = [Age]::Photo($src, 600, 450, 2004)
$ph2 = [Age]::Photo($src, 580, 435, 2004)

$imgA = LoadBmp "$L\示意-附件二偷拍照片.png"
[Age]::PaperFill($imgA, 25, 55, 630, 505, 0, 575, 666, 140, 14)
[Age]::Paste($imgA, $ph1, 336, 300, -1.8, 0.28, 3, 5)
$imgA.Save("$W\att2-a.png")

$imgB = LoadBmp "$L\证据-你信紧的医生.png"
[Age]::PaperFill($imgB, 640, 42, 634, 506, 700, 560, 560, 100, 14)
[Age]::Paste($imgB, $ph2, 952, 292, 1.6, 0.28, 3, 5)
$imgB.Save("$W\att2-b.png")

if ($Apply) {
  foreach ($n in "示意-附件二偷拍照片", "证据-你信紧的医生") { Copy-Item -LiteralPath "$L\$n.png" -Destination "$M\$n-上一版.png" -Force }
  if ($Base -ne "$M\示意-附件二偷拍照片-底图-背影.png") { $src.Save("$M\示意-附件二偷拍照片-底图-背影.png") }
  $imgA.Save("$L\示意-附件二偷拍照片.png"); Copy-Item -LiteralPath "$L\示意-附件二偷拍照片.png" -Destination "$M\示意-附件二偷拍照片.png" -Force
  $imgB.Save("$L\证据-你信紧的医生.png"); Copy-Item -LiteralPath "$L\证据-你信紧的医生.png" -Destination "$M\证据-你信紧的医生.png" -Force
  "applied"
}
"preview: $W\att2-a.png, att2-b.png"
