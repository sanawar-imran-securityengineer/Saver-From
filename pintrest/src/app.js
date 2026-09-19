// ===== PinSave — Pinterest Video Downloader App =====

const ALLOWED_OPTION_VALUES = ['1080p', '720p', '360p', 'mp3']
const OPTION_LABELS = {
  '1080p': '1080p Full HD (Sound Included)',
  '720p': '720p HD (Sound Included)',
  '360p': '360p SD (Compact)',
  'mp3': 'MP3 Audio (Music / Voice)',
}

const ICONS = {
  pinterest: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>`,
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
  400: 'Please enter a valid Pinterest pin link (e.g. pinterest.com/pin/... or pin.it/...).',
  404: 'The file could not be found.',
  413: 'The file is too large to process.',
  429: 'The server is busy. Please try again later.',
  500: 'This Pinterest video could not be downloaded.',
  504: 'The download took too long and was stopped.',
}

// ── Pinterest URL normalization & validation ──────────────────────────────────
function normalizeUrl(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let u = raw.trim()
  const match = u.match(/https?:\/\/[^\s]+/)
  if (match) return match[0]
  const lower = u.toLowerCase()
  if (
    lower.startsWith('pinterest.com') ||
    lower.startsWith('www.pinterest.com') ||
    lower.startsWith('pin.it') ||
    lower.startsWith('www.pin.it') ||
    lower.includes('.pinterest.') ||
    lower.startsWith('reddit.com') ||
    lower.startsWith('www.reddit.com') ||
    lower.startsWith('redd.it') ||
    lower.startsWith('v.redd.it') ||
    lower.startsWith('twitter.com') ||
    lower.startsWith('x.com') ||
    lower.startsWith('youtube.com') ||
    lower.startsWith('youtu.be')
  ) {
    return 'https://' + u
  }
  return u
}

function isValidPinterestUrl(rawUrl) {
  const url = normalizeUrl(rawUrl)
  if (!url || typeof url !== 'string' || url.length > 2048) return false
  try {
    const u = new URL(url)
    if (!u.protocol.startsWith('http')) return false
    const host = u.hostname.replace(/^www\./, '').toLowerCase()
    
    // Pinterest pin.it
    if (host === 'pin.it' || host.endsWith('.pin.it')) {
      return !!u.pathname.replace('/', '').trim()
    }
    
    // Pinterest domains
    if (host === 'pinterest.com' || host.endsWith('.pinterest.com') || host.includes('pinterest.')) {
      const path = u.pathname.toLowerCase()
      if (path.includes('/pin/') || path.startsWith('/pin/')) return true
      const parts = path.split('/').filter(Boolean)
      if (parts.length >= 1 && parts[0] === 'pin') return true
      return false
    }

    // Supported fallbacks
    if (['reddit.com', 'old.reddit.com', 'sh.reddit.com', 'm.reddit.com', 'redd.it', 'v.redd.it', 'twitter.com', 'x.com', 'youtube.com', 'youtu.be', 'snapchat.com', 'bilibili.com', 'b23.tv'].includes(host)) {
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
    <a href="#home" class="logo-link" aria-label="PinSave home">
      <div class="logo-icon">${ICONS.pinterest}</div>
      <span class="logo-text">Pin<span class="logo-accent">Save</span></span>
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
        ${ICONS.pinterest}
        <span>#1 Free Pinterest Video Downloader</span>
      </div>
      <h1>Download Pinterest Videos<br/><span class="pinterest-accent">In HD Quality with Sound</span></h1>

      <div class="downloader-card" id="downloader-card">
        <div class="audio-highlight-bar">
          <span class="audio-tag">${ICONS.volume} <strong>Sound Guaranteed:</strong> Crystal Clear Audio &amp; Video MP4</span>
          <span class="speed-tag">⚡ Ultra Fast &bull; No Watermark</span>
        </div>

        <form id="download-form" novalidate>
          <div class="input-row">
            <div class="url-input-wrap">
              <div class="pinterest-icon" style="color: var(--pinterest-red); display: flex; align-items: center;">${ICONS.pinterest}</div>
              <input
                type="url"
                id="url-input"
                name="url"
                placeholder="Paste Pinterest pin or pin.it link (e.g. pinterest.com/pin/... or pin.it/...)"
                autocomplete="off"
                spellcheck="false"
                aria-label="Pinterest pin URL"
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
            <p id="loading-msg">Fetching Pinterest video &amp; audio...</p>
            <p class="loading-sub">Extracting video and audio tracks for full quality.</p>
          </div>
          <div class="progress-track">
            <div class="progress-fill"></div>
          </div>
        </div>

        <!-- Pinterest Pin Info Preview Card -->
        <div class="reddit-preview-card" id="info-preview" hidden>
          <div class="tweet-card-header">
            <div class="reddit-avatar" style="background: var(--pinterest-red); box-shadow: 0 2px 8px var(--pinterest-red-glow);">${ICONS.pinterest}</div>
            <div class="tweet-user-meta">
              <div class="tweet-user-row">
                <span class="subreddit-tag" id="info-subreddit" style="color: var(--pinterest-red); background: var(--pinterest-red-light); border-color: var(--pinterest-red-border);">Pinterest Pin</span>
                <span class="tweet-author-name" id="info-author">Pinterest Video</span>
              </div>
              <p class="tweet-text-content" id="info-title"></p>
            </div>
          </div>
          <div class="info-thumb-wrap">
            <img id="info-thumb" src="" alt="Pinterest video preview" class="info-thumb" />
            <div class="info-thumb-overlay">
              <svg viewBox="0 0 24 24" fill="white" width="44" height="44">
                <circle cx="12" cy="12" r="11" fill="rgba(230, 0, 35, 0.85)"/>
                <polygon points="10,8 17,12 10,16" fill="white"/>
              </svg>
            </div>
            <span class="info-duration" id="info-duration"></span>
          </div>
          <div class="tweet-stats-row">
            <span class="tweet-stat-item upvotes">
              ${ICONS.upvote}
              <span id="info-views">Saved</span>
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
            <span>Your Pinterest Video is Ready!</span>
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
        For publicly accessible Pinterest pins and videos. Compliant with copyright laws and platform terms.
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
            <span>Highest Quality with Audio</span>
          </div>
        </div>
        <div class="format-chip featured">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg>
          <div>
            <strong>720p HD</strong>
            <span>Crisp &amp; Fast Download</span>
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
            <span>Pure Extracted Audio</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- How It Works -->
  <section id="how-it-works" class="section">
    <div class="container">
      <div class="section-header">
        <h2>How to Download Pinterest Videos</h2>
        <p>Three simple steps to save any Pinterest video, Idea Pin, or clip with audio directly to your device.</p>
      </div>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-num">01</div>
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </div>
          <h3>Copy Pinterest Link</h3>
          <p>Open Pinterest on the app or browser, tap <strong>Share</strong> under any pin or video, and choose <strong>Copy Link</strong>.</p>
        </div>
        <div class="step-card">
          <div class="step-num">02</div>
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          </div>
          <h3>Paste &amp; Pick Quality</h3>
          <p>Paste the pin or pin.it link into the search box above. Select 1080p, 720p HD with synced audio or MP3.</p>
        </div>
        <div class="step-card">
          <div class="step-num">03</div>
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
          <h3>Download with Sound</h3>
          <p>Click <strong>Download</strong>. Your MP4 video is ready with sound fully synced to play on any device.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Features / Safety -->
  <section id="features" class="section section-alt">
    <div class="container">
      <div class="section-header">
        <h2>Why Use PinSave?</h2>
        <p>Engineered to quickly save Pinterest videos and Idea Pins in full quality.</p>
      </div>
      <div class="safety-grid">
        <div class="safety-card">
          <div class="safety-icon orange" style="background: var(--pinterest-red-light); color: var(--pinterest-red); border-color: var(--pinterest-red-border);">${ICONS.volume}</div>
          <div>
            <h4>HD Video with Clear Audio</h4>
            <p>PinSave automatically extracts and merges audio and video into a seamless MP4 with high-quality sound.</p>
          </div>
        </div>
        <div class="safety-card">
          <div class="safety-icon orange" style="background: var(--pinterest-red-light); color: var(--pinterest-red); border-color: var(--pinterest-red-border);">${ICONS.pinterest}</div>
          <div>
            <h4>Supports pin.it &amp; All Domains</h4>
            <p>Full instant support for mobile pin.it links, standard pins, and international Pinterest domains.</p>
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
            <p>Downloaded media files are automatically purged from our servers within 30 minutes for strict privacy.</p>
          </div>
        </div>
        <div class="safety-card">
          <div class="safety-icon orange" style="background: var(--pinterest-red-light); color: var(--pinterest-red); border-color: var(--pinterest-red-border);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <h4>Multi-Layer In-Memory Cache</h4>
            <p>Cached videos are processed and served within milliseconds to eliminate wait times for trending pins.</p>
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
        <p>Everything you need to know about downloading Pinterest videos with sound.</p>
      </div>
      <div class="faq-list">
        <details class="faq-item">
          <summary class="faq-q">
            <span>Can I download Pinterest Idea Pins and video pins?</span>
            ${ICONS.chevronDown}
          </summary>
          <p class="faq-a">Yes! PinSave supports standard video pins, Idea Pins, and reels in high definition MP4 with synced audio.</p>
        </details>
        <details class="faq-item">
          <summary class="faq-q">
            <span>How do I download videos from the Pinterest mobile app?</span>
            ${ICONS.chevronDown}
          </summary>
          <p class="faq-a">In the official Pinterest app, find the pin you want to save. Tap the "Share" button beneath the pin, then choose "Copy link". Come to PinSave, paste the link, and click Download.</p>
        </details>
        <details class="faq-item">
          <summary class="faq-q">
            <span>Does PinSave support short pin.it links?</span>
            ${ICONS.chevronDown}
          </summary>
          <p class="faq-a">Yes! When you share from mobile, Pinterest generates short pin.it links. PinSave resolves and processes them automatically.</p>
        </details>
        <details class="faq-item">
          <summary class="faq-q">
            <span>Can I extract only the audio as an MP3?</span>
            ${ICONS.chevronDown}
          </summary>
          <p class="faq-a">Yes! Simply choose "MP3 Audio Only" in the quality dropdown before hitting Download. PinSave will extract the audio track to a high-bitrate MP3.</p>
        </details>
        <details class="faq-item">
          <summary class="faq-q">
            <span>Is PinSave free to use?</span>
            ${ICONS.chevronDown}
          </summary>
          <p class="faq-a">Yes, PinSave is 100% free with no hidden fees, watermarks, or account registration required.</p>
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
          <div class="logo-icon">${ICONS.pinterest}</div>
          <span class="logo-text">Pin<span class="logo-accent">Save</span></span>
        </div>
        <p class="footer-tagline">Free Pinterest Video Downloader with Sound &bull; HD MP4 &amp; MP3</p>
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
        Disclaimer: PinSave is an independent web utility and is not affiliated, endorsed, or associated with Pinterest Inc. All trademarks belong to their respective owners.
      </p>
      <p class="copyright-year">&copy; ${year} PinSave. All rights reserved.</p>
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
        urlInput.value = text.trim()
        urlInput.dispatchEvent(new Event('input'))
      } catch {
        // clipboard access denied
      }
    })
  }

  // Input validation & info prefetch
  if (urlInput) {
    urlInput.addEventListener('input', () => {
      const val = normalizeUrl(urlInput.value)
      clearTimeout(infoDebounce)

      if (!val) {
        urlStatus.textContent = ''
        urlStatus.className = 'url-status'
        infoPreview.hidden = true
        return
      }

      if (isValidPinterestUrl(val)) {
        urlStatus.textContent = '✓ Valid Pinterest pin link'
        urlStatus.className = 'url-status valid'

        infoDebounce = setTimeout(async () => {
          try {
            const res = await fetch(`/api/info?url=${encodeURIComponent(val)}`)
            if (!res.ok) return
            const data = await res.json()
            if (data && (data.title || data.thumbnail)) {
              root.querySelector('#info-title').textContent = data.title || 'Pinterest Video'
              if (data.channel) {
                root.querySelector('#info-author').textContent = data.channel
              }
              const thumb = root.querySelector('#info-thumb')
              if (data.thumbnail) {
                thumb.src = data.thumbnail
                thumb.hidden = false
              } else {
                thumb.hidden = true
              }
              const durEl = root.querySelector('#info-duration')
              if (data.duration) {
                const mins = Math.floor(data.duration / 60)
                const secs = String(data.duration % 60).padStart(2, '0')
                durEl.textContent = `${mins}:${secs}`
                durEl.hidden = false
              } else {
                durEl.hidden = true
              }
              infoPreview.hidden = false
            }
          } catch {
            // silent ignore
          }
        }, 500)
      } else {
        urlStatus.textContent = 'Please enter a valid Pinterest pin or video URL.'
        urlStatus.className = 'url-status invalid'
        infoPreview.hidden = true
      }
    })
  }

  // Form submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const rawUrl = urlInput.value.trim()
      const url = normalizeUrl(rawUrl)
      const option = qualitySelect.value

      errorBox.hidden = true
      resultCard.hidden = true

      if (!url) {
        errorText.textContent = 'Please enter a Pinterest video or pin URL.'
        errorBox.hidden = false
        return
      }

      if (!isValidPinterestUrl(url)) {
        errorText.textContent = 'Please enter a valid Pinterest pin URL (e.g. pinterest.com/pin/... or pin.it/...).'
        errorBox.hidden = false
        return
      }

      // Start download
      loadingArea.hidden = false
      downloadBtn.disabled = true
      downloadBtn.setAttribute('aria-busy', 'true')

      try {
        const res = await fetch('/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, option }),
        })

        loadingArea.hidden = true
        downloadBtn.disabled = false
        downloadBtn.removeAttribute('aria-busy')

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          const msg = errData.message || FRIENDLY_ERRORS[res.status] || 'This Pinterest video could not be downloaded.'
          errorText.textContent = msg
          errorBox.hidden = false
          return
        }

        const data = await res.json()
        if (data.success && data.download_url) {
          resultTitle.textContent = data.title || 'Pinterest Video'
          downloadFileBtn.href = data.download_url
          downloadFileBtn.setAttribute('download', data.filename || 'pinterest-video.mp4')

          // Meta grid
          const sizeMB = data.file_size ? (data.file_size / (1024 * 1024)).toFixed(1) + ' MB' : 'Ready'
          resultMetaGrid.innerHTML = `
            <div class="meta-box"><div class="meta-label">Format</div><div class="meta-value">${data.quality_selected || option}</div></div>
            <div class="meta-box"><div class="meta-label">Audio</div><div class="meta-value" style="color: var(--color-green);">Merged &amp; Synced</div></div>
            <div class="meta-box"><div class="meta-label">File Size</div><div class="meta-value">${sizeMB}</div></div>
          `

          resultCard.hidden = false
          infoPreview.hidden = true
          resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        } else {
          errorText.textContent = 'Failed to prepare video file.'
          errorBox.hidden = false
        }
      } catch {
        loadingArea.hidden = true
        downloadBtn.disabled = false
        downloadBtn.removeAttribute('aria-busy')
        errorText.textContent = 'A connection error occurred. Please check your network and try again.'
        errorBox.hidden = false
      }
    })
  }

  // Copy link button
  if (copyLinkBtn && downloadFileBtn) {
    copyLinkBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(downloadFileBtn.href)
        copyLinkBtn.querySelector('span').textContent = 'Copied!'
        setTimeout(() => {
          copyLinkBtn.querySelector('span').textContent = 'Copy Link'
        }, 2000)
      } catch {
        // fallback
      }
    })
  }

  // Start another button
  if (startAnotherBtn && urlInput) {
    startAnotherBtn.addEventListener('click', () => {
      urlInput.value = ''
      urlStatus.textContent = ''
      urlStatus.className = 'url-status'
      resultCard.hidden = true
      errorBox.hidden = true
      infoPreview.hidden = true
      urlInput.focus()
    })
  }
}
