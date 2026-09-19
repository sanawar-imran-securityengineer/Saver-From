const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const REQUEST_TIMEOUT_MS = 8000;

function jsonRes(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isTikTokUrl(value: string) {
  try {
    const parsed = new URL(value);
    return ["tiktok.com", "www.tiktok.com", "vm.tiktok.com"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, ms = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function firstUrl(values: (string | undefined | null)[]): string | undefined {
  return values.find((v): v is string => typeof v === "string" && /^https?:\/\//i.test(v));
}

function resultFrom(
  source: string,
  videoUrl: string | undefined,
  rawResponse: unknown,
  sizes: { label: string; value: string; url: string }[] = [],
) {
  if (!videoUrl) throw new Error(`${source} returned no video URL`);
  return { source, videoUrl, rawResponse, sizes };
}

// Technique A1: tdownv4 worker
async function fromTDown(tiktokUrl: string) {
  const res = await fetchWithTimeout(
    `https://tdownv4.sl-bjs.workers.dev/?down=${encodeURIComponent(tiktokUrl)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: Record<string, unknown> = await res.json();
  const videoUrl = firstUrl([
    data?.url as string,
    (data?.data as Record<string, string>)?.url,
    (data?.video as Record<string, string>)?.url,
    (data?.result as Record<string, string>)?.url,
    (data?.data as Record<string, string>)?.play,
  ]);
  return resultFrom("free-api-1", videoUrl, data);
}

// Technique A2: tikwm.com — returns no-watermark, watermark, and audio options
async function fromTikWM(tiktokUrl: string) {
  const res = await fetchWithTimeout(
    `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}&hd=1`,
    { headers: { Accept: "application/json", "User-Agent": "TikDownloader/1.0" } },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: Record<string, unknown> = await res.json();
  // tikwm wraps results in data.data
  const payload = (data?.data || data?.result || data) as Record<string, string>;
  const noWatermark = firstUrl([payload?.play, payload?.hdplay, payload?.no_watermark, payload?.noWatermark, payload?.url]);
  const watermark = firstUrl([payload?.wmplay, payload?.watermark]);
  const audio = firstUrl([payload?.music, (payload?.music_info as Record<string, string>)?.play]);
  const sizes = [
    noWatermark && { label: "No watermark · HD", value: "HD", url: noWatermark },
    watermark && { label: "With watermark", value: "SD", url: watermark },
    audio && { label: "Audio · MP3", value: "MP3", url: audio },
  ].filter((x): x is { label: string; value: string; url: string } => Boolean(x));
  return resultFrom("free-api-2", noWatermark || watermark, data, sizes);
}

// Technique A3: snaptik-style API
async function fromSnaptik(tiktokUrl: string) {
  const res = await fetchWithTimeout(
    `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(tiktokUrl)}`,
    { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" } },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: Record<string, unknown> = await res.json();
  const videoUrl = firstUrl([
    (data as Record<string, string>)?.url,
    ((data?.video as Record<string, string>))?.url,
  ]);
  return resultFrom("free-api-3", videoUrl, data);
}

// Technique B: HTML page scraping — extract .mp4 or embedded JSON video URLs
async function fromHtmlScrape(tiktokUrl: string) {
  const res = await fetchWithTimeout(tiktokUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
  }, 10000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  // Priority 1: look for direct .mp4 links that contain "video" in their path
  const mp4Matches = [...html.matchAll(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/gi)]
    .map((m) => m[0].replace(/\\u0026/g, "&"))
    .filter((u) => u.includes("video") || u.includes("v1") || u.includes("cdn"));

  // Priority 2: JSON-embedded video fields
  const jsonMatches = [...html.matchAll(/"(?:playAddr|downloadAddr|playAddress)":"(https?:[^"]+)"/gi)]
    .map((m) => m[1].replace(/\\u0026/g, "&").replace(/\\/g, ""));

  const videoUrl = firstUrl([...jsonMatches, ...mp4Matches]);
  return resultFrom("html-scrape", videoUrl, { matched: Boolean(videoUrl) });
}

const SOURCES = [
  { name: "tikwm", run: fromTikWM },
  { name: "tdown", run: fromTDown },
  { name: "snaptik", run: fromSnaptik },
  { name: "html-scrape", run: fromHtmlScrape },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return jsonRes({ success: false, error: "Method not allowed" }, 405);
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return jsonRes({ success: false, error: "Invalid JSON body" }, 400);
    }

    const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
    if (!rawUrl || !isTikTokUrl(rawUrl)) {
      return jsonRes({ success: false, error: "Please provide a valid TikTok video link." }, 400);
    }

    for (const source of SOURCES) {
      try {
        console.log(`[download] trying ${source.name}`);
        const result = await source.run(rawUrl);
        console.log(`[download] ${source.name} succeeded: ${result.videoUrl.slice(0, 60)}`);
        return jsonRes({ success: true, ...result });
      } catch (err) {
        console.warn(`[download] ${source.name} failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return jsonRes({ success: false, error: "No download source could access this video right now. Please try again later." }, 502);
  } catch (err) {
    console.error("[download] unhandled error:", err);
    return jsonRes({ success: false, error: "An unexpected error occurred." }, 500);
  }
});
