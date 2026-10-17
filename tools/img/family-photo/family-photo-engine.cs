using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;

namespace FamilyPhoto
{
    public class F
    {
        public int W, H;
        public float[] R, G, B;
        public F(int w, int h) { W = w; H = h; R = new float[w * h]; G = new float[w * h]; B = new float[w * h]; }

        public static F FromBitmap(Bitmap src)
        {
            Bitmap bmp = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(bmp)) { g.DrawImage(src, new Rectangle(0, 0, src.Width, src.Height)); }
            F f = new F(bmp.Width, bmp.Height);
            BitmapData bd = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            byte[] buf = new byte[bd.Stride * bmp.Height];
            Marshal.Copy(bd.Scan0, buf, 0, buf.Length);
            bmp.UnlockBits(bd);
            for (int y = 0; y < f.H; y++)
                for (int x = 0; x < f.W; x++)
                {
                    int o = y * bd.Stride + x * 4, i = y * f.W + x;
                    f.B[i] = buf[o]; f.G[i] = buf[o + 1]; f.R[i] = buf[o + 2];
                }
            bmp.Dispose();
            return f;
        }

        public static F Load(string p)
        {
            using (Bitmap b = new Bitmap(p)) { return FromBitmap(b); }
        }

        public Bitmap ToBitmap()
        {
            Bitmap bmp = new Bitmap(W, H, PixelFormat.Format32bppArgb);
            BitmapData bd = bmp.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
            byte[] buf = new byte[bd.Stride * H];
            for (int y = 0; y < H; y++)
                for (int x = 0; x < W; x++)
                {
                    int o = y * bd.Stride + x * 4, i = y * W + x;
                    buf[o] = C8(B[i]); buf[o + 1] = C8(G[i]); buf[o + 2] = C8(R[i]); buf[o + 3] = 255;
                }
            Marshal.Copy(buf, 0, bd.Scan0, buf.Length);
            bmp.UnlockBits(bd);
            return bmp;
        }

        public void Save(string p)
        {
            using (Bitmap b = ToBitmap()) { b.Save(p, ImageFormat.Png); }
        }

        public F Clone()
        {
            F f = new F(W, H);
            Array.Copy(R, f.R, R.Length); Array.Copy(G, f.G, G.Length); Array.Copy(B, f.B, B.Length);
            return f;
        }

        public F Resize(int w, int h)
        {
            using (Bitmap src = ToBitmap())
            using (Bitmap dst = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            {
                using (Graphics g = Graphics.FromImage(dst))
                using (ImageAttributes ia = new ImageAttributes())
                {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.CompositingQuality = CompositingQuality.HighQuality;
                    ia.SetWrapMode(WrapMode.TileFlipXY);
                    g.DrawImage(src, new Rectangle(0, 0, w, h), 0, 0, W, H, GraphicsUnit.Pixel, ia);
                }
                return FromBitmap(dst);
            }
        }

        public F Crop(int x0, int y0, int w, int h)
        {
            F f = new F(w, h);
            for (int y = 0; y < h; y++)
                for (int x = 0; x < w; x++)
                {
                    int sx = Math.Min(W - 1, Math.Max(0, x0 + x)), sy = Math.Min(H - 1, Math.Max(0, y0 + y));
                    int i = y * w + x, j = sy * W + sx;
                    f.R[i] = R[j]; f.G[i] = G[j]; f.B[i] = B[j];
                }
            return f;
        }

        static byte C8(float v) { if (v < 0) return 0; if (v > 255) return 255; return (byte)(v + 0.5f); }

        public void Sample(double x, double y, out float r, out float g, out float b)
        {
            if (x < 0) x = 0; if (y < 0) y = 0;
            if (x > W - 1.001) x = W - 1.001; if (y > H - 1.001) y = H - 1.001;
            int x0 = (int)x, y0 = (int)y;
            float fx = (float)(x - x0), fy = (float)(y - y0);
            int i00 = y0 * W + x0, i10 = i00 + 1, i01 = i00 + W, i11 = i01 + 1;
            float w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
            r = R[i00] * w00 + R[i10] * w10 + R[i01] * w01 + R[i11] * w11;
            g = G[i00] * w00 + G[i10] * w10 + G[i01] * w01 + G[i11] * w11;
            b = B[i00] * w00 + B[i10] * w10 + B[i01] * w01 + B[i11] * w11;
        }
    }

