import { useState } from 'react';
import {
  ArrowDownToLine,
  Check,
  ChevronDown,
  Clipboard,
  Download,
  Flame,
  Gem,
  Layers,
  Link as LinkIcon,
  Menu,
  Monitor,
  Music,
  RotateCcw,
  Smartphone,
  Sparkles,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';

type DownloadResult = {
  source?: string;
  videoUrl: string;
  title?: string;
  thumbnail?: string;
  duration?: string | number;
  sizes?: { label: string; value: string; url: string }[];
  rawResponse?: {
    title?: string;
    cover?: string;
    data?: {
      title?: string;
      cover?: string;
      origin_cover?: string;
      play?: string;
      hdplay?: string;
      wmplay?: string;
      music?: string;
      duration?: number;
      author?: {
        nickname?: string;
        unique_id?: string;
        avatar?: string;
      };
    };
  };
};

// Modern Downloader Logo Emblem with Vibrant Blue Gradient
function DownloaderLogo({ size = 38 }: { size?: number }) {
  return (
    <div
      className="downloader-logo-badge"
      style={{ width: size, height: size }}
      aria-label="TikDownloader Logo"
    >
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="blueLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#2563eb" floodOpacity="0.3" />
          </filter>
        </defs>
        <rect width="44" height="44" rx="14" fill="url(#blueLogoGrad)" filter="url(#logoShadow)" />
        <path
          d="M16 13L29 21.5L16 30V13Z"
          fill="white"
          fillOpacity="0.16"
        />
        <path
          d="M22 12V25M22 25L16 19M22 25L28 19"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 31H31"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'stories' | 'mp3'>('video');
  const [menuOpen, setMenuOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  async function pasteLink() {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          setError('');
        }
      } else {
        const inputEl = document.querySelector('.hero-input') as HTMLInputElement | null;
        inputEl?.focus();
      }
    } catch {
      const inputEl = document.querySelector('.hero-input') as HTMLInputElement | null;
      inputEl?.focus();
    }
  }

  async function downloadVideo() {
    setError('');
    setResult(null);
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please paste a valid TikTok link first.');
      return;
    }
    if (!/^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)\//i.test(trimmedUrl)) {
      setError('Invalid TikTok URL. Please paste a valid tiktok.com or vm.tiktok.com link.');
      return;
    }

    setLoading(true);
    try {
      let data: DownloadResult | null = null;
      let lastErrorMessage = '';

      // 1. Try Supabase Edge Function if env configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        try {
          const edgeFnUrl = `${supabaseUrl}/functions/v1/download-video`;
          const response = await fetch(edgeFnUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabaseKey}`,
              Apikey: supabaseKey,
            },
            body: JSON.stringify({ url: trimmedUrl }),
          });
          const json = await response.json();
          if (response.ok && json.success && typeof json.videoUrl === 'string') {
            data = json as DownloadResult;
          } else if (json?.error) {
            lastErrorMessage = String(json.error);
          }
        } catch (supaErr) {
          console.warn('Supabase edge function failed, using dev/local fallback:', supaErr);
        }
      }

      // 2. Fallback to local /api/download (Vite dev proxy or Express server)
      if (!data) {
        try {
          const localResponse = await fetch('/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: trimmedUrl }),
          });
          const json = await localResponse.json();
          if (localResponse.ok && json.success && typeof json.videoUrl === 'string') {
            data = json as DownloadResult;
          } else if (json?.error) {
            lastErrorMessage = String(json.error);
          }
        } catch (localErr) {
          console.warn('Local /api/download request failed:', localErr);
        }
      }

      if (!data || !data.videoUrl) {
        throw new Error(
          lastErrorMessage || 'Unable to retrieve this video. Please ensure the TikTok is public and accessible.'
        );
      }
      setResult(data);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : 'Unable to download this video right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setUrl('');
    setResult(null);
    setError('');
    const inputEl = document.querySelector('.hero-input') as HTMLInputElement | null;
    inputEl?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function switchTab(tab: 'video' | 'stories' | 'mp3') {
    setActiveTab(tab);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="site-shell">
      {/* 1. Modern Header */}
      <header className="site-header">
        <div className="header-container">
          <a
            href="#"
            className="brand-logo"
            onClick={(e) => {
              e.preventDefault();
              handleReset();
            }}
          >
            <DownloaderLogo size={36} />
            <div className="brand-text-wrap">
              <span className="brand-name">
                Tik<span className="brand-accent">Downloader</span>
              </span>
            </div>
          </a>

          <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
            <button
              type="button"
              className={`nav-item ${activeTab === 'video' ? 'nav-item-active' : ''}`}
              onClick={() => switchTab('video')}
            >
              TikTok Video
            </button>
            <button
              type="button"
              className={`nav-item ${activeTab === 'stories' ? 'nav-item-active' : ''}`}
              onClick={() => switchTab('stories')}
            >
              TikTok Stories
            </button>
            <button
              type="button"
              className={`nav-item ${activeTab === 'mp3' ? 'nav-item-active' : ''}`}
              onClick={() => switchTab('mp3')}
            >
              TikTok MP3
            </button>
            <a
              href="#how-it-works"
              className="nav-item"
              onClick={() => setMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#faq"
              className="nav-item"
              onClick={() => setMenuOpen(false)}
            >
              FAQ
            </a>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="install-app-btn"
              onClick={() => setInstallModalOpen(true)}
            >
              <ArrowDownToLine size={16} />
              <span>Install App</span>
            </button>

            <button
              type="button"
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* 2. Hero Section (Matching User's Reference Screenshot) */}
        <section className="hero-section" id="downloader">
          <div className="hero-glow-bg" />
          <div className="hero-inner">
            {/* Pill Badge at top */}
            <div className="hero-badge-pill">
              <Sparkles size={15} className="hero-badge-icon" />
              <span>Free TikTok Video Downloader</span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-title">
              Download TikTok Videos &amp; Reels in{' '}
              <span className="hero-title-highlight">Full HD 1080p</span>
            </h1>

            {/* Feature Pills / Badges underneath headline */}
            <div className="hero-tags-row">
              <div className="hero-tag-pill">
                <Flame size={15} className="tag-icon tag-flame" />
                <span>TikTok Reels</span>
              </div>
              <div className="hero-tag-pill">
                <Zap size={15} className="tag-icon tag-zap" />
                <span>No Watermark</span>
              </div>
              <div className="hero-tag-pill">
                <Users size={15} className="tag-icon tag-users" />
                <span>Public Stories</span>
              </div>
              <div className="hero-tag-pill">
                <Gem size={15} className="tag-icon tag-gem" />
                <span>1080p Full HD</span>
              </div>
              <div className="hero-tag-pill">
                <Music size={15} className="tag-icon tag-music" />
                <span>MP3 Audio</span>
              </div>
            </div>

            {/* Modern Floating Search / Download Bar */}
            <div className="search-bar-container">
              <div className="search-input-wrapper">
                <LinkIcon size={20} className="search-link-icon" />
                <input
                  type="text"
                  className="hero-input"
                  placeholder="Paste TikTok link here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && downloadVideo()}
                  aria-label="Paste TikTok video link"
                />
                {url && (
                  <button
                    type="button"
                    className="clear-input-btn"
                    onClick={() => {
                      setUrl('');
                      setError('');
                    }}
                    title="Clear"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="search-actions-row">
                <button
                  type="button"
                  className="paste-action-btn"
                  onClick={pasteLink}
                  title="Paste from clipboard"
                >
                  <Clipboard size={16} />
                  <span>Paste</span>
                </button>

                <button
                  type="button"
                  className="download-action-btn"
                  onClick={downloadVideo}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="hero-error-banner">
                <span>{error}</span>
              </div>
            )}

            {/* Result Preview & Downloader Card */}
            {result && (
              <div className="result-container">
                <DownloadResultCard result={result} onReset={handleReset} />
              </div>
            )}
          </div>
        </section>

        {/* 3. Simple 3-Step Process (Matching User's Reference Screenshot) */}
        <section className="section-steps" id="how-it-works">
          <div className="content-container">
            <div className="steps-header">
              <span className="steps-kicker">SIMPLE 3-STEP PROCESS</span>
              <h2 className="steps-title">
                How to Download TikTok Videos <span className="steps-title-highlight">in Seconds</span>
              </h2>
              <p className="steps-desc">
                FastTok makes downloading TikTok videos effortless on any phone, tablet, or PC.
              </p>
            </div>

            <div className="steps-grid">
              {/* Card 01 */}
              <div className="step-card">
                <div className="step-card-top">
                  <span className="step-number">01</span>
                  <div className="step-icon-bubble">
                    <LinkIcon size={20} />
                  </div>
                </div>
                <h3 className="step-title">1. Copy Video URL</h3>
                <p className="step-text">
                  Open TikTok and copy the link of the video, Reel, or Story you want to download.
                </p>
              </div>

              {/* Card 02 */}
              <div className="step-card">
                <div className="step-card-top">
                  <span className="step-number">02</span>
                  <div className="step-icon-bubble">
                    <Sparkles size={20} />
                  </div>
                </div>
                <h3 className="step-title">2. Paste into TikDownloader</h3>
                <p className="step-text">
                  Paste the copied URL into the download box above and click the Download button.
                </p>
              </div>

              {/* Card 03 */}
              <div className="step-card">
                <div className="step-card-top">
                  <span className="step-number">03</span>
                  <div className="step-icon-bubble">
                    <Download size={20} />
                  </div>
                </div>
                <h3 className="step-title">3. Choose Quality &amp; Save</h3>
                <p className="step-text">
                  Pick your preferred quality (1080p Full HD, No Watermark, or MP3) and download the file instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Core Features Showcase */}
        <section className="section-features">
          <div className="content-container">
            <div className="features-intro">
              <span className="features-kicker">POWERFUL &amp; 100% FREE</span>
              <h2 className="features-title">Why Choose TikDownloader?</h2>
              <p className="features-desc">
                The fastest and most reliable TikTok downloader without watermark, supporting HD MP4 and crystal-clear MP3 conversions.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon-box">
                  <Zap size={24} />
                </div>
                <h3 className="feature-card-title">Lightning Fast</h3>
                <p className="feature-card-text">
                  Fetch and extract TikTok MP4 videos without watermark in less than 2 seconds.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-box">
                  <Gem size={24} />
                </div>
                <h3 className="feature-card-title">1080p Full HD Quality</h3>
                <p className="feature-card-text">
                  Preserve original source bitrates, sharpness, and high-fidelity colors without degradation.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-box">
                  <Music size={24} />
                </div>
                <h3 className="feature-card-title">Extract MP3 Audio</h3>
                <p className="feature-card-text">
                  Convert trending TikTok sounds and original songs to 320kbps MP3 audio files instantly.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-box">
                  <Layers size={24} />
                </div>
                <h3 className="feature-card-title">Unlimited &amp; Free</h3>
                <p className="feature-card-text">
                  Download as many videos as you want. No registration, no credit card, no download limits.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Mobile & Desktop Devices Guide */}
        <section className="section-devices">
          <div className="content-container">
            <div className="device-guide-block">
              <div className="device-col">
                <div className="device-header">
                  <div className="device-icon-wrap">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <span className="device-sub">Android &amp; iOS (iPhone / iPad)</span>
                    <h3 className="device-title">Download on Mobile</h3>
                  </div>
                </div>
                <ol className="device-steps-list">
                  <li>Open the TikTok app and find the video you wish to save.</li>
                  <li>Tap the <strong>Share</strong> icon on the bottom right and select <strong>Copy Link</strong>.</li>
                  <li>Open <strong>TikDownloader</strong> in Safari or Chrome, paste the link and tap <strong>Download</strong>.</li>
                </ol>
              </div>

              <div className="device-col">
                <div className="device-header">
                  <div className="device-icon-wrap">
                    <Monitor size={24} />
                  </div>
                  <div>
                    <span className="device-sub">Windows, Mac &amp; Linux</span>
                    <h3 className="device-title">Download on Desktop &amp; PC</h3>
                  </div>
                </div>
                <ol className="device-steps-list">
                  <li>Go to TikTok.com on your desktop browser and open any video.</li>
                  <li>Copy the video URL directly from your browser's address bar or share button.</li>
                  <li>Paste into TikDownloader and click <strong>Download</strong> to save the MP4 video directly.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ Section */}
        <section className="section-faq" id="faq">
          <div className="content-container">
            <div className="faq-header">
              <span className="faq-kicker">FREQUENTLY ASKED QUESTIONS</span>
              <h2 className="faq-title">Got Questions? We've Got Answers</h2>
            </div>
            <div className="faq-accordion">
              <FaqItem
                question="Is TikDownloader completely free to use?"
                answer="Yes, TikDownloader is 100% free with unlimited downloads. You do not need to register an account or install any third-party software."
              />
              <FaqItem
                question="How do I download TikTok videos without a watermark?"
                answer="Simply paste the TikTok video URL into the search box and click Download. Our servers automatically strip the bouncing watermark and provide the clean HD MP4 file."
              />
              <FaqItem
                question="Where are the downloaded TikTok videos saved on my device?"
                answer="Downloaded videos are automatically stored in your default 'Downloads' folder on your PC/Mac or the Photos/Files app on Android and iPhone."
              />
              <FaqItem
                question="Can I extract and download only the MP3 audio from a TikTok?"
                answer="Yes! When you input any TikTok link, you can select the 'Download MP3 Audio' option to save the sound file directly."
              />
              <FaqItem
                question="Does this tool work on iPhone, iPad, Android, and Desktop?"
                answer="Yes, TikDownloader works across all modern web browsers including Safari, Chrome, Edge, and Firefox on mobile, tablet, and desktop."
              />
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="site-footer">
        <div className="content-container footer-content">
          <div className="footer-brand">
            <DownloaderLogo size={32} />
            <span className="brand-name">
              Tik<span className="brand-accent">Downloader</span>
            </span>
          </div>
          <div className="footer-links">
            <a href="#downloader" onClick={(e) => { e.preventDefault(); handleReset(); }}>
              TikTok Video Downloader
            </a>
            <a href="#downloader" onClick={(e) => { e.preventDefault(); switchTab('stories'); }}>
              TikTok Stories
            </a>
            <a href="#downloader" onClick={(e) => { e.preventDefault(); switchTab('mp3'); }}>
              TikTok MP3
            </a>
            <a href="#how-it-works">How to Download</a>
            <a href="#faq">FAQ</a>
          </div>
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} TikDownloader. All rights reserved. Not affiliated with TikTok or ByteDance Ltd.
          </p>
        </div>
      </footer>

      {/* Interactive Install App Modal */}
      <InstallAppModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />
    </div>
  );
}

// Download Result Card with Video Preview and Quality Download Buttons
function DownloadResultCard({
  result,
  onReset,
}: {
  result: DownloadResult;
  onReset: () => void;
}) {
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const title =
    result.title ||
    result.rawResponse?.data?.title ||
    result.rawResponse?.title ||
    'TikTok Video';
  const authorName =
    result.rawResponse?.data?.author?.nickname ||
    result.rawResponse?.data?.author?.unique_id ||
    'TikTok Creator';
  const authorHandle = result.rawResponse?.data?.author?.unique_id
    ? `@${result.rawResponse.data.author.unique_id}`
    : '';
  const authorAvatar = result.rawResponse?.data?.author?.avatar;
  const coverUrl =
    result.thumbnail ||
    result.rawResponse?.data?.cover ||
    result.rawResponse?.data?.origin_cover ||
    result.rawResponse?.cover;

  const audioUrl =
    result.rawResponse?.data?.music ||
    result.sizes?.find((s) => s.value === 'MP3' || s.label.toLowerCase().includes('mp3'))?.url;

  const options = result.sizes?.length
    ? result.sizes
    : [{ label: 'No watermark · HD', value: 'HD', url: result.videoUrl }];

  const bestVideoUrl =
    result.rawResponse?.data?.hdplay ||
    result.sizes?.find(
      (opt) =>
        opt.value === 'HD' ||
        opt.label.toLowerCase().includes('hd') ||
        opt.label.toLowerCase().includes('no watermark')
    )?.url ||
    result.videoUrl;

  const primaryOption =
    options.find(
      (opt) =>
        opt.value === 'HD' ||
        opt.label.toLowerCase().includes('hd') ||
        opt.label.toLowerCase().includes('no watermark')
    ) || options[0];

  const downloadTargetUrl = result.rawResponse?.data?.hdplay || primaryOption.url;

  async function handleDirectDownload(fileUrl: string, label: string, isAudio = false) {
    setDownloadError(null);
    setDownloadingUrl(fileUrl);
    setDownloadSuccess(null);

    const safeTitle = (title || 'tiktok_video')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 30);
    const extension = isAudio ? 'mp3' : 'mp4';
    const filename = `${safeTitle || 'tikdownloader'}_${isAudio ? 'audio' : 'no_watermark'}.${extension}`;

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = objectUrl;
      tempLink.download = filename;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60000);

      setDownloadSuccess(label);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch {
      try {
        const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(filename)}`;
        const fallbackLink = document.createElement('a');
        fallbackLink.href = proxyUrl;
        fallbackLink.setAttribute('download', filename);
        document.body.appendChild(fallbackLink);
        fallbackLink.click();
        document.body.removeChild(fallbackLink);

        setDownloadSuccess(label);
        setTimeout(() => setDownloadSuccess(null), 4000);
      } catch {
        setDownloadError('Could not auto-download file. Please check your network connection.');
      }
    } finally {
      setDownloadingUrl(null);
    }
  }

  return (
    <div className="download-result-card">
      {/* Creator Profile */}
      <div className="result-header">
        <div className="creator-profile">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="creator-avatar" />
          ) : (
            <div className="creator-avatar-fallback">
              <User size={18} />
            </div>
          )}
          <div className="creator-meta">
            <span className="creator-name">{authorName}</span>
            {authorHandle && <span className="creator-handle">{authorHandle}</span>}
          </div>
        </div>
        <span className="badge-ready">
          <Sparkles size={14} /> Ready to Download
        </span>
      </div>

      {title && <p className="result-title">{title}</p>}

      {/* Video Preview */}
      <div className="video-player-container">
        <video
          className="video-player"
          src={bestVideoUrl}
          poster={coverUrl}
          controls
          playsInline
          preload="metadata"
        >
          Your browser does not support video playback.
        </video>
      </div>

      {/* Action Buttons */}
      <div className="result-actions">
        <button
          type="button"
          className="btn-download-primary"
          onClick={() => handleDirectDownload(downloadTargetUrl, 'HD Video')}
          disabled={Boolean(downloadingUrl)}
        >
          {downloadingUrl === downloadTargetUrl ? (
            <>
              <span className="spinner-icon" />
              <span>Downloading Video...</span>
            </>
          ) : downloadSuccess === 'HD Video' ? (
            <>
              <Check size={18} />
              <span>Downloaded Successfully!</span>
            </>
          ) : (
            <>
              <ArrowDownToLine size={19} />
              <span>Download Without Watermark (Full HD)</span>
            </>
          )}
        </button>

        {audioUrl && (
          <button
            type="button"
            className="btn-download-secondary"
            onClick={() => handleDirectDownload(audioUrl, 'MP3 Audio', true)}
            disabled={Boolean(downloadingUrl)}
          >
            <Music size={17} />
            <span>Download MP3 Audio</span>
          </button>
        )}

        <button
          type="button"
          className="btn-another-video"
          onClick={onReset}
        >
          <RotateCcw size={16} />
          <span>Download Another Video</span>
        </button>

        {downloadError && <div className="result-error-notice">{downloadError}</div>}
      </div>
    </div>
  );
}

