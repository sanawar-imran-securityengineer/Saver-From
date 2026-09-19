/* ═══════════════════════════════════════════════════════════════════════════
   ThreadSave — Frontend Application Logic
   Features: i18n (8 langs + RTL), clipboard paste, info prefetch,
             SingleFlight dedup display, toast system, FAQ, hamburger
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';

// ── i18n Translations ─────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    nav_home: 'Home', nav_how: 'How it works', nav_safety: 'Features',
    nav_faq: 'FAQ', nav_terms: 'Terms', nav_privacy: 'Privacy',
    badge: '#1 Free Threads Video Downloader with Audio',
    hero_title: '10. Threads Video Downloader<br/><span class="threads-accent">In HD Quality with Sound</span>',
    hero_sub: 'Save public Meta Threads videos, clips, and posts with crystal-clear sound. 1080p, 720p HD MP4 or MP3 audio. 100% Free, no watermark or login required.',
    url_placeholder: 'Paste Threads post or video link (e.g. threads.net/@user/post/... or threads.net/t/...)',
    audio_guarantee: 'Sound Guaranteed:',
    paste: 'Paste', btn_download: 'Download',
    loading_msg: 'Fetching Threads video & audio...', loading_sub: 'Extracting media and audio streams in full HD quality.',
    result_ready: 'Your Threads Video is Ready!',
    btn_download_file: 'Download Video', btn_copy: 'Copy Link', btn_another: 'Download Another',
    hero_legal: 'For publicly accessible Meta Threads posts and videos. Compliant with copyright laws and platform terms.',
    how_title: 'How to Download Threads Videos', how_sub: 'Three quick steps to save any Meta Threads video or clip to your device.',
    step1_title: 'Copy Threads Link', step1_desc: 'Open Threads, tap the Share icon on any post or video, and select Copy Link.',
    step2_title: 'Paste & Pick Quality', step2_desc: 'Paste the Threads link into the search bar above and pick your desired resolution: 1080p, 720p, 360p MP4, or MP3 audio.',
    step3_title: 'Download with Sound', step3_desc: 'Click Download. Your HD Threads video is saved directly to your phone or computer with synced sound.',
    safety_title: 'Why Choose 10. Threads Video Downloader', safety_sub: 'Engineered to quickly save Meta Threads videos and clips in full quality.',
    s1_title: 'HD Video with Synced Audio', s1_desc: 'Automatically fetches and preserves video and audio tracks in high-definition MP4 with clear sound.',
    s2_title: 'Supports All Threads Posts', s2_desc: 'Instant support for threads.net and threads.com, profile posts (/@user/post/...), and shortlinks (/t/...).',
    s3_title: 'No Login or Account Required', s3_desc: 'Zero accounts, passwords, or cookies needed. Everything runs directly in your browser 100% free.',
    s4_title: 'Auto-Delete in 30 Min', s4_desc: 'Downloaded media files are automatically erased from our servers within 30 minutes for complete privacy.',
    s5_title: 'Lightning Fast Direct Downloads', s5_desc: 'High-speed stream extraction servers deliver your download links within seconds without waiting.',
    s6_title: 'Works on All Devices', s6_desc: 'Responsive and optimized for Safari on iOS, Chrome on Android, Windows, Mac, and Linux.',
    copyright_notice: "This service is intended only for publicly accessible content that you own or have permission to use. You are responsible for complying with copyright law and platform terms.",
    terms_title: 'Terms & Usage', priv_title: 'Privacy & Security',
    terms_h1: 'Acceptable Use', terms_p1: 'Use 10. Threads Video Downloader to download publicly accessible Threads posts and videos you have permission to use.',
    terms_h2: 'Your Responsibility', terms_p2: "You are solely responsible for compliance with copyright laws and platform Terms of Service.",
    terms_h3: 'No Warranties', terms_p3: 'Downloads may be affected if the platform changes its API.',
    priv_h1: 'No Personal Data', priv_p1: 'No passwords, cookies, session IDs, or account tokens stored.',
    priv_h2: 'Temporary Storage', priv_p2: 'Files auto-deleted after 30 minutes.',
    priv_h3: 'No Analytics', priv_p3: 'No tracking pixels or third-party cookies.',
    faq_title: 'Frequently Asked Questions', faq_sub: 'Everything you need to know about downloading Meta Threads videos with sound.',
    faq_q1: 'Can I download Threads videos in high quality?', faq_a1: 'Yes! 10. Threads Video Downloader supports saving Threads video posts in high definition 1080p and 720p MP4 with crystal-clear audio.',
    faq_q2: 'How do I get the video link from the Threads app?', faq_a2: 'In the Threads mobile app or on the web, find the post. Tap the airplane/Share icon at the bottom of the post and tap "Copy link". Then paste it above.',
    faq_q3: 'Can I extract MP3 audio from a Threads video?', faq_a3: 'Yes! Select "MP3 Audio Only" from the format dropdown before clicking Download to convert and extract the sound track.',
    faq_q4: 'Is 10. Threads Video Downloader free to use?', faq_a4: 'Yes, it is 100% free with no watermarks, subscriptions, or software installation required.',
    faq_q5: 'Is this fast?', faq_a5: 'Yes! Direct CDN stream extraction delivers download links within seconds.',
    footer_tagline: '10. Threads Video Downloader with Sound • HD MP4 & MP3',
    fmt_360: '360p SD (Compact)', fmt_720: '720p HD (Sound)', fmt_1080: '1080p Full HD (Sound)', fmt_mp3: 'MP3 Audio Only',
    toast_copied: 'Link copied to clipboard!', toast_pasted: 'URL pasted!', toast_paste_fail: 'Paste failed. Please paste manually.',
    err_empty: 'Please enter a Threads post or video link.', err_invalid: 'Please enter a valid Threads post link (e.g. threads.net/@user/post/... or threads.net/t/...).',
    err_playlist: 'Playlists are not supported.', err_long: 'This URL is not supported.',
    err_failed: 'This Threads video could not be downloaded.', err_fmt: 'The requested format is unavailable.',
    err_busy: 'The server is busy. Please try again later.',
    err_large: 'The file is too large to process.', err_timeout: 'The download took too long and was stopped.',
    err_generic: 'An unexpected error occurred. Please try again.',
    meta_title: 'Title', meta_format: 'Format', meta_quality: 'Quality',
    meta_size: 'File Size', meta_type: 'File Type', meta_by: 'Platform',
    views: 'views', likes: 'likes',
  },
  ur: {
    nav_home: 'ہوم', nav_how: 'طریقہ کار', nav_safety: 'خصوصیات',
    nav_faq: 'سوالات', nav_terms: 'شرائط', nav_privacy: 'رازداری',
    badge: '10. تھریڈز ویڈیو ڈاؤنلوڈر (مکمل آواز کے ساتھ)',
    hero_title: '10. Threads Video Downloader<br/><span class="threads-accent">آواز اور ساؤنڈ کے ساتھ HD میں</span>',
    hero_sub: 'عوامی تھریڈز ویڈیوز اور پوسٹس کو مکمل آواز کے ساتھ 1080p، 720p MP4 یا MP3 میں ڈاؤنلوڈ کریں۔ 100% مفت، بغیر لاگ ان۔',
    url_placeholder: 'تھریڈز ویڈیو یا پوسٹ کا لنک یہاں پیسٹ کریں (threads.net/@user/post/... یا threads.net/t/...)',
    audio_guarantee: 'مکمل آواز کی ضمانت:',
    paste: 'پیسٹ', btn_download: 'ڈاؤنلوڈ',
    loading_msg: 'تھریڈز ویڈیو اور آڈیو تیار ہو رہی ہے...', loading_sub: 'ویڈیو اور آڈیو کو ملا کر فل ساؤنڈ فائل تیار کی جا رہی ہے۔',
    result_ready: 'آپ کی تھریڈز ویڈیو تیار ہے!',
    btn_download_file: 'ویڈیو ڈاؤنلوڈ کریں', btn_copy: 'لنک کاپی کریں', btn_another: 'اور ڈاؤنلوڈ کریں',
    hero_legal: 'صرف عوامی مواد کے لیے۔ کاپی رائٹ کی پاسداری صارف کی ذمہ داری ہے۔',
    how_title: 'تھریڈز ویڈیوز کیسے ڈاؤنلوڈ کریں', how_sub: 'تین آسان مراحل میں آواز کے ساتھ ویڈیو ڈاؤنلوڈ کریں۔',
    step1_title: 'لنک کاپی کریں', step1_desc: 'تھریڈز پر شیئر کا بٹن دبائیں اور "Copy Link" منتخب کریں۔',
    step2_title: 'پیسٹ اور کوالٹی کا انتخاب', step2_desc: 'سرچ بار میں لنک پیسٹ کریں اور 1080p، 720p یا MP3 منتخب کریں۔',
    step3_title: 'ڈاؤنلوڈ کریں', step3_desc: 'ڈاؤنلوڈ پر کلک کریں اور آواز کے ساتھ ویڈیو محفوظ کریں۔',
    safety_title: '10. Threads Video Downloader کی خصوصیات', safety_sub: 'آواز کے مسئلے کا مکمل حل اور تیز ترین ڈاؤنلوڈنگ۔',
    s1_title: 'مکمل آواز کے ساتھ', s1_desc: 'تھریڈز کی ویڈیو اور آڈیو خودبخود ایک ساتھ محفوظ ہوتی ہے۔',
    s2_title: 'تمام تھریڈز لنکس کی سپورٹ', s2_desc: 'threads.net اور threads.com دونوں لنکس پر فوری کام کرتا ہے۔',
    s3_title: 'کوئی لاگ ان نہیں', s3_desc: 'کوئی اکاؤنٹ، پاس ورڈ یا رجسٹریشن درکار نہیں۔',
    s4_title: '30 منٹ میں خودکار حذف', s4_desc: 'رازداری کے لیے فائلیں سرور سے مٹا دی جاتی ہیں۔',
    s5_title: 'انتہائی تیز رفتار', s5_desc: 'براہ راست اسٹریمنگ کی بدولت فائلیں سیکنڈوں میں تیار ہو جاتی ہیں۔',
    s6_title: 'تمام ڈیوائسز پر دستیاب', s6_desc: 'آئی فون، اینڈرائڈ، ونڈوز اور میک سب پر چلتا ہے۔',
    copyright_notice: 'یہ سروس صرف عوامی مواد کے لیے ہے جس کی آپ کو اجازت ہو۔',
    terms_title: 'شرائط', priv_title: 'رازداری',
    terms_h1: 'استعمال', terms_p1: 'صرف جائز اور عوامی پوسٹس ڈاؤنلوڈ کریں۔',
    terms_h2: 'ذمہ داری', terms_p2: 'کاپی رائٹ قوانین کی پاسداری آپ کی ذمہ داری ہے۔',
    terms_h3: 'کوئی وارنٹی نہیں', terms_p3: 'پلیٹ فارم کی تبدیلیوں سے ڈاؤنلوڈ متاثر ہو سکتا ہے۔',
    priv_h1: 'کوئی ڈیٹا نہیں', priv_p1: 'ہم کوئی ذاتی ڈیٹا یا ٹوکن محفوظ نہیں کرتے۔',
    priv_h2: 'عارضی اسٹوریج', priv_p2: '30 منٹ میں ڈیٹا مکمل طور پر حذف ہو جاتا ہے۔',
    priv_h3: 'کوئی ٹریکنگ نہیں', priv_p3: 'کوئی بیرونی ٹریکنگ یا اشتہاری کوکیز نہیں۔',
    faq_title: 'اکثر پوچھے گئے سوالات', faq_sub: 'تھریڈز ویڈیو ڈاؤنلوڈ کے بارے میں معلومات۔',
    faq_q1: 'تھریڈز سے لنک کیسے حاصل کریں؟', faq_a1: 'پوسٹ پر شیئر بٹن دبائیں اور "کاپی لنک" کا انتخاب کریں۔',
    faq_q2: 'کیا آواز کے ساتھ ویڈیو ڈاؤنلوڈ ہوتی ہے؟', faq_a2: 'ہاں! آڈیو اور ویڈیو کو خودبخود یکجا کر کے فل ساؤنڈ ویڈیو دیتا ہے۔',
    faq_q3: 'کیا کوئی اکاؤنٹ چاہیے؟', faq_a3: 'نہیں۔ یہ مکمل طور پر مفت اور بغیر اکاؤنٹ کے ہے۔',
    faq_q4: 'کیا صرف آڈیو ڈاؤنلوڈ کی جا سکتی ہے؟', faq_a4: 'ہاں، آپ MP3 فارمیٹ منتخب کر کے صرف آڈیو حاصل کر سکتے ہیں۔',
    faq_q5: 'کون سے فارمیٹس دستیاب ہیں؟', faq_a5: '1080p، 720p، 360p MP4 اور MP3 آڈیو۔',
    faq_q6: 'کیا یہ تیز ہے؟', faq_a6: 'ہاں، کیشنگ کے ذریعے یہ چند سیکنڈز میں تیار ہو جاتا ہے۔',
    footer_tagline: '10. Threads Video Downloader (آواز کے ساتھ)',
    fmt_360: '360p SD', fmt_720: '720p HD', fmt_1080: '1080p Full HD', fmt_mp3: 'MP3 آڈیو',
    toast_copied: 'لنک کاپی ہو گیا!', toast_pasted: 'لنک پیسٹ ہو گیا!', toast_paste_fail: 'پیسٹ ناکام رہا۔',
    err_empty: 'براہ کرم تھریڈز ویڈیو کا لنک درج کریں۔', err_invalid: 'براہ کرم ایک درست تھریڈز پوسٹ یا ویڈیو لنک درج کریں۔',
    err_playlist: 'پلے لسٹ سپورٹ نہیں ہے۔', err_long: 'یہ لنک بہت لمبا ہے۔',
    err_failed: 'ویڈیو ڈاؤنلوڈ نہیں ہو سکی۔', err_fmt: 'مطلوبہ فارمیٹ دستیاب نہیں۔',
    err_busy: 'سرور مصروف ہے۔ بعد میں کوشش کریں۔', err_large: 'فائل بہت بڑی ہے۔',
    err_timeout: 'ڈاؤنلوڈ بہت لمبا ہو گیا اور بند کر دیا گیا۔',
    err_generic: 'غیر متوقع خرابی۔ دوبارہ کوشش کریں۔',
    meta_title: 'عنوان', meta_format: 'فارمیٹ', meta_quality: 'معیار',
    meta_size: 'فائل سائز', meta_type: 'فائل ٹائپ', meta_by: 'پلیٹ فارم',
    views: 'مناظر', likes: 'پسند',
  },
  ar: {
    nav_home: 'الرئيسية', nav_how: 'كيف يعمل', nav_safety: 'الأمان',
    nav_faq: 'الأسئلة الشائعة', nav_terms: 'الشروط', nav_privacy: 'الخصوصية',
    badge: '#1 برنامج تنزيل فيديوهات ثريدز مجاناً مع الصوت',
    hero_title: '10. Threads Video Downloader<br/><span class="threads-accent">بجودة عالية وبكامل الصوت</span>',
    hero_sub: 'قم بتنزيل فيديوهات ثريدز (Threads) العامة بصيغة MP4 أو MP3 بجودة صوت نقية. بدون حساب أو تسجيل دخول.',
    url_placeholder: 'الصق رابط منشور ثريدز هنا (threads.net/@user/post/... أو threads.net/t/...)',
    paste: 'لصق', btn_download: 'تنزيل',
    loading_msg: 'جاري استخراج فيديو ثريدز...', loading_sub: 'جاري تجهيز مسارات الصوت والفيديو بأعلى جودة.',
    result_ready: 'الفيديو جاهز للتحميل!',
    btn_download_file: 'تحميل الفيديو', btn_copy: 'نسخ الرابط', btn_another: 'تنزيل آخر',
    hero_legal: 'للمحتوى المتاح للعامة فقط على منصة ثريدز.',
    how_title: 'كيفية تنزيل فيديوهات ثريدز', how_sub: 'ثلاث خطوات سريعة لحفظ أي فيديو من ثريدز على جهازك.',
    step1_title: 'انسخ الرابط', step1_desc: 'افتح ثريدز وانقر على أيقونة المشاركة واختر "نسخ الرابط".',
    step2_title: 'الصق الرابط', step2_desc: 'الصق الرابط في الحقل أعلاه واختر الجودة المطلوبة.',
    step3_title: 'تنزيل مع الصوت', step3_desc: 'انقر على "تنزيل" لحفظ الفيديو مع الصوت المدمج.',
    safety_title: 'لماذا تختار 10. Threads Video Downloader', safety_sub: 'مصمم خصيصاً لتنزيل مقاطع ثريدز بسرعة وأمان.',
    s1_title: 'فيديو عالي الدقة مع الصوت', s1_desc: 'يدمج الصوت والصورة تلقائياً بأعلى دقة.',
    s2_title: 'يدعم جميع منشورات ثريدز', s2_desc: 'دعم كامل لروابط threads.net و threads.com.',
    s3_title: 'بدون تسجيل دخول', s3_desc: 'لا يتطلب أي كلمة مرور أو حساب.',
    s4_title: 'حذف تلقائي بعد 30 دقيقة', s4_desc: 'تُحذف الملفات تلقائياً لحماية الخصوصية.',
    s5_title: 'سرعة فائقة', s5_desc: 'تنزيل مباشر وسريع عبر خوادم متقدمة.',
    s6_title: 'يعمل على جميع الأجهزة', s6_desc: 'متوافق مع آيفون وأندرويد والكمبيوتر.',
    copyright_notice: 'هذه الخدمة مخصصة للمحتوى العام فقط.',
    terms_title: 'الشروط والاستخدام', priv_title: 'الخصوصية والأمان',
    terms_h1: 'الاستخدام المقبول', terms_p1: 'استخدم الخدمة لتحميل المحتوى المتاح للعامة فقط.',
    terms_h2: 'مسؤوليتك', terms_p2: 'أنت مسؤول عن الامتثال لقوانين حقوق النشر.',
    terms_h3: 'لا ضمانات', terms_p3: 'قد تتأثر الخدمة بتحديثات المنصة.',
    priv_h1: 'لا بيانات شخصية', priv_p1: 'لا نقوم بحفظ أي بيانات شخصية.',
    priv_h2: 'تخزين مؤقت', priv_p2: 'الملفات تُحذف بعد 30 دقيقة.',
    priv_h3: 'لا تتبع', priv_p3: 'لا نستخدم ملفات تعريف ارتباط للتتبع.',
    faq_title: 'الأسئلة الشائعة', faq_sub: 'كل ما تحتاج لمعرفته حول تنزيل فيديوهات ثريدز.',
    faq_q1: 'هل يدعم الفيديوهات ذات الدقة العالية؟', faq_a1: 'نعم! يدعم تنزيل فيديوهات ثريدز بدقة 1080p و 720p كاملة الصوت.',
    faq_q2: 'كيف أحصل على رابط الفيديو؟', faq_a2: 'من تطبيق ثريدز، اضغط على زر المشاركة ثم اختر "نسخ الرابط".',
    faq_q3: 'هل يمكن استخراج صوت MP3 فقط؟', faq_a3: 'نعم، اختر MP3 من القائمة المنسدلة قبل التنزيل.',
    faq_q4: 'هل الخدمة مجانية؟', faq_a4: 'نعم، الخدمة مجانية تماماً وبدون علامات مائية.',
    footer_tagline: '10. Threads Video Downloader مع الصوت • MP4 و MP3',
    fmt_360: '360p SD', fmt_720: '720p HD', fmt_1080: '1080p Full HD', fmt_mp3: 'صوت MP3 فقط',
    toast_copied: 'تم نسخ الرابط!', toast_pasted: 'تم لصق الرابط!', toast_paste_fail: 'فشل اللصق.',
    err_empty: 'يرجى إدخال رابط فيديو ثريدز.', err_invalid: 'يرجى إدخال رابط منشور ثريدز صالح (threads.net/t/... أو threads.net/@user/post/...).',
    err_playlist: 'قوائم التشغيل غير مدعومة.', err_long: 'هذا الرابط غير مدعوم.',
    err_failed: 'تعذّر تنزيل هذا الفيديو من ثريدز.', err_fmt: 'الصيغة المطلوبة غير متاحة.',
    err_busy: 'الخادم مشغول حالياً.', err_large: 'الملف كبير جداً.',
    err_timeout: 'استغرق التنزيل وقتاً طويلاً.', err_generic: 'حدث خطأ غير متوقع.',
    meta_title: 'العنوان', meta_format: 'الصيغة', meta_quality: 'الجودة',
    meta_size: 'حجم الملف', meta_type: 'نوع الملف', meta_by: 'المنصة',
    views: 'مشاهدة', likes: 'إعجاب',
  },
  fr: {
    nav_home: 'Accueil', nav_how: 'Comment ça marche', nav_safety: 'Sécurité',
    nav_faq: 'FAQ', nav_terms: 'Conditions', nav_privacy: 'Confidentialité',
    badge: '#1 Téléchargeur Gratuit de Vidéos Threads avec Son',
    hero_title: '10. Threads Video Downloader<br/><span class="threads-accent">En Qualité HD avec Audio</span>',
    hero_sub: 'Téléchargez des vidéos et posts Meta Threads en MP4 ou MP3 avec un son cristallin. 100% gratuit, sans filigrane ni inscription.',
    url_placeholder: 'Collez le lien Threads ici (ex: threads.net/@user/post/... ou threads.net/t/...)',
    audio_guarantee: 'Son Garanti :',
    paste: 'Coller', btn_download: 'Télécharger',
    loading_msg: 'Extraction de la vidéo Threads...', loading_sub: 'Préparation du flux vidéo et audio HD.',
    result_ready: 'Votre vidéo Threads est prête !',
    btn_download_file: 'Télécharger la vidéo', btn_copy: 'Copier le lien', btn_another: 'Télécharger une autre',
    hero_legal: 'Pour le contenu public Meta Threads uniquement.',
    how_title: 'Comment télécharger des vidéos Threads', how_sub: 'Trois étapes faciles pour enregistrer n\'importe quelle vidéo Threads sur votre appareil.',
    step1_title: 'Copier le lien', step1_desc: 'Ouvrez Threads, cliquez sur Partager et sélectionnez "Copier le lien".',
    step2_title: 'Coller et choisir la qualité', step2_desc: 'Collez le lien ci-dessus et sélectionnez 1080p, 720p ou MP3.',
    step3_title: 'Télécharger avec son', step3_desc: 'Cliquez sur Télécharger pour enregistrer votre vidéo avec audio synchronisé.',
    safety_title: 'Pourquoi choisir 10. Threads Video Downloader', safety_sub: 'Conçu pour télécharger rapidement les vidéos Threads en qualité optimale.',
    s1_title: 'Vidéo HD avec audio', s1_desc: 'Extrait et fusionne automatiquement les flux audio et vidéo en MP4 HD.',
    s2_title: 'Prend en charge tous les posts Threads', s2_desc: 'Compatible avec threads.net et threads.com.',
    s3_title: 'Aucun compte requis', s3_desc: 'Aucun mot de passe ni cookie nécessaire.',
    s4_title: 'Suppression après 30 min', s4_desc: 'Les fichiers sont purgés automatiquement après 30 minutes.',
    s5_title: 'Vitesse ultra-rapide', s5_desc: 'Téléchargement direct en quelques secondes.',
    s6_title: 'Compatible tous appareils', s6_desc: 'Fonctionne sur iOS, Android, Windows et Mac.',
    copyright_notice: 'Ce service est destiné uniquement au contenu public.',
    terms_title: 'Conditions d\'utilisation', priv_title: 'Confidentialité et sécurité',
    terms_h1: 'Utilisation acceptable', terms_p1: 'Utilisez le service pour les vidéos publiques Threads.',
    terms_h2: 'Votre responsabilité', terms_p2: 'Vous êtes responsable du respect du droit d\'auteur.',
    terms_h3: 'Aucune garantie', terms_p3: 'Les téléchargements dépendent de la disponibilité de la plateforme.',
    priv_h1: 'Aucune donnée personnelle', priv_p1: 'Aucune information stockée.',
    priv_h2: 'Stockage temporaire', priv_p2: 'Suppression après 30 min.',
    priv_h3: 'Aucun suivi', priv_p3: 'Pas de cookies de traçage tiers.',
    faq_title: 'Questions fréquentes', faq_sub: 'Tout sur le téléchargement de vidéos Threads.',
    faq_q1: 'Puis-je télécharger en HD ?', faq_a1: 'Oui, supporte les résolutions 1080p et 720p HD avec son.',
    faq_q2: 'Comment copier le lien sur Threads ?', faq_a2: 'Appuyez sur l\'icône de partage sous le post et choisissez "Copier le lien".',
    faq_q3: 'Puis-je extraire le son en MP3 ?', faq_a3: 'Oui, choisissez "MP3 Audio Only" dans la liste des formats.',
    faq_q4: 'Est-ce gratuit ?', faq_a4: 'Oui, 100% gratuit sans filigrane.',
    footer_tagline: '10. Threads Video Downloader avec Son • HD MP4 & MP3',
    fmt_360: '360p SD', fmt_720: '720p HD', fmt_1080: '1080p Full HD', fmt_mp3: 'Audio MP3',
    toast_copied: 'Lien copié !', toast_pasted: 'URL collée !', toast_paste_fail: 'Échec du collage.',
    err_empty: 'Veuillez entrer une URL Threads.', err_invalid: 'Veuillez entrer une URL Threads valide (ex: threads.net/@user/post/... ou threads.net/t/...).',
    err_playlist: 'Les playlists ne sont pas prises en charge.', err_long: 'Cette URL n\'est pas prise en charge.',
    err_failed: 'Cette vidéo Threads n\'a pas pu être téléchargée.', err_fmt: 'Le format demandé n\'est pas disponible.',
    err_busy: 'Le serveur est occupé.', err_large: 'Le fichier est trop volumineux.',
    err_timeout: 'Le téléchargement a trop duré.', err_generic: 'Une erreur inattendue s\'est produite.',
    meta_title: 'Titre', meta_format: 'Format', meta_quality: 'Qualité',
    meta_size: 'Taille', meta_type: 'Type', meta_by: 'Plateforme',
    views: 'vues', likes: 'j\'aime',
  },
  es: {
    nav_home: 'Inicio', nav_how: 'Cómo funciona', nav_safety: 'Seguridad',
    nav_faq: 'FAQ', nav_terms: 'Términos', nav_privacy: 'Privacidad',
    badge: '#1 Descargador Gratuito de Vídeos de Threads con Audio',
    hero_title: '10. Threads Video Downloader<br/><span class="threads-accent">En Calidad HD con Sonido</span>',
    hero_sub: 'Guarda vídeos y publicaciones públicas de Meta Threads con sonido nítido en MP4 o MP3. 100% gratis, sin marca de agua.',
    url_placeholder: 'Pega el enlace de Threads aquí (ej: threads.net/@user/post/... o threads.net/t/...)',
    audio_guarantee: 'Sonido Garantizado:',
    paste: 'Pegar', btn_download: 'Descargar',
    loading_msg: 'Extrayendo vídeo de Threads...', loading_sub: 'Obteniendo flujos de vídeo y audio en máxima calidad.',
    result_ready: '¡Tu vídeo de Threads está listo!',
    btn_download_file: 'Descargar vídeo', btn_copy: 'Copiar enlace', btn_another: 'Descargar otro',
    hero_legal: 'Solo para contenido público de Meta Threads.',
    how_title: 'Cómo descargar vídeos de Threads', how_sub: 'Tres sencillos pasos para guardar cualquier vídeo de Threads en tu dispositivo.',
    step1_title: 'Copiar enlace', step1_desc: 'Abre Threads, pulsa en Compartir y selecciona "Copiar enlace".',
    step2_title: 'Pegar y elegir calidad', step2_desc: 'Pega el enlace arriba y elige 1080p, 720p o MP3.',
    step3_title: 'Descargar con sonido', step3_desc: 'Pulsa Descargar y guarda el archivo con audio sincronizado.',
    safety_title: '¿Por qué elegir 10. Threads Video Downloader?', safety_sub: 'Diseñado para guardar vídeos de Threads a la máxima velocidad.',
    s1_title: 'Vídeo HD con audio claro', s1_desc: 'Descarga con audio y vídeo unidos en un único MP4 HD.',
    s2_title: 'Soporta todos los enlaces Threads', s2_desc: 'Compatible con threads.net y threads.com.',
    s3_title: 'Sin registro ni cuenta', s3_desc: 'No necesitas cuenta, contraseña ni cookies.',
    s4_title: 'Borrado en 30 min', s4_desc: 'Los archivos se eliminan en 30 minutos para tu privacidad.',
    s5_title: 'Descargas ultrarrápidas', s5_desc: 'Obtención directa del vídeo en pocos segundos.',
    s6_title: 'Funciona en cualquier dispositivo', s6_desc: 'Compatible con iPhone, Android, PC y Mac.',
    copyright_notice: 'Este servicio está destinado solo a contenido público.',
    terms_title: 'Términos de uso', priv_title: 'Privacidad y seguridad',
    terms_h1: 'Uso aceptable', terms_p1: 'Usa el descargador para vídeos públicos de Threads.',
    terms_h2: 'Tu responsabilidad', terms_p2: 'Eres responsable del cumplimiento de las leyes de derechos de autor.',
    terms_h3: 'Sin garantías', terms_p3: 'Las descargas pueden variar según actualizaciones de la plataforma.',
    priv_h1: 'Sin datos personales', priv_p1: 'No guardamos datos de usuario.',
    priv_h2: 'Almacenamiento temporal', priv_p2: 'Archivos eliminados tras 30 minutos.',
    priv_h3: 'Sin rastreo', priv_p3: 'Sin cookies de seguimiento.',
    faq_title: 'Preguntas frecuentes', faq_sub: 'Todo lo que necesitas saber sobre descargar de Threads.',
    faq_q1: '¿Puedo descargar vídeos en HD?', faq_a1: '¡Sí! Puedes descargar vídeos de Threads en 1080p y 720p MP4 con audio.',
    faq_q2: '¿Cómo obtengo el enlace de Threads?', faq_a2: 'En la app o web de Threads, pulsa el botón Compartir y elige "Copiar enlace".',
    faq_q3: '¿Puedo extraer solo el audio en MP3?', faq_a3: 'Sí, selecciona "MP3 Audio Only" en el menú desplegable de formatos.',
    faq_q4: '¿Es gratuito?', faq_a4: 'Sí, es 100% gratuito y sin marcas de agua.',
    footer_tagline: '10. Threads Video Downloader con Sonido • HD MP4 & MP3',
    fmt_360: '360p SD', fmt_720: '720p HD', fmt_1080: '1080p Full HD', fmt_mp3: 'Audio MP3',
    toast_copied: '¡Enlace copiado!', toast_pasted: '¡URL pegada!', toast_paste_fail: 'Error al pegar.',
    err_empty: 'Por favor ingresa una URL de Threads.', err_invalid: 'Por favor ingresa una URL de Threads válida (ej: threads.net/@user/post/... o threads.net/t/...).',
    err_playlist: 'Las listas no son compatibles.', err_long: 'Esta URL no es compatible.',
    err_failed: 'No se pudo descargar este vídeo de Threads.', err_fmt: 'El formato solicitado no está disponible.',
    err_busy: 'El servidor está ocupado.', err_large: 'El archivo es demasiado grande.',
    err_timeout: 'La descarga tardó demasiado.', err_generic: 'Ocurrió un error inesperado.',
    meta_title: 'Título', meta_format: 'Formato', meta_quality: 'Calidad',
    meta_size: 'Tamaño', meta_type: 'Tipo', meta_by: 'Plataforma',
    views: 'vistas', likes: 'me gusta',
  },
  de: {
    nav_home: 'Start', nav_how: 'Wie es funktioniert', nav_safety: 'Sicherheit',
    nav_faq: 'FAQ', nav_terms: 'AGB', nav_privacy: 'Datenschutz',
    badge: '#1 Kostenloser Threads Video Downloader mit Ton',
    hero_title: '10. Threads Video Downloader<br/><span class="threads-accent">In HD-Qualität mit Ton</span>',
    hero_sub: 'Laden Sie öffentliche Meta Threads-Videos und Posts in HD 1080p, 720p MP4 oder MP3 herunter. 100% kostenlos ohne Login.',
    url_placeholder: 'Threads-Link hier einfügen (z.B. threads.net/@user/post/... oder threads.net/t/...)',
    audio_guarantee: 'Ton Garantiert:',
    paste: 'Einfügen', btn_download: 'Herunterladen',
    loading_msg: 'Threads-Video wird vorbereitet...', loading_sub: 'Audio- und Videospuren werden in bester HD-Qualität extrahiert.',
    result_ready: 'Ihr Threads-Video ist fertig!',
    btn_download_file: 'Video herunterladen', btn_copy: 'Link kopieren', btn_another: 'Weiteres herunterladen',
    hero_legal: 'Nur für öffentliche Meta Threads-Inhalte.',
    how_title: 'So laden Sie Threads-Videos herunter', how_sub: 'In 3 einfachen Schritten jedes Threads-Video auf Ihrem Gerät speichern.',
    step1_title: 'Link kopieren', step1_desc: 'Öffnen Sie Threads, tippen Sie auf Teilen und wählen Sie "Link kopieren".',
    step2_title: 'Einfügen & Qualität wählen', step2_desc: 'Fügen Sie den Link oben ein und wählen Sie 1080p, 720p oder MP3.',
    step3_title: 'Mit Ton herunterladen', step3_desc: 'Klicken Sie auf Herunterladen, um das Video mit synchronisiertem Ton zu speichern.',
    safety_title: 'Warum 10. Threads Video Downloader', safety_sub: 'Speziell für das schnelle Speichern von Threads-Videos entwickelt.',
    s1_title: 'HD-Video mit klarem Ton', s1_desc: 'Kombiniert Audio und Video automatisch in einer vollständigen MP4-Datei.',
    s2_title: 'Unterstützt alle Threads-Links', s2_desc: 'Funktioniert mit threads.net und threads.com.',
    s3_title: 'Kein Konto erforderlich', s3_desc: 'Keine Passwörter oder Registrierung nötig.',
    s4_title: 'Automatische Löschung nach 30 Min.', s4_desc: 'Dateien werden aus Datenschutzgründen nach 30 Minuten gelöscht.',
    s5_title: 'Blitzschnelle Downloads', s5_desc: 'Direkter CDN-Download liefert Dateien in Sekundenschnelle.',
    s6_title: 'Funktioniert auf allen Geräten', s6_desc: 'Optimiert für iPhone, Android, Windows und Mac.',
    copyright_notice: 'Dieser Dienst ist nur für öffentliche Inhalte bestimmt.',
    terms_title: 'Nutzungsbedingungen', priv_title: 'Datenschutz',
    terms_h1: 'Nutzung', terms_p1: 'Nur für öffentliche Threads-Inhalte verwenden.',
    terms_h2: 'Verantwortung', terms_p2: 'Sie sind für das Urheberrecht verantwortlich.',
    terms_h3: 'Keine Garantie', terms_p3: 'Dienst kann von Plattform-Updates abhängen.',
    priv_h1: 'Keine persönlichen Daten', priv_p1: 'Wir speichern keine privaten Daten.',
    priv_h2: 'Temporäre Speicherung', priv_p2: 'Löschung nach 30 Minuten.',
    priv_h3: 'Kein Tracking', priv_p3: 'Keine Tracking-Cookies.',
    faq_title: 'Häufig gestellte Fragen', faq_sub: 'Alles über das Herunterladen von Threads-Videos.',
    faq_q1: 'Kann ich Videos in HD herunterladen?', faq_a1: 'Ja! Sie können Threads-Videos in 1080p und 720p HD mit Ton speichern.',
    faq_q2: 'Wie kopiere ich den Link in Threads?', faq_a2: 'Tippen Sie unter dem Post auf das Teilen-Symbol und wählen Sie "Link kopieren".',
    faq_q3: 'Kann ich MP3-Audio extrahieren?', faq_a3: 'Ja, wählen Sie einfach "MP3 Audio Only" vor dem Klick auf Herunterladen.',
    faq_q4: 'Ist dieser Service kostenlos?', faq_a4: 'Ja, 100% kostenlos und ohne Wasserzeichen.',
    footer_tagline: '10. Threads Video Downloader mit Ton • HD MP4 & MP3',
    fmt_360: '360p SD', fmt_720: '720p HD', fmt_1080: '1080p Full HD', fmt_mp3: 'MP3 Audio',
    toast_copied: 'Link kopiert!', toast_pasted: 'URL eingefügt!', toast_paste_fail: 'Einfügen fehlgeschlagen.',
    err_empty: 'Bitte geben Sie eine Threads-URL ein.', err_invalid: 'Bitte geben Sie eine gültige Threads-URL ein (z.B. threads.net/@user/post/... oder threads.net/t/...).',
    err_playlist: 'Playlists werden nicht unterstützt.', err_long: 'Diese URL wird nicht unterstützt.',
    err_failed: 'Dieses Threads-Video konnte nicht heruntergeladen werden.', err_fmt: 'Format nicht verfügbar.',
    err_busy: 'Server ist beschäftigt.', err_large: 'Datei ist zu groß.',
    err_timeout: 'Zeitüberschreitung beim Download.', err_generic: 'Unerwarteter Fehler.',
    meta_title: 'Titel', meta_format: 'Format', meta_quality: 'Qualität',
    meta_size: 'Dateigröße', meta_type: 'Typ', meta_by: 'Plattform',
    views: 'Aufrufe', likes: 'Likes',
  },
  zh: {
    nav_home: '首页', nav_how: '使用方法', nav_safety: '功能特点',
    nav_faq: '常见问题', nav_terms: '服务条款', nav_privacy: '隐私政策',
    badge: '#1 免费 Threads 视频下载器（带声音）',
    hero_title: '10. Threads Video Downloader<br/><span class="threads-accent">高清音画质同步下载</span>',
    hero_sub: '下载公开 Meta Threads 帖子与视频，支持 1080p、720p 高清 MP4 或 MP3 音频。100% 免费，无水印，无需登录。',
    url_placeholder: '在此粘贴 Threads 链接（例如 threads.net/@user/post/... 或 threads.net/t/...）',
    audio_guarantee: '声音保证：',
    paste: '粘贴', btn_download: '下载',
    loading_msg: '正在解析 Threads 视频...', loading_sub: '正在以最高画质提取视频与音频轨道。',
    result_ready: '您的 Threads 视频已准备就绪！',
    btn_download_file: '下载视频', btn_copy: '复制链接', btn_another: '下载另一个',
    hero_legal: '仅限公开的 Meta Threads 视频内容。',
    how_title: '如何下载 Threads 视频', how_sub: '只需三步即可将任何 Threads 视频保存到您的设备。',
    step1_title: '复制链接', step1_desc: '在 Threads 帖子下方点击分享图标，选择“复制链接”。',
    step2_title: '粘贴并选择画质', step2_desc: '在上方输入框粘贴链接，选择 1080p、720p 或 MP3。',
    step3_title: '带音频下载', step3_desc: '点击“下载”即可保存带有声音的高清视频文件。',
    safety_title: '为什么选择 10. Threads Video Downloader', safety_sub: '专为快速、稳定下载 Threads 视频而设计。',
    s1_title: '高清视频与声音同步', s1_desc: '自动提取并合并视频与音频流，保存为完整的 MP4 文件。',
    s2_title: '支持所有 Threads 链接', s2_desc: '完美支持 threads.net 与 threads.com 所有公开帖子。',
    s3_title: '无需登录', s3_desc: '无需任何账号、密码或 Cookie。',
    s4_title: '30 分钟自动删除', s4_desc: '服务器在 30 分钟后自动清除缓存文件，保护隐私。',
    s5_title: '极速下载', s5_desc: '直连高速 CDN，几秒钟内完成解析与下载。',
    s6_title: '支持所有设备', s6_desc: '完美适配 iPhone、Android、Windows 及 Mac。',
    copyright_notice: '本服务仅用于公开内容下载。',
    terms_title: '条款与使用', priv_title: '隐私与安全',
    terms_h1: '可接受使用', terms_p1: '仅用于下载您有权访问的公开视频。',
    terms_h2: '您的责任', terms_p2: '用户需自行遵守版权法与平台条款。',
    terms_h3: '无保证', terms_p3: '下载可能随平台接口调整而变动。',
    priv_h1: '无个人数据', priv_p1: '不保留任何用户账号数据。',
    priv_h2: '临时存储', priv_p2: '文件在 30 分钟后自动清除。',
    priv_h3: '无追踪', priv_p3: '无第三方追踪 Cookie。',
    faq_title: '常见问题', faq_sub: '关于 Threads 视频下载的所有疑问。',
    faq_q1: '支持下载高清视频吗？', faq_a1: '支持！可下载 1080p、720p 高清 MP4 并完整保留原声。',
    faq_q2: '如何从 Threads 复制链接？', faq_a2: '在 Threads 应用或网页中点击帖子下方的分享按钮，选择“复制链接”。',
    faq_q3: '可以单独提取 MP3 音频吗？', faq_a3: '可以！在格式下拉菜单中选择“MP3 Audio Only”即可提取纯音频。',
    faq_q4: '此工具免费吗？', faq_a4: '100% 免费，无广告水印，无需安装任何软件。',
    footer_tagline: '10. Threads Video Downloader（带声音）• HD MP4 & MP3',
    fmt_360: '360p SD', fmt_720: '720p HD', fmt_1080: '1080p Full HD', fmt_mp3: 'MP3 音频',
    toast_copied: '链接已复制！', toast_pasted: 'URL 已粘贴！', toast_paste_fail: '粘贴失败。',
    err_empty: '请输入 Threads 视频链接。', err_invalid: '请输入有效的 Threads 链接（如 threads.net/@user/post/... 或 threads.net/t/...）。',
    err_playlist: '不支持播放列表。', err_long: '链接长度超出限制。',
    err_failed: '无法下载此 Threads 视频。', err_fmt: '请求的格式不可用。',
    err_busy: '服务器繁忙，请稍后再试。', err_large: '文件过大。',
    err_timeout: '下载超时已停止。', err_generic: '发生未知错误，请重试。',
    meta_title: '标题', meta_format: '格式', meta_quality: '画质',
    meta_size: '文件大小', meta_type: '类型', meta_by: '平台',
    views: '次观看', likes: '次点赞',
  },
  hi: {
    nav_home: 'होम', nav_how: 'कैसे काम करता है', nav_safety: 'विशेषताएं',
    nav_faq: 'सामान्य प्रश्न', nav_terms: 'शर्तें', nav_privacy: 'गोपनीयता',
    badge: '#1 निःशुल्क थ्रेड्स वीडियो डाउनलोडर (आवाज के साथ)',
    hero_title: '10. Threads Video Downloader<br/><span class="threads-accent">HD क्वालिटी और साउंड के साथ</span>',
    hero_sub: 'सार्वजनिक Meta Threads वीडियो और पोस्ट्स को फुल साउंड के साथ 1080p, 720p MP4 या MP3 में डाउनलोड करें। 100% मुफ़्त, बिना लॉगिन।',
    url_placeholder: 'थ्रेड्स वीडियो लिंक यहाँ पेस्ट करें (जैसे threads.net/@user/post/... या threads.net/t/...)',
    audio_guarantee: 'साउंड गारंटी:',
    paste: 'पेस्ट', btn_download: 'डाउनलोड',
    loading_msg: 'थ्रेड्स वीडियो तैयार हो रहा है...', loading_sub: 'उच्चतम गुणवत्ता में वीडियो और ऑडियो ट्रैक निकाला जा रहा है।',
    result_ready: 'आपका थ्रेड्स वीडियो तैयार है!',
    btn_download_file: 'वीडियो डाउनलोड करें', btn_copy: 'लिंक कॉपी करें', btn_another: 'दूसरा डाउनलोड करें',
    hero_legal: 'केवल सार्वजनिक थ्रेड्स सामग्री के लिए।',
    how_title: 'थ्रेड्स वीडियो कैसे डाउनलोड करें', how_sub: 'तीन आसान चरणों में किसी भी थ्रेड्स वीडियो को सुरक्षित करें।',
    step1_title: 'लिंक कॉपी करें', step1_desc: 'थ्रेड्स खोलें, शेयर आइकन पर टैप करें और "कॉपी लिंक" चुनें।',
    step2_title: 'पेस्ट और फॉर्मेट चुनें', step2_desc: 'ऊपर लिंक पेस्ट करें और 1080p, 720p या MP3 चुनें।',
    step3_title: 'साउंड के साथ डाउनलोड करें', step3_desc: '"डाउनलोड" पर क्लिक करें और ऑडियो के साथ वीडियो प्राप्त करें।',
    safety_title: '10. Threads Video Downloader क्यों चुनें', safety_sub: 'थ्रेड्स वीडियो को तुरंत और सही आवाज के साथ डाउनलोड करने के लिए।',
    s1_title: 'HD वीडियो के साथ क्लियर ऑडियो', s1_desc: 'वीडियो और ऑडियो ट्रैक को एक साथ जोड़कर डाउनलोड करता है।',
    s2_title: 'सभी थ्रेड्स लिंक समर्थित', s2_desc: 'threads.net और threads.com दोनों पर तुरंत काम करता है।',
    s3_title: 'लॉगिन की आवश्यकता नहीं', s3_desc: 'कोई पासवर्ड या खाता आवश्यक नहीं है।',
    s4_title: '30 मिनट में स्वतः हटाना', s4_desc: 'गोपनीयता के लिए फाइलें 30 मिनट में सर्वर से हट जाती हैं।',
    s5_title: 'सुपर फास्ट डाउनलोड', s5_desc: 'डायरेक्ट सीडीएन डाउनलोडिंग कुछ ही सेकंड में फाइल उपलब्ध कराती है।',
    s6_title: 'सभी डिवाइस पर उपलब्ध', s6_desc: 'iPhone, Android, Windows और Mac सभी पर काम करता है।',
    copyright_notice: 'यह सेवा केवल सार्वजनिक सामग्री के लिए है।',
    terms_title: 'शर्तें', priv_title: 'गोपनीयता',
    terms_h1: 'उपयोग', terms_p1: 'केवल सार्वजनिक और कानूनी वीडियो डाउनलोड करें।',
    terms_h2: 'जिम्मेदारी', terms_p2: 'कॉपीराइट नियमों का पालन आपकी जिम्मेदारी है।',
    terms_h3: 'कोई वारंटी नहीं', terms_p3: 'प्लेटफ़ॉर्म के बदलावों से सेवा प्रभावित हो सकती है।',
    priv_h1: 'कोई व्यक्तिगत डेटा नहीं', priv_p1: 'हम कोई व्यक्तिगत जानकारी सुरक्षित नहीं रखते।',
    priv_h2: 'अस्थायी भंडारण', priv_p2: '30 मिनट बाद फाइलें मिटा दी जाती हैं।',
    priv_h3: 'कोई ट्रैकिंग नहीं', priv_p3: 'कोई बाहरी ट्रैकिंग कुकीज़ नहीं।',
    faq_title: 'सामान्य प्रश्न', faq_sub: 'थ्रेड्स वीडियो डाउनलोड के बारे में सब कुछ।',
    faq_q1: 'क्या HD वीडियो डाउनलोड हो सकता है?', faq_a1: 'हाँ! 1080p और 720p HD में पूरी आवाज के साथ डाउनलोड उपलब्ध है।',
    faq_q2: 'थ्रेड्स से लिंक कैसे लें?', faq_a2: 'पोस्ट के नीचे शेयर बटन दबाएं और "कॉपी लिंक" चुनें।',
    faq_q3: 'क्या केवल MP3 ऑडियो डाउनलोड कर सकते हैं?', faq_a3: 'हाँ, फॉर्मेट में "MP3 Audio Only" चुनकर आप केवल आवाज डाउनलोड कर सकते हैं।',
    faq_q4: 'क्या यह सेवा मुफ़्त है?', faq_a4: 'हाँ, यह 100% मुफ़्त है और कोई वॉटरमार्क नहीं है।',
    footer_tagline: '10. Threads Video Downloader (साउंड के साथ) • HD MP4 & MP3',
    fmt_360: '360p SD', fmt_720: '720p HD', fmt_1080: '1080p Full HD', fmt_mp3: 'MP3 ऑडियो',
    toast_copied: 'लिंक कॉपी हो गया!', toast_pasted: 'URL पेस्ट हो गया!', toast_paste_fail: 'पेस्ट विफल रहा।',
    err_empty: 'कृपया थ्रेड्स वीडियो URL दर्ज करें।', err_invalid: 'कृपया एक मान्य थ्रेड्स पोस्ट लिंक दर्ज करें (जैसे threads.net/@user/post/... या threads.net/t/...)।',
    err_playlist: 'प्लेलिस्ट समर्थित नहीं है।', err_long: 'यह URL बहुत लंबा है।',
    err_failed: 'थ्रेड्स वीडियो डाउनलोड नहीं हो सका।', err_fmt: 'अनुरोधित प्रारूप उपलब्ध नहीं है।',
    err_busy: 'सर्वर व्यस्त है।', err_large: 'फाइल बहुत बड़ी है।',
    err_timeout: 'डाउनलोड में बहुत समय लगा।', err_generic: 'अनपेक्षित त्रुटि हुई।',
    meta_title: 'शीर्षक', meta_format: 'प्रारूप', meta_quality: 'गुणवत्ता',
    meta_size: 'फाइल आकार', meta_type: 'प्रकार', meta_by: 'प्लेटफ़ॉर्म',
    views: 'दृश्य', likes: 'पसंद',
  },
};

const RTL_LANGS = new Set(['ar', 'ur']);
const LANG_META = {
  en: { flag: '🇺🇸', code: 'EN' }, ar: { flag: '🇸🇦', code: 'AR' }, ur: { flag: '🇵🇰', code: 'UR' },
  fr: { flag: '🇫🇷', code: 'FR' }, es: { flag: '🇪🇸', code: 'ES' }, de: { flag: '🇩🇪', code: 'DE' },
  zh: { flag: '🇨🇳', code: 'ZH' }, hi: { flag: '🇮🇳', code: 'HI' },
};

// ── i18n Engine ───────────────────────────────────────────────────────────────
let currentLang = localStorage.getItem('sf_lang') || 'en';

function t(key) {
  return (TRANSLATIONS[currentLang] || TRANSLATIONS.en)[key] || (TRANSLATIONS.en[key] || key);
}

function applyTranslations() {
  const lang = currentLang;
  const isRTL = RTL_LANGS.has(lang);

  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const text = t(key);
    if (text && el.innerHTML !== text) el.innerHTML = text;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = t(key);
  });

  // Update select options
  document.querySelectorAll('[data-i18n-opt]').forEach(el => {
    const key = el.dataset.i18nOpt;
    el.textContent = t(key);
  });

  // Update lang button display
  const meta = LANG_META[lang] || LANG_META.en;
  const flagEl = document.getElementById('lang-flag');
  const codeEl = document.getElementById('lang-code');
  if (flagEl) flagEl.textContent = meta.flag;
  if (codeEl) codeEl.textContent = meta.code;
}

// ── Language switcher dropdown ────────────────────────────────────────────────
const langSwitcher = document.getElementById('lang-switcher');
const langBtn = document.getElementById('lang-btn');
const langMenu = document.getElementById('lang-menu');

langBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = langMenu.classList.toggle('open');
  langBtn.setAttribute('aria-expanded', isOpen);
});

document.addEventListener('click', () => {
  langMenu.classList.remove('open');
  langBtn.setAttribute('aria-expanded', 'false');
});

langMenu.querySelectorAll('.lang-option').forEach(opt => {
  opt.addEventListener('click', () => {
    const chosen = opt.dataset.lang;
    if (chosen && chosen !== currentLang) {
      currentLang = chosen;
      localStorage.setItem('sf_lang', chosen);
      applyTranslations();
    }
    langMenu.classList.remove('open');
    langBtn.setAttribute('aria-expanded', 'false');
  });
});

// ── Hamburger menu ────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('nav-mobile');

hamburger.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', !isOpen);
});

navMobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navMobile.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}));

// ── Toast system ──────────────────────────────────────────────────────────────
const toastContainer = document.getElementById('toast-container');

const TOAST_ICONS = {
  success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  error:   '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  info:    '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
};

function showToast(message, type = 'info', duration = 3500) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `${TOAST_ICONS[type] || TOAST_ICONS.info}<span>${message}</span>`;
  toastContainer.appendChild(toast);

  const remove = () => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };
  setTimeout(remove, duration);
}

// ── URL normalization & validation (client-side) ──────────────────────────────
function normalizeUrl(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let u = raw.trim();
  // Strip outer quotes, brackets, parentheses
  u = u.replace(/^[<"'(]+|[>"')]+$/g, '');
  const match = u.match(/https?:\/\/[^\s<>"')]+/);
  if (match) {
    u = match[0];
  } else if (!/^https?:\/\//i.test(u)) {
    u = 'https://' + u;
  }
  return u.replace(/[.,;!?]+$/, '');
}

function validateUrl(url) {
  if (!url || !url.trim()) return { valid: false, msg: t('err_empty') };
  const u = normalizeUrl(url);
  if (u.length > 2048) return { valid: false, msg: t('err_long') };

  try {
    const parsed = new URL(u);
    if (!parsed.protocol.startsWith('http')) {
      return { valid: false, msg: t('err_invalid') };
    }
    const cleanHost = parsed.hostname.toLowerCase().replace(/^www\./, '');

    // 0. Threads posts, share links, clips, and videos (threads.net & threads.com)
    if (cleanHost === 'threads.net' || cleanHost.endsWith('.threads.net') ||
        cleanHost === 'threads.com' || cleanHost.endsWith('.threads.com')) {
      const p = parsed.pathname.replace(/^\/+/, '');
      if (p.length > 0) return { valid: true, normalizedUrl: u, platform: 'Threads' };
      return { valid: false, msg: t('err_invalid') };
    }

    // 1. Twitch clips and VODs
    if (cleanHost === 'clips.twitch.tv' || cleanHost.endsWith('.clips.twitch.tv')) {
      const p = parsed.pathname.replace(/^\/+/, '');
      if (p.length > 0) return { valid: true, normalizedUrl: u, platform: 'Twitch' };
      return { valid: false, msg: t('err_invalid') };
    }

    if (cleanHost === 'twitch.tv' || cleanHost.endsWith('.twitch.tv')) {
      const path = parsed.pathname.toLowerCase();
      if (path.includes('/videos/') || path.includes('/clip/') || path.includes('/v/')) {
        return { valid: true, normalizedUrl: u, platform: 'Twitch' };
      }
      const parts = path.split('/').filter(Boolean);
      if (parts.length >= 1) return { valid: true, normalizedUrl: u, platform: 'Twitch' };
      return { valid: false, msg: t('err_invalid') };
    }

    // 2. Pinterest pins
    if (cleanHost === 'pin.it' || cleanHost.endsWith('.pin.it')) {
      const p = parsed.pathname.replace(/^\/+/, '');
      if (p.length > 0) return { valid: true, normalizedUrl: u, platform: 'Pinterest' };
      return { valid: false, msg: t('err_invalid') };
    }

    if (cleanHost === 'pinterest.com' || cleanHost.includes('pinterest.')) {
      const p = parsed.pathname.toLowerCase();
      if (p.includes('/pin/')) return { valid: true, normalizedUrl: u, platform: 'Pinterest' };
      const parts = p.split('/').filter(Boolean);
      if (parts.length >= 2 && parts[0] === 'pin') return { valid: true, normalizedUrl: u, platform: 'Pinterest' };
      return { valid: false, msg: t('err_invalid') };
    }

    // 3. YouTube
    if (cleanHost === 'youtube.com' || cleanHost === 'youtu.be') {
      return { valid: true, normalizedUrl: u, platform: 'YouTube' };
    }

    // 4. Twitter/X
    if (cleanHost === 'twitter.com' || cleanHost === 'x.com' || cleanHost === 'mobile.twitter.com') {
      return { valid: true, normalizedUrl: u, platform: 'Twitter/X' };
    }

    // 5. Reddit
    if (cleanHost === 'reddit.com' || cleanHost === 'redd.it' || cleanHost === 'v.redd.it' ||
        cleanHost === 'old.reddit.com' || cleanHost === 'sh.reddit.com' || cleanHost === 'm.reddit.com') {
      return { valid: true, normalizedUrl: u, platform: 'Reddit' };
    }

    // 6. Snapchat
    if (cleanHost === 'snapchat.com' || cleanHost === 'story.snapchat.com' || cleanHost === 't.snapchat.com') {
      return { valid: true, normalizedUrl: u, platform: 'Snapchat' };
    }

    // 7. Bilibili
    if (cleanHost === 'bilibili.com' || cleanHost === 'b23.tv') {
      return { valid: true, normalizedUrl: u, platform: 'Bilibili' };
    }
  } catch {
    if (/https?:\/\/([a-z0-9-]+\.)?threads\.(net|com)\//i.test(u)) {
      return { valid: true, normalizedUrl: u, platform: 'Threads' };
    }
  }

  return { valid: false, msg: t('err_invalid') };
}

// ── DOM refs ──────────────────────────────────────────────────────────────────
const urlInput      = document.getElementById('url-input');
const pasteBtn      = document.getElementById('paste-btn');
const qualitySelect = document.getElementById('quality-select');
const downloadBtn   = document.getElementById('download-btn');
const urlStatus     = document.getElementById('url-status');
const loadingArea   = document.getElementById('loading-area');
const infoPreview   = document.getElementById('info-preview');
const errorBox      = document.getElementById('error-box');
const errorText     = document.getElementById('error-text');
const resultCard    = document.getElementById('result-card');
const downloadFileBtn = document.getElementById('download-file-btn');
const copyLinkBtn   = document.getElementById('copy-link-btn');
const startAnotherBtn = document.getElementById('start-another-btn');

// ── State ─────────────────────────────────────────────────────────────────────
let activeRequest = null;    // AbortController
let infoDebounce  = null;    // setTimeout handle
let lastDownloadUrl = '';    // for copy-link

// ── Show/hide helpers ─────────────────────────────────────────────────────────
function showEl(el)  { el.hidden = false; }
function hideEl(el)  { el.hidden = true; }

function setLoading(active) {
  downloadBtn.disabled = active;
  downloadBtn.setAttribute('aria-busy', active);
  urlInput.disabled    = active;
  qualitySelect.disabled = active;
  if (active) showEl(loadingArea); else hideEl(loadingArea);
}

function showError(msg) {
  hideEl(loadingArea);
  hideEl(resultCard);
  errorText.textContent = msg;
  showEl(errorBox);
}

function clearResults() {
  hideEl(errorBox);
  hideEl(resultCard);
  hideEl(infoPreview);
  hideEl(loadingArea);
}

// ── Clipboard paste ───────────────────────────────────────────────────────────
pasteBtn.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    urlInput.value = text.trim();
    urlInput.dispatchEvent(new Event('input'));
    showToast(t('toast_pasted'), 'success', 2000);
  } catch {
    showToast(t('toast_paste_fail'), 'error');
    urlInput.focus();
  }
});

// ── URL live validation + info prefetch ───────────────────────────────────────
urlInput.addEventListener('input', () => {
  const rawUrl = urlInput.value.trim();
  clearTimeout(infoDebounce);

  if (!rawUrl) {
    urlStatus.textContent = '';
    urlStatus.className = 'url-status';
    hideEl(infoPreview);
    return;
  }

  const { valid, msg, normalizedUrl, platform } = validateUrl(rawUrl);
  if (!valid) {
    urlStatus.textContent = msg;
    urlStatus.className = 'url-status invalid';
    hideEl(infoPreview);
    return;
  }

  urlStatus.textContent = `✓ Valid ${platform || 'Threads'} video link`;
  urlStatus.className = 'url-status valid';

  // Debounced info prefetch (600ms)
  const url = normalizedUrl || normalizeUrl(rawUrl);
  infoDebounce = setTimeout(() => prefetchInfo(url), 600);
});

async function prefetchInfo(url) {
  try {
    const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
    if (!res.ok) return;
    const data = await res.json();
    renderInfoPreview(data);
  } catch {
    // Silently ignore — info is optional
  }
}

function renderInfoPreview(data) {
  if (!data || !data.title) return;

  const thumb = document.getElementById('info-thumb');
  const titleEl = document.getElementById('info-title');
  const channelEl = document.getElementById('info-channel');
  const subredditEl = document.getElementById('info-subreddit');
  const durationEl = document.getElementById('info-duration');
  const viewsEl = document.getElementById('info-views');

  if (titleEl) titleEl.textContent = data.title || '';
  if (channelEl) channelEl.textContent = data.uploader || 'Threads Creator';
  if (subredditEl) {
    subredditEl.textContent = 'Threads Post';
  }

  if (thumb && data.thumbnail) {
    thumb.src = data.thumbnail;
    thumb.style.display = 'block';
    thumb.onerror = () => { thumb.style.display = 'none'; };
  }

  if (durationEl && data.duration) {
    const d = parseInt(data.duration);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = d % 60;
    durationEl.textContent = h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      : `${m}:${String(s).padStart(2,'0')}`;
  }

  if (viewsEl && data.view_count) {
    const statText = viewsEl.querySelector('.stat-text');
    if (statText) statText.textContent = `${formatNumber(data.view_count)} Views`;
  }

  showEl(infoPreview);
}

function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

// ── Download flow ─────────────────────────────────────────────────────────────
downloadBtn.addEventListener('click', handleDownload);

async function handleDownload() {
  // Cancel any previous request
  if (activeRequest) { activeRequest.abort(); activeRequest = null; }

  const rawUrl = urlInput.value.trim();
  const { valid, msg, normalizedUrl } = validateUrl(rawUrl);
  if (!valid) { showError(msg); return; }
  const url = normalizedUrl || normalizeUrl(rawUrl);

  clearResults();
  setLoading(true);

  activeRequest = new AbortController();
  const timeout = setTimeout(() => activeRequest.abort(), 360_000);

  try {
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, option: qualitySelect.value }),
      signal: activeRequest.signal,
    });

    clearTimeout(timeout);

    let data;
    try { data = await res.json(); } catch { data = null; }

    if (!res.ok || !data || !data.success) {
      const friendlyMsg = mapErrorCode(res.status, data?.message || data?.detail);
      showError(friendlyMsg);
      return;
    }

    setLoading(false);
    renderResult(data);

  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      showError(t('err_timeout'));
    } else {
      showError(t('err_generic'));
    }
  } finally {
    setLoading(false);
    activeRequest = null;
  }
}

function mapErrorCode(status, serverMsg) {
  if (status === 400) return t('err_invalid');
  if (status === 413) return t('err_large');
  if (status === 429) return t('err_busy');
  if (status === 504) return t('err_timeout');
  if (status === 422) return t('err_fmt');
  if (serverMsg) {
    const s = serverMsg.toLowerCase();
    if (s.includes('playlist')) return t('err_playlist');
    if (s.includes('format') || s.includes('quality')) return t('err_fmt');
    if (s.includes('large') || s.includes('size')) return t('err_large');
    if (s.includes('timeout') || s.includes('long')) return t('err_timeout');
    if (s.includes('busy') || s.includes('rate')) return t('err_busy');
  }
  return t('err_failed');
}

function renderResult(data) {
  // Video info header
  const videoInfo = document.getElementById('result-video-info');
  videoInfo.innerHTML = data.title
    ? `<strong style="color:var(--text-primary);font-size:.95rem">${data.title}</strong>`
    : '';

  // Meta grid
  const metaGrid = document.getElementById('result-meta-grid');
  const sizeFormatted = data.file_size
    ? (typeof data.file_size === 'number' ? (data.file_size / (1024 * 1024)).toFixed(1) + ' MB' : data.file_size)
    : 'Ready';

  const metas = [
    [t('meta_format'), data.option_requested?.toUpperCase() || '720P'],
    ['Sound', 'Merged & Synced'],
    [t('meta_quality'), data.quality_selected || 'HD'],
    [t('meta_size'), sizeFormatted],
  ];

  metaGrid.innerHTML = metas.map(([label, value]) => `
    <div class="meta-box">
      <div class="meta-label">${label}</div>
      <div class="meta-value">${value}</div>
    </div>
  `).join('');

  // Download button — set href and download filename
  lastDownloadUrl = window.location.origin + data.download_url;
  downloadFileBtn.href = data.download_url;
  const ext = data.filename?.split('.').pop() || 'mp4';
  const safeTitle = (data.title || 'threads-video').replace(/[^a-zA-Z0-9 _-]/g, '').trim().substring(0, 80);
  downloadFileBtn.setAttribute('download', `${safeTitle}.${ext}`);

  showEl(resultCard);
}

// ── Copy link ─────────────────────────────────────────────────────────────────
copyLinkBtn.addEventListener('click', async () => {
  if (!lastDownloadUrl) return;
  try {
    await navigator.clipboard.writeText(lastDownloadUrl);
    showToast(t('toast_copied'), 'success', 2000);
  } catch {
    showToast(t('err_generic'), 'error');
  }
});

// ── Start another ─────────────────────────────────────────────────────────────
startAnotherBtn.addEventListener('click', () => {
  clearResults();
  urlInput.value = '';
  urlStatus.textContent = '';
  urlStatus.className = 'url-status';
  lastDownloadUrl = '';
  urlInput.focus();
});

// ── FAQ accordion ─────────────────────────────────────────────────────────────
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    const expanded = btn.getAttribute('aria-expanded') === 'true';

    // Close all others
    document.querySelectorAll('.faq-q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.hidden = true;
    });

    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      answer.hidden = false;
    }
  });
});

// ── Footer year ───────────────────────────────────────────────────────────────
const footerCopy = document.getElementById('footer-copy');
if (footerCopy) {
  footerCopy.textContent = `© ${new Date().getFullYear()} ThreadSave. Public-content downloads only.`;
}

// ── Init ──────────────────────────────────────────────────────────────────────
applyTranslations();