    public static class Ops
    {
        // homography mapping src quad (x0,y0..x3,y3) to dst quad
        public static double[] Homo(double[] s, double[] d)
        {
            double[,] M = new double[8, 9];
            for (int i = 0; i < 4; i++)
            {
                double x = s[2 * i], y = s[2 * i + 1], u = d[2 * i], v = d[2 * i + 1];
                int a = 2 * i, b = 2 * i + 1;
                M[a, 0] = x; M[a, 1] = y; M[a, 2] = 1; M[a, 6] = -u * x; M[a, 7] = -u * y; M[a, 8] = u;
                M[b, 3] = x; M[b, 4] = y; M[b, 5] = 1; M[b, 6] = -v * x; M[b, 7] = -v * y; M[b, 8] = v;
            }
            for (int c = 0; c < 8; c++)
            {
                int p = c;
                for (int r = c + 1; r < 8; r++) if (Math.Abs(M[r, c]) > Math.Abs(M[p, c])) p = r;
                for (int k = 0; k < 9; k++) { double t = M[c, k]; M[c, k] = M[p, k]; M[p, k] = t; }
                for (int r = 0; r < 8; r++)
                {
                    if (r == c) continue;
                    double f = M[r, c] / M[c, c];
                    for (int k = c; k < 9; k++) M[r, k] -= f * M[c, k];
                }
            }
            double[] h = new double[9];
            for (int i = 0; i < 8; i++) h[i] = M[i, 8] / M[i, i];
            h[8] = 1;
            return h;
        }

        public static void Map(double[] h, double x, double y, out double u, out double v)
        {
            double w = h[6] * x + h[7] * y + h[8];
            u = (h[0] * x + h[1] * y + h[2]) / w;
            v = (h[3] * x + h[4] * y + h[5]) / w;
        }

        public static double[] Rect(double w, double h) { return new double[] { 0, 0, w, 0, w, h, 0, h }; }

        public static double[] Inset(double[] q, double fu, double fv)
        {
            double[] h = Homo(Rect(1, 1), q);
            double[] uv = new double[] { fu, fv, 1 - fu, fv, 1 - fu, 1 - fv, fu, 1 - fv };
            double[] r = new double[8];
            for (int i = 0; i < 4; i++) { double a, b; Map(h, uv[2 * i], uv[2 * i + 1], out a, out b); r[2 * i] = a; r[2 * i + 1] = b; }
            return r;
        }

        static float Lum(float r, float g, float b) { return 0.3f * r + 0.59f * g + 0.11f * b; }

