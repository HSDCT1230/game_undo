# Family photo (quanjiafu) compositor. ASCII-only on purpose; pass Chinese paths as arguments.
#
# Spec: photo 3:4 portrait (600x800 in texture), dark walnut flat moulding 50px => outer 700x900 (7:9).
# Real size: photo 30x40 cm, moulding 2.5 cm, outer 35x45 cm.
#
# Usage (one image):
#   powershell -NoProfile -ExecutionPolicy Bypass -File family-photo-compose.ps1 `
#     -In <src.png> -Out <dst.png> -Quad "308,63 410,77 410,205 308,210" `
#     -OldQuad "308,63 422,79 422,204 308,210" -Erase "300,55,432,218"
#   Quad / OldQuad = outer frame corners TL TR BR BL in target pixels.
#   OldQuad = where the old frame is now; light/colour is matched to it automatically (3x4 gain grid).
#   Erase   = rects "x0,y0,x1,y1;..." refilled from the surrounding wall before placing (cover old frame + its shadow).
#   -Tex family-photo-front-night.png for night shots (auto gain still applies).
#   -NoAuto -Gain 0.5 to skip auto light matching.
# Batch: -Jobs family-photo-jobs.csv (columns: in,out,quad,oldquad,erase,tex,blur,shadow) ; empty out = overwrite in.
param(
  [string]$In = '', [string]$Out = '',
  [string]$Quad = '', [string]$OldQuad = '', [double]$OldBorder = 0.07,
  [string]$Erase = '', [string]$Tex = '', [string]$Grid = '3,4',
  [switch]$NoAuto, [double]$Gain = 1.0,
  [double]$Blur = 0.5, [double]$Noise = -1,
  [double]$Shadow = 0.35, [double]$ShadowDX = 2, [double]$ShadowDY = 3, [double]$ShadowSigma = 2.5,
  [int]$Seed = 7, [string]$Jobs = ''
)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not ('FamilyPhoto.Ops' -as [type])) { Add-Type -Path "$here\family-photo-engine.cs" -ReferencedAssemblies System.Drawing }

function Parse-Quad([string]$s) {
  $v = @($s.Trim() -split '[ ,;]+' | Where-Object { $_ -ne '' } | ForEach-Object { [double]$_ })
  if ($v.Count -ne 8) { throw "quad needs 8 numbers: $s" }
  return [double[]]$v
}

function Invoke-One($src, $dst, $q, $oq, $er, $tx, $bl, $sh) {
  if (-not $tx) { $tx = "$here\family-photo-front-day.png" }
  $texF = [FamilyPhoto.F]::Load($tx)
  $m = [math]::Round(50.0 * $texF.W / 700)
  $pr = [double[]]($m, $m, ($texF.W - 2 * $m), ($texF.H - 2 * $m))
  $img = [FamilyPhoto.F]::Load($src)
  $qq = Parse-Quad $q
  if ($oq) { $oqq = Parse-Quad $oq } else { $oqq = $qq }
  $gw = [int]($Grid.Split(',')[0]); $gh = [int]($Grid.Split(',')[1])
  if ($NoAuto) {
    $grid = [FamilyPhoto.Ops]::FlatGain($Gain, $Gain, $Gain); $gw = 1; $gh = 1
  } else {
    $ow = (($oqq[2] - $oqq[0]) + ($oqq[4] - $oqq[6])) / 2
    $oh = (($oqq[7] - $oqq[1]) + ($oqq[5] - $oqq[3])) / 2
    $inner = [FamilyPhoto.Ops]::Inset($oqq, $OldBorder, $OldBorder * $ow / $oh)
    $photoF = $texF.Crop($m, $m, $texF.W - 2 * $m, $texF.H - 2 * $m)
    $grid = [FamilyPhoto.Ops]::GainGrid($img, $inner, $photoF, $gw, $gh)
    if ($Gain -ne 1.0) { for ($i = 0; $i -lt $grid.Length; $i++) { $grid[$i] = $grid[$i] * $Gain } }
  }
  if ($er) {
    $k = 0
    foreach ($r in $er.Split(';')) {
      if (-not $r.Trim()) { continue }
      $e = @($r.Split(',') | ForEach-Object { [int]$_ })
      [FamilyPhoto.Ops]::Erase($img, $e[0], $e[1], $e[2], $e[3], $Seed + $k); $k++
    }
  }
  [FamilyPhoto.Ops]::Place($img, $texF, $qq, $grid, $gw, $gh, $pr, [float]$bl, [float]$Noise, [float]$sh, [float]$ShadowDX, [float]$ShadowDY, [float]$ShadowSigma, $Seed)
  if (-not $dst) { $dst = $src }
  $img.Save($dst)
  Write-Output "done $dst"
}

if ($Jobs) {
  $rows = Import-Csv -LiteralPath $Jobs -Encoding UTF8
  foreach ($r in $rows) {
    if (-not $r.in) { continue }
    $b = $Blur; if ($r.blur) { $b = [double]$r.blur }
    $s = $Shadow; if ($r.shadow) { $s = [double]$r.shadow }
    $t = ''; if ($r.tex) { $t = Join-Path $here $r.tex }
    Invoke-One $r.in $r.out $r.quad $r.oldquad $r.erase $t $b $s
  }
} else {
  Invoke-One $In $Out $Quad $OldQuad $Erase $Tex $Blur $Shadow
}
