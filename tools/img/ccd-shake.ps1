# Cheap 2014 CCD snapshot look: hand-shake smear, grain, exposure, washed-out colour, careless framing.
# powershell -File ccd-shake.ps1 -Src <in> -Out <out.png> [options]
#   -rx/-ry      horizontal/vertical shake blur radius (px)      -ghost/-gdx  double-image strength / offset
#   -grain       luma noise                                       -chroma      colour noise
#   -expose      exposure gain (1 = unchanged, 1.3 = overexposed; highlights roll off instead of hard clipping)
#   -lift        black level lift (16 = mild, 40 = milky)         -desat       0..1 toward grey
#   -tilt        degrees of careless rotation                     -zoom/-ox/-oy  extra crop and off-centre shift (fractions of width/height)
# Output keeps the source size.
param([string]$Src, [string]$Out, [int]$rx = 4, [int]$ry = 1, [double]$ghost = 0.25, [int]$gdx = 7, [double]$grain = 20, [double]$chroma = 6,
  [double]$expose = 1.0, [double]$lift = 16, [double]$desat = 0, [double]$tilt = 0, [double]$zoom = 1.0, [double]$ox = 0, [double]$oy = 0)
$ErrorActionPreference = "Stop"
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System; using System.Drawing; using System.Drawing.Imaging; using System.Runtime.InteropServices;
public static class CcdShake {
  public static void Run(Bitmap bm, int rx, int ry, double ghost, int gdx, double grain, double chroma, double expose, double lift, double desat) {
    int W = bm.Width, H = bm.Height;
    BitmapData bd = bm.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadWrite, PixelFormat.Format24bppRgb);
    int s = bd.Stride;
    byte[] a = new byte[s * H]; Marshal.Copy(bd.Scan0, a, 0, a.Length);
    double[] t = new double[s * H]; byte[] u = new byte[s * H];
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) for (int c = 0; c < 3; c++) {
      double sum = 0; int n = 0;
      for (int k = -rx; k <= rx; k++) { int xx = Math.Min(W - 1, Math.Max(0, x + k)); sum += a[y * s + xx * 3 + c]; n++; }
      t[y * s + x * 3 + c] = sum / n;
    }
    Random r = new Random(23);
    double[] v = new double[3];
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
      double ln = (r.NextDouble() + r.NextDouble() + r.NextDouble() - 1.5) * grain;
      int xg = Math.Min(W - 1, x + gdx);
      for (int c = 0; c < 3; c++) {
        double sum = 0; int n = 0;
        for (int k = -ry; k <= ry; k++) { int yy = Math.Min(H - 1, Math.Max(0, y + k)); sum += t[yy * s + x * 3 + c]; n++; }
        double q = (sum / n) * (1 - ghost) + t[y * s + xg * 3 + c] * ghost;
        q = q / 255.0 * expose;
        q = q <= 0.8 ? q : 0.8 + 0.2 * (1 - Math.Exp(-(q - 0.8) / 0.2));
        v[c] = lift + q * (255 - lift);
      }
      double lum = 0.11 * v[0] + 0.59 * v[1] + 0.30 * v[2];
      for (int c = 0; c < 3; c++) {
        double q = v[c] + (lum - v[c]) * desat;
        if (c == 1) q += 3; if (c == 0) q -= 2;
        q += ln + (r.NextDouble() - 0.5) * chroma;
        u[y * s + x * 3 + c] = (byte)Math.Min(255, Math.Max(0, (int)q));
      }
    }
    Marshal.Copy(u, 0, bd.Scan0, u.Length); bm.UnlockBits(bd);
  }
}
"@
$im = [System.Drawing.Image]::FromFile($Src)
$W = $im.Width; $H = $im.Height
$bm = New-Object System.Drawing.Bitmap $W, $H, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($bm)
$g.InterpolationMode = "HighQualityBicubic"
$th = [math]::Abs($tilt) * [math]::PI / 180
$cover = [math]::Cos($th) + [math]::Sin($th) * [math]::Max($W / $H, $H / $W)
$sc = $cover * $zoom
$g.TranslateTransform([float]($W / 2 + $ox * $W), [float]($H / 2 + $oy * $H))
$g.RotateTransform([float]$tilt)
$g.ScaleTransform([float]$sc, [float]$sc)
$g.DrawImage($im, [float](-$W / 2), [float](-$H / 2), [float]$W, [float]$H)
$g.Dispose(); $im.Dispose()
[CcdShake]::Run($bm, $rx, $ry, $ghost, $gdx, $grain, $chroma, $expose, $lift, $desat)
$bm.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
"$($bm.Width)x$($bm.Height)"
$bm.Dispose()