        // gain grid over photo uv: old photo region (quad in old image) vs master photo
        public static float[] GainGrid(F old, double[] oldPhotoQuad, F photo, int gw, int gh)
        {
            double[] h = Homo(Rect(1, 1), oldPhotoQuad);
            float[] lg = new float[gw * gh];
            double so0 = 0, so1 = 0, so2 = 0, st0 = 0, st1 = 0, st2 = 0;
            int n = 10;
            for (int cy = 0; cy < gh; cy++)
                for (int cx = 0; cx < gw; cx++)
                {
                    double lo = 0, lt = 0;
                    for (int sy = 0; sy < n; sy++)
                        for (int sx = 0; sx < n; sx++)
                        {
                            double u = (cx + (sx + 0.5) / n) / gw, v = (cy + (sy + 0.5) / n) / gh;
                            double ox, oy; Map(h, u, v, out ox, out oy);
                            float r1, g1, b1, r2, g2, b2;
                            old.Sample(ox, oy, out r1, out g1, out b1);
                            photo.Sample(u * (photo.W - 1), v * (photo.H - 1), out r2, out g2, out b2);
                            lo += Lum(r1, g1, b1); lt += Lum(r2, g2, b2);
                            so0 += r1; so1 += g1; so2 += b1; st0 += r2; st1 += g2; st2 += b2;
                        }
                    float gl = (float)((lo + 1) / (lt + 1));
                    lg[cy * gw + cx] = Math.Max(0.02f, Math.Min(4f, gl));
                }
            float[] sm = new float[gw * gh];
            for (int cy = 0; cy < gh; cy++)
                for (int cx = 0; cx < gw; cx++)
                {
                    float s = 0, w = 0;
                    for (int dy = -1; dy <= 1; dy++)
                        for (int dx = -1; dx <= 1; dx++)
                        {
                            int x = cx + dx, y = cy + dy;
                            if (x < 0 || y < 0 || x >= gw || y >= gh) continue;
                            float k = (dx == 0 && dy == 0) ? 2f : 1f;
                            s += lg[y * gw + x] * k; w += k;
                        }
                    sm[cy * gw + cx] = s / w;
                }
            double lo2 = Lum((float)so0, (float)so1, (float)so2), lt2 = Lum((float)st0, (float)st1, (float)st2);
            float cr = (float)((so0 / lo2) / (st0 / lt2)), cg = (float)((so1 / lo2) / (st1 / lt2)), cb = (float)((so2 / lo2) / (st2 / lt2));
            float[] res = new float[gw * gh * 3];
            for (int i = 0; i < gw * gh; i++) { res[3 * i] = sm[i] * cr; res[3 * i + 1] = sm[i] * cg; res[3 * i + 2] = sm[i] * cb; }
            return res;
        }

        public static float[] FlatGain(float r, float g, float b)
        {
            return new float[] { r, g, b };
        }

        static void GainAt(float[] grid, int gw, int gh, double u, double v, out float r, out float g, out float b)
        {
            double x = u * gw - 0.5, y = v * gh - 0.5;
            if (x < 0) x = 0; if (y < 0) y = 0; if (x > gw - 1) x = gw - 1; if (y > gh - 1) y = gh - 1;
            int x0 = (int)Math.Floor(x), y0 = (int)Math.Floor(y);
            int x1 = Math.Min(gw - 1, x0 + 1), y1 = Math.Min(gh - 1, y0 + 1);
            float fx = (float)(x - x0), fy = (float)(y - y0);
            float[] c = new float[3];
            for (int k = 0; k < 3; k++)
            {
                float a = grid[3 * (y0 * gw + x0) + k], b2 = grid[3 * (y0 * gw + x1) + k];
                float c2 = grid[3 * (y1 * gw + x0) + k], d = grid[3 * (y1 * gw + x1) + k];
                c[k] = (a * (1 - fx) + b2 * fx) * (1 - fy) + (c2 * (1 - fx) + d * fx) * fy;
            }
            r = c[0]; g = c[1]; b = c[2];
        }

        public static void Blur1(float[] a, int w, int h, float sigma)
        {
            if (sigma <= 0.05f) return;
            int rad = (int)Math.Ceiling(sigma * 3);
            float[] k = new float[2 * rad + 1]; float s = 0;
            for (int i = -rad; i <= rad; i++) { k[i + rad] = (float)Math.Exp(-i * i / (2.0 * sigma * sigma)); s += k[i + rad]; }
            for (int i = 0; i < k.Length; i++) k[i] /= s;
            float[] t = new float[a.Length];
            for (int y = 0; y < h; y++)
                for (int x = 0; x < w; x++)
                {
                    float v = 0;
                    for (int i = -rad; i <= rad; i++) { int xx = Math.Min(w - 1, Math.Max(0, x + i)); v += a[y * w + xx] * k[i + rad]; }
                    t[y * w + x] = v;
                }
            for (int y = 0; y < h; y++)
                for (int x = 0; x < w; x++)
                {
                    float v = 0;
                    for (int i = -rad; i <= rad; i++) { int yy = Math.Min(h - 1, Math.Max(0, y + i)); v += t[yy * w + x] * k[i + rad]; }
                    a[y * w + x] = v;
                }
        }

