// ===== XSave — Twitter (X) Video Downloader App =====

const ALLOWED_OPTION_VALUES = ['1080p', '720p', '360p', 'mp3']
const OPTION_LABELS = {
  '1080p': '1080p Full HD',
  '720p': '720p HD',
  '360p': '360p SD',
  'mp3': 'MP3 Audio',
}

const ICONS = {
  x: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><rect x="9" y="2" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`,
  hamburger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
}

const FRIENDLY_ERRORS = {
  400: 'Please enter a valid Twitter/X post link (e.g. x.com/.../status/...).',
  404: 'The file could not be found.',
  413: 'The file is too large to process.',
  429: 'The server is busy. Please try again later.',
  500: 'This Twitter video could not be downloaded.',
  504: 'The download took too long and was stopped.',
}

// ── Twitter / X URL normalization & validation ─────────────────────────────
function normalizeUrl(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let u = raw.trim()
  const match = u.match(/https?:\/\/[^\s]+/)
  if (match) return match[0]
  const lower = u.toLowerCase()
  if (
    lower.startsWith('twitter.com') ||
    lower.startsWith('www.twitter.com') ||
    lower.startsWith('mobile.twitter.com') ||
    lower.startsWith('x.com') ||
    lower.startsWith('www.x.com') ||
    lower.startsWith('youtube.com') ||
    lower.startsWith('youtu.be')
  ) {
    return 'https://' + u
  }
  return u
}

function isValidTwitterUrl(rawUrl) {
  const url = normalizeUrl(rawUrl)
  if (!url || typeof url !== 'string' || url.length > 2048) return false
  try {
    const u = new URL(url)
    if (!u.protocol.startsWith('http')) return false
    const host = u.hostname.replace(/^www\./, '').replace(/^mobile\./, '')
    if (['twitter.com', 'x.com'].includes(host)) {
      return /status\/\d+/.test(u.pathname)
    }
    if (['youtube.com', 'youtu.be', 'snapchat.com', 'bilibili.com', 'b23.tv'].includes(host)) {
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
    <a href="#home" class="logo-link" aria-label="XSave home">
      <div class="logo-icon">${ICONS.x}</div>
      <span class="logo-text">X<span class="logo-accent">Save</span></span>
    </a>
    <nav class="nav-desktop" aria-label="Main navigation">
      <a href="#home">Home</a>
      <a href="#how-it-works">How it works</a>
      <a href="#safety">Safety</a>
      <a href="#faq">FAQ</a>
    </nav>
    <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-mobile">
      ${ICONS.hamburger}
    </button>
  </div>
  <nav class="nav-mobile" id="nav-mobile" aria-label="Mobile navigation">
    <a href="#home">Home</a>
    <a href="#how-it-works">How it works</a>
    <a href="#safety">Safety</a>
    <a href="#faq">FAQ</a>
  </nav>
</header>

<main>
  <!-- Hero + Downloader -->
  <section id="home" class="hero">
    <div class="hero-bg">
      <div class="hero-grid"></div>
      <div class="hero-glow-1"></div>
    </div>

    <div class="hero-content">
      <div class="hero-badge">
        ${ICONS.x}
        <span>Twitter / X Video &amp; GIF Downloader</span>
      </div>
      <h1>Download Twitter (X) Videos<br/><span class="x-accent">Fast, Free &amp; in HD</span></h1>
      <p class="hero-subtitle">Download public Twitter / X videos, reels, and GIFs in 1080p, 720p MP4 or MP3 audio. 100% free, no login or app required.</p>

      <div class="downloader-card" id="downloader-card">
        <form id="download-form" novalidate>
          <div class="input-row">
            <div class="url-input-wrap">
              <div class="x-icon">${ICONS.x}</div>
              <input
                type="url"
                id="url-input"
                name="url"
                placeholder="Paste Twitter or X post URL (e.g. x.com/.../status/...)"
                autocomplete="off"
                spellcheck="false"
                aria-label="Twitter or X post URL"
              />
              <button type="button" class="paste-btn" id="paste-btn" title="Paste from clipboard">
                ${ICONS.clipboard}
                <span>Paste</span>
              </button>
            </div>

            <select id="quality-select" name="option" class="quality-select">
              <option value="1080p">1080p Full HD</option>
              <option value="720p" selected>720p HD</option>
              <option value="360p">360p SD</option>
              <option value="mp3">MP3 Audio</option>
            </select>

            <button type="submit" class="btn-download" id="download-btn">
              ${ICONS.download}
              <span>Download</span>
            </button>
          </div>
        </form>

        <div id="url-status" class="url-status"></div>

        <div class="loading-area" id="loading-area" hidden>
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <div class="loading-text">
            <p id="loading-msg">Fetching Twitter video...</p>
            <p class="loading-sub">Converting and preparing your media file.</p>
          </div>
          <div class="progress-track">
            <div class="progress-fill"></div>
          </div>
        </div>

        <div class="error-box" id="error-box" role="alert" hidden>
          ${ICONS.alert}
          <span id="error-text"></span>
        </div>

        <div class="result-card" id="result-card" hidden>
          <div class="result-header">
            <div class="result-check">${ICONS.check}</div>
            <span>Your Twitter Media is Ready!</span>
          </div>
          <div class="result-video-info" id="result-video-info"></div>
          <div class="result-meta-grid" id="result-meta-grid"></div>
          <div class="result-actions">
            <a href="#" class="btn-result-primary" id="download-file-btn" download>
              ${ICONS.download}
              <span>Download File</span>
            </a>
            <button type="button" class="btn-result-ghost" id="start-another-btn">
              ${ICONS.refresh}
              <span>Download Another</span>
            </button>
          </div>
        </div>
      </div>

      <p class="hero-legal">
        For publicly accessible posts you have rights or permission to view. Compliant with copyright laws and platform terms.
      </p>
    </div>
  </section>

  <!-- Format chips -->
  <section class="formats-strip">
    <div class="container">
      <div class="format-chips">
        <div class="format-chip">
          <div><strong>1080p Full HD</strong><span>Highest Quality MP4</span></div>
        </div>
        <div class="format-chip featured">
          <div><strong>720p HD</strong><span>Fast &amp; Crisp Video</span></div>
          <span class="chip-badge">Popular</span>
        </div>
        <div class="format-chip">
          <div><strong>360p SD</strong><span>Compact File Size</span></div>
        </div>
        <div class="format-chip">
          <div><strong>MP3 Audio</strong><span>Soundtrack &amp; Voice</span></div>
        </div>
      </div>
    </div>
  </section>

  <!-- How it works -->
  <section id="how-it-works" class="section">
    <div class="container">
      <div class="section-header">
        <h2>How to Download Twitter (X) Videos</h2>
        <p>Three quick steps to save any video, GIF, or reel to your device.</p>
      </div>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-num">01</div>
          <h3>Copy Tweet Link</h3>
          <p>Open X or Twitter, click the Share button on any post, and select "Copy Link".</p>
        </div>
        <div class="step-card">
          <div class="step-num">02</div>
          <h3>Paste &amp; Select Format</h3>
          <p>Paste the link into the search bar above and pick 1080p, 720p, 360p MP4, or MP3 audio.</p>
        </div>
        <div class="step-card">
          <div class="step-num">03</div>
          <h3>Download File</h3>
          <p>Click Download. Your HD video or GIF is saved directly to your phone or computer.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section id="faq" class="section section-alt">
    <div class="container">
      <div class="section-header">
        <h2>Frequently Asked Questions</h2>
        <p>Common questions about downloading Twitter (X) videos.</p>
      </div>
      <div class="faq-list">
        <details class="faq-item">
          <summary class="faq-q">
            <span>How do I get the video link from Twitter / X?</span>
            ${ICONS.chevronDown}
          </summary>
          <p class="faq-a">On the Twitter (X) app or website, tap the Share button under the tweet and select "Copy link". Paste it into the input above.</p>
        </details>
        <details class="faq-item">
          <summary class="faq-q">
            <span>Can I download Twitter GIFs?</span>
            ${ICONS.chevronDown}
          </summary>
          <p class="faq-a">Yes! Twitter GIFs are converted to looping MP4 videos that you can download directly in high quality.</p>
        </details>
        <details class="faq-item">
          <summary class="faq-q">
            <span>Do I need an account or software?</span>
            ${ICONS.chevronDown}
          </summary>
          <p class="faq-a">No. XSave is 100% free and web-based. No account, login, or software installation is required.</p>
        </details>
      </div>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div>
        <div class="logo-link">
          <div class="logo-icon">${ICONS.x}</div>
          <span class="logo-text">X<span class="logo-accent">Save</span></span>
        </div>
        <p class="footer-tagline">Fast, Free Twitter (X) Video &amp; GIF Downloader</p>
      </div>
      <div class="footer-links">
        <a href="#home">Home</a>
        <a href="#how-it-works">How it works</a>
        <a href="#safety">Safety</a>
        <a href="#faq">FAQ</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="copyright-notice">Disclaimer: XSave is not affiliated with Twitter or X Corp. All trademarks belong to their respective owners.</p>
      <p>&copy; ${year} XSave. All rights reserved.</p>
    </div>
  </div>
</footer>
`
}

