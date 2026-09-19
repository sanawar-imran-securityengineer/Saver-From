// ===== SnapSave Frontend App =====

const ALLOWED_OPTION_VALUES = ['360p', '720p', '1080p', 'mp3']
const OPTION_LABELS = {
  '360p': '360p MP4',
  '720p': '720p MP4',
  '1080p': '1080p MP4',
  'mp3': 'MP3 Audio',
}

const ICONS = {
  ghost: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7.58 2 4 5.58 4 10c0 2.28.95 4.34 2.49 5.82-.16.82-.7 2.19-2.07 2.82a.8.8 0 0 0-.42.75c.04.4.37.71.77.71.93 0 1.83-.16 2.62-.46.33-.13.71-.12 1.03.02.4.18.7.5.82.93.3 1.07 1.3 1.91 2.78 1.91s2.48-.84 2.78-1.91c.12-.43.42-.75.82-.93.32-.14.7-.15 1.03-.02.79.3 1.69.46 2.62.46.4 0 .73-.31.77-.71a.8.8 0 0 0-.42-.75c-1.37-.63-1.91-2-2.07-2.82C19.05 14.34 20 12.28 20 10c0-4.42-3.58-8-8-8z"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  hamburger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
}

const FRIENDLY_ERRORS = {
  400: 'This URL is not supported.',
  404: 'The file could not be found.',
  413: 'The file is too large to process.',
  429: 'The server is busy. Please try again later.',
  500: 'This video could not be downloaded.',
  504: 'The download took too long and was stopped.',
}

// ── Snapchat URL normalization & validation ────────────────────────────────
function normalizeUrl(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let u = raw.trim()
  // Extract URL from text (e.g. mobile share: "Check out this Spotlight on Snapchat https://...")
  const match = u.match(/https?:\/\/[^\s]+/)
  if (match) return match[0]
  const lower = u.toLowerCase()
  if (
    lower.startsWith('snapchat.com') ||
    lower.startsWith('www.snapchat.com') ||
    lower.startsWith('story.snapchat.com') ||
    lower.startsWith('t.snapchat.com') ||
    lower.startsWith('bilibili.com') ||
    lower.startsWith('www.bilibili.com') ||
    lower.startsWith('b23.tv') ||
    lower.startsWith('youtube.com') ||
    lower.startsWith('www.youtube.com') ||
    lower.startsWith('youtu.be')
  ) {
    return 'https://' + u
  }
  // Raw Spotlight ID or partial ID (like W7_EDlX... or DlX... 20+ chars)
  if (/^[A-Za-z0-9_-]{20,}$/.test(u)) {
    if (!u.startsWith('W7_') && u.length >= 45) {
      return 'https://www.snapchat.com/spotlight/W7_E' + u
    }
    return 'https://www.snapchat.com/spotlight/' + u
  }
  return u
}

function isValidSnapchatUrl(rawUrl) {
  const url = normalizeUrl(rawUrl)
  if (!url || typeof url !== 'string') return false
  if (url.length > 2048) return false
  try {
    const u = new URL(url)
    if (!u.protocol.startsWith('http')) return false
    const host = u.hostname.replace(/^www\./, '')
    if (['snapchat.com', 'story.snapchat.com', 't.snapchat.com', 'bilibili.com', 'b23.tv', 'youtube.com', 'youtu.be'].includes(host)) {
      return !!u.pathname.replace('/', '').trim()
    }
    return false
  } catch {
    return false
  }
}

