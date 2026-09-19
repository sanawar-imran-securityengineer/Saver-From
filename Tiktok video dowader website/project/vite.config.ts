import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

function isTikTokUrl(value: string) {
  try {
    const parsed = new URL(value);
    return ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com'].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function firstUrl(values: (string | undefined | null)[]): string | undefined {
  return values.find((v): v is string => typeof v === 'string' && /^https?:\/\//i.test(v));
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fromTikWM(tiktokUrl: string) {
  const res = await fetchWithTimeout(
    `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}&hd=1`,
    { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' } }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: any = await res.json();
  const payload = data?.data || data?.result || data;
  const noWatermark = firstUrl([payload?.play, payload?.hdplay, payload?.no_watermark, payload?.noWatermark, payload?.url]);
  const watermark = firstUrl([payload?.wmplay, payload?.watermark]);
  const audio = firstUrl([payload?.music, payload?.music_info?.play]);
  const sizes = [
    noWatermark && { label: 'No watermark · HD', value: 'HD', url: noWatermark },
    watermark && { label: 'With watermark', value: 'SD', url: watermark },
    audio && { label: 'Audio · MP3', value: 'MP3', url: audio },
  ].filter(Boolean);
  if (!noWatermark && !watermark) throw new Error('No video URL returned from TikWM');
  return { source: 'tikwm', videoUrl: noWatermark || watermark, sizes, rawResponse: data };
}

async function fromTDown(tiktokUrl: string) {
  const res = await fetchWithTimeout(
    `https://tdownv4.sl-bjs.workers.dev/?down=${encodeURIComponent(tiktokUrl)}`,
    { headers: { Accept: 'application/json' } }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: any = await res.json();
  const videoUrl = firstUrl([data?.url, data?.data?.url, data?.video?.url, data?.result?.url, data?.data?.play]);
  if (!videoUrl) throw new Error('No video URL from TDown');
  return { source: 'tdown', videoUrl, rawResponse: data };
}

function proxyDownloadPlugin() {
  return {
    name: 'proxy-download',
    configureServer(server: any) {
      server.middlewares.use('/api/download', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }
        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body || '{}');
            const targetUrl = typeof parsed?.url === 'string' ? parsed.url.trim() : '';
            if (!targetUrl || !isTikTokUrl(targetUrl)) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: false, error: 'Please provide a valid TikTok video link.' }));
            }

            const sources = [fromTikWM, fromTDown];
            for (const source of sources) {
              try {
                const result = await source(targetUrl);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: true, ...result }));
              } catch (err: any) {
                console.warn(`[dev /api/download] source failed: ${err?.message}`);
              }
            }

            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: 'No download source could access this video. Please try again.' }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
          }
        });
      });

      server.middlewares.use('/api/proxy-download', async (req: any, res: any) => {
        try {
          const parsed = new URL(req.url, 'http://localhost');
          const targetUrl = parsed.searchParams.get('url');
          const filename = parsed.searchParams.get('filename') || 'tiktok_video.mp4';
          if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
            res.statusCode = 400;
            return res.end('Invalid URL');
          }
          const upstream = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Referer': 'https://www.tiktok.com/',
            },
          });
          if (!upstream.ok) {
            res.statusCode = upstream.status;
            return res.end('Upstream error');
          }
          res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '')}"`);
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
          const contentLength = upstream.headers.get('content-length');
          if (contentLength) res.setHeader('Content-Length', contentLength);

          const { Readable } = await import('node:stream');
          if (upstream.body) {
            Readable.fromWeb(upstream.body as any).pipe(res);
          } else {
            res.end();
          }
        } catch (err: any) {
          res.statusCode = 500;
          res.end(err?.message || 'Server error');
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), proxyDownloadPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
