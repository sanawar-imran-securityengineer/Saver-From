// ===== SwiftFetch Frontend App =====

const ALLOWED_OPTION_VALUES = ['360p', '720p', '1080p', 'mp3']
const OPTION_LABELS = {
  '360p': '360p MP4',
  '720p': '720p MP4',
  '1080p': '1080p MP4',
  'mp3': 'MP3 Audio',
}

const ICONS = {
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

function isValidYouTubeUrl(url) {
  if (!url || typeof url !== 'string') return false
  if (url.length > 2048) return false
  try {
    const u = new URL(url)
    if (!u.protocol.startsWith('http')) return false
    const host = u.hostname.replace(/^www\./, '')
    if (!['youtube.com', 'youtu.be'].includes(host)) return false
    if (u.searchParams.has('list')) return false
    if (host === 'youtu.be') {
      return !!u.pathname.slice(1)
    }
    if (u.pathname === '/watch') {
      return u.searchParams.has('v')
    }
    if (u.pathname.startsWith('/shorts/')) {
      return u.pathname.split('/')[2] !== undefined
    }
    return false
  } catch {
    return false
  }
}

function getYouTubeValidationError(url) {
  if (!url || !url.trim()) return 'Please enter a YouTube URL.'
  const trimmed = url.trim()
  if (trimmed.length > 2048) return 'This URL is not supported.'
  try {
    const u = new URL(trimmed)
    if (!u.protocol.startsWith('http')) return 'Please enter a valid YouTube video URL.'
    const host = u.hostname.replace(/^www\./, '')
    if (!['youtube.com', 'youtu.be'].includes(host)) return 'This URL is not supported.'
    if (u.searchParams.has('list')) return 'Playlists are not supported.'
    if (host === 'youtu.be') {
      if (!u.pathname.slice(1)) return 'Please enter a valid YouTube video URL.'
      return null
    }
    if (u.pathname === '/watch') {
      if (!u.searchParams.has('v')) return 'Please enter a valid YouTube video URL.'
      return null
    }
    if (u.pathname.startsWith('/shorts/')) {
      if (!u.pathname.split('/')[2]) return 'Please enter a valid YouTube video URL.'
      return null
    }
    return 'This URL is not supported.'
  } catch {
    return 'Please enter a valid YouTube video URL.'
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
    <a href="#home" class="logo-link" aria-label="SwiftFetch home">
      <span class="logo-icon">${ICONS.download}</span>
      <span class="logo-text">Swift<span>Fetch</span></span>
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
      Public URLs only — No login required
    </div>
    <h1>Download Public Videos Quickly and Responsibly</h1>
    <p>Download publicly accessible YouTube videos in MP4 or MP3 format. No account, API key, password, or cookie is required.</p>

    <div class="downloader-card" aria-busy="false">
      <div class="card-brand">
        <div class="brand-name">SwiftFetch</div>
        <div class="brand-tagline">Fast public video downloads</div>
      </div>

      <form id="download-form" novalidate>
        <div class="field-group">
          <label for="url-input">YouTube URL</label>
          <input
            type="url"
            id="url-input"
            name="url"
            placeholder="Paste a YouTube video URL here"
            autocomplete="off"
            spellcheck="false"
            aria-describedby="status"
          />
        </div>

        <div class="field-group">
          <label for="quality-select">Output format</label>
          <select id="quality-select" name="option">
            <option value="360p">360p MP4</option>
            <option value="720p" selected>720p MP4</option>
            <option value="1080p">1080p MP4</option>
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
    <p class="section-subtitle">Three simple steps to download a public video.</p>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">${ICONS.clipboard}</div>
        <h3>Paste URL</h3>
        <p>Enter a public YouTube video URL. Only single public videos are supported.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">${ICONS.settings}</div>
        <h3>Select format</h3>
        <p>Choose 360p MP4, 720p MP4, 1080p MP4, or MP3 audio — whichever you need.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">${ICONS.download}</div>
        <h3>Download file</h3>
        <p>Download the generated file when processing finishes. Files are deleted automatically after 30 minutes.</p>
      </div>
    </div>
  </section>

  <!-- Safety -->
  <section id="safety" class="section">
    <h2 class="section-title">Safety &amp; privacy</h2>
    <p class="section-subtitle">Built with security-first principles for public content only.</p>
    <div class="safety-grid">
      ${buildSafetyItem('Public URLs only')}
      ${buildSafetyItem('No account credentials')}
      ${buildSafetyItem('No cookies or tokens')}
      ${buildSafetyItem('Temporary file storage')}
      ${buildSafetyItem('Automatic file deletion after 30 min')}
      ${buildSafetyItem('IP-based rate limiting')}
      ${buildSafetyItem('Maximum file size limit')}
      ${buildSafetyItem('Request timeout handling')}
      ${buildSafetyItem('Secure UUID filenames')}
      ${buildSafetyItem('Path traversal protection')}
    </div>
  </section>

  <!-- Copyright notice -->
  <section class="section" style="padding-top:0">
    <div class="copyright-notice">
      <p>
        This service is intended only for publicly accessible content that you own or have permission to use. You are responsible for complying with copyright law, YouTube's Terms of Service, and all applicable laws. Do not download private, restricted, or unauthorized content.
      </p>
    </div>
  </section>

  <!-- Terms -->
  <section id="terms" class="section">
    <h2 class="section-title">Terms &amp; usage notice</h2>
    <p class="section-subtitle">Please read these terms before using SwiftFetch.</p>
    <div class="info-card">
      <h3>Acceptable use</h3>
      <p>You may use SwiftFetch to download <strong>publicly accessible YouTube videos</strong> that you own or have explicit permission to download. You must not use this service to download private, restricted, paid, age-restricted, or unauthorized content.</p>
      <h3>Your responsibility</h3>
      <p>You are solely responsible for ensuring your use of downloaded content complies with all applicable copyright laws, YouTube's Terms of Service, and third-party rights. SwiftFetch does not verify ownership or grant any rights to the content you download.</p>
      <h3>No warranties</h3>
      <p>This service is provided "as is" without warranty of any kind. Downloads may fail if YouTube changes its systems or if a video is unavailable in the requested format. A lower quality may be used as a fallback when the requested quality is unavailable.</p>
    </div>
  </section>

  <!-- Privacy -->
  <section id="privacy" class="section">
    <h2 class="section-title">Privacy &amp; security information</h2>
    <p class="section-subtitle">What we collect and how we protect your data.</p>
    <div class="info-card">
      <h3>No personal data stored</h3>
      <p>SwiftFetch does not require an account, login, or any personal information. No YouTube passwords, cookies, session IDs, or access tokens are ever requested or stored.</p>
      <h3>Temporary storage only</h3>
      <p>Downloaded files are stored temporarily on the server and are <strong>automatically deleted after 30 minutes</strong>. No files are kept permanently.</p>
      <h3>Security measures</h3>
      <p>All filenames are generated using secure UUIDs. The server validates every URL, rejects unsupported domains, blocks path traversal attempts, enforces rate limiting, and limits concurrent downloads and file sizes.</p>
      <h3>No analytics or tracking</h3>
      <p>SwiftFetch does not use external analytics, tracking pixels, or third-party tracking services. Your IP address is used only for rate limiting and is not stored long-term.</p>
    </div>
  </section>

  <!-- FAQ -->
  <section id="faq" class="section">
    <h2 class="section-title">Frequently asked questions</h2>
    <p class="section-subtitle">Common questions about SwiftFetch.</p>
    <div class="faq-list">
      ${buildFaqItem('Do I need a YouTube account or API key?',
        'No. SwiftFetch requires no account, no API key, no password, and no cookies. It works with publicly accessible YouTube URLs only.')}
      ${buildFaqItem('Why did my download fail?',
        'Downloads can fail if YouTube changes its systems, the video is private or restricted, or the requested format is unavailable. When a format is unavailable, SwiftFetch tries a safe lower-quality fallback first.')}
      ${buildFaqItem('Why are files deleted after 30 minutes?',
        'SwiftFetch uses temporary storage only. All downloaded files are automatically deleted after 30 minutes to protect privacy and save disk space. Download your file promptly after it is ready.')}
      ${buildFaqItem('Can I download playlists or channels?',
        'No. SwiftFetch supports single public videos only. Playlists, channels, live streams, and multi-item URLs are not supported.')}
      ${buildFaqItem('Is it legal to download YouTube videos?',
        'You are responsible for complying with copyright law and YouTube\'s Terms of Service. Only download content you own or have permission to use. Do not download private, restricted, or unauthorized content.')}
      ${buildFaqItem('What formats are available?',
        'SwiftFetch offers 360p MP4, 720p MP4, 1080p MP4, and MP3 audio. If a requested quality is unavailable, a lower quality may be used instead and the actual quality will be shown in the result.')}
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">Swift<span>Fetch</span></div>
    <div class="footer-tagline">Public-content downloads only</div>
    <div class="footer-links">
      <a href="#home">Home</a>
      <a href="#safety">Safety</a>
      <a href="#terms">Terms</a>
      <a href="#privacy">Privacy</a>
    </div>
    <div class="footer-copyright">
      &copy; ${year} SwiftFetch. This service is intended only for publicly accessible content that you own or have permission to use. You are responsible for complying with copyright law and all applicable terms.
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

    resultMeta.innerHTML = `
      <div class="meta-item">
        <div class="meta-label">Title</div>
        <div class="meta-value" title="${escapeHtml(data.title || 'Unknown')}">${escapeHtml(data.title || 'Unknown')}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Format</div>
        <div class="meta-value">${escapeHtml(optionLabel)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Quality selected</div>
        <div class="meta-value">${escapeHtml(qualityLabel)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">File type</div>
        <div class="meta-value">${fileExt}</div>
      </div>
      ${data.file_size ? `<div class="meta-item"><div class="meta-label">File size</div><div class="meta-value">${escapeHtml(data.file_size)}</div></div>` : ''}
      <div class="meta-item">
        <div class="meta-label">Downloader</div>
        <div class="meta-value">${escapeHtml(data.downloader_used || 'yt-dlp')}</div>
      </div>
    `

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

    const url = urlInput.value.trim()
    const option = qualitySelect.value

    const validationError = getYouTubeValidationError(url)
    if (validationError) {
      showError(validationError)
      urlInput.focus()
      return
    }

    if (!ALLOWED_OPTION_VALUES.includes(option)) {
      showError('This URL is not supported.')
      return
    }

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
      } else if (data && data.message) {
        hideProgress()
        setDownloading(false)
        showError(data.message)
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

export { renderApp, isValidYouTubeUrl, getYouTubeValidationError }