function getSnapchatValidationError(rawUrl) {
  if (!rawUrl || !rawUrl.trim()) return 'Please enter a Snapchat video URL.'
  const url = normalizeUrl(rawUrl)
  if (url.length > 2048) return 'This URL is not supported.'
  try {
    const u = new URL(url)
    if (!u.protocol.startsWith('http')) return 'Please enter a valid Snapchat video URL.'
    const host = u.hostname.replace(/^www\./, '')
    if (['snapchat.com', 'story.snapchat.com', 't.snapchat.com'].includes(host)) {
      if (!u.pathname.replace('/', '').trim()) return 'Please enter a valid Snapchat video link.'
      return null
    }
    if (['bilibili.com', 'b23.tv', 'youtube.com', 'youtu.be'].includes(host)) {
      return null
    }
    return 'This URL is not supported. Please use a Snapchat video URL (e.g. snapchat.com/spotlight/...).'
  } catch {
    return 'Please enter a valid Snapchat video URL.'
  }
}

function renderApp(root) {
  root.innerHTML = buildHTML()
  initInteractions(root)
}

function buildHTML() {
  const year = new Date().getFullYear()
  return `
<header class="site-header">
  <div class="header-inner">
    <a href="#home" class="logo-link" aria-label="SnapSave home">
      <span class="logo-icon">${ICONS.ghost}</span>
      <span class="logo-text">Snap<span>Save</span></span>
    </a>
    <nav class="nav-desktop" aria-label="Main navigation">
      <a href="#home">Home</a>
      <a href="#how-it-works">How it works</a>
      <a href="#safety">Safety</a>
      <a href="#terms">Terms</a>
      <a href="#privacy">Privacy</a>
    </nav>
    <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-mobile">
      ${ICONS.hamburger}
    </button>
  </div>
  <nav class="nav-mobile" id="nav-mobile" aria-label="Mobile navigation">
    <a href="#home">Home</a>
    <a href="#how-it-works">How it works</a>
    <a href="#safety">Safety</a>
    <a href="#terms">Terms</a>
    <a href="#privacy">Privacy</a>
  </nav>
</header>

<main>
  <!-- Hero + Downloader -->
  <section id="home" class="hero">
    <div class="security-badge">
      ${ICONS.shield}
      Public Spotlight &amp; Stories — No Login Required
    </div>
    <h1>Download Snapchat Videos Fast &amp; Free in HD</h1>
    <p>Download public Snapchat Spotlight videos and Stories directly in MP4 or MP3 format. 100% free, no watermark, no password or app required.</p>

    <div class="downloader-card" aria-busy="false">
      <div class="card-brand">
        <div class="brand-name">SnapSave</div>
        <div class="brand-tagline">Fast Snapchat Spotlight &amp; Story video downloader</div>
      </div>

      <form id="download-form" novalidate>
        <div class="field-group">
          <label for="url-input">Snapchat Video URL</label>
          <input
            type="url"
            id="url-input"
            name="url"
            placeholder="Paste Snapchat link here (e.g. snapchat.com/spotlight/... or t.snapchat.com/...)"
            autocomplete="off"
            spellcheck="false"
            aria-describedby="status"
          />
        </div>

        <div class="field-group">
          <label for="quality-select">Output format</label>
          <select id="quality-select" name="option">
            <option value="360p">360p MP4</option>
            <option value="720p" selected>720p MP4 (HD)</option>
            <option value="1080p">1080p MP4 (Full HD)</option>
            <option value="mp3">MP3 Audio</option>
          </select>
        </div>

        <button type="submit" class="btn-download" id="download-btn">
          ${ICONS.download}
          <span>Download Now</span>
        </button>
      </form>

      <div class="progress-area" id="progress-area" aria-live="polite">
        <div class="spinner"></div>
        <div class="progress-bar-wrapper">
          <div class="progress-bar" id="progress-bar"></div>
        </div>
        <div class="progress-text" id="progress-text">Preparing your download...</div>
        <div class="progress-sub">This may take a moment.</div>
      </div>

      <div class="error-message" id="error-message" role="alert" aria-live="assertive">
        ${ICONS.alert}
        <span id="error-text"></span>
      </div>

      <div class="result-card" id="result-card" aria-live="polite">
        <div class="result-header">
          ${ICONS.check}
          <span class="result-title-text">Download ready</span>
        </div>
        <div class="result-meta" id="result-meta"></div>
        <div class="result-actions">
          <a href="#" class="btn-secondary" id="download-file-btn">
            ${ICONS.file}
            Download File
          </a>
          <button type="button" class="btn-ghost" id="start-another-btn">
            ${ICONS.refresh}
            Start another
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- How it works -->
  <section id="how-it-works" class="section">
    <h2 class="section-title">How it works</h2>
    <p class="section-subtitle">Three simple steps to download Snapchat videos &amp; Stories.</p>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">${ICONS.clipboard}</div>
        <h3>Paste Snapchat Link</h3>
        <p>Copy any public Snapchat Spotlight video or Story link and paste it into the input box above.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">${ICONS.settings}</div>
        <h3>Select format</h3>
        <p>Choose HD MP4 (720p / 1080p), fast 360p, or extract crisp MP3 audio with one click.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">${ICONS.download}</div>
        <h3>Instant Download</h3>
        <p>Click Download Now. Your video is ready in seconds with clean quality and zero watermark.</p>
      </div>
    </div>
  </section>

  <!-- Safety -->
  <section id="safety" class="section">
    <h2 class="section-title">Safety &amp; privacy</h2>
    <p class="section-subtitle">Built with security-first principles for public content only.</p>
    <div class="safety-grid">
      ${buildSafetyItem('Public Spotlight & Stories only')}
      ${buildSafetyItem('No account or password needed')}
      ${buildSafetyItem('No cookies or access tokens')}
      ${buildSafetyItem('No watermark added')}
      ${buildSafetyItem('Automatic file deletion after 30 min')}
      ${buildSafetyItem('IP-based rate limiting')}
      ${buildSafetyItem('Encrypted SSL connection')}
      ${buildSafetyItem('Fast high-speed CDN download')}
      ${buildSafetyItem('Secure UUID filenames')}
      ${buildSafetyItem('Works on iPhone, Android & PC')}
    </div>
  </section>

  <!-- Copyright notice -->
  <section class="section" style="padding-top:0">
    <div class="copyright-notice">
      <p>
        This service is intended only for publicly accessible content that you own or have permission to use. You are responsible for complying with copyright law, Snapchat's Terms of Service, and all applicable laws. Do not download private, restricted, or unauthorized content.
      </p>
    </div>
  </section>

  <!-- Terms -->
  <section id="terms" class="section">
    <h2 class="section-title">Terms &amp; usage notice</h2>
    <p class="section-subtitle">Please read these terms before using SnapSave.</p>
    <div class="info-card">
      <h3>Acceptable use</h3>
      <p>You may use SnapSave to download <strong>publicly accessible Snapchat videos &amp; Stories</strong> that you own or have explicit permission to download. You must not use this service to download private, restricted, or copyrighted content without consent.</p>
      <h3>Your responsibility</h3>
      <p>You are solely responsible for ensuring your use of downloaded content complies with all applicable copyright laws, Snapchat's Community Guidelines and Terms of Service, and third-party rights.</p>
      <h3>No warranties</h3>
      <p>This service is provided "as is" without warranty of any kind. Downloads may fail if Snapchat changes its systems or if a video is unavailable in the requested format.</p>
    </div>
  </section>

  <!-- Privacy -->
  <section id="privacy" class="section">
    <h2 class="section-title">Privacy &amp; security information</h2>
    <p class="section-subtitle">What we collect and how we protect your data.</p>
    <div class="info-card">
      <h3>No personal data stored</h3>
      <p>SnapSave does not require an account, login, or any personal information. No Snapchat passwords, cookies, session IDs, or private credentials are ever requested or stored.</p>
      <h3>Temporary storage only</h3>
      <p>Downloaded files are stored temporarily on the server and are <strong>automatically deleted after 30 minutes</strong>. No files are kept permanently.</p>
      <h3>Security measures</h3>
      <p>All filenames are generated using secure UUIDs. The server validates every URL, enforces rate limits, and protects against unauthorized access.</p>
      <h3>No tracking or selling data</h3>
      <p>SnapSave respects your privacy. We never track your personal browsing habits or sell any user data to third parties.</p>
    </div>
  </section>

  <!-- FAQ -->
  <section id="faq" class="section">
    <h2 class="section-title">Frequently asked questions</h2>
    <p class="section-subtitle">Common questions about SnapSave.</p>
    <div class="faq-list">
      ${buildFaqItem('Do I need a Snapchat account or login?',
        'No! SnapSave does not require any account, app installation, login, or cookies. Just paste a public Snapchat Spotlight or Story link.')}
      ${buildFaqItem('Can I download Snapchat Spotlight videos?',
        'Yes. SnapSave fully supports Snapchat Spotlight videos in full original quality (MP4) with audio.')}
      ${buildFaqItem('Can I download Snapchat Stories?',
        'Yes, you can download public Snapchat Stories. Make sure the story is publicly visible.')}
      ${buildFaqItem('Does it have watermarks?',
        'No, SnapSave downloads the original video without adding any extra watermarks or logos.')}
      ${buildFaqItem('Why did my download fail?',
        'Downloads can fail if the video is private, has expired (after 24h for normal stories), or has been deleted by the author.')}
      ${buildFaqItem('What formats are available?',
        'SnapSave provides 1080p Full HD, 720p HD, 360p MP4, and direct MP3 audio extraction.')}
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">Snap<span>Save</span></div>
    <div class="footer-tagline">Snapchat Spotlight &amp; Story video downloader — public content only</div>
    <div class="footer-links">
      <a href="#home">Home</a>
      <a href="#safety">Safety</a>
      <a href="#terms">Terms</a>
      <a href="#privacy">Privacy</a>
    </div>
    <div class="footer-copyright">
      &copy; ${year} SnapSave. This service is intended only for publicly accessible Snapchat content that you own or have permission to use.
    </div>
  </div>
</footer>

<div class="sr-only" id="status" role="status" aria-live="polite"></div>
`
}