        public static float NoiseStd(F img, int x0, int y0, int x1, int y1, int ring)
        {
            double s = 0, s2 = 0; int n = 0;
            for (int y = y0 - ring; y < y1 + ring; y++)
                for (int x = x0 - ring; x < x1 + ring; x++)
                {
                    if (x < 1 || y < 1 || x >= img.W - 1 || y >= img.H - 1) continue;
                    if (x >= x0 && x < x1 && y >= y0 && y < y1) continue;
                    int i = y * img.W + x;
                    float c = Lum(img.R[i], img.G[i], img.B[i]);
                    float m = (Lum(img.R[i - 1], img.G[i - 1], img.B[i - 1]) + Lum(img.R[i + 1], img.G[i + 1], img.B[i + 1]) +
                               Lum(img.R[i - img.W], img.G[i - img.W], img.B[i - img.W]) + Lum(img.R[i + img.W], img.G[i + img.W], img.B[i + img.W])) / 4f;
                    double d = c - m; s += d; s2 += d * d; n++;
                }
            if (n < 10) return 0;
            double var = s2 / n - (s / n) * (s / n);
            return (float)Math.Sqrt(Math.Max(0, var) / 1.25);
        }

        public static void AddNoise(F img, float[] mask, int mx, int my, int mw, int mh, float sigma, int seed)
        {
            if (sigma <= 0) return;
            Random rnd = new Random(seed);
            for (int y = 0; y < mh; y++)
                for (int x = 0; x < mw; x++)
                {
                    int X = mx + x, Y = my + y;
                    double u1 = 1.0 - rnd.NextDouble(), u2 = rnd.NextDouble();
                    double u3 = 1.0 - rnd.NextDouble(), u4 = rnd.NextDouble();
                    if (X < 0 || Y < 0 || X >= img.W || Y >= img.H) continue;
                    float m = mask == null ? 1f : mask[y * mw + x];
                    if (m <= 0) continue;
                    float nl = (float)(Math.Sqrt(-2 * Math.Log(u1)) * Math.Cos(2 * Math.PI * u2)) * sigma * m;
                    float nc = (float)(Math.Sqrt(-2 * Math.Log(u3)) * Math.Cos(2 * Math.PI * u4)) * sigma * 0.35f * m;
                    int i = Y * img.W + X;
                    img.R[i] += nl + nc; img.G[i] += nl; img.B[i] += nl - nc;
                }
        }

        // Coons-patch fill of rect [x0,x1) x [y0,y1) from surrounding pixels, plus matching grain
        public static void Erase(F img, int x0, int y0, int x1, int y1, int seed)
        {
            int W = img.W, H = img.H;
            float sig = NoiseStd(img, x0, y0, x1, y1, 8);
            bool hasL = x0 >= 3, hasR = x1 <= W - 3, hasT = y0 >= 3, hasB = y1 <= H - 3;
            int cx0 = Math.Max(0, x0), cx1 = Math.Min(W, x1), cy0 = Math.Max(0, y0), cy1 = Math.Min(H, y1);
            int w = cx1 - cx0, h = cy1 - cy0;
            if (w <= 0 || h <= 0) return;
            float[][] chans = new float[][] { img.R, img.G, img.B };
            foreach (float[] ch in chans)
            {
                float[] L = new float[h], Rr = new float[h], T = new float[w], Bt = new float[w];
                for (int y = 0; y < h; y++)
                {
                    int Y = cy0 + y;
                    if (hasL) { float s = 0; for (int k = 1; k <= 3; k++) s += ch[Y * W + x0 - k]; L[y] = s / 3; }
                    if (hasR) { float s = 0; for (int k = 0; k < 3; k++) s += ch[Y * W + x1 + k]; Rr[y] = s / 3; }
                }
                for (int x = 0; x < w; x++)
                {
                    int X = cx0 + x;
                    if (hasT) { float s = 0; for (int k = 1; k <= 3; k++) s += ch[(y0 - k) * W + X]; T[x] = s / 3; }
                    if (hasB) { float s = 0; for (int k = 0; k < 3; k++) s += ch[(y1 + k) * W + X]; Bt[x] = s / 3; }
                }
                Smooth(L, 4); Smooth(Rr, 4); Smooth(T, 4); Smooth(Bt, 4);
                if (!hasL) for (int y = 0; y < h; y++) L[y] = hasR ? Rr[y] : 0;
                if (!hasR) for (int y = 0; y < h; y++) Rr[y] = L[y];
                if (!hasT) for (int x = 0; x < w; x++) { float s = (x + 0.5f) / w; T[x] = (1 - s) * L[0] + s * Rr[0]; }
                if (!hasB) for (int x = 0; x < w; x++) { float s = (x + 0.5f) / w; Bt[x] = (1 - s) * L[h - 1] + s * Rr[h - 1]; }
                float c00 = (L[0] + T[0]) / 2, c10 = (Rr[0] + T[w - 1]) / 2, c01 = (L[h - 1] + Bt[0]) / 2, c11 = (Rr[h - 1] + Bt[w - 1]) / 2;
                for (int y = 0; y < h; y++)
                    for (int x = 0; x < w; x++)
                    {
                        float s = (x + 0.5f) / w, t = (y + 0.5f) / h;
                        float v = (1 - s) * L[y] + s * Rr[y] + (1 - t) * T[x] + t * Bt[x]
                                - ((1 - s) * (1 - t) * c00 + s * (1 - t) * c10 + (1 - s) * t * c01 + s * t * c11);
                        ch[(cy0 + y) * W + cx0 + x] = v;
                    }
            }
            AddNoise(img, null, cx0, cy0, w, h, sig, seed);
        }

        static void Smooth(float[] a, int r)
        {
            float[] t = (float[])a.Clone();
            for (int i = 0; i < a.Length; i++)
            {
                float s = 0; int n = 0;
                for (int k = -r; k <= r; k++) { int j = i + k; if (j < 0 || j >= a.Length) continue; s += t[j]; n++; }
                a[i] = s / n;
            }
        }

        // tex: frame texture; photoRect: x,y,w,h of the photo inside tex (gain grid uv space)
        public static void Place(F dst, F tex, double[] quad, float[] grid, int gw, int gh, double[] photoRect,
                                 float blur, float noise, float shadow, float sdx, float sdy, float ssig, int seed)
        {
            double minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
            for (int i = 0; i < 4; i++) { minx = Math.Min(minx, quad[2 * i]); maxx = Math.Max(maxx, quad[2 * i]); miny = Math.Min(miny, quad[2 * i + 1]); maxy = Math.Max(maxy, quad[2 * i + 1]); }
            double qw = maxx - minx, qh = maxy - miny;
            F t = tex;
            if (qw * 2.2 < tex.W) t = tex.Resize((int)Math.Ceiling(qw * 2.2), (int)Math.Ceiling(qw * 2.2 * tex.H / tex.W));
            double sx = (double)t.W / tex.W, sy = (double)t.H / tex.H;
            int pad = (int)Math.Ceiling(Math.Max(Math.Abs(sdx), Math.Abs(sdy)) + ssig * 3 + blur * 3 + 4);
            int lx = (int)Math.Floor(minx) - pad, ly = (int)Math.Floor(miny) - pad;
            int lw = (int)Math.Ceiling(maxx) + pad - lx, lh = (int)Math.Ceiling(maxy) + pad - ly;
            float[] LR = new float[lw * lh], LG = new float[lw * lh], LB = new float[lw * lh], LA = new float[lw * lh];
            double[] hinv = Homo(quad, Rect(tex.W, tex.H));
            int ss = 4;
            for (int y = 0; y < lh; y++)
                for (int x = 0; x < lw; x++)
                {
                    float ar = 0, ag = 0, ab = 0; int cnt = 0;
                    for (int j = 0; j < ss; j++)
                        for (int i = 0; i < ss; i++)
                        {
                            double px = lx + x + (i + 0.5) / ss, py = ly + y + (j + 0.5) / ss, u, v;
                            Map(hinv, px, py, out u, out v);
                            if (u < 0 || v < 0 || u >= tex.W || v >= tex.H) continue;
                            float r, g, b, gr, gg, gb;
                            t.Sample(u * sx - 0.5, v * sy - 0.5, out r, out g, out b);
                            double pu = (u - photoRect[0]) / photoRect[2], pv = (v - photoRect[1]) / photoRect[3];
                            pu = Math.Max(0, Math.Min(1, pu)); pv = Math.Max(0, Math.Min(1, pv));
                            if (grid.Length == 3) { gr = grid[0]; gg = grid[1]; gb = grid[2]; }
                            else GainAt(grid, gw, gh, pu, pv, out gr, out gg, out gb);
                            ar += r * gr; ag += g * gg; ab += b * gb; cnt++;
                        }
                    int k = y * lw + x;
                    float n2 = ss * ss;
                    LR[k] = ar / n2; LG[k] = ag / n2; LB[k] = ab / n2; LA[k] = cnt / n2;
                }
            if (shadow > 0)
            {
                float[] SA = new float[lw * lh];
                int idx = (int)Math.Round(sdx), idy = (int)Math.Round(sdy);
                for (int y = 0; y < lh; y++)
                    for (int x = 0; x < lw; x++)
                    {
                        int xx = x - idx, yy = y - idy;
                        if (xx >= 0 && yy >= 0 && xx < lw && yy < lh) SA[y * lw + x] = LA[yy * lw + xx];
                    }
                Blur1(SA, lw, lh, ssig);
                for (int y = 0; y < lh; y++)
                    for (int x = 0; x < lw; x++)
                    {
                        int X = lx + x, Y = ly + y;
                        if (X < 0 || Y < 0 || X >= dst.W || Y >= dst.H) continue;
                        float f = 1 - shadow * SA[y * lw + x];
                        int i = Y * dst.W + X;
                        dst.R[i] *= f; dst.G[i] *= f; dst.B[i] *= f;
                    }
            }
            Blur1(LR, lw, lh, blur); Blur1(LG, lw, lh, blur); Blur1(LB, lw, lh, blur); Blur1(LA, lw, lh, blur);
            for (int y = 0; y < lh; y++)
                for (int x = 0; x < lw; x++)
                {
                    int X = lx + x, Y = ly + y;
                    if (X < 0 || Y < 0 || X >= dst.W || Y >= dst.H) continue;
                    int k = y * lw + x, i = Y * dst.W + X;
                    float a = Math.Min(1f, LA[k]);
                    dst.R[i] = LR[k] + dst.R[i] * (1 - a);
                    dst.G[i] = LG[k] + dst.G[i] * (1 - a);
                    dst.B[i] = LB[k] + dst.B[i] * (1 - a);
                }
            if (noise < 0) noise = NoiseStd(dst, (int)minx, (int)miny, (int)maxx, (int)maxy, 10);
            AddNoise(dst, LA, lx, ly, lw, lh, noise, seed);
        }

