// ===== ThreadSave — 10. Threads Video Downloader App =====

const ALLOWED_OPTION_VALUES = ['1080p', '720p', '360p', 'mp3']
const OPTION_LABELS = {
  '1080p': '1080p Full HD (Sound)',
  '720p': '720p HD (Sound)',
  '360p': '360p SD (Compact)',
  'mp3': 'MP3 Audio Only',
}

const ICONS = {
  threads: `<svg viewBox="0 0 192 192" width="22" height="22" fill="currentColor"><path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><rect x="9" y="2" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`,
  hamburger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  volume: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  upvote: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`,
}

const FRIENDLY_ERRORS = {
  400: 'Please enter a valid Threads video or post link (e.g. threads.net/@user/post/... or threads.net/t/...).',
  404: 'The requested Threads video file could not be found.',
  413: 'The file is too large to process.',
  429: 'The server is busy. Please try again later.',
  500: 'This Threads video could not be downloaded. Please check the link and try again.',
  504: 'The download took too long and was stopped.',
}

// ── Threads URL normalization & validation ─────────────────────────────────────
function normalizeUrl(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let u = raw.trim()
  u = u.replace(/^[<"'(]+|[>"')]+$/g, '')
  const match = u.match(/https?:\/\/[^\s<>"')]+/)
  if (match) {
    u = match[0]
  } else if (!/^https?:\/\//i.test(u)) {
    u = 'https://' + u
  }
  return u.replace(/[.,;!?]+$/, '')
}

function isValidThreadsUrl(rawUrl) {
  const url = normalizeUrl(rawUrl)
  if (!url || typeof url !== 'string' || url.length > 2048) return false
  try {
    const u = new URL(url)
    if (!u.protocol.startsWith('http')) return false
    const host = u.hostname.replace(/^www\./, '').toLowerCase()
    
    // Threads domains
    if (host === 'threads.net' || host === 'threads.com' || host.endsWith('.threads.net') || host.endsWith('.threads.com')) {
      const path = u.pathname.toLowerCase()
      if (path.includes('/post/') || path.startsWith('/t/') || path.includes('/share/')) return true
      const parts = path.split('/').filter(Boolean)
      if (parts.length >= 1) return true
      return false
    }

    // Supported fallbacks
    if (['twitch.tv', 'pinterest.com', 'pin.it', 'reddit.com', 'redd.it', 'twitter.com', 'x.com', 'youtube.com', 'youtu.be', 'snapchat.com', 'bilibili.com'].some(h => host === h || host.endsWith('.' + h))) {
      return !!u.pathname.replace('/', '').trim()
    }
    return false
  } catch {
    return false
  }
}

export function renderApp(root) {
  root.innerHTML = buildHTML()
  initInteractions(root)
}

function buildHTML() {
  const year = new Date().getFullYear()
  return `
<header class="site-header">
  <div class="header-inner">
    <a href="#home" class="logo-link" aria-label="10. Threads Video Downloader home">
      <div class="logo-icon">${ICONS.threads}</div>
      <span class="logo-text">10. <span class="logo-accent">Threads</span></span>
    </a>
    <nav class="nav-desktop" aria-label="Main navigation">
      <a href="#home">Home</a>
      <a href="#how-it-works">How it works</a>
      <a href="#features">Features</a>
      <a href="#faq">FAQ</a>
    </nav>
    <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-mobile">
      ${ICONS.hamburger}
    </button>
  </div>
  <nav class="nav-mobile" id="nav-mobile" aria-label="Mobile navigation">
    <a href="#home">Home</a>
    <a href="#how-it-works">How it works</a>
    <a href="#features">Features</a>
    <a href="#faq">FAQ</a>
  </nav>
</header>

<main>
  <!-- Hero + Downloader -->
  <section id="home" class="hero">
    <div class="hero-bg">
      <div class="hero-grid"></div>
      <div class="hero-glow-1"></div>
      <div class="hero-glow-2"></div>
    </div>

    <div class="hero-content">
      <div class="hero-badge">
        ${ICONS.threads}
        <span>#1 Free Threads Video Downloader</span>
      </div>
      <h1>10. Threads Video Downloader<br/><span class="threads-accent">In HD Quality with Sound</span></h1>
      <p class="hero-subtitle">Save public Meta Threads videos, clips, and posts with crystal-clear sound. 1080p, 720p HD MP4 or MP3 audio. 100% Free, no watermark or login required.</p>

      <div class="downloader-card" id="downloader-card">
        <div class="audio-highlight-bar">
          <span class="audio-tag">${ICONS.volume} <strong>Sound Guaranteed:</strong> Crystal Clear Audio &amp; Video MP4</span>
          <span class="speed-tag">⚡ Ultra Fast &bull; No Watermark</span>
        </div>

        <form id="download-form" novalidate>
          <div class="input-row">
            <div class="url-input-wrap">
              <div class="threads-icon" style="color: #000000; display: flex; align-items: center; position: absolute; left: 14px;">${ICONS.threads}</div>
              <input
                type="url"
                id="url-input"
                name="url"
                placeholder="Paste Threads post or video link (e.g. threads.net/@user/post/... or threads.net/t/...)"
                autocomplete="off"
                spellcheck="false"
                aria-label="Threads post or video URL"
              />
              <button type="button" class="paste-btn" id="paste-btn" title="Paste from clipboard">
                ${ICONS.clipboard}
                <span>Paste</span>
              </button>
            </div>

            <select id="quality-select" name="option" class="quality-select">
              <option value="1080p">1080p Full HD (Sound)</option>
              <option value="720p" selected>720p HD (Sound)</option>
              <option value="360p">360p SD (Compact)</option>
              <option value="mp3">MP3 Audio Only</option>
            </select>

            <button type="submit" class="btn-download" id="download-btn">
              ${ICONS.download}
              <span>Download</span>
            </button>
          </div>

          <div id="url-status" class="url-status" aria-live="polite"></div>
        </form>

        <!-- Loading state -->
        <div class="loading-area" id="loading-area" hidden>
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <div class="loading-text">
            <p id="loading-msg">Fetching Threads video &amp; audio...</p>
            <p class="loading-sub">Extracting media streams and audio tracks for full quality.</p>
          </div>
        </div>

        <!-- Threads Post Info Preview Card -->
        <div class="reddit-preview-card" id="info-preview" hidden>
          <div class="tweet-card-header">
            <div class="reddit-avatar" style="background: #000000; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);">${ICONS.threads}</div>
            <div class="tweet-user-meta">
              <div class="tweet-user-row">
                <span class="subreddit-tag" id="info-subreddit" style="color: #101010; background: rgba(0, 0, 0, 0.07); border-color: rgba(0, 0, 0, 0.12);">Threads Post</span>
                <span class="tweet-author-name" id="info-author">@threads_user</span>
              </div>
              <p class="tweet-text-content" id="info-title"></p>
            </div>
          </div>
          <div class="info-thumb-wrap">
            <img id="info-thumb" src="" alt="Threads video preview" class="info-thumb" />
            <div class="info-thumb-overlay">
              <svg viewBox="0 0 24 24" fill="white" width="44" height="44">
                <circle cx="12" cy="12" r="11" fill="rgba(0, 0, 0, 0.85)"/>
                <polygon points="10,8 17,12 10,16" fill="white"/>
              </svg>
            </div>
            <span class="info-duration" id="info-duration"></span>
          </div>
          <div class="tweet-stats-row">
            <span class="tweet-stat-item upvotes">
              ${ICONS.upvote}
              <span id="info-views">Ready to save</span>
            </span>
            <span class="tweet-stat-item audio-status">
              ${ICONS.volume} Audio Synced
            </span>
          </div>
        </div>

        <!-- Error box -->
        <div class="error-box" id="error-box" role="alert" hidden>
          ${ICONS.alert}
          <span id="error-text"></span>
        </div>

        <!-- Result Card -->
        <div class="result-card" id="result-card" hidden aria-live="polite">
          <div class="result-header">
            <div class="result-check">${ICONS.check}</div>
            <span>Your Threads Video is Ready!</span>
          </div>
          <div class="result-video-info" id="result-title"></div>
          <div class="result-meta-grid" id="result-meta-grid"></div>
          <div class="result-actions">
            <a href="#" class="btn-result-primary" id="download-file-btn" download>
              ${ICONS.download}
              <span>Download Video</span>
            </a>
            <button type="button" class="btn-result-ghost" id="copy-link-btn">
              ${ICONS.clipboard}
              <span>Copy Link</span>
            </button>
            <button type="button" class="btn-result-ghost" id="start-another-btn">
              ${ICONS.refresh}
              <span>Download Another</span>
            </button>
          </div>
        </div>
      </div>

      <p class="hero-legal">
        For publicly accessible Meta Threads posts and videos. Compliant with copyright laws and platform terms.
      </p>
    </div>
  </section>

  <!-- Format Strip -->
  <section class="formats-strip">
    <div class="container">
      <div class="format-chips">
        <div class="format-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg>
          <div>
            <strong>1080p Full HD</strong>
            <span>Highest Quality Source with Audio</span>
          </div>
        </div>
        <div class="format-chip featured">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg>
          <div>
            <strong>720p HD</strong>
            <span>Crisp &amp; Fast Threads Download</span>
          </div>
          <span class="chip-badge">Popular</span>
        </div>
        <div class="format-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg>
          <div>
            <strong>360p SD</strong>
            <span>Small Size, Fast Save</span>
          </div>
        </div>
        <div class="format-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          <div>
            <strong>MP3 Audio</strong>
            <span>Pure Audio / Soundtrack</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- How It Works -->
  <section id="how-it-works" class="section">
    <div class="container">
      <div class="section-header">
        <h2>How to Download Threads Videos &amp; Clips</h2>
        <p>Three simple steps to save any Meta Threads video post or clip with audio directly to your device.</p>
      </div>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-num">01</div>
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </div>
          <h3>Copy Threads Link</h3>
          <p>Open Threads on your phone or web, tap the <strong>Share</strong> or airplane icon on any post, and choose <strong>Copy Link</strong>.</p>
        </div>
        <div class="step-card">
          <div class="step-num">02</div>
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          </div>
          <h3>Paste &amp; Pick Quality</h3>
          <p>Paste the Threads link into the input bar above. Select 1080p, 720p HD with synced sound or MP3 audio.</p>
        </div>
        <div class="step-card">
          <div class="step-num">03</div>
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
          <h3>Download with Sound</h3>
          <p>Click <strong>Download</strong>. Your MP4 video is ready with sound fully synced to play on any phone or computer.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Features / Safety -->
  <section id="features" class="section section-alt">
    <div class="container">
      <div class="section-header">
        <h2>Why Choose 10. Threads Video Downloader?</h2>
        <p>Engineered to quickly save Meta Threads videos and posts in original high-definition quality.</p>
      </div>
      <div class="safety-grid">
        <div class="safety-card">
          <div class="safety-icon orange" style="background: rgba(0, 0, 0, 0.07); color: #000000; border-color: rgba(0, 0, 0, 0.14);">${ICONS.volume}</div>
          <div>
            <h4>HD Video with Clear Audio</h4>
            <p>Automatically captures and preserves full video and audio into a crystal-clear MP4 file.</p>
          </div>
        </div>
        <div class="safety-card">
          <div class="safety-icon orange" style="background: rgba(0, 0, 0, 0.07); color: #000000; border-color: rgba(0, 0, 0, 0.14);">${ICONS.threads}</div>
          <div>
            <h4>Supports All Threads Links</h4>
            <p>Full support for threads.net/@user/post/..., threads.net/t/..., and threads.com share links.</p>
          </div>
        </div>
        <div class="safety-card">
          <div class="safety-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div>
            <h4>No Login or App Required</h4>
            <p>Zero accounts, passwords, or cookies needed. Everything runs directly in your web browser 100% free.</p>
          </div>
        </div>
        <div class="safety-card">
          <div class="safety-icon black">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </div>
          <div>
            <h4>Auto-Delete in 30 Minutes</h4>
            <p>Downloaded media files are automatically erased from our servers within 30 minutes for strict privacy.</p>
          </div>
        </div>
        <div class="safety-card">
          <div class="safety-icon orange" style="background: rgba(0, 0, 0, 0.07); color: #000000; border-color: rgba(0, 0, 0, 0.14);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <h4>Lightning-Fast Fetching</h4>
            <p>High-speed stream extraction servers deliver your download links within seconds without lag.</p>
          </div>
        </div>
        <div class="safety-card">
          <div class="safety-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div>
            <h4>All Devices Supported</h4>
            <p>Works flawlessly across iPhone, iPad, Android, Windows, Mac, and Linux on Chrome, Safari, and Firefox.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section id="faq" class="section">
    <div class="container">
      <div class="section-header">
        <h2>Frequently Asked Questions</h2>
        <p>Everything you need to know about downloading Meta Threads videos and posts with sound.</p>
      </div>
      <div class="faq-list">
        <details class="faq-item">
          <summary class="faq-q">
            <span>Can I download Threads videos in HD with sound?</span>
            ${ICONS.chevronDown}
          </summary>
          <p class="faq-a">Yes! 10. Threads Video Downloader supports saving Threads video posts in high definition 1080p and 720p MP4 with crystal-clear audio.</p>
        </details>
        <details class="faq-item">
          <summary class="faq-q">
            <span>How do I copy a Threads post link?</span>
            ${ICONS.chevronDown}
          </summary>
          <p class="faq-a">In the Threads mobile app or browser, find the post. Tap the airplane/Share icon at the bottom of the post and tap "Copy link". Then paste it into the search box above.</p>
        </details>
        <details class="faq-item">
          <summary class="faq-q">
            <span>Can I extract only the audio as an MP3?</span>
            ${ICONS.chevronDown}
          </summary>
          <p class="faq-a">Yes! Simply select "MP3 Audio Only" in the quality dropdown before clicking Download. The audio track will be extracted into a high-quality MP3 file.</p>
        </details>
        <details class="faq-item">
          <summary class="faq-q">
            <span>Is 10. Threads Video Downloader free to use?</span>
            ${ICONS.chevronDown}
          </summary>
          <p class="faq-a">Yes, it is 100% free with no watermarks, registration, or software installation required.</p>
        </details>
      </div>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <div class="logo-link">
          <div class="logo-icon">${ICONS.threads}</div>
          <span class="logo-text">10. <span class="logo-accent">Threads</span></span>
        </div>
        <p class="footer-tagline">10. Threads Video Downloader with Sound &bull; HD MP4 &amp; MP3</p>
      </div>
      <div class="footer-links">
        <a href="#home">Home</a>
        <a href="#how-it-works">How it works</a>
        <a href="#features">Features</a>
        <a href="#faq">FAQ</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="copyright-notice">
        Disclaimer: 10. Threads Video Downloader is an independent web utility and is not affiliated, endorsed, or associated with Meta Platforms, Inc. or Instagram. All trademarks belong to their respective owners.
      </p>
      <p class="copyright-year">&copy; ${year} 10. Threads Video Downloader. All rights reserved.</p>
    </div>
  </div>
</footer>
`
}

function initInteractions(root) {
  const form = root.querySelector('#download-form')
  const urlInput = root.querySelector('#url-input')
  const qualitySelect = root.querySelector('#quality-select')
  const downloadBtn = root.querySelector('#download-btn')
  const pasteBtn = root.querySelector('#paste-btn')
  const urlStatus = root.querySelector('#url-status')
  const loadingArea = root.querySelector('#loading-area')
  const infoPreview = root.querySelector('#info-preview')
  const errorBox = root.querySelector('#error-box')
  const errorText = root.querySelector('#error-text')
  const resultCard = root.querySelector('#result-card')
  const resultTitle = root.querySelector('#result-title')
  const resultMetaGrid = root.querySelector('#result-meta-grid')
  const downloadFileBtn = root.querySelector('#download-file-btn')
  const copyLinkBtn = root.querySelector('#copy-link-btn')
  const startAnotherBtn = root.querySelector('#start-another-btn')
  const hamburger = root.querySelector('#hamburger')
  const navMobile = root.querySelector('#nav-mobile')

  let infoDebounce = null

  // Mobile menu
  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      const open = navMobile.classList.toggle('open')
      hamburger.setAttribute('aria-expanded', String(open))
    })
    navMobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navMobile.classList.remove('open')
        hamburger.setAttribute('aria-expanded', 'false')
      })
    })
  }

  // Paste button
  if (pasteBtn && urlInput) {
    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText()
        if (text) {
          urlInput.value = text.trim()
          urlInput.dispatchEvent(new Event('input', { bubbles: true }))
        }
      } catch {
        urlInput.focus()
      }
    })
  }

  // Real-time input handling & validation
  urlInput.addEventListener('input', () => {
    const raw = urlInput.value.trim()
    clearError()
    resultCard.hidden = true

    if (!raw) {
      urlStatus.textContent = ''
      urlStatus.className = 'url-status'
      infoPreview.hidden = true
      return
    }

    const valid = isValidThreadsUrl(raw)
    if (valid) {
      urlStatus.textContent = '✓ Valid Threads post link'
      urlStatus.className = 'url-status valid'
      scheduleInfoFetch(raw)
    } else {
      urlStatus.textContent = 'Please enter a valid Threads post URL (e.g. threads.net/@user/post/...)'
      urlStatus.className = 'url-status invalid'
      infoPreview.hidden = true
    }
  })

  // Debounced metadata prefetch (/api/info)
  function scheduleInfoFetch(rawUrl) {
    clearTimeout(infoDebounce)
    infoDebounce = setTimeout(async () => {
      const url = normalizeUrl(rawUrl)
      if (!isValidThreadsUrl(url)) return

      try {
        const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`)
        if (!res.ok) return
        const info = await res.json()
        if (!info || !info.title) return

        showInfoPreview(info)
      } catch {
        // Silently ignore prefetch failures
      }
    }, 400)
  }

  function showInfoPreview(info) {
    const thumb = root.querySelector('#info-thumb')
    const author = root.querySelector('#info-author')
    const title = root.querySelector('#info-title')
    const views = root.querySelector('#info-views')
    const duration = root.querySelector('#info-duration')

    if (info.thumbnail && thumb) {
      thumb.src = info.thumbnail
      thumb.alt = info.title || 'Threads video preview'
      thumb.hidden = false
    } else if (thumb) {
      thumb.hidden = true
    }

    if (author) {
      author.textContent = info.uploader ? `@${info.uploader}` : 'Threads User'
    }
    if (title) {
      title.textContent = info.title || ''
    }
    if (views) {
      views.textContent = info.view_count ? `${info.view_count.toLocaleString()} views` : 'Ready to save'
    }
    if (duration) {
      duration.textContent = info.duration ? formatDuration(info.duration) : 'HD Video'
    }

    infoPreview.hidden = false
  }

  function formatDuration(sec) {
    if (!sec || isNaN(sec)) return ''
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Form submission: Download video
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    clearError()
    resultCard.hidden = true

    const raw = urlInput.value.trim()
    if (!raw) {
      showError('Please enter a Threads post or video link.')
      urlInput.focus()
      return
    }

    const url = normalizeUrl(raw)
    if (!isValidThreadsUrl(url)) {
      showError('Please enter a valid Threads post URL (e.g. threads.net/@user/post/... or threads.net/t/...).')
      return
    }

    const option = qualitySelect.value
    if (!ALLOWED_OPTION_VALUES.includes(option)) {
      showError('Please select a valid quality option.')
      return
    }

    // Enter loading state
    setLoading(true)

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, option }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = data.message || FRIENDLY_ERRORS[res.status] || 'Download failed. Please try again.'
        showError(msg)
        return
      }

      showResult(data)
    } catch {
      showError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  })

  function showResult(data) {
    resultTitle.textContent = data.title || 'Threads Video'
    resultMetaGrid.innerHTML = `
      <div class="meta-box">
        <div class="meta-label">Format</div>
        <div class="meta-value">${data.option_requested === 'mp3' ? 'MP3 Audio' : 'MP4 Video'}</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Quality</div>
        <div class="meta-value">${data.quality_selected || data.option_requested}</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">File Size</div>
        <div class="meta-value">${data.file_size || 'N/A'}</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Platform</div>
        <div class="meta-value">Threads</div>
      </div>
    `

    downloadFileBtn.href = data.download_url
    downloadFileBtn.setAttribute('download', data.filename || 'threads_video.mp4')
    resultCard.hidden = false
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  // Copy link action
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', async () => {
      if (downloadFileBtn.href) {
        try {
          await navigator.clipboard.writeText(downloadFileBtn.href)
          copyLinkBtn.textContent = 'Copied!'
          setTimeout(() => {
            copyLinkBtn.innerHTML = `${ICONS.clipboard} <span>Copy Link</span>`
          }, 2000)
        } catch {
          // Fallback
        }
      }
    })
  }

  // Download another action
  if (startAnotherBtn) {
    startAnotherBtn.addEventListener('click', () => {
      urlInput.value = ''
      urlStatus.textContent = ''
      urlStatus.className = 'url-status'
      infoPreview.hidden = true
      resultCard.hidden = true
      clearError()
      urlInput.focus()
    })
  }

  function setLoading(active) {
    loadingArea.hidden = !active
    downloadBtn.disabled = active
    downloadBtn.setAttribute('aria-busy', String(active))
    if (active) {
      downloadBtn.innerHTML = `<span>Fetching...</span>`
    } else {
      downloadBtn.innerHTML = `${ICONS.download} <span>Download</span>`
    }
  }

  function showError(msg) {
    errorText.textContent = msg
    errorBox.hidden = false
  }

  function clearError() {
    errorBox.hidden = true
    errorText.textContent = ''
  }
}