function initInteractions(root) {
  const hamburger = root.querySelector('#hamburger')
  const navMobile = root.querySelector('#nav-mobile')
  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      navMobile.classList.toggle('open')
    })
  }

  const form = root.querySelector('#download-form')
  const urlInput = root.querySelector('#url-input')
  const qualitySelect = root.querySelector('#quality-select')
  const pasteBtn = root.querySelector('#paste-btn')
  const downloadBtn = root.querySelector('#download-btn')
  const urlStatus = root.querySelector('#url-status')
  const loadingArea = root.querySelector('#loading-area')
  const errorBox = root.querySelector('#error-box')
  const errorText = root.querySelector('#error-text')
  const resultCard = root.querySelector('#result-card')
  const downloadFileBtn = root.querySelector('#download-file-btn')
  const startAnotherBtn = root.querySelector('#start-another-btn')

  if (pasteBtn && urlInput) {
    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText()
        urlInput.value = text.trim()
        urlInput.dispatchEvent(new Event('input'))
      } catch {
        urlInput.focus()
      }
    })
  }

  if (urlInput) {
    urlInput.addEventListener('input', () => {
      const u = urlInput.value.trim()
      if (!u) {
        urlStatus.textContent = ''
        urlStatus.className = 'url-status'
        return
      }
      if (isValidTwitterUrl(u)) {
        urlStatus.textContent = '✓ Valid Twitter / X URL'
        urlStatus.className = 'url-status valid'
      } else {
        urlStatus.textContent = 'Please enter a valid Twitter/X post URL'
        urlStatus.className = 'url-status invalid'
      }
    })
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const rawUrl = urlInput.value.trim()
      if (!rawUrl) {
        showError('Please enter a Twitter or X post URL.')
        return
      }
      const url = normalizeUrl(rawUrl)
      if (!isValidTwitterUrl(url)) {
        showError('Please enter a valid Twitter/X post link (e.g. x.com/.../status/...).')
        return
      }

      errorBox.hidden = true
      resultCard.hidden = true
      loadingArea.hidden = false
      downloadBtn.disabled = true

      try {
        const res = await fetch('/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, option: qualitySelect.value }),
        })

        const data = await res.json()
        loadingArea.hidden = true
        downloadBtn.disabled = false

        if (!res.ok || !data.success) {
          const msg = data.message || FRIENDLY_ERRORS[res.status] || 'This video could not be downloaded.'
          showError(msg)
          return
        }

        // Render result
        root.querySelector('#result-video-info').textContent = data.title || 'Twitter Video'
        const metaGrid = root.querySelector('#result-meta-grid')
        metaGrid.innerHTML = `
          <div class="meta-box"><div class="meta-label">Format</div><div class="meta-value">${data.option_requested || 'HD'}</div></div>
          <div class="meta-box"><div class="meta-label">Quality</div><div class="meta-value">${data.quality_selected || 'Best'}</div></div>
          <div class="meta-box"><div class="meta-label">Size</div><div class="meta-value">${data.file_size || 'Ready'}</div></div>
        `
        downloadFileBtn.href = data.download_url
        resultCard.hidden = false
      } catch (err) {
        loadingArea.hidden = true
        downloadBtn.disabled = false
        showError('Download request failed. Please check your connection and try again.')
      }
    })
  }

  function showError(msg) {
    errorText.textContent = msg
    errorBox.hidden = false
    loadingArea.hidden = true
  }

  if (startAnotherBtn) {
    startAnotherBtn.addEventListener('click', () => {
      resultCard.hidden = true
      errorBox.hidden = true
      urlInput.value = ''
      urlStatus.textContent = ''
      urlInput.focus()
    })
  }
}