        // ---------- texture building ----------
        static float Hash(int x, int y, int s)
        {
            unchecked
            {
                int h = x * 374761393 + y * 668265263 + s * 982451653;
                h = (h ^ (h >> 13)) * 1274126177;
                h = h ^ (h >> 16);
                return (h & 0xffffff) / 16777215f;
            }
        }

        static float VNoise(double x, double y, int s)
        {
            int x0 = (int)Math.Floor(x), y0 = (int)Math.Floor(y);
            float fx = (float)(x - x0), fy = (float)(y - y0);
            fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
            float a = Hash(x0, y0, s), b = Hash(x0 + 1, y0, s), c = Hash(x0, y0 + 1, s), d = Hash(x0 + 1, y0 + 1, s);
            return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
        }

        static float Grain(double along, double across, int s)
        {
            float n = 0.5f * VNoise(along * 0.012, across * 0.45, s) + 0.3f * VNoise(along * 0.035, across * 0.9, s + 7) + 0.2f * VNoise(along * 0.15, across * 1.6, s + 13);
            return n;
        }

        // front: moulding m px around a photo of pw x ph
        public static F BuildFront(F photo, int m, float[] wood)
        {
            int pw = photo.W, ph = photo.H, W = pw + 2 * m, H = ph + 2 * m;
            F f = new F(W, H);
            for (int y = 0; y < H; y++)
                for (int x = 0; x < W; x++)
                {
                    int i = y * W + x;
                    int dl = x, dr = W - 1 - x, dt = y, db = H - 1 - y;
                    int dmin = Math.Min(Math.Min(dl, dr), Math.Min(dt, db));
                    if (dmin >= m)
                    {
                        int px = x - m, py = y - m;
                        int j = py * pw + px;
                        float k = 1f;
                        k *= 1f - 0.42f * (float)Math.Exp(-py / 5.0);
                        k *= 1f - 0.28f * (float)Math.Exp(-px / 4.0);
                        k *= 1f - 0.12f * (float)Math.Exp(-(pw - 1 - px) / 3.0);
                        k *= 1f - 0.10f * (float)Math.Exp(-(ph - 1 - py) / 3.0);
                        float sheen = (float)(0.035 * Math.Max(0, 1 - Math.Abs((px + py * 0.6) / (pw * 1.0) - 0.75) / 0.12));
                        f.R[i] = photo.R[j] * k + 255 * sheen;
                        f.G[i] = photo.G[j] * k + 255 * sheen;
                        f.B[i] = photo.B[j] * k + 255 * sheen;
                        continue;
                    }
                    int side; // 0 top 1 right 2 bottom 3 left
                    if (dmin == dt && dt <= dl && dt <= dr) side = 0;
                    else if (dmin == db && db <= dl && db <= dr) side = 2;
                    else if (dmin == dl) side = 3; else side = 1;
                    double along = (side == 0 || side == 2) ? x : y;
                    double c = dmin;
                    float g = Grain(along, c, 11 + side * 5);
                    float tone = 0.80f + 0.42f * g;
                    double cf = c / m;
                    float prof;
                    bool lit = side == 0 || side == 3;
                    if (cf < 0.05) prof = 0.55f;
                    else if (cf < 0.22) { double t = (cf - 0.05) / 0.17; prof = lit ? (float)(1.30 - 0.30 * t) : (float)(0.78 + 0.22 * t); }
                    else if (cf < 0.80) prof = 1.0f + (lit ? 0.04f : -0.04f);
                    else if (cf < 0.90) prof = lit ? 1.16f : 0.92f;
                    else prof = 0.42f;
                    int ds = Math.Abs(Math.Min(dl, dr) - Math.Min(dt, db));
                    float mitre = ds < 1 ? 0.72f : 1f;
                    float k2 = tone * prof * mitre;
                    f.R[i] = wood[0] * k2; f.G[i] = wood[1] * k2; f.B[i] = wood[2] * k2;
                }
            return f;
        }