// FAQ Accordion Item
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`faq-card ${isOpen ? 'faq-card-open' : ''}`}>
      <button
        type="button"
        className="faq-question-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <ChevronDown
          size={18}
          className={`faq-chevron ${isOpen ? 'faq-chevron-rotate' : ''}`}
        />
      </button>
      {isOpen && <div className="faq-answer-content">{answer}</div>}
    </div>
  );
}

// Modal for PWA / App Installation Guide
function InstallAppModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <DownloaderLogo size={32} />
            <h3 className="modal-title">Install TikDownloader</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-lead">
            TikDownloader is an ultra-fast web app that runs on any device without app stores. Add it to your home screen or bookmarks for 1-tap instant downloads!
          </p>

          <div className="modal-guide-grid">
            <div className="guide-card">
              <div className="guide-card-head">
                <Smartphone size={18} />
                <span className="platform-tag">Mobile (iPhone &amp; Android)</span>
              </div>
              <ol className="guide-steps">
                <li>
                  In Safari or Chrome, tap the <strong>Share</strong> (or <strong>⋮ Menu</strong>) icon.
                </li>
                <li>
                  Select <strong>"Add to Home Screen"</strong>.
                </li>
                <li>
                  Tap <strong>Add</strong> to launch TikDownloader anytime like a native app.
                </li>
              </ol>
            </div>

            <div className="guide-card">
              <div className="guide-card-head">
                <Monitor size={18} />
                <span className="platform-tag">Desktop (PC &amp; Mac)</span>
              </div>
              <ol className="guide-steps">
                <li>
                  In Chrome or Edge, click the <strong>Install App</strong> icon in the address bar on the right.
                </li>
                <li>
                  Click <strong>Install</strong> to pin it directly to your taskbar/dock.
                </li>
                <li>
                  Or press <kbd>Ctrl</kbd> + <kbd>D</kbd> (<kbd>Cmd</kbd> + <kbd>D</kbd>) to bookmark.
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-modal-gotit" onClick={onClose}>
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
