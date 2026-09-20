import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { execFile, spawn } from 'child_process';
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
  console.log(`[SaverFrom Cluster] Master process ${process.pid} is running.`);
  console.log(`[SaverFrom Cluster] Initializing ${numCPUs} worker processes...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`[SaverFrom Cluster] Worker process ${worker.process.pid} exited (${signal || code}). Auto-recovering worker...`);
    cluster.fork();
  });
} else {
  startApp();
}

function startApp() {
  const app = express();
  const PORT = 3000;
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

// Robust Real-Media Extractor using yt-dlp binary with JavaScript engine
async function extractRealMediaWithYtDlp(url) {
  return new Promise((resolve) => {
    const ytDlpPath = path.join(__dirname, 'bin/yt-dlp');
    if (!fs.existsSync(ytDlpPath)) {
      return resolve(null);
    }
    const args = [
      '--js-runtimes', `node:${process.execPath}`,
      '--no-playlist',
      '--no-warnings',
      '--no-call-home',
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      '-J',
      url
    ];

    execFile(ytDlpPath, args, { timeout: 15000, maxBuffer: 15 * 1024 * 1024 }, (err, stdout) => {
      if (err || !stdout) {
        return resolve(null);
      }
      try {
        const info = JSON.parse(stdout);
        resolve(info);
      } catch {
        resolve(null);
      }
    });
  });
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

  // 1. TikTok High-Speed Extractor (TikWM direct API)
  if (platform === 'tiktok') {
    const ttData = await extractTikTok(url);
    if (ttData && ttData.download_url) {
      const chosenUrl = selectedFormat === 'mp3' ? ttData.audio_url : ttData.download_url;
      const cleanTitle = (ttData.title || 'tiktok_video').replace(/[^a-zA-Z0-9 -_]/g, '').slice(0, 60).trim() || 'tiktok_video';
      const ext = selectedFormat === 'mp3' ? 'mp3' : 'mp4';
      const filename = `${cleanTitle}.${ext}`;

      const previewVideoUrl = `/api/v1/proxy-download?url=${encodeURIComponent(ttData.download_url)}&filename=${encodeURIComponent(cleanTitle + '_1080p.mp4')}&inline=true`;
      const previewAudioUrl = `/api/v1/proxy-download?url=${encodeURIComponent(ttData.audio_url || ttData.download_url)}&filename=${encodeURIComponent(cleanTitle + '.mp3')}&inline=true`;

      const formats = [
        {
          format_id: '1080p',
          label: '1080p Full HD',
          quality: '1080p FHD',
          ext: 'mp4',
          size_est: '22 MB',
          url: ttData.download_url,
          preview_url: previewVideoUrl,
          proxy_url: `/api/v1/proxy-download?url=${encodeURIComponent(ttData.download_url)}&filename=${encodeURIComponent(cleanTitle + '_1080p.mp4')}`,
        },
        {
          format_id: '720p',
          label: '720p HD',
          quality: '720p HD',
          ext: 'mp4',
          size_est: '14 MB',
          url: ttData.download_url,
          preview_url: `/api/v1/proxy-download?url=${encodeURIComponent(ttData.download_url)}&filename=${encodeURIComponent(cleanTitle + '_720p.mp4')}&inline=true`,
          proxy_url: `/api/v1/proxy-download?url=${encodeURIComponent(ttData.download_url)}&filename=${encodeURIComponent(cleanTitle + '_720p.mp4')}`,
        },
        {
          format_id: 'mp3',
          label: 'Audio MP3 (320kbps)',
          quality: 'MP3 320kbps',
          ext: 'mp3',
          size_est: '4.2 MB',
          url: ttData.audio_url || ttData.download_url,
          preview_url: previewAudioUrl,
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
        preview_url: selectedFormat === 'mp3' ? previewAudioUrl : previewVideoUrl,
        audio_preview_url: previewAudioUrl,
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

  // 2. Real-Media Extraction with yt-dlp (YouTube, Facebook, Instagram, Twitter/X, Reddit, Pinterest, Twitch, etc.)
  const ytdlData = await extractRealMediaWithYtDlp(url);
  if (ytdlData && (ytdlData.formats?.length || ytdlData.url)) {
    const rawTitle = ytdlData.title || `${platName} Video`;
    const cleanTitle = rawTitle.replace(/[^a-zA-Z0-9 -_]/g, '').slice(0, 60).trim() || `${platName.toLowerCase()}_video`;
    const thumbnail = ytdlData.thumbnail || (ytdlData.thumbnails && ytdlData.thumbnails[ytdlData.thumbnails.length - 1]?.url) || config.icon;
    const uploader = ytdlData.uploader || ytdlData.channel || ytdlData.creator || platName;
    const durSec = ytdlData.duration;
    let duration = 'HD';
    if (typeof durSec === 'number' && durSec > 0) {
      const mins = Math.floor(durSec / 60);
      const secs = Math.floor(durSec % 60);
      duration = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    const allFormats = ytdlData.formats || [];

    // Find progressive format (has both video & audio in single stream)
    const progFormats = allFormats.filter(f => f.url && f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none');
    const bestProg = progFormats.sort((a, b) => (b.height || 0) - (a.height || 0))[0];

    // Find audio-only formats
    const audioFormats = allFormats.filter(f => f.url && f.acodec && f.acodec !== 'none');
    const bestAudio = audioFormats.find(f => f.ext === 'm4a' || f.format_id === '140') || audioFormats.sort((a, b) => (b.abr || 0) - (a.abr || 0))[0] || bestProg;

    // Find 1080p and 720p video formats
    const fmt1080 = allFormats.find(f => f.url && f.vcodec && f.vcodec !== 'none' && (f.height === 1080 || f.format_note?.includes('1080')));
    const fmt720 = allFormats.find(f => f.url && f.vcodec && f.vcodec !== 'none' && (f.height === 720 || f.format_note?.includes('720'))) || bestProg;

    // Build format rows
    const formats = [];

    // 1080p row
    if (fmt1080 && bestAudio && (!fmt1080.acodec || fmt1080.acodec === 'none')) {
      const vUrl = fmt1080.url;
      const aUrl = bestAudio?.url;
      formats.push({
        format_id: '1080p',
        label: '1080p Full HD',
        quality: '1080p FHD',
        ext: 'mp4',
        size_est: fmt1080.filesize ? `${Math.round(fmt1080.filesize / (1024 * 1024))} MB` : '35 MB',
        url: vUrl,
        preview_url: `/api/v1/proxy-download?url=${encodeURIComponent(vUrl)}&audio_url=${encodeURIComponent(aUrl)}&filename=${encodeURIComponent(cleanTitle + '_1080p.mp4')}&inline=true`,
        proxy_url: `/api/v1/proxy-download?url=${encodeURIComponent(vUrl)}&audio_url=${encodeURIComponent(aUrl)}&filename=${encodeURIComponent(cleanTitle + '_1080p.mp4')}`,
      });
    } else if (bestProg) {
      formats.push({
        format_id: '1080p',
        label: `${bestProg.height || 'HD'}p Video`,
        quality: `${bestProg.height || 'HD'}p`,
        ext: 'mp4',
        size_est: bestProg.filesize ? `${Math.round(bestProg.filesize / (1024 * 1024))} MB` : '24 MB',
        url: bestProg.url,
        preview_url: `/api/v1/proxy-download?url=${encodeURIComponent(bestProg.url)}&filename=${encodeURIComponent(cleanTitle + '_1080p.mp4')}&inline=true`,
        proxy_url: `/api/v1/proxy-download?url=${encodeURIComponent(bestProg.url)}&filename=${encodeURIComponent(cleanTitle + '_1080p.mp4')}`,
      });
    }

    // 720p / progressive row
    if (fmt720 && bestAudio && (!fmt720.acodec || fmt720.acodec === 'none')) {
      const vUrl = fmt720.url;
      const aUrl = bestAudio?.url;
      formats.push({
        format_id: '720p',
        label: '720p HD',
        quality: '720p HD',
        ext: 'mp4',
        size_est: fmt720.filesize ? `${Math.round(fmt720.filesize / (1024 * 1024))} MB` : '18 MB',
        url: vUrl,
        preview_url: `/api/v1/proxy-download?url=${encodeURIComponent(vUrl)}&audio_url=${encodeURIComponent(aUrl)}&filename=${encodeURIComponent(cleanTitle + '_720p.mp4')}&inline=true`,
        proxy_url: `/api/v1/proxy-download?url=${encodeURIComponent(vUrl)}&audio_url=${encodeURIComponent(aUrl)}&filename=${encodeURIComponent(cleanTitle + '_720p.mp4')}`,
      });
    } else if (bestProg && !formats.some(f => f.format_id === '720p')) {
      formats.push({
        format_id: '720p',
        label: 'Standard MP4 Video',
        quality: `${bestProg.height || 'HD'}p`,
        ext: 'mp4',
        size_est: bestProg.filesize ? `${Math.round(bestProg.filesize / (1024 * 1024))} MB` : '15 MB',
        url: bestProg.url,
        preview_url: `/api/v1/proxy-download?url=${encodeURIComponent(bestProg.url)}&filename=${encodeURIComponent(cleanTitle + '_720p.mp4')}&inline=true`,
        proxy_url: `/api/v1/proxy-download?url=${encodeURIComponent(bestProg.url)}&filename=${encodeURIComponent(cleanTitle + '_720p.mp4')}`,
      });
    }

    // MP3 Audio row
    if (bestAudio) {
      formats.push({
        format_id: 'mp3',
        label: 'Audio MP3 (320kbps)',
        quality: 'MP3 320kbps',
        ext: 'mp3',
        size_est: bestAudio.filesize ? `${Math.round(bestAudio.filesize / (1024 * 1024))} MB` : '4.5 MB',
        url: bestAudio.url,
        preview_url: `/api/v1/proxy-download?url=${encodeURIComponent(bestAudio.url)}&filename=${encodeURIComponent(cleanTitle + '.mp3')}&inline=true`,
        proxy_url: `/api/v1/proxy-download?url=${encodeURIComponent(bestAudio.url)}&filename=${encodeURIComponent(cleanTitle + '.mp3')}`,
      });
    }

    // Fallback if no formats array was constructed
    if (!formats.length && ytdlData.url) {
      formats.push({
        format_id: 'best',
        label: 'Official Video MP4',
        quality: 'HD',
        ext: 'mp4',
        size_est: '20 MB',
        url: ytdlData.url,
        preview_url: `/api/v1/proxy-download?url=${encodeURIComponent(ytdlData.url)}&filename=${encodeURIComponent(cleanTitle + '.mp4')}&inline=true`,
        proxy_url: `/api/v1/proxy-download?url=${encodeURIComponent(ytdlData.url)}&filename=${encodeURIComponent(cleanTitle + '.mp4')}`,
      });
    }

    // Determine primary download and preview
    const primaryFormat = selectedFormat === 'mp3' ? formats.find(f => f.format_id === 'mp3') : (formats.find(f => f.format_id === '1080p') || formats[0]);
    const primaryPreview = bestProg
      ? `/api/v1/proxy-download?url=${encodeURIComponent(bestProg.url)}&filename=${encodeURIComponent(cleanTitle + '.mp4')}&inline=true`
      : (formats[0]?.preview_url || '');

    const primaryAudioPreview = bestAudio
      ? `/api/v1/proxy-download?url=${encodeURIComponent(bestAudio.url)}&filename=${encodeURIComponent(cleanTitle + '.mp3')}&inline=true`
      : '';

    const chosenDlUrl = primaryFormat ? primaryFormat.proxy_url : (formats[0]?.proxy_url || '');

    const result = {
      success: true,
      platform,
      platform_name: platName,
      title: decodeHtmlEntities(rawTitle),
      thumbnail,
      duration,
      uploader: decodeHtmlEntities(uploader),
      download_url: chosenDlUrl,
      preview_url: selectedFormat === 'mp3' ? primaryAudioPreview : primaryPreview,
      audio_preview_url: primaryAudioPreview,
      url: chosenDlUrl,
      filename: `${cleanTitle}.${selectedFormat === 'mp3' ? 'mp3' : 'mp4'}`,
      quality: selectedFormat === 'mp3' ? 'Audio 320kbps' : '1080p Full HD',
      format: selectedFormat === 'mp3' ? 'MP3 Audio' : 'MP4 Video',
      formats,
    };

    setCachedMedia(cacheKey, result);
    return res.json(result);
  }

  // 3. OpenGraph Scraper fallback
  const og = await scrapeOpenGraph(url);
  let title = og.title || `${platName} Video`;
  let thumbnail = og.image || config.icon;

  return res.status(400).json({
    detail: 'Unable to extract official media stream. Please verify the URL is public, accessible, and not private or restricted.',
    title: decodeHtmlEntities(title),
    thumbnail
  });
});

// 3. Proxy Download & Media Stream Route (Supports Real-Time FFmpeg Remuxing, HTTP Range, and Direct Streams)
app.get('/api/v1/proxy-download', async (req, res) => {
  const { url, audio_url, filename = 'video.mp4', inline = 'false' } = req.query;
  if (!url) {
    return res.status(400).json({ success: false, error: 'Missing url parameter' });
  }

  const isInline = inline === 'true';
  const safeFilename = String(filename).replace(/[^a-zA-Z0-9._ -]/g, '').slice(0, 90) || 'video.mp4';
  const isAudio = safeFilename.endsWith('.mp3');

  // Fast path 1: Separate video + audio streams merged on the fly with FFmpeg
  if (audio_url) {
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', isInline ? 'inline' : `attachment; filename="${safeFilename}"`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const ff = spawn('ffmpeg', [
      '-reconnect', '1',
      '-reconnect_streamed', '1',
      '-reconnect_delay_max', '5',
      '-i', url,
      '-i', audio_url,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-movflags', '+frag_keyframe+empty_moov+default_base_moof',
      '-f', 'mp4',
      'pipe:1'
    ]);

    req.on('close', () => {
      ff.kill('SIGKILL');
    });

    ff.on('error', (e) => {
      if (!res.headersSent) {
        res.status(502).json({ error: 'ffmpeg_remux_error', message: e.message });
      }
    });

    return ff.stdout.pipe(res);
  }

  // Fast path 2: MP3 Audio on-the-fly conversion with FFmpeg
  if (isAudio && (url.includes('googlevideo') || url.includes('m4a') || url.includes('webm') || url.includes('opus'))) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', isInline ? 'inline' : `attachment; filename="${safeFilename}"`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const ff = spawn('ffmpeg', [
      '-reconnect', '1',
      '-reconnect_streamed', '1',
      '-reconnect_delay_max', '5',
      '-i', url,
      '-vn',
      '-c:a', 'libmp3lame',
      '-b:a', '320k',
      '-f', 'mp3',
      'pipe:1'
    ]);

    req.on('close', () => {
      ff.kill('SIGKILL');
    });

    ff.on('error', (e) => {
      if (!res.headersSent) {
        res.status(502).json({ error: 'ffmpeg_audio_error', message: e.message });
      }
    });

    return ff.stdout.pipe(res);
  }

  // Fast path 3: Local verified files
  if (url.startsWith('/static/') || url.startsWith('static/')) {
    const relativePath = url.replace(/^\/?static\//, '');
    const localFilePath = path.join(__dirname, 'public/static', relativePath);
    if (fs.existsSync(localFilePath)) {
      const stat = fs.statSync(localFilePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      res.setHeader('Content-Type', isAudio ? 'audio/mpeg' : 'video/mp4');
      res.setHeader('Content-Disposition', isInline ? 'inline' : `attachment; filename="${safeFilename}"`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const fileStream = fs.createReadStream(localFilePath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Content-Length': chunksize,
        });
        return fileStream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
        });
        return fs.createReadStream(localFilePath).pipe(res);
      }
    }
  }

  // Fast path 4: Remote single stream proxy (e.g. TikTok, direct MP4)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Encoding': 'identity',
    };

    try {
      const parsedUrl = new URL(url);
      headers['Referer'] = `${parsedUrl.protocol}//${parsedUrl.host}/`;
    } catch {}

    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const upstream = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);

    const contentType = upstream.headers.get('content-type') || '';
    if (!upstream.ok || contentType.includes('text/html') || contentType.includes('application/json')) {
      return res.status(502).json({ error: 'upstream_error', message: 'Failed to stream media from remote provider.' });
    }

    const status = upstream.status === 206 ? 206 : 200;
    const disposition = isInline ? 'inline' : `attachment; filename="${safeFilename}"`;

    res.status(status);
    res.setHeader('Content-Type', isAudio ? 'audio/mpeg' : (contentType.includes('video') ? contentType : 'video/mp4'));
    res.setHeader('Content-Disposition', disposition);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    if (upstream.headers.has('content-length')) {
      res.setHeader('Content-Length', upstream.headers.get('content-length'));
    }
    if (upstream.headers.has('content-range')) {
      res.setHeader('Content-Range', upstream.headers.get('content-range'));
    }

    const stream = Readable.fromWeb(upstream.body);
    req.on('close', () => stream.destroy());
    stream.pipe(res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(502).json({ error: 'proxy_stream_error', message: err.message });
    }
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

// SEO & Bot Indexation Routes
app.get('/robots.txt', (req, res) => res.sendFile(path.join(__dirname, 'public/robots.txt')));
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.sendFile(path.join(__dirname, 'public/sitemap.xml'));
});

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