        public static F Grade(F src, float mul, float r, float g, float b, float desat, float lift)
        {
            F f = src.Clone();
            for (int i = 0; i < f.R.Length; i++)
            {
                float l = Lum(f.R[i], f.G[i], f.B[i]);
                float rr = f.R[i] + (l - f.R[i]) * desat, gg = f.G[i] + (l - f.G[i]) * desat, bb = f.B[i] + (l - f.B[i]) * desat;
                f.R[i] = rr * mul * r + lift; f.G[i] = gg * mul * g + lift; f.B[i] = bb * mul * b + lift;
            }
            return f;
        }

        // multiply dst region by ratio (num/den) — transfers a darker mark (pencil) from num over den
        public static void TransferRatio(F dst, F num, F den, int sx, int sy, int w, int h, double dx, double dy, double scale, float strength)
        {
            int ow = (int)Math.Ceiling(w * scale), oh = (int)Math.Ceiling(h * scale);
            for (int y = 0; y < oh; y++)
                for (int x = 0; x < ow; x++)
                {
                    int X = (int)Math.Round(dx) + x, Y = (int)Math.Round(dy) + y;
                    if (X < 0 || Y < 0 || X >= dst.W || Y >= dst.H) continue;
                    double u = sx + x / scale, v = sy + y / scale;
                    float r1, g1, b1, r2, g2, b2;
                    num.Sample(u, v, out r1, out g1, out b1);
                    den.Sample(u, v, out r2, out g2, out b2);
                    int i = Y * dst.W + X;
                    dst.R[i] *= 1 + strength * ((r1 + 1) / (r2 + 1) - 1);
                    dst.G[i] *= 1 + strength * ((g1 + 1) / (g2 + 1) - 1);
                    dst.B[i] *= 1 + strength * ((b1 + 1) / (b2 + 1) - 1);
                }
        }

