// Instagram Video Downloader - High-Performance Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // Navigation & Tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const heroTitle = document.getElementById('heroTitle');
  const heroSubtitle = document.getElementById('heroSubtitle');
  const videoUrlInput = document.getElementById('videoUrlInput');
  const pasteBtn = document.getElementById('pasteBtn');
  const clearBtn = document.getElementById('clearBtn');
  const fetchBtn = document.getElementById('fetchBtn');
  const fetchSpinner = document.getElementById('fetchSpinner');
  const tryDemoBtn = document.getElementById('tryDemoBtn');

  // Theme Toggle Elements
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIconDark = document.querySelector('.theme-icon-dark');
  const themeIconLight = document.querySelector('.theme-icon-light');

  // Session ID Modal Elements
  const cookieSettingsBtn = document.getElementById('cookieSettingsBtn');
  const sessionStatusDot = document.getElementById('sessionStatusDot');
  const sessionModal = document.getElementById('sessionModal');
  const sessionBackdrop = document.getElementById('sessionBackdrop');
  const sessionCloseBtn = document.getElementById('sessionCloseBtn');
  const sessionCookieInput = document.getElementById('sessionCookieInput');
  const saveSessionBtn = document.getElementById('saveSessionBtn');
  const clearSessionBtn = document.getElementById('clearSessionBtn');

  // Progress Bar Elements
  const progressCard = document.getElementById('progressCard');
  const progressBar = document.getElementById('progressBar');
  const progressStatus = document.getElementById('progressStatus');
  const progressPercent = document.getElementById('progressPercent');

  // Single Result Card Elements
  const resultCard = document.getElementById('resultCard');
  const resultThumb = document.getElementById('resultThumb');
  const resultDuration = document.getElementById('resultDuration');
  const resultUploader = document.getElementById('resultUploader');
  const resultTitle = document.getElementById('resultTitle');
  const resultCacheBadge = document.getElementById('resultCacheBadge');
  const resultLatency = document.getElementById('resultLatency');
  const previewPlayBtn = document.getElementById('previewPlayBtn');
  const btnPlayStream = document.getElementById('btnPlayStream');
  const btnResetSearch = document.getElementById('btnResetSearch');
  const directLinkInput = document.getElementById('directLinkInput');
  const copyLinkBtn = document.getElementById('copyLinkBtn');

  // Format Rows & Download Buttons
  const row1080p = document.getElementById('row1080p');
  const row720p = document.getElementById('row720p');
  const row480p = document.getElementById('row480p');
  const rowAudio = document.getElementById('rowAudio');
  const rowCover = document.getElementById('rowCover');
  const btnDownloadHd = document.getElementById('btnDownloadHd');
  const btnDownload720 = document.getElementById('btnDownload720');
  const btnDownload480 = document.getElementById('btnDownload480');
  const btnDownloadAudio = document.getElementById('btnDownloadAudio');
  const btnDownloadCover = document.getElementById('btnDownloadCover');

  // Carousel Section Elements
  const carouselSection = document.getElementById('carouselSection');
  const carouselCount = document.getElementById('carouselCount');
  const carouselGrid = document.getElementById('carouselGrid');

  // Stream Player Modal Elements
  const videoModal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');

  let currentDirectUrl = '';
  let currentStreamUrl = '';
  let currentActiveTab = 'video';
  let progressTimer = null;

  // Tab Configurations (Matching User Screenshot)
  const tabConfigs = {
    video: {
      title: 'Instagram Video Downloader',
      subtitle: 'Download Instagram Videos in Full HD 1080p with no watermark',
      placeholder: 'Insert instagram video link here...',
    },
    photo: {
      title: 'Instagram Photo Downloader',
      subtitle: 'Download High-Resolution Instagram Photos & Wallpapers in original quality',
      placeholder: 'Insert instagram photo link here...',
    },
    reels: {
      title: 'Instagram Reels Downloader',
      subtitle: 'Download Instagram Reels with audio in Full HD 1080p MP4',
      placeholder: 'Insert instagram reels link here...',
    },
    story: {
      title: 'Instagram Story Downloader',
      subtitle: 'Download Instagram Stories & Highlights anonymously before they expire',
      placeholder: 'Insert instagram story link or username...',
    },
    igtv: {
      title: 'Instagram IGTV Downloader',
      subtitle: 'Download long-form IGTV videos with high bitrate and clear audio',
      placeholder: 'Insert instagram IGTV link here...',
    },
    carousel: {
      title: 'Instagram Carousel Downloader',
      subtitle: 'Download all slides, photos & videos from Instagram carousel albums',
      placeholder: 'Insert instagram carousel/album link here...',
    },
    viewer: {
      title: 'Instagram Anonymous Viewer',
      subtitle: 'View and download Instagram profiles, reels, and stories without an account',
      placeholder: 'Enter Instagram username (e.g. @cristiano) or profile URL...',
    }
  };

  // 1. Theme Management
  const savedTheme = localStorage.getItem('fastdl_theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeIconDark) themeIconDark.classList.add('hidden');
    if (themeIconLight) themeIconLight.classList.remove('hidden');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('fastdl_theme', isDark ? 'dark' : 'light');
      if (themeIconDark && themeIconLight) {
        themeIconDark.classList.toggle('hidden', isDark);
        themeIconLight.classList.toggle('hidden', !isDark);
      }
    });
  }

  // 2. Session ID Management
  function getSavedSession() {
    return localStorage.getItem('fastdl_ig_session') || '';
  }

  function updateSessionDot() {
    const session = getSavedSession();
    if (sessionStatusDot) {
      sessionStatusDot.classList.toggle('active', Boolean(session && session.trim()));
    }
  }
  updateSessionDot();

  if (cookieSettingsBtn) {
    cookieSettingsBtn.addEventListener('click', () => {
      if (sessionCookieInput) sessionCookieInput.value = getSavedSession();
      if (sessionModal) sessionModal.classList.remove('hidden');
    });
  }

  if (sessionCloseBtn) sessionCloseBtn.addEventListener('click', () => sessionModal.classList.add('hidden'));
  if (sessionBackdrop) sessionBackdrop.addEventListener('click', () => sessionModal.classList.add('hidden'));

  if (saveSessionBtn && sessionCookieInput) {
    saveSessionBtn.addEventListener('click', () => {
      const val = sessionCookieInput.value.trim();
      if (val) {
        localStorage.setItem('fastdl_ig_session', val);
        showToast('Session ID saved! Instagram login bypass active.', 'success');
      } else {
        localStorage.removeItem('fastdl_ig_session');
        showToast('Session ID removed.', 'info');
      }
      updateSessionDot();
      if (sessionModal) sessionModal.classList.add('hidden');
    });
  }

  if (clearSessionBtn && sessionCookieInput) {
    clearSessionBtn.addEventListener('click', () => {
      localStorage.removeItem('fastdl_ig_session');
      sessionCookieInput.value = '';
      updateSessionDot();
      showToast('Session ID cleared.', 'info');
      if (sessionModal) sessionModal.classList.add('hidden');
    });
  }

  // 3. Tab Switching Logic
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const tabKey = btn.getAttribute('data-tab');
      currentActiveTab = tabKey;
      const config = tabConfigs[tabKey] || tabConfigs.video;

      if (heroTitle) heroTitle.textContent = config.title;
      if (heroSubtitle) heroSubtitle.textContent = config.subtitle;
      if (videoUrlInput) {
        videoUrlInput.placeholder = config.placeholder;
        videoUrlInput.focus();
      }
    });
  });

  // 4. Toast Notification
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // 5. Input Controls & Clipboard Paste
  if (videoUrlInput && clearBtn) {
    videoUrlInput.addEventListener('input', () => {
      clearBtn.classList.toggle('hidden', videoUrlInput.value.trim() === '');
    });

    clearBtn.addEventListener('click', () => {
      videoUrlInput.value = '';
      clearBtn.classList.add('hidden');
      videoUrlInput.focus();
    });
  }

  if (pasteBtn && videoUrlInput) {
    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          videoUrlInput.value = text.trim();
          if (clearBtn) clearBtn.classList.remove('hidden');
          showToast('Instagram link pasted!', 'success');
          triggerDownload();
        } else {
          showToast('Clipboard is empty', 'error');
        }
      } catch (err) {
        videoUrlInput.focus();
        showToast('Please paste manually using Ctrl+V', 'info');
      }
    });
  }

  // 6. Try Demo Reel Button
  if (tryDemoBtn && videoUrlInput) {
    tryDemoBtn.addEventListener('click', () => {
      videoUrlInput.value = 'https://www.instagram.com/reel/C8901abcD34/';
      if (clearBtn) clearBtn.classList.remove('hidden');
      triggerDownload();
    });
  }

  // 7. Progress Bar Animation
  function startProgressSimulation() {
    if (progressTimer) clearInterval(progressTimer);
    if (!progressCard) return;

    progressCard.classList.remove('hidden');
    updateProgress(18, 'Connecting to Instagram CDN...');

    let current = 18;
    progressTimer = setInterval(() => {
      if (current < 85) {
        current += Math.floor(Math.random() * 14) + 6;
        if (current > 85) current = 85;

        let statusText = 'Resolving media stream headers...';
        if (current > 40) statusText = 'Extracting 1080p Full HD video streams...';
        if (current > 70) statusText = 'Generating high-speed download formats...';

        updateProgress(current, statusText);
      }
    }, 150);
  }

  function completeProgress() {
    if (progressTimer) clearInterval(progressTimer);
    updateProgress(100, 'Done! Media ready for download.');
    setTimeout(() => {
      if (progressCard) progressCard.classList.add('hidden');
    }, 450);
  }

  function updateProgress(percent, status) {
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPercent) progressPercent.textContent = `${percent}%`;
    if (progressStatus) progressStatus.textContent = status;
  }

  function buildDownloadUrl(targetUrl, filename) {
    if (!targetUrl) return '#';
    return `/api/v1/stream?url=${encodeURIComponent(targetUrl)}&download=true&filename=${encodeURIComponent(filename)}`;
  }

  // 8. Core Media Download Execution
  async function triggerDownload() {
    if (!videoUrlInput) return;
    const rawUrl = videoUrlInput.value.trim();
    if (!rawUrl) {
      showToast('Please enter or paste an Instagram link', 'error');
      videoUrlInput.focus();
      return;
    }

    // Basic URL validation
    if (!rawUrl.includes('instagram.com') && !rawUrl.includes('instagr.am') && !rawUrl.startsWith('@')) {
      showToast('Please enter a valid Instagram URL or @username', 'error');
      return;
    }

    // Set Loading State
    if (fetchBtn) fetchBtn.disabled = true;
    if (fetchSpinner) fetchSpinner.classList.remove('hidden');
    if (resultCard) resultCard.classList.add('hidden');
    if (carouselSection) carouselSection.classList.add('hidden');
    startProgressSimulation();

    const savedSession = getSavedSession();
    const endpoint = `/api/v1/download?url=${encodeURIComponent(rawUrl)}&quality=best&format=mp4`;

    try {
      const headers = {};
      if (savedSession) {
        headers['X-Instagram-Session'] = savedSession;
      }

      const response = await fetch(endpoint, { headers });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.message || errData.detail || 'Failed to extract media';
        
        if (errMsg.includes('login verification') || errMsg.includes('Session ID')) {
          showToast(errMsg, 'error');
          // Offer to open session settings modal
          setTimeout(() => {
            if (sessionModal) sessionModal.classList.remove('hidden');
          }, 1200);
          throw new Error(errMsg);
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      completeProgress();
      displayResult(data);
      showToast('Media ready for download!', 'success');

    } catch (err) {
      if (progressTimer) clearInterval(progressTimer);
      if (progressCard) progressCard.classList.add('hidden');
      showToast(err.message, 'error');
    } finally {
      if (fetchBtn) fetchBtn.disabled = false;
      if (fetchSpinner) fetchSpinner.classList.add('hidden');
    }
  }

  if (fetchBtn) fetchBtn.addEventListener('click', triggerDownload);
  if (videoUrlInput) {
    videoUrlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') triggerDownload();
    });
  }

  // 9. Display Result Data
  function displayResult(data) {
    if (!resultCard) return;
    resultCard.classList.remove('hidden');

    currentDirectUrl = data.direct_url;
    currentStreamUrl = data.stream_url || data.direct_url;

    // Media Thumbnail & Details
    if (resultThumb) {
      resultThumb.src = data.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600';
    }
    if (resultDuration) {
      if (data.media_type === 'photo') {
        resultDuration.textContent = 'PHOTO';
      } else {
        resultDuration.textContent = data.duration_formatted || '00:00';
      }
    }
    if (resultUploader) {
      resultUploader.textContent = data.uploader ? `@${data.uploader}` : '@instagram_user';
    }
    if (resultTitle) {
      resultTitle.textContent = data.title || 'Instagram Media';
    }

    // Latency & Cache Chips
    if (resultLatency) resultLatency.textContent = `⏱ ${data.fetch_time_ms}ms`;
    if (resultCacheBadge) {
      if (data.cached) {
        resultCacheBadge.textContent = `⚡ ${data.cache_layer || 'L1'} Cache Hit`;
        resultCacheBadge.className = 'badge-chip chip-cache';
      } else {
        resultCacheBadge.textContent = '🚀 Fresh Extract';
        resultCacheBadge.className = 'badge-chip chip-time';
      }
    }

    // Safe File Name
    const safeBaseName = (data.title || 'instagram_media')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    const timeStamp = Date.now().toString().slice(-4);
    const directMediaUrl = data.direct_url;

    // Photo vs Video View Adjustment
    const isPhoto = data.media_type === 'photo';
    if (previewPlayBtn) previewPlayBtn.classList.toggle('hidden', isPhoto);
    if (btnPlayStream) btnPlayStream.classList.toggle('hidden', isPhoto);
    if (row1080p) row1080p.classList.toggle('hidden', isPhoto);
    if (row720p) row720p.classList.toggle('hidden', isPhoto);
    if (row480p) row480p.classList.toggle('hidden', isPhoto);
    if (rowAudio) rowAudio.classList.toggle('hidden', isPhoto);

    // Find verified full video formats with both video and sound
    const fullVideos = (data.formats || []).filter(f => f.has_video && f.has_audio);
    const bestFullVideoUrl = fullVideos.length > 0 ? fullVideos[0].url : directMediaUrl;

    const findFormatUrl = (pattern, fallback) => {
      if (!data.formats || data.formats.length === 0) return fallback;
      const matchedFull = fullVideos.find(f => (f.resolution || '').includes(pattern) || (f.format_note || '').includes(pattern));
      if (matchedFull) return matchedFull.url;
      return bestFullVideoUrl;
    };

    const hd1080Url = findFormatUrl('1080', bestFullVideoUrl);
    const hd720Url = findFormatUrl('720', bestFullVideoUrl);
    const sd480Url = findFormatUrl('480', bestFullVideoUrl);

    // 1080p Full HD Video (with Sound)
    if (btnDownloadHd) {
      btnDownloadHd.href = buildDownloadUrl(hd1080Url, `${safeBaseName}_1080p_${timeStamp}.mp4`);
    }
    // 720p HD Video (with Sound)
    if (btnDownload720) {
      btnDownload720.href = buildDownloadUrl(hd720Url, `${safeBaseName}_720p_${timeStamp}.mp4`);
    }
    // 480p SD Video (with Sound)
    if (btnDownload480) {
      btnDownload480.href = buildDownloadUrl(sd480Url, `${safeBaseName}_480p_${timeStamp}.mp4`);
    }
    // Audio MP3 (pure audio track)
    const audioFmt = (data.formats || []).find(f => !f.has_video && f.has_audio);
    const audioTarget = audioFmt ? audioFmt.url : bestFullVideoUrl;
    if (btnDownloadAudio) {
      btnDownloadAudio.href = buildDownloadUrl(audioTarget, `${safeBaseName}_audio_${timeStamp}.mp3`);
    }
    // Cover / Photo
    const coverTarget = data.thumbnail || directMediaUrl;
    if (btnDownloadCover) {
      btnDownloadCover.href = buildDownloadUrl(coverTarget, `${safeBaseName}_photo_${timeStamp}.jpg`);
    }

    // Direct link input
    if (directLinkInput) directLinkInput.value = data.direct_url;

    // Multi-Item Carousel Rendering
    if (data.is_carousel && data.carousel_items && data.carousel_items.length > 0) {
      renderCarousel(data.carousel_items, safeBaseName, timeStamp);
    } else if (carouselSection) {
      carouselSection.classList.add('hidden');
    }

    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 10. Carousel Section Renderer
  function renderCarousel(items, baseName, timeStamp) {
    if (!carouselSection || !carouselGrid) return;
    carouselSection.classList.remove('hidden');
    if (carouselCount) carouselCount.textContent = items.length;

    carouselGrid.innerHTML = '';
    items.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'carousel-card';

      const isVideo = item.type === 'video';
      const ext = isVideo ? 'mp4' : 'jpg';
      const downloadHref = buildDownloadUrl(item.direct_url, `${baseName}_slide_${item.index}_${timeStamp}.${ext}`);

      card.innerHTML = `
        <div class="carousel-thumb-wrap">
          <img class="carousel-thumb" src="${item.thumbnail || item.direct_url}" alt="Slide ${item.index}" loading="lazy" />
          <span class="carousel-type-badge">${isVideo ? 'VIDEO' : 'PHOTO'}</span>
          <span class="carousel-index-badge">#${item.index}</span>
        </div>
        <div class="carousel-card-body">
          <span class="carousel-item-title">${item.title || `Slide ${item.index}`}</span>
          <a class="btn-download-action" href="${downloadHref}" download>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download ${isVideo ? 'Video' : 'Photo'}</span>
          </a>
        </div>
      `;
      carouselGrid.appendChild(card);
    });
  }

  // 11. Direct Link Copy
  if (copyLinkBtn && directLinkInput) {
    copyLinkBtn.addEventListener('click', () => {
      if (directLinkInput.value) {
        navigator.clipboard.writeText(directLinkInput.value);
        showToast('Direct download link copied to clipboard!', 'success');
      }
    });
  }

  // 12. Reset Search
  if (btnResetSearch) {
    btnResetSearch.addEventListener('click', () => {
      if (resultCard) resultCard.classList.add('hidden');
      if (carouselSection) carouselSection.classList.add('hidden');
      if (videoUrlInput) {
        videoUrlInput.value = '';
        videoUrlInput.focus();
      }
      if (clearBtn) clearBtn.classList.add('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 13. Stream Video Player Modal
  function openStreamModal() {
    if (!currentStreamUrl || !videoModal) return;
    if (modalTitle && resultTitle) modalTitle.textContent = resultTitle.textContent;
    if (modalVideo) {
      modalVideo.src = currentStreamUrl;
      videoModal.classList.remove('hidden');
      modalVideo.play().catch(() => {});
    }
  }

  function closeStreamModal() {
    if (!videoModal) return;
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.src = '';
    }
    videoModal.classList.add('hidden');
  }

  if (btnPlayStream) btnPlayStream.addEventListener('click', openStreamModal);
  if (previewPlayBtn) previewPlayBtn.addEventListener('click', openStreamModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeStreamModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeStreamModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeStreamModal();
      if (sessionModal) sessionModal.classList.add('hidden');
    }
  });
});
