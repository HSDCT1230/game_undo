using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class Age {
  static int[] Get(Bitmap b) {
    var d = b.LockBits(new Rectangle(0, 0, b.Width, b.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    var a = new int[b.Width * b.Height]; Marshal.Copy(d.Scan0, a, 0, a.Length); b.UnlockBits(d); return a;
  }
  static void Put(Bitmap b, int[] a) {
    var d = b.LockBits(new Rectangle(0, 0, b.Width, b.Height), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
    Marshal.Copy(a, 0, d.Scan0, a.Length); b.UnlockBits(d);
  }
  static int C(double v) { return v < 0 ? 0 : v > 255 ? 255 : (int)(v + 0.5); }
  static int Pk(double al, double r, double g, double b) { return (C(al) << 24) | (C(r) << 16) | (C(g) << 8) | C(b); }
  static double Lerp(double a, double b, double t) { return a + (b - a) * t; }

  // Smooth value noise in [-1,1].
  class VNoise {
    double[] v; int n;
    public VNoise(int seed, int size) { n = size; v = new double[n * n]; var r = new Random(seed); for (int i = 0; i < v.Length; i++) v[i] = r.NextDouble() * 2 - 1; }
    double At(int x, int y) { x = ((x % n) + n) % n; y = ((y % n) + n) % n; return v[y * n + x]; }
    public double Get(double x, double y) {
      int ix = (int)Math.Floor(x), iy = (int)Math.Floor(y); double fx = x - ix, fy = y - iy;
      fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
      return Lerp(Lerp(At(ix, iy), At(ix + 1, iy), fx), Lerp(At(ix, iy + 1), At(ix + 1, iy + 1), fx), fy);
    }
    public double Fbm(double x, double y, int oct) { double s = 0, a = 0.5, f = 1; for (int i = 0; i < oct; i++) { s += a * Get(x * f, y * f); f *= 2.03; a *= 0.5; } return s; }
  }

  // Paint dark hair over warm skin pixels inside a box.
  public static void HairOver(Bitmap b, int x0, int y0, int x1, int y1, int hx, int hy, int hw, int hh) {
    var a = Get(b); int w = b.Width; double sr = 0, sg = 0, sb = 0; int n = 0;
    for (int y = hy; y < hy + hh; y++) for (int x = hx; x < hx + hw; x++) { int p = a[y * w + x]; sr += (p >> 16) & 255; sg += (p >> 8) & 255; sb += p & 255; n++; }
    sr /= n; sg /= n; sb /= n; var rnd = new Random(7);
    for (int y = y0; y < y1; y++) for (int x = x0; x < x1; x++) {
      int i = y * w + x, p = a[i]; double r = (p >> 16) & 255, g = (p >> 8) & 255, bl = p & 255;
      double warm = (r - bl - 6) / 22.0; if (warm <= 0) continue; if (warm > 1) warm = 1;
      double j = (rnd.NextDouble() - 0.5) * 8;
      a[i] = Pk(255, Lerp(r, sr + j, warm), Lerp(g, sg + j, warm), Lerp(bl, sb + j, warm));
    }
    Put(b, a);
  }

  static Bitmap Resize(Bitmap s, int w, int h) {
    var b = new Bitmap(w, h, PixelFormat.Format32bppArgb);
    using (var g = Graphics.FromImage(b)) {
      g.InterpolationMode = InterpolationMode.HighQualityBicubic; g.PixelOffsetMode = PixelOffsetMode.HighQuality;
      using (var ia = new ImageAttributes()) { ia.SetWrapMode(WrapMode.TileFlipXY); g.DrawImage(s, new Rectangle(0, 0, w, h), 0, 0, s.Width, s.Height, GraphicsUnit.Pixel, ia); }
    }
    return b;
  }

  static List<double[]> Jagged(double ax, double ay, double bx, double by, double rough, int depth, Random r) {
    var pts = new List<double[]> { new[] { ax, ay }, new[] { bx, by } };
    double amp = rough;
    for (int d = 0; d < depth; d++) {
      var np = new List<double[]>();
      for (int i = 0; i < pts.Count - 1; i++) {
        var p = pts[i]; var q = pts[i + 1]; np.Add(p);
        double mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = q[0] - p[0], dy = q[1] - p[1], L = Math.Sqrt(dx * dx + dy * dy) + 1e-9;
        double off = (r.NextDouble() * 2 - 1) * amp; np.Add(new[] { mx - dy / L * off, my + dx / L * off });
      }
      np.Add(pts[pts.Count - 1]); pts = np; amp *= 0.55;
    }
    return pts;
  }
  // Signed distance to polyline (sign: side relative to segment direction), plus t along.
  static double PolyDist(List<double[]> pl, double x, double y, out double side) {
    double best = 1e9; side = 1;
    for (int i = 0; i < pl.Count - 1; i++) {
      double ax = pl[i][0], ay = pl[i][1], bx = pl[i + 1][0], by = pl[i + 1][1];
      double dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy + 1e-9, t = ((x - ax) * dx + (y - ay) * dy) / L2;
      if (t < 0) t = 0; if (t > 1) t = 1;
      double px = ax + t * dx - x, py = ay + t * dy - y, d = Math.Sqrt(px * px + py * py);
      if (d < best) { best = d; side = (dx * (y - ay) - dy * (x - ax)) >= 0 ? 1 : -1; }
    }
    return best;
  }

  // Returns an ARGB bitmap of a worn, creased, torn-corner print (transparent where torn away).
  public static Bitmap Photo(Bitmap src, int W, int H, int seed) {
    var rnd = new Random(seed);
    int bd = (int)Math.Round(W * 0.03);
    int iw = W - 2 * bd, ih = H - 2 * bd;
    var soft = Resize(Resize(src, (int)(iw * 0.62), (int)(ih * 0.62)), iw, ih);
    var s = Get(soft);
    var o = new int[W * H];
    var blot = new VNoise(seed + 1, 64); var blot2 = new VNoise(seed + 2, 64); var fib = new VNoise(seed + 3, 128);

    // Creases: one main diagonal fold, one weaker horizontal fold.
    var c1 = Jagged(W * 0.41, -4, W * 0.34, H + 4, 3.0, 6, rnd);
    var c2 = Jagged(-4, H * 0.58, W + 4, H * 0.53, 2.5, 6, rnd);
    // Torn-away top-left corner and a tear crack from the bottom edge.
    var tear = Jagged(W * 0.20, -2, -2, H * 0.27, 9.0, 7, rnd);
    var crack = Jagged(W * 0.83, H + 2, W * 0.80, H * 0.80, 4.0, 5, rnd);
    // Water stain.
    double wx = W * 0.80, wy = H * 0.22, wrx = W * 0.16, wry = H * 0.17;

    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
      double r, g, b, al = 255;
      bool inside = x >= bd && y >= bd && x < bd + iw && y < bd + ih;
      if (inside) {
        int p = s[(y - bd) * iw + (x - bd)];
        r = ((p >> 16) & 255) / 255.0; g = ((p >> 8) & 255) / 255.0; b = (p & 255) / 255.0;
        // Faded dyes: lifted blacks, rolled-off whites, cyan loss -> warm/magenta cast.
        r = 0.13 + 0.78 * r; g = 0.12 + 0.74 * g; b = 0.11 + 0.64 * b;
        r *= 1.07; g *= 1.0; b *= 0.93;
        double l = 0.299 * r + 0.587 * g + 0.114 * b;
        r = l + (r - l) * 0.62; g = l + (g - l) * 0.62; b = l + (b - l) * 0.62;
        double u = blot.Fbm(x / 70.0, y / 70.0, 4);
        double fade = 1 + 0.10 * u; r *= fade; g *= fade; b *= fade * (1 + 0.04 * blot2.Fbm(x / 50.0, y / 50.0, 3));
        double ed = Math.Min(Math.Min(x - bd, bd + iw - 1 - x), Math.Min(y - bd, bd + ih - 1 - y));
        if (ed < 30) { double k = (1 - ed / 30.0) * 0.12; r = Lerp(r, 0.86, k); g = Lerp(g, 0.80, k); b = Lerp(b, 0.62, k); }
        r *= 255; g *= 255; b *= 255;
      } else {
        double u = blot.Fbm(x / 40.0, y / 40.0, 3);
        r = 226 + 10 * u; g = 216 + 10 * u; b = 190 + 12 * u;
      }
      // Water stain: tide line and yellowed interior.
      double wd = Math.Sqrt((x - wx) * (x - wx) / (wrx * wrx) + (y - wy) * (y - wy) / (wry * wry)) + 0.12 * blot2.Fbm(x / 22.0, y / 22.0, 3);
      if (wd < 1.04) {
        double ring = Math.Exp(-Math.Pow((wd - 0.98) / 0.035, 2));
        double fill = wd < 0.98 ? 0.06 : 0;
        r = r * (1 - 0.10 * ring) + 14 * fill; g = g * (1 - 0.15 * ring) + 6 * fill; b = b * (1 - 0.30 * ring) - 10 * fill;
      }
      // Creases.
      double side;
      double d1 = PolyDist(c1, x, y, out side);
      if (d1 < 7) {
        double sh = side > 0 ? -0.13 * (1 - d1 / 7) : 0.09 * (1 - d1 / 7);
        r *= 1 + sh; g *= 1 + sh; b *= 1 + sh;
        double brk = fib.Get(y / 6.0, x / 40.0);
        if (d1 < 1.1 && brk > -0.35) { double k = 0.8 * (1 - d1 / 1.1) + 0.2; r = Lerp(r, 238, k); g = Lerp(g, 234, k); b = Lerp(b, 222, k); }
        else if (d1 < 4.5 && fib.Get(x / 2.2, y / 2.2) > 0.62) { r = Lerp(r, 236, 0.85); g = Lerp(g, 232, 0.85); b = Lerp(b, 220, 0.85); }
      }
      double d2 = PolyDist(c2, x, y, out side);
      if (d2 < 5) {
        double sh = side > 0 ? -0.08 * (1 - d2 / 5) : 0.06 * (1 - d2 / 5);
        r *= 1 + sh; g *= 1 + sh; b *= 1 + sh;
        double brk2 = fib.Get(x / 45.0, 7.7);
        if (d2 < 1.0 && brk2 > -0.25) { double k = 0.4 * (1 - d2) + 0.1; r = Lerp(r, 232, k); g = Lerp(g, 228, k); b = Lerp(b, 216, k); }
      }
      // Tear crack (paper split, not missing).
      double d3 = PolyDist(crack, x, y, out side);
      if (y > H * 0.79 && d3 < 3.2) {
        if (d3 < 1.3) { r = Lerp(r, 244, 0.9); g = Lerp(g, 241, 0.9); b = Lerp(b, 232, 0.9); }
        else if (side > 0) { r *= 0.82; g *= 0.82; b *= 0.82; }
      }
      // Torn-away corner.
      double d4 = PolyDist(tear, x, y, out side);
      bool cut = side > 0 && x < W * 0.4 && y < H * 0.5;
      if (cut && d4 > 0.6) al = 0;
      else if (d4 < 5.5) {
        double f = fib.Get(x / 1.7, y / 1.7);
        double k = d4 < 2.5 ? 0.92 : (5.5 - d4) / 3.0 * 0.5;
        r = Lerp(r, 242, k); g = Lerp(g, 238, k); b = Lerp(b, 228, k);
        if (cut || d4 < 1.2) al = 255 * Math.Max(0, Math.Min(1, 0.55 + f));
      }
      // Worn rounded outer edge.
      double oe = Math.Min(Math.Min(x, W - 1 - x), Math.Min(y, H - 1 - y));
      double cr = 7, cx = Math.Max(0, Math.Max(cr - x, x - (W - 1 - cr))), cy = Math.Max(0, Math.Max(cr - y, y - (H - 1 - cr)));
      if (cx > 0 && cy > 0) { double dd = Math.Sqrt(cx * cx + cy * cy); if (dd > cr) al = 0; else oe = Math.Min(oe, cr - dd); }
      if (al > 0 && oe < 2.5) { double f = fib.Get(x / 1.5 + 50, y / 1.5); r = Lerp(r, 240, 0.5); g = Lerp(g, 236, 0.5); b = Lerp(b, 226, 0.5); al *= Math.Max(0.15, Math.Min(1, 0.6 + f + oe * 0.3)); }
      o[y * W + x] = Pk(al, r, g, b);
    }

    // Scratches.
    for (int k = 0; k < 9; k++) {
      double x0 = rnd.NextDouble() * W, y0 = rnd.NextDouble() * H, ang = rnd.NextDouble() * Math.PI, len = 40 + rnd.NextDouble() * 160, bend = (rnd.NextDouble() - 0.5) * 0.004;
      double op = 0.25 + rnd.NextDouble() * 0.35;
      for (double t = 0; t < len; t += 0.5) {
        double a2 = ang + bend * t; int xx = (int)(x0 + Math.Cos(a2) * t), yy = (int)(y0 + Math.Sin(a2) * t);
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) break;
        int i = yy * W + xx, p = o[i]; if (((p >> 24) & 255) == 0) continue;
        double fo = op * (0.5 + 0.5 * Math.Sin(t * 0.07 + k));
        o[i] = Pk((p >> 24) & 255, Lerp((p >> 16) & 255, 240, fo), Lerp((p >> 8) & 255, 238, fo), Lerp(p & 255, 230, fo));
      }
    }
    // Dust and emulsion pits.
    for (int k = 0; k < 260; k++) {
      double x0 = rnd.NextDouble() * W, y0 = rnd.NextDouble() * H, rad = 0.4 + Math.Pow(rnd.NextDouble(), 3) * 2.2;
      bool white = rnd.NextDouble() < 0.7; double op = 0.4 + rnd.NextDouble() * 0.5;
      for (int yy = (int)(y0 - rad - 1); yy <= y0 + rad + 1; yy++) for (int xx = (int)(x0 - rad - 1); xx <= x0 + rad + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        double dd = Math.Sqrt((xx - x0) * (xx - x0) + (yy - y0) * (yy - y0)); if (dd > rad + 0.5) continue;
        double m = op * Math.Min(1, rad + 0.5 - dd);
        int i = yy * W + xx, p = o[i]; if (((p >> 24) & 255) == 0) continue;
        double tr = white ? 236 : 40, tg = white ? 233 : 36, tb = white ? 222 : 32;
        o[i] = Pk((p >> 24) & 255, Lerp((p >> 16) & 255, tr, m), Lerp((p >> 8) & 255, tg, m), Lerp(p & 255, tb, m));
      }
    }
    // Coarse grain.
    for (int i = 0; i < o.Length; i++) {
      int p = o[i]; if (((p >> 24) & 255) == 0) continue;
      double u1 = 1.0 - rnd.NextDouble(), u2 = rnd.NextDouble(), n = Math.Sqrt(-2 * Math.Log(u1)) * Math.Cos(2 * Math.PI * u2) * 9;
      o[i] = Pk((p >> 24) & 255, ((p >> 16) & 255) + n * 1.05, ((p >> 8) & 255) + n, (p & 255) + n * 0.95);
    }
    var res = new Bitmap(W, H, PixelFormat.Format32bppArgb); Put(res, o); return res;
  }

  // Cover a rect with mirrored tiles of a clean paper patch, feathered into the surroundings.
  public static void PaperFill(Bitmap b, int rx, int ry, int rw, int rh, int sx, int sy, int sw, int sh, int feather) {
    var a = Get(b); var o = (int[])a.Clone(); int w = b.Width;
    for (int y = ry; y < ry + rh; y++) for (int x = rx; x < rx + rw; x++) {
      int u = (x - rx) % (2 * sw); if (u >= sw) u = 2 * sw - 1 - u;
      int v = (y - ry) % (2 * sh); if (v >= sh) v = 2 * sh - 1 - v;
      int q = o[(sy + v) * w + sx + u], i = y * w + x, p = o[i];
      double e = Math.Min(Math.Min(x - rx, rx + rw - 1 - x), Math.Min(y - ry, ry + rh - 1 - y));
      double m = Math.Min(1, e / (double)feather);
      a[i] = Pk(255, Lerp((p >> 16) & 255, (q >> 16) & 255, m), Lerp((p >> 8) & 255, (q >> 8) & 255, m), Lerp(p & 255, q & 255, m));
    }
    Put(b, a);
  }

  static void Sample(int[] s, int sw, int sh, double u, double v, out double al, out double r, out double g, out double b) {
    al = r = g = b = 0;
    int iu = (int)Math.Floor(u), iv = (int)Math.Floor(v); double fu = u - iu, fv = v - iv;
    for (int k = 0; k < 4; k++) {
      int xx = iu + (k & 1), yy = iv + (k >> 1); double wt = ((k & 1) == 1 ? fu : 1 - fu) * ((k >> 1) == 1 ? fv : 1 - fv);
      if (xx < 0 || yy < 0 || xx >= sw || yy >= sh || wt == 0) continue;
      int p = s[yy * sw + xx]; double pa = ((p >> 24) & 255) / 255.0 * wt;
      al += pa; r += ((p >> 16) & 255) * pa; g += ((p >> 8) & 255) * pa; b += (p & 255) * pa;
    }
    if (al > 0) { r /= al; g /= al; b /= al; }
  }

  // Paste an ARGB photo rotated around (cx,cy) with a soft drop shadow.
  public static void Paste(Bitmap dst, Bitmap ph, double cx, double cy, double deg, double shOp, double shDx, double shDy) {
    var a = Get(dst); var s = Get(ph); int w = dst.Width, h = dst.Height, sw = ph.Width, sh = ph.Height;
    double th = deg * Math.PI / 180, co = Math.Cos(th), si = Math.Sin(th), R = Math.Sqrt(sw * sw + sh * sh) / 2 + 12;
    int x0 = Math.Max(0, (int)(cx - R)), x1 = Math.Min(w - 1, (int)(cx + R)), y0 = Math.Max(0, (int)(cy - R)), y1 = Math.Min(h - 1, (int)(cy + R));
    for (int y = y0; y <= y1; y++) for (int x = x0; x <= x1; x++) {
      int i = y * w + x, p = a[i]; double r = (p >> 16) & 255, g = (p >> 8) & 255, b = p & 255;
      // shadow: blurred alpha at offset
      double sa = 0; int n = 0;
      for (int dy = -4; dy <= 4; dy += 2) for (int dx = -4; dx <= 4; dx += 2) {
        double X = x - shDx + dx - cx, Y = y - shDy + dy - cy, u = co * X + si * Y + sw / 2.0, v = -si * X + co * Y + sh / 2.0;
        double al, rr, gg, bb; Sample(s, sw, sh, u, v, out al, out rr, out gg, out bb); sa += al; n++;
      }
      sa = sa / n * shOp; r *= 1 - sa; g *= 1 - sa; b *= 1 - sa;
      double X2 = x - cx, Y2 = y - cy, u2 = co * X2 + si * Y2 + sw / 2.0, v2 = -si * X2 + co * Y2 + sh / 2.0;
      double al2, r2, g2, b2; Sample(s, sw, sh, u2, v2, out al2, out r2, out g2, out b2);
      if (al2 > 0) { r = Lerp(r, r2, al2); g = Lerp(g, g2, al2); b = Lerp(b, b2, al2); }
      a[i] = Pk(255, r, g, b);
    }
    Put(dst, a);
  }
}