function buildSafetyItem(text) {
  return `<div class="safety-item">${ICONS.check}<span>${text}</span></div>`
}

function buildFaqItem(question, answer) {
  return `
    <div class="faq-item">
      <button class="faq-question" aria-expanded="false">
        <span>${question}</span>
        ${ICONS.chevronDown}
      </button>
      <div class="faq-answer">
        <div class="faq-answer-inner">${answer}</div>
      </div>
    </div>
  `
}

function initInteractions(root) {
  const hamburger = root.querySelector('#hamburger')
  const navMobile = root.querySelector('#nav-mobile')

  hamburger.addEventListener('click', () => {
    const isOpen = navMobile.classList.toggle('open')
    hamburger.setAttribute('aria-expanded', String(isOpen))
    hamburger.innerHTML = isOpen ? ICONS.close : ICONS.hamburger
  })

  navMobile.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      navMobile.classList.remove('open')
      hamburger.setAttribute('aria-expanded', 'false')
      hamburger.innerHTML = ICONS.hamburger
    })
  })

  root.querySelectorAll('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-question')
    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open')
      btn.setAttribute('aria-expanded', String(isOpen))
    })
  })

  initDownloadForm(root)
}

function initDownloadForm(root) {
  const form = root.querySelector('#download-form')
  const urlInput = root.querySelector('#url-input')
  const qualitySelect = root.querySelector('#quality-select')
  const downloadBtn = root.querySelector('#download-btn')
  const progressArea = root.querySelector('#progress-area')
  const progressBar = root.querySelector('#progress-bar')
  const progressText = root.querySelector('#progress-text')
  const errorMsg = root.querySelector('#error-message')
  const errorText = root.querySelector('#error-text')
  const resultCard = root.querySelector('#result-card')
  const resultMeta = root.querySelector('#result-meta')
  const downloadFileBtn = root.querySelector('#download-file-btn')
  const startAnotherBtn = root.querySelector('#start-another-btn')
  const statusLive = root.querySelector('#status')
  const card = root.querySelector('.downloader-card')

  let isDownloading = false
  let progressInterval = null
  let abortController = null

  function setDownloading(state) {
    isDownloading = state
    card.setAttribute('aria-busy', String(state))
    urlInput.disabled = state
    qualitySelect.disabled = state
    downloadBtn.disabled = state
  }

  function showError(message) {
    errorText.textContent = message
    errorMsg.classList.add('active')
    statusLive.textContent = message
  }

  function hideError() {
    errorMsg.classList.remove('active')
    errorText.textContent = ''
  }

  function showProgress() {
    progressBar.style.width = '0%'
    progressText.textContent = 'Preparing your download...'
    progressArea.classList.add('active')
    let pct = 0
    progressInterval = setInterval(() => {
      if (pct < 90) {
        pct += Math.random() * 8 + 2
        if (pct > 90) pct = 90
        progressBar.style.width = pct + '%'
      }
    }, 600)
  }

  function hideProgress() {
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }
    progressArea.classList.remove('active')
  }

  function showResult(data) {
    const optionLabel = OPTION_LABELS[data.option_requested] || data.option_requested
    const qualityLabel = data.quality_selected === 'mp3' ? 'MP3 Audio' : (OPTION_LABELS[data.quality_selected] || data.quality_selected)
    const fileExt = data.filename ? data.filename.split('.').pop().toUpperCase() : 'MP4'

    // Meta info grid hidden — sirf Download ready + buttons dikhenge
    resultMeta.innerHTML = ''
    resultMeta.style.display = 'none'

    downloadFileBtn.href = data.download_url || '#'
    downloadFileBtn.setAttribute('download', '')
    resultCard.classList.add('active')
    statusLive.textContent = 'Download ready: ' + (data.title || 'video')
  }

  function hideResult() {
    resultCard.classList.remove('active')
  }

  function resetForm() {
    hideError()
    hideProgress()
    hideResult()
    progressBar.style.width = '0%'
    urlInput.value = ''
    qualitySelect.value = '720p'
    urlInput.focus()
  }

  startAnotherBtn.addEventListener('click', resetForm)

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (isDownloading) return

    hideError()
    hideResult()

    const rawInput = urlInput.value.trim()
    const url = normalizeUrl(rawInput)
    const option = qualitySelect.value

    const validationError = getSnapchatValidationError(url)
    if (validationError) {
      showError(validationError)
      urlInput.focus()
      return
    }

    if (!ALLOWED_OPTION_VALUES.includes(option)) {
      showError('This format is not supported.')
      return
    }

    // Auto-update the input field with normalized URL so user sees it clearly
    urlInput.value = url

    setDownloading(true)
    showProgress()

    abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), 180000)

    try {
      const resp = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, option }),
        signal: abortController.signal,
      })

      let data = null
      const contentType = resp.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        try {
          data = await resp.json()
        } catch {
          data = null
        }
      }

      if (resp.ok && data && data.success) {
        progressBar.style.width = '100%'
        setTimeout(() => {
          hideProgress()
          showResult(data)
          setDownloading(false)
        }, 400)
      } else if (data && (data.message || data.detail)) {
        hideProgress()
        setDownloading(false)
        showError(data.message || data.detail)
      } else {
        hideProgress()
        setDownloading(false)
        showError(FRIENDLY_ERRORS[resp.status] || 'This video could not be downloaded.')
      }
    } catch (err) {
      hideProgress()
      setDownloading(false)
      if (err.name === 'AbortError') {
        showError('The download took too long and was stopped.')
      } else {
        showError('This video could not be downloaded.')
      }
    } finally {
      clearTimeout(timeoutId)
      abortController = null
    }
  })
}

function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export { renderApp, isValidSnapchatUrl, getSnapchatValidationError, isValidSnapchatUrl as isValidBilibiliUrl, getSnapchatValidationError as getBilibiliValidationError }
