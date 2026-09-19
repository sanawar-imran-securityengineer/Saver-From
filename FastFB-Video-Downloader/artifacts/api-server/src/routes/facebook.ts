import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "node:stream";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  GetFacebookVideoInfoResponse,
  GetFacebookVideoInfoBody,
} from "@workspace/api-zod";

const router: IRouter = Router();
const execFileAsync = promisify(execFile);
const MAX_URL_LENGTH = 2_000;
const MAX_FORMAT_LENGTH = 120;

const FACEBOOK_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "web.facebook.com",
  "mbasic.facebook.com",
  "l.facebook.com",
  "touch.facebook.com",
  "fb.watch",
  "fb.com",
  "www.fb.com",
]);

type YtDlpFormat = {
  format_id?: string;
  ext?: string;
  height?: number;
  width?: number;
  format_note?: string;
  filesize?: number;
  filesize_approx?: number;
  vcodec?: string;
  acodec?: string;
  url?: string;
  protocol?: string;
  http_headers?: Record<string, string>;
};

type YtDlpInfo = {
  title?: string;
  thumbnail?: string;
  duration?: number;
  uploader?: string;
  formats?: YtDlpFormat[];
};

function normalizeUrl(raw: string): string {
  let trimmed = raw.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

function isFacebookUrl(value: string): boolean {
  if (!value || value.length > MAX_URL_LENGTH) return false;
  try {
    const parsed = new URL(normalizeUrl(value));
    const host = parsed.hostname.toLowerCase();
    return (
      FACEBOOK_HOSTS.has(host) ||
      host.endsWith(".facebook.com") ||
      host.endsWith(".fb.com") ||
      host === "fb.watch"
    );
  } catch {
    return false;
  }
}

function readableSize(bytes: number | undefined): string | null {
  if (!bytes || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

type CachedVideoInfo = {
  data: ReturnType<typeof GetFacebookVideoInfoResponse.parse>;
  raw: YtDlpInfo;
  timestamp: number;
};

const infoCache = new Map<string, CachedVideoInfo>();

function getFfmpegDir(): string | null {
  const localBin = path.resolve(process.cwd(), "bin");
  if (existsSync(path.join(localBin, "ffmpeg.exe")) || existsSync(path.join(localBin, "ffmpeg"))) {
    return localBin;
  }
  const rootBin = path.resolve(process.cwd(), "../../bin");
  if (existsSync(path.join(rootBin, "ffmpeg.exe")) || existsSync(path.join(rootBin, "ffmpeg"))) {
    return rootBin;
  }
  return null;
}

function getYtDlpBinary(): string {
  if (process.env.YT_DLP_PATH) return process.env.YT_DLP_PATH;
  const candidates = [
    path.resolve(process.cwd(), "bin/yt-dlp.exe"),
    path.resolve(process.cwd(), "bin/yt-dlp"),
    path.resolve(process.cwd(), "../../bin/yt-dlp.exe"),
    path.resolve(process.cwd(), "../../bin/yt-dlp"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return "yt-dlp";
}

function qualityLabel(format: YtDlpFormat): string {
  const fid = format.format_id?.toLowerCase() || "";
  if (fid === "hd" || fid.includes("hd")) return format.height ? `HD ${format.height}p` : "HD 1080p";
  if (fid === "sd" || fid.includes("sd")) return format.height ? `SD ${format.height}p` : "SD 480p";
  if (format.height) return `${format.height}p`;
  if (format.format_note) return format.format_note;
  if (format.width) return `${format.width}px`;
  return "HD Quality";
}

function runYtDlp(args: string[], maxBuffer = 30 * 1024 * 1024) {
  const binary = getYtDlpBinary();
  const ffmpegDir = getFfmpegDir();
  const defaultOptimizations = [
    "--no-check-certificates",
    "--force-ipv4",
    ...(ffmpegDir ? ["--ffmpeg-location", ffmpegDir] : []),
  ];
  return execFileAsync(binary, [...defaultOptimizations, ...args], {
    maxBuffer,
    timeout: 120_000,
    windowsHide: true,
  });
}

function safeDownloadName(title: string | undefined): string {
  const cleaned = (title ?? "facebook-video")
    .replace(/[^\p{L}\p{N}\-_. ]/gu, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return `${cleaned || "facebook-video"}.mp4`;
}

function isUsableFormat(format: YtDlpFormat): boolean {
  const fid = format.format_id?.toLowerCase() || "";
  return Boolean(
    format.format_id &&
      (format.ext === "mp4" || format.ext === "m4a" || !format.ext) &&
      (format.height ||
        fid.includes("hd") ||
        fid.includes("sd") ||
        (format.vcodec && format.vcodec !== "none"))
  );
}

function toVideoInfo(info: YtDlpInfo) {
  const formats = (info.formats ?? [])
    .filter(isUsableFormat)
    .map((format) => {
      const filesize = format.filesize ?? format.filesize_approx ?? null;
      let effectiveHeight = format.height ?? null;
      const fid = format.format_id?.toLowerCase() || "";
      if (!effectiveHeight) {
        if (fid.includes("hd")) effectiveHeight = 1080;
        else if (fid.includes("sd")) effectiveHeight = 480;
      }
      return {
        formatId: format.format_id!,
        label: qualityLabel(format),
        height: effectiveHeight,
        filesize,
        filesizeReadable: readableSize(filesize ?? undefined),
        ext: "mp4",
      };
    })
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
    .filter((format, index, all) =>
      index === all.findIndex((candidate) => (format.height ? candidate.height === format.height : candidate.formatId === format.formatId))
    );

  if (formats.length === 0) {
    formats.push({
      formatId: "best",
      label: "HD 1080p",
      height: 1080,
      filesize: null,
      filesizeReadable: null,
      ext: "mp4",
    });
  }

  return GetFacebookVideoInfoResponse.parse({
    title: info.title ?? "Facebook Video",
    thumbnail: info.thumbnail ?? null,
    duration: Number.isFinite(info.duration) ? Math.round(info.duration!) : null,
    uploader: info.uploader ?? null,
    formats,
  });
}

function parseFacebookUrl(body: unknown) {
  const parsed = GetFacebookVideoInfoBody.safeParse(body);
  if (!parsed.success) return { error: "Please paste a valid Facebook video link." } as const;
  const normalized = normalizeUrl(parsed.data.url);
  if (!isFacebookUrl(normalized)) {
    return { error: "That doesn’t look like a Facebook video link. Use a public facebook.com or fb.watch URL." } as const;
  }
  return { data: { ...parsed.data, url: normalized } } as const;
}

// POST /api/facebook/info — extract metadata and qualities
router.post("/facebook/info", async (req, res): Promise<void> => {
  const input = parseFacebookUrl(req.body);
  if ("error" in input) {
    res.status(400).json({ error: input.error });
    return;
  }

  const cacheKey = input.data.url;
  const cached = infoCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 15 * 60 * 1000) {
    res.json(cached.data);
    return;
  }

  try {
    const { stdout } = await runYtDlp([
      "--dump-single-json",
      "--no-warnings",
      "--no-playlist",
      "--skip-download",
      "--socket-timeout", "12",
      "--extractor-retries", "2",
      input.data.url,
    ]);
    const raw = JSON.parse(stdout) as YtDlpInfo;
    const data = toVideoInfo(raw);
    infoCache.set(cacheKey, { data, raw, timestamp: Date.now() });
    res.json(data);
  } catch (error) {
    req.log.warn({ err: error }, "Facebook metadata extraction failed");
    res.status(422).json({
      error: "We couldn’t read that video. It may be private, login-gated, unavailable, or restricted by Facebook.",
    });
  }
});

/**
 * Handle video download via DIRECT STREAMING (PIPE).
 *
 * 1. Zero server buffering: bytes are piped directly to HTTP response as they arrive.
 * 2. Instant start: if direct CDN MP4 format URL was retrieved in /info, it pipes via fetch in ~200ms.
 * 3. No re-encoding: yt-dlp remuxes with "-c copy -movflags frag_keyframe+empty_moov+default_base_moof".
 * 4. Early disconnect: if the user aborts/leaves, yt-dlp / fetch stream is immediately killed.
 */
async function handleDownload(req: Request, res: Response): Promise<void> {
  let url: string | undefined;
  let formatId: string | undefined;

  if (req.method === "GET") {
    url = typeof req.query.url === "string" ? req.query.url : undefined;
    formatId = typeof req.query.formatId === "string" ? req.query.formatId : undefined;
  } else {
    url = typeof req.body?.url === "string" ? req.body.url : undefined;
    formatId = typeof req.body?.formatId === "string" ? req.body.formatId : undefined;
  }

  if (url) {
    url = normalizeUrl(url);
  }

  if (!url || !isFacebookUrl(url)) {
    res.status(400).json({ error: "Please paste a valid Facebook video link." });
    return;
  }
  if (formatId && (!/^[A-Za-z0-9+._-]+$/.test(formatId) || formatId.length > MAX_FORMAT_LENGTH)) {
    res.status(400).json({ error: "That quality option is no longer available. Please fetch the video again." });
    return;
  }

  const cached = infoCache.get(url);
  const title = cached?.data?.title || cached?.raw?.title;
  const fileName = safeDownloadName(title);
  const safeAsciiName = fileName.replace(/[^\x20-\x7E]/g, "_");

  // Strategy 1: Direct CDN Pipe (~200ms TTFB)
  // If we already inspected the video and have a progressive MP4 direct URL, stream directly
  const directFormat = cached?.raw?.formats?.find(
    (f) =>
      f.format_id === formatId &&
      f.url &&
      (f.protocol === "https" || f.protocol === "http") &&
      (f.ext === "mp4" || !f.ext) &&
      (!f.vcodec || f.vcodec !== "none")
  );

  if (directFormat?.url) {
    try {
      const abortController = new AbortController();
      let clientClosed = false;

      req.on("close", () => {
        if (!res.writableEnded) {
          clientClosed = true;
          abortController.abort();
        }
      });

      const fetchHeaders: Record<string, string> = {
        "User-Agent": "facebookexternalhit/1.1 (compatible; FastFB)",
        ...(directFormat.http_headers || {}),
      };

      const cdnRes = await fetch(directFormat.url, {
        headers: fetchHeaders,
        signal: abortController.signal,
      });

      if (cdnRes.ok && cdnRes.body) {
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${safeAsciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
        );
        const contentLength = cdnRes.headers.get("content-length");
        if (contentLength) {
          res.setHeader("Content-Length", contentLength);
        }

        const nodeStream = Readable.fromWeb(cdnRes.body as any);
        nodeStream.pipe(res);

        nodeStream.on("error", (err) => {
          if (!clientClosed) {
            req.log?.warn?.({ err }, "Direct CDN stream aborted");
          }
        });

        return;
      }
    } catch (cdnErr) {
      req.log?.debug?.({ err: cdnErr }, "Direct CDN stream failed, falling back to yt-dlp pipe");
    }
  }

  // Strategy 2: Direct yt-dlp stdout pipe (-o -, -c copy, zero disk writes)
  const binary = getYtDlpBinary();
  const ffmpegDir = getFfmpegDir();

  const selector = formatId
    ? `${formatId}+bestaudio/${formatId}/best[ext=mp4]/best`
    : "best[ext=mp4]/best";

  const ytdlpArgs = [
    "-f", selector,
    "-o", "-",
    "--no-part",
    "--no-playlist",
    "--no-warnings",
    "--force-ipv4",
    "--no-check-certificates",
    "--concurrent-fragments", "16",
    "--buffer-size", "16M",
    "--http-chunk-size", "10M",
    "--socket-timeout", "15",
    "--retries", "3",
    "--fragment-retries", "3",
    ...(ffmpegDir ? ["--ffmpeg-location", ffmpegDir] : []),
    "--postprocessor-args", "ffmpeg:-c copy -movflags frag_keyframe+empty_moov+default_base_moof",
    url,
  ];

  res.setHeader("Content-Type", "video/mp4");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeAsciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
  );

  let ytdlp: ReturnType<typeof spawn> | null = null;
  try {
    ytdlp = spawn(binary, ytdlpArgs, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    req.log?.error?.({ err }, "yt-dlp spawn failed synchronously");
    if (!res.headersSent) {
      res.status(500).json({ error: "Download failed to start." });
    }
    return;
  }

  ytdlp.stdout.pipe(res);

  ytdlp.stderr.on("data", (chunk) => {
    req.log?.debug?.({ stderr: chunk.toString() }, "yt-dlp stderr");
  });

  ytdlp.on("error", (err) => {
    req.log?.error?.({ err }, "yt-dlp process error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Download failed to start." });
    }
  });

  ytdlp.on("close", (code) => {
    if (code !== 0 && !res.headersSent) {
      res.status(422).json({
        error: "We couldn’t download that video quality. Try another option or verify the video is public.",
      });
    }
  });

  // Kill yt-dlp if client closes page before download finishes
  req.on("close", () => {
    if (!res.writableEnded && ytdlp) {
      try {
        ytdlp.kill("SIGKILL");
      } catch {}
    }
  });
}

router.get("/facebook/download", handleDownload);
router.post("/facebook/download", handleDownload);

export default router;