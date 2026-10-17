param([string]$Src = '', [string]$Out = '', [int]$cx = 895, [int]$cy = 598, [int]$ax = 80, [int]$ay = 140, [int]$rx = 6, [int]$ry = 2, [double]$ghost = 0.3, [int]$gdx = 7)
$ErrorActionPreference = "Stop"
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System; using System.Drawing; using System.Drawing.Imaging; using System.Runtime.InteropServices;
public static class ManBlur {
  public static void Run(Bitmap bm, int cx, int cy, int ax, int ay, int rx, int ry, double ghost, int gdx) {
    int W = bm.Width, H = bm.Height;
    BitmapData bd = bm.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadWrite, PixelFormat.Format24bppRgb);
    int s = bd.Stride;
    byte[] a = new byte[s * H]; Marshal.Copy(bd.Scan0, a, 0, a.Length);
    byte[] t = (byte[])a.Clone(); byte[] u = (byte[])a.Clone();
    int x0 = Math.Max(0, cx - ax - rx - gdx), x1 = Math.Min(W, cx + ax + rx + gdx);
    int y0 = Math.Max(0, cy - ay - ry), y1 = Math.Min(H, cy + ay + ry);
    for (int y = y0; y < y1; y++) for (int x = x0; x < x1; x++) for (int c = 0; c < 3; c++) {
      int sum = 0, n = 0;
      for (int k = -rx; k <= rx; k++) { int xx = Math.Min(W - 1, Math.Max(0, x + k)); sum += a[y * s + xx * 3 + c]; n++; }
      t[y * s + x * 3 + c] = (byte)(sum / n);
    }
    Random r = new Random(17);
    for (int y = y0; y < y1; y++) for (int x = x0; x < x1; x++) {
      double dx = (x - cx) / (double)ax, dy = (y - cy) / (double)ay;
      double d = Math.Sqrt(dx * dx + dy * dy);
      double w = d >= 1 ? 0 : (d <= 0.55 ? 1 : (1 - d) / 0.45);
      w = w * w * (3 - 2 * w);
      if (w <= 0) continue;
      int nz = (int)((r.NextDouble() - 0.5) * 16 * w);
      int xg = Math.Min(W - 1, x + gdx);
      for (int c = 0; c < 3; c++) {
        int sum = 0, n = 0;
        for (int k = -ry; k <= ry; k++) { int yy = Math.Min(H - 1, Math.Max(0, y + k)); sum += t[yy * s + x * 3 + c]; n++; }
        double b = sum / (double)n;
        b = b * (1 - ghost) + t[y * s + xg * 3 + c] * ghost;
        int i = y * s + x * 3 + c;
        double v = a[i] * (1 - w) + b * w + nz;
        u[i] = (byte)Math.Min(255, Math.Max(0, (int)v));
      }
    }
    Marshal.Copy(u, 0, bd.Scan0, u.Length); bm.UnlockBits(bd);
  }
}
"@
$im = [System.Drawing.Image]::FromFile($Src)
$bm = New-Object System.Drawing.Bitmap $im
$im.Dispose()
[ManBlur]::Run($bm, $cx, $cy, $ax, $ay, $rx, $ry, $ghost, $gdx)
$bm.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$bm.Dispose()
"ok"