        public static void Paste(F dst, F src, int dx, int dy)
        {
            for (int y = 0; y < src.H; y++)
                for (int x = 0; x < src.W; x++)
                {
                    int X = dx + x, Y = dy + y;
                    if (X < 0 || Y < 0 || X >= dst.W || Y >= dst.H) continue;
                    int i = Y * dst.W + X, j = y * src.W + x;
                    dst.R[i] = src.R[j]; dst.G[i] = src.G[j]; dst.B[i] = src.B[j];
                }
        }

        // output pixel (x,y) = src at homography(rect rw x rh -> srcQuad) of (x+0.5-ox, y+0.5-oy)
        public static F Rectify(F src, double[] srcQuad, double rw, double rh, double ox, double oy, int W, int H)
        {
            double[] h = Homo(Rect(rw, rh), srcQuad);
            F f = new F(W, H);
            for (int y = 0; y < H; y++)
                for (int x = 0; x < W; x++)
                {
                    double u, v; float r, g, b;
                    Map(h, x + 0.5 - ox, y + 0.5 - oy, out u, out v);
                    src.Sample(u - 0.5, v - 0.5, out r, out g, out b);
                    int i = y * W + x;
                    f.R[i] = r; f.G[i] = g; f.B[i] = b;
                }
            return f;
        }

        public static F FlipV(F s)
        {
            F f = new F(s.W, s.H);
            for (int y = 0; y < s.H; y++)
            {
                Array.Copy(s.R, (s.H - 1 - y) * s.W, f.R, y * s.W, s.W);
                Array.Copy(s.G, (s.H - 1 - y) * s.W, f.G, y * s.W, s.W);
                Array.Copy(s.B, (s.H - 1 - y) * s.W, f.B, y * s.W, s.W);
            }
            return f;
        }

        // paste with linear fade-in over the first fadeTop rows / fadeLeft columns
        public static void PasteFade(F dst, F src, int dx, int dy, int fadeTop, int fadeLeft)
        {
            for (int y = 0; y < src.H; y++)
                for (int x = 0; x < src.W; x++)
                {
                    int X = dx + x, Y = dy + y;
                    if (X < 0 || Y < 0 || X >= dst.W || Y >= dst.H) continue;
                    float a = 1f;
                    if (fadeTop > 0 && y < fadeTop) a *= (y + 0.5f) / fadeTop;
                    if (fadeLeft > 0 && x < fadeLeft) a *= (x + 0.5f) / fadeLeft;
                    int i = Y * dst.W + X, j = y * src.W + x;
                    dst.R[i] = src.R[j] * a + dst.R[i] * (1 - a);
                    dst.G[i] = src.G[j] * a + dst.G[i] * (1 - a);
                    dst.B[i] = src.B[j] * a + dst.B[i] * (1 - a);
                }
        }

        public static void Vignette(F f, float strength, double cx, double cy)
        {
            double r0 = Math.Sqrt(f.W * f.W + f.H * f.H) / 2;
            for (int y = 0; y < f.H; y++)
                for (int x = 0; x < f.W; x++)
                {
                    double d = Math.Sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / r0;
                    float k = (float)(1 - strength * d * d);
                    int i = y * f.W + x;
                    f.R[i] *= k; f.G[i] *= k; f.B[i] *= k;
                }
        }

        public static double MeanAbsDiff(F a, F b, int x0, int y0, int x1, int y1)
        {
            double s = 0; int n = 0;
            for (int y = y0; y < y1; y++)
                for (int x = x0; x < x1; x++)
                {
                    int i = y * a.W + x;
                    s += Math.Abs(a.R[i] - b.R[i]) + Math.Abs(a.G[i] - b.G[i]) + Math.Abs(a.B[i] - b.B[i]); n += 3;
                }
            return s / n;
        }
    }
}
