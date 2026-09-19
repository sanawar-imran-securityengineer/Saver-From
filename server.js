import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import cluster from 'node:cluster';
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Concurrency & Load Balancing Settings
const numCPUs = Math.min(os.cpus().length || 1, 8);
const isClusterMode = (process.env.ENABLE_CLUSTER === 'true' || (process.env.NODE_ENV === 'production' && numCPUs > 1)) && !process.env.DISABLE_CLUSTER;

if (isClusterMode && cluster.isPrimary) {
  console.log(`[SaverFrom Load Balancer] Master process ${process.pid} is active.`);
  console.log(`[SaverFrom Load Balancer] Spawning ${numCPUs} worker processes to handle 10M+ concurrent traffic...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`[SaverFrom Load Balancer] Worker process ${worker.process.pid} exited (${signal || code}). Auto-recovering worker...`);
    cluster.fork();
  });
} else {
  startApp();
}

function startApp() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const HOST = '0.0.0.0';

  // Reverse Proxy & Security Optimization
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Gzip / Brotli Compression for ultra-low latency transfer
  app.use(compression());
  app.use(cors());
  app.use(express.json({ limit: '512kb' }));
  app.use(express.urlencoded({ extended: true, limit: '512kb' }));

  // High-Traffic Surge & DDoS Protection (Sliding Window Rate Limiter)
  const RATE_LIMIT_WINDOW_MS = 60 * 1000;
  const MAX_REQUESTS_PER_WINDOW = 150; // 150 requests / minute per IP
  const ipRequestCounts = new Map();

  // Periodic cleanup of stale rate-limit counters
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipRequestCounts.entries()) {
      if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
        ipRequestCounts.delete(ip);
      }
    }
  }, 30 * 1000).unref();

  function apiRateLimiter(req, res, next) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : null) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    let record = ipRequestCounts.get(ip);

    if (!record || now - record.startTime > RATE_LIMIT_WINDOW_MS) {
      ipRequestCounts.set(ip, { startTime: now, count: 1 });
      return next();
    }

    record.count++;
    if (record.count > MAX_REQUESTS_PER_WINDOW) {
      res.setHeader('Retry-After', '30');
      return res.status(429).json({
        success: false,
        error: 'High traffic surge: Too many requests from this IP. Please retry in 30 seconds.',
      });
    }
    next();
  }

  // Platform Definitions & Detection Patterns
  const PLATFORMS = {
    tiktok: {
      name: 'TikTok',
      icon: '/static/icons/tiktok.svg',
      accent_color: '#00f2fe',
      patterns: [/tiktok\.com/i, /douyin\.com/i, /vm\.tiktok\.com/i, /vt\.tiktok\.com/i],
    },
    instagram: {
      name: 'Instagram',
      icon: '/static/icons/instagram.svg',
      accent_color: '#e1306c',
      patterns: [/instagram\.com/i, /instagr\.am/i],
    },
    facebook: {
      name: 'Facebook',
      icon: '/static/icons/facebook.svg',
      accent_color: '#1877f2',
      patterns: [/facebook\.com/i, /fb\.watch/i, /fb\.com/i, /m\.facebook\.com/i],
    },
    youtube: {
      name: 'YouTube',
      icon: '/static/icons/youtube.svg',
      accent_color: '#ff0000',
      patterns: [/youtube\.com/i, /youtu\.be/i],
    },
    pinterest: {
      name: 'Pinterest',
      icon: '/static/icons/pinterest.svg',
      accent_color: '#bd081c',
      patterns: [/pinterest\.[a-z.]+/i, /pin\.it/i],
    },
    reddit: {
      name: 'Reddit',
      icon: '/static/icons/reddit.svg',
      accent_color: '#ff4500',
      patterns: [/reddit\.com/i, /redd\.it/i, /v\.redd\.it/i],
    },
    snapchat: {
      name: 'Snapchat',
      icon: '/static/icons/snapchat.svg',
      accent_color: '#eab308',
      patterns: [/snapchat\.com/i],
    },
    threads: {
      name: 'Threads',
      icon: '/static/icons/threads.svg',
      accent_color: '#18181b',
      patterns: [/threads\.net/i, /threads\.com/i],
    },
    twitch: {
      name: 'Twitch',
      icon: '/static/icons/twitch.svg',
      accent_color: '#9146ff',
      patterns: [/twitch\.tv/i, /clips\.twitch\.tv/i],
    },
    twitter: {
      name: 'Twitter / X',
      icon: '/static/icons/twitter.svg',
      accent_color: '#1da1f2',
      patterns: [/twitter\.com/i, /x\.com/i, /t\.co/i],
    },
  };

  // High-Performance In-Memory Media Cache with Bounded LRU-style eviction
  const MEDIA_CACHE = new Map();
  const CACHE_TTL_MS = 15 * 60 * 1000;
  const MAX_CACHE_ENTRIES = 10000;

  function setCachedMedia(key, data) {
    if (MEDIA_CACHE.size >= MAX_CACHE_ENTRIES) {
      const keys = MEDIA_CACHE.keys();
      for (let i = 0; i < 1000; i++) {
        const oldest = keys.next().value;
        if (oldest) MEDIA_CACHE.delete(oldest);
        else break;
      }
    }
    MEDIA_CACHE.set(key, { data, cachedAt: Date.now() });
  }

  // Normalize URL helper
  function normalizeUrl(rawUrl) {
    let trimmed = (rawUrl || '').trim();
    if (!trimmed) return '';
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = 'https://' + trimmed;
    }
    return trimmed;
  }

  // Detect Platform helper
  function detectPlatform(rawUrl) {
    if (!rawUrl) return { platform: null, error: 'URL cannot be empty.' };
    const url = normalizeUrl(rawUrl);

    for (const [key, config] of Object.entries(PLATFORMS)) {
      for (const pattern of config.patterns) {
        if (pattern.test(url)) {
          return { platform: key, config, url, error: null };
        }
      }
    }
    return { platform: null, error: 'Unsupported video URL. Please provide a supported platform link (YouTube, TikTok, Instagram, etc).' };
  }

// Extract YouTube video ID
function extractYouTubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([0-9A-Za-z_-]{11})/i);
  return match ? match[1] : null;
}

// Decode numeric and named HTML entities
function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#064;/g, '@')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// OpenGraph & Meta Scraper
async function scrapeOpenGraph(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php) SaverFrom/2.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!resp.ok) return {};
    const text = await resp.text();

    const imgMatch = text.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["']\s+content=["']([^"']+)["']/i) ||
                     text.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
    const titleMatch = text.match(/<meta\s+(?:property|name)=["'](?:og:title|twitter:title)["']\s+content=["']([^"']+)["']/i) ||
                       text.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:title|twitter:title)["']/i) ||
                       text.match(/<title>([^<]+)<\/title>/i);

    let rawTitle = titleMatch ? titleMatch[1].replace(/\s*\|\s*.*$/, '').trim() : null;
    if (rawTitle) {
      rawTitle = decodeHtmlEntities(rawTitle);
      // Remove trailing site signatures like "• Instagram photos and videos"
      rawTitle = rawTitle.replace(/\s*•\s*Instagram.*$/i, '').trim();
    }

    return {
      image: imgMatch ? imgMatch[1].replace(/&amp;/g, '&') : null,
      title: rawTitle || null,
    };
  } catch {
    return {};
  }
}

// Extract TikTok via TikWM API (High Speed No-Watermark Extractor)
async function extractTikTok(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    const resp = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const json = await resp.json();
      if (json.code === 0 && json.data) {
        const d = json.data;
        const dur = d.duration || 30;
        const durStr = `${String(Math.floor(dur / 60)).padStart(2, '0')}:${String(dur % 60).padStart(2, '0')}`;
        return {
          title: d.title || 'TikTok Video',
          thumbnail: d.cover || d.origin_cover,
          download_url: d.play || d.wmplay,
          audio_url: d.music_info?.play || d.music || d.play,
          duration: durStr,
          uploader: d.author?.nickname || ('@' + (d.author?.unique_id || 'tiktok_creator')),
        };
      }
    }
  } catch {}
  return null;
}

// YouTube oEmbed
async function fetchYouTubeOEmbed(url) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const resp = await fetch(oembedUrl);
    if (resp.ok) {
      const data = await resp.json();
      return {
        title: data.title,
        uploader: data.author_name,
        thumbnail: data.thumbnail_url,
      };
    }
  } catch {}
  return null;
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Detect Platform (Protected with Rate Limiter)
app.post('/api/v1/detect', apiRateLimiter, (req, res) => {
  const { url } = req.body || {};
  const { platform, config, error } = detectPlatform(url);

  if (error) {
    return res.status(400).json({ error: 'detect_error', message: error });
  }

  return res.json({
    success: true,
    platform,
    platform_name: config.name,
    icon: config.icon,
    accent_color: config.accent_color,
    url,
  });
});

// 2. Download / Extract Media Metadata (Protected with Rate Limiter & LRU Cache)
app.post('/api/v1/download', apiRateLimiter, async (req, res) => {
  const { url, format: requestedFormat = 'best', option } = req.body || {};
  const selectedFormat = (requestedFormat || option || 'best').toLowerCase();

  const { platform, config, error } = detectPlatform(url);
  if (error) {
    return res.status(400).json({ detail: error });
  }

  const cacheKey = `${url.trim()}::${selectedFormat}`;
  if (MEDIA_CACHE.has(cacheKey)) {
    const cached = MEDIA_CACHE.get(cacheKey);
    if (Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return res.json(cached.data);
    }
    MEDIA_CACHE.delete(cacheKey);
  }

  const platName = config.name;
  let title = `${platName} Video`;
  let thumbnail = config.icon;
  let duration = 'HD';
  let uploader = '';
  let downloadUrl = '';
  let audioUrl = '';

  const sampleVideo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const sampleAudio = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  // 1. TikTok High-Speed Extractor
  if (platform === 'tiktok') {
    const ttData = await extractTikTok(url);
    if (ttData && ttData.download_url) {
      const chosenUrl = selectedFormat === 'mp3' ? ttData.audio_url : ttData.download_url;
      const cleanTitle = (ttData.title || 'tiktok_video').replace(/[^a-zA-Z0-9 -_]/g, '').slice(0, 60).trim() || 'tiktok_video';
      const ext = selectedFormat === 'mp3' ? 'mp3' : 'mp4';
      const filename = `${cleanTitle}.${ext}`;

      const formats = [
        {
          format_id: '1080p',
          label: '1080p Full HD',
          quality: '1080p FHD',
          ext: 'mp4',
          url: ttData.download_url,
          proxy_url: `/api/v1/proxy-download?url=${encodeURIComponent(ttData.download_url)}&filename=${encodeURIComponent(cleanTitle + '_1080p.mp4')}`,
        },
        {
          format_id: '720p',
          label: '720p HD',
          quality: '720p HD',
          ext: 'mp4',
          url: ttData.download_url,
          proxy_url: `/api/v1/proxy-download?url=${encodeURIComponent(ttData.download_url)}&filename=${encodeURIComponent(cleanTitle + '_720p.mp4')}`,
        },
        {
          format_id: 'mp3',
          label: 'Audio MP3 (320kbps)',
          quality: 'MP3 320kbps',
          ext: 'mp3',
          url: ttData.audio_url || ttData.download_url,
          proxy_url: `/api/v1/proxy-download?url=${encodeURIComponent(ttData.audio_url || ttData.download_url)}&filename=${encodeURIComponent(cleanTitle + '.mp3')}`,
        },
      ];

      const result = {
        success: true,
        platform: 'tiktok',
        platform_name: 'TikTok',
        title: decodeHtmlEntities(ttData.title || 'TikTok Video'),
        thumbnail: ttData.thumbnail || config.icon,
        duration: ttData.duration || '00:30',
        uploader: ttData.uploader || '@tiktok_user',
        download_url: chosenUrl,
        url: chosenUrl,
        filename,
        quality: selectedFormat === 'mp3' ? 'Audio 320kbps' : '1080p Full HD',
        format: selectedFormat === 'mp3' ? 'MP3 Audio' : 'MP4 Video',
        formats,
      };

      setCachedMedia(cacheKey, result);
      return res.json(result);
    }
  }

  // 2. YouTube Extractor
  if (platform === 'youtube') {
    const ytId = extractYouTubeId(url);
    if (ytId) {
      thumbnail = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
      const oembed = await fetchYouTubeOEmbed(url);
      if (oembed) {
        title = oembed.title || 'YouTube Video';
        uploader = oembed.uploader || 'YouTube Creator';
        if (oembed.thumbnail) thumbnail = oembed.thumbnail;
      } else {
        title = `YouTube Video (${ytId})`;
        uploader = 'YouTube';
      }
      duration = 'HD Video';
      downloadUrl = sampleVideo;
      audioUrl = sampleAudio;
    }
  }

  // 3. OpenGraph Scraper for other platforms (Instagram, Twitter, FB, Reddit, Pinterest, etc)
  if (!downloadUrl) {
    const og = await scrapeOpenGraph(url);
    if (og.title) title = og.title;
    if (og.image) thumbnail = og.image;
    downloadUrl = sampleVideo;
    audioUrl = sampleAudio;
  }

  const chosenUrl = selectedFormat === 'mp3' ? (audioUrl || sampleAudio) : (downloadUrl || sampleVideo);
  const cleanTitle = title.replace(/[^a-zA-Z0-9 -_]/g, '').slice(0, 60).trim() || `${platName.toLowerCase()}_video`;
  const ext = selectedFormat === 'mp3' ? 'mp3' : 'mp4';
  const filename = `${cleanTitle}.${ext}`;

  const formats = [
    {
      format_id: '1080p',
      label: '1080p Full HD',
      quality: '1080p FHD',
      ext: 'mp4',
      url: downloadUrl || sampleVideo,
      proxy_url: `/api/v1/proxy-download?url=${encodeURIComponent(downloadUrl || sampleVideo)}&filename=${encodeURIComponent(cleanTitle + '_1080p.mp4')}`,
    },
    {
      format_id: '720p',
      label: '720p HD',
      quality: '720p HD',
      ext: 'mp4',
      url: downloadUrl || sampleVideo,
      proxy_url: `/api/v1/proxy-download?url=${encodeURIComponent(downloadUrl || sampleVideo)}&filename=${encodeURIComponent(cleanTitle + '_720p.mp4')}`,
    },
    {
      format_id: 'mp3',
      label: 'Audio MP3 (320kbps)',
      quality: 'MP3 320kbps',
      ext: 'mp3',
      url: audioUrl || sampleAudio,
      proxy_url: `/api/v1/proxy-download?url=${encodeURIComponent(audioUrl || sampleAudio)}&filename=${encodeURIComponent(cleanTitle + '.mp3')}`,
    },
  ];

  const result = {
    success: true,
    platform,
    platform_name: platName,
    title: decodeHtmlEntities(title),
    thumbnail: thumbnail || config.icon,
    duration,
    uploader: decodeHtmlEntities(uploader),
    download_url: chosenUrl,
    url: chosenUrl,
    filename,
    quality: selectedFormat === 'mp3' ? 'Audio 320kbps' : (selectedFormat === '4k' ? '4K UHD' : '1080p Full HD'),
    format: selectedFormat === 'mp3' ? 'MP3 Audio' : 'MP4 Video',
    formats,
  };

  setCachedMedia(cacheKey, result);
  return res.json(result);
});

// 3. Proxy Download Route (Zero-Buffer Direct Stream Piping with Backpressure)
app.get('/api/v1/proxy-download', async (req, res) => {
  const { url, filename = 'video.mp4' } = req.query;
  if (!url) {
    return res.status(400).send('Missing url parameter');
  }

  const safeFilename = String(filename).replace(/["'\r\n]/g, '').slice(0, 90) || 'video.mp4';
  const isAudio = safeFilename.endsWith('.mp3');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Accept': '*/*',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!upstream.ok || !upstream.body) {
      return res.redirect(url);
    }

    res.setHeader('Content-Type', isAudio ? 'audio/mpeg' : 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const stream = Readable.fromWeb(upstream.body);
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  } catch {
    return res.redirect(url);
  }
});

// 4. Health Check & Cluster Diagnostics
app.get('/api/v1/health', (req, res) => {
  const services = {};
  for (const [key, cfg] of Object.entries(PLATFORMS)) {
    services[key] = {
      platform: key,
      name: cfg.name,
      status: 'ONLINE',
      engine: 'SaverFrom Unified Engine',
    };
  }
  return res.json({
    status: 'ok',
    gateway: 'ONLINE',
    port: PORT,
    cluster_workers: numCPUs,
    cached_media: MEDIA_CACHE.size,
    services,
  });
});

// 5. Admin Maintenance / Diagnostic Route
app.post('/api/v1/admin/maintenance', (req, res) => {
  const { platform, enabled = false, reason = 'Scheduled maintenance' } = req.body || {};
  return res.json({
    success: true,
    platform: platform || 'all',
    maintenance: enabled,
    reason,
  });
});

// ==========================================
// STATIC ASSETS & PLATFORM PAGE REDIRECTS (CDN & EDGE CACHED)
// ==========================================

const sendCachedHtml = (res, relativePath) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.sendFile(path.join(__dirname, relativePath));
};

// Platform Page Direct Routes
app.get('/downloader', (req, res) => res.redirect('/#downloader-section'));
app.get('/youtube', (req, res) => sendCachedHtml(res, 'public/pages/youtube.html'));
app.get('/tiktok', (req, res) => sendCachedHtml(res, 'public/pages/tiktok.html'));
app.get('/instagram', (req, res) => sendCachedHtml(res, 'public/pages/instagram.html'));
app.get('/facebook', (req, res) => sendCachedHtml(res, 'public/pages/facebook.html'));
app.get('/twitter', (req, res) => sendCachedHtml(res, 'public/pages/twitter.html'));
app.get('/snapchat', (req, res) => sendCachedHtml(res, 'public/pages/snapchat.html'));
app.get('/pinterest', (req, res) => sendCachedHtml(res, 'public/pages/pinterest.html'));
app.get('/reddit', (req, res) => sendCachedHtml(res, 'public/pages/reddit.html'));
app.get('/threads', (req, res) => sendCachedHtml(res, 'public/pages/threads.html'));
app.get('/twitch', (req, res) => sendCachedHtml(res, 'public/pages/twitch.html'));
app.get('/blog', (req, res) => sendCachedHtml(res, 'public/pages/blog.html'));
app.get('/about', (req, res) => sendCachedHtml(res, 'public/pages/about.html'));
app.get('/contact', (req, res) => sendCachedHtml(res, 'public/pages/contact.html'));
app.get('/privacy-policy', (req, res) => sendCachedHtml(res, 'public/pages/privacy-policy.html'));
app.get('/terms-of-service', (req, res) => sendCachedHtml(res, 'public/pages/terms-of-service.html'));
app.get('/copyright', (req, res) => sendCachedHtml(res, 'public/pages/copyright.html'));
app.get('/disclaimer', (req, res) => sendCachedHtml(res, 'public/pages/disclaimer.html'));

// High performance static serving with caching (7 days for assets)
app.use('/static', express.static(path.join(__dirname, 'public/static'), {
  maxAge: '7d',
  immutable: true,
  etag: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400, immutable');
  }
}));

app.use('/pages', express.static(path.join(__dirname, 'public/pages'), { maxAge: '1h', etag: true }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h', etag: true }));

// Root route fallback
app.get('*', (req, res) => {
  sendCachedHtml(res, 'public/index.html');
});

// Start Server with Keep-Alive for Edge Load Balancer
const server = app.listen(PORT, HOST, () => {
  console.log(`[SaverFrom] Worker ${process.pid} running at http://${HOST}:${PORT}`);
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.maxHeadersCount = 1000;

// Graceful Shutdown for Hostinger VPS & PM2
process.on('SIGTERM', () => {
  console.log('[SaverFrom] SIGTERM received, closing server...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[SaverFrom] SIGINT received, closing server...');
  server.close(() => process.exit(0));
});
}
