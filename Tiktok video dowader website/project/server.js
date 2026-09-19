import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT) || 3000;
const requestTimeout = 7000;

app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

function isTikTokUrl(value) {
  try {
    const parsed = new URL(value);
    return ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com'].includes(parsed.hostname);
  } catch {
    return false;
  }
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'TikDownloader/1.0' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'text/html', 'User-Agent': 'Mozilla/5.0' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function firstUrl(values) {
  return values.find((value) => typeof value === 'string' && /^https?:\/\//i.test(value));
}

function resultFrom(source, videoUrl, rawResponse, sizes = []) {
  if (!videoUrl) throw new Error(`${source} returned no video URL`);
  return { source, videoUrl, rawResponse, sizes };
}

async function fromTDown(tiktokUrl) {
  const data = await fetchJson(`https://tdownv4.sl-bjs.workers.dev/?down=${encodeURIComponent(tiktokUrl)}`);
  const videoUrl = firstUrl([data?.url, data?.data?.url, data?.video?.url, data?.result?.url, data?.data?.play]);
  return resultFrom('free-api-1', videoUrl, data);
}

async function fromTikWM(tiktokUrl) {
  const data = await fetchJson(`https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`);
  const payload = data?.data || data?.result || data;
  const noWatermark = firstUrl([payload?.play, payload?.hdplay, payload?.no_watermark, payload?.noWatermark, payload?.url]);
  const watermark = firstUrl([payload?.wmplay, payload?.watermark]);
  const audio = firstUrl([payload?.music, payload?.music_info?.play]);
  const sizes = [
    noWatermark && { label: 'No watermark · HD', value: 'HD', url: noWatermark },
    watermark && { label: 'With watermark', value: 'SD', url: watermark },
    audio && { label: 'Audio · MP3', value: 'MP3', url: audio },
  ].filter(Boolean);
  return resultFrom('free-api-2', noWatermark || watermark, data, sizes);
}

async function fromTikTokPage(tiktokUrl) {
  const html = await fetchText(tiktokUrl);
  const mp4Matches = [...html.matchAll(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/gi)].map((m) => m[0].replace(/\\u0026/g, '&'));
  const jsonMatches = [...html.matchAll(/"(?:playAddr|downloadAddr|playAddress|url)"\s*:\s*"(https?:\/\/[^"]+)"/gi)].map((m) => m[1].replace(/\\u0026/g, '&'));
  const videoUrl = firstUrl([...mp4Matches, ...jsonMatches]);
  return resultFrom('html-fallback', videoUrl, { matched: Boolean(videoUrl) });
}

const sources = [
  { name: 'free-api-1', run: fromTDown },
  { name: 'free-api-2', run: fromTikWM },
  { name: 'html-fallback', run: fromTikTokPage },
];

app.post('/api/download', async (req, res) => {
  const submittedUrl = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
  if (!submittedUrl || !isTikTokUrl(submittedUrl)) {
    return res.status(400).json({ success: false, error: 'Please provide a valid TikTok video link.' });
  }

  for (const source of sources) {
    try {
      console.log(`[download] trying ${source.name}`);
      const result = await source.run(submittedUrl);
      console.log(`[download] ${source.name} succeeded`);
      return res.json({ success: true, ...result });
    } catch (error) {
      console.warn(`[download] ${source.name} failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  return res.status(502).json({ success: false, error: 'No download source could access this video. Please try again later.' });
});

app.get('/api/proxy-download', async (req, res) => {
  try {
    const targetUrl = typeof req.query.url === 'string' ? req.query.url : '';
    const filename = typeof req.query.filename === 'string' ? req.query.filename : 'tiktok_video.mp4';
    if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
      return res.status(400).send('Invalid or missing URL');
    }

    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.tiktok.com/',
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).send('Upstream download failed');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '')}"`);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
    const contentLength = upstream.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    const { Readable } = await import('node:stream');
    if (upstream.body) {
      Readable.fromWeb(upstream.body).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    console.error('[proxy-download] error:', err);
    res.status(500).send('Download proxy encountered an error');
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(port, () => console.log(`TikDownloader listening on port ${port}`));
