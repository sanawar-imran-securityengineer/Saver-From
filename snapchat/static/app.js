/* ═══════════════════════════════════════════════════════════════════════════
   SwiftFetch — Frontend Application Logic
   Features: i18n (8 langs + RTL), clipboard paste, info prefetch,
             SingleFlight dedup display, toast system, FAQ, hamburger
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';

// ── i18n Translations ─────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    nav_home: 'Home', nav_how: 'How it works', nav_safety: 'Safety',
    nav_faq: 'FAQ', nav_terms: 'Terms', nav_privacy: 'Privacy',
    badge: 'Public URLs only — No login required',
    hero_title: 'Download YouTube Videos<br/><span class="gradient-text">Quickly & Responsibly</span>',
    hero_sub: 'Download publicly accessible YouTube videos in MP4 or MP3. No account, no API key, no cookies needed.',
    url_placeholder: 'Paste YouTube URL here...',
    paste: 'Paste', btn_download: 'Get Video',
    loading_msg: 'Preparing your download...', loading_sub: 'This may take a moment.',
    result_ready: 'Download ready!',
    btn_download_file: 'Download File', btn_copy: 'Copy Link', btn_another: 'Download Another',
    hero_legal: 'For publicly accessible content you own or have permission to use only. You are responsible for copyright compliance.',
    how_title: 'How It Works', how_sub: 'Three steps to download any public YouTube video.',
    step1_title: 'Paste URL', step1_desc: 'Copy any public YouTube video link and paste it. Use the 📋 Paste button for instant fill.',
    step2_title: 'Select Format', step2_desc: 'Choose your preferred output: 360p, 720p, 1080p MP4 or MP3 audio.',
    step3_title: 'Download File', step3_desc: 'Click "Download File" and save to your device. Files auto-delete after 30 min.',
    safety_title: 'Safety & Privacy', safety_sub: 'Built with security-first principles for public content only.',
    s1_title: 'Public URLs Only', s1_desc: 'Only publicly accessible YouTube videos.',
    s2_title: 'No Login Required', s2_desc: 'Zero passwords, cookies, session tokens, or API keys.',
    s3_title: 'Auto-Delete in 30 min', s3_desc: 'All files are automatically purged within 30 minutes.',
    s4_title: 'UUID Filenames', s4_desc: 'UUID-based filenames prevent path traversal attacks.',
    s5_title: 'Rate Limited', s5_desc: 'IP-based rate limiting protects server stability.',
    s6_title: 'No Tracking', s6_desc: 'No analytics, tracking pixels, or third-party services.',
    copyright_notice: "This service is intended only for publicly accessible content that you own or have permission to use. You are responsible for complying with copyright law, YouTube's Terms of Service, and all applicable laws.",
    terms_title: 'Terms & Usage', priv_title: 'Privacy & Security',
    terms_h1: 'Acceptable Use', terms_p1: 'Use SwiftFetch to download publicly accessible YouTube videos you own or have permission to use.',
    terms_h2: 'Your Responsibility', terms_p2: "You are solely responsible for compliance with copyright laws and YouTube's Terms of Service.",
    terms_h3: 'No Warranties', terms_p3: 'Downloads may fail if YouTube changes its systems.',
    priv_h1: 'No Personal Data', priv_p1: 'No passwords, cookies, session IDs, or access tokens stored.',
    priv_h2: 'Temporary Storage', priv_p2: 'Files auto-deleted after 30 minutes.',
    priv_h3: 'No Analytics', priv_p3: 'No external tracking or analytics services.',
    faq_title: 'Frequently Asked Questions', faq_sub: 'Everything you need to know about SwiftFetch.',
    faq_q1: 'Do I need an account or API key?', faq_a1: 'No. SwiftFetch requires no account, API key, password, or cookies.',
    faq_q2: 'Why did my download fail?', faq_a2: 'Downloads can fail if YouTube changes its systems or the video is private.',
    faq_q3: 'Why are files deleted after 30 minutes?', faq_a3: 'SwiftFetch uses temporary storage only to protect your privacy.',
    faq_q4: 'Can I download playlists?', faq_a4: 'No. Single public videos only. Playlists are not supported.',
    faq_q5: 'What formats are available?', faq_a5: '360p MP4, 720p MP4, 1080p MP4, and MP3 audio.',
    faq_q6: 'Is this fast?', faq_a6: 'Yes. Multi-layer caching means cached results return in milliseconds.',
    footer_tagline: 'Public-content downloads only',
    fmt_360: '360p MP4', fmt_720: '720p MP4', fmt_1080: '1080p MP4', fmt_mp3: 'MP3 Audio',
    toast_copied: 'Link copied to clipboard!', toast_pasted: 'URL pasted!', toast_paste_fail: 'Paste failed. Please paste manually.',
    err_empty: 'Please enter a YouTube URL.', err_invalid: 'Please enter a valid YouTube video URL.',
    err_playlist: 'Playlists are not supported.', err_long: 'This URL is not supported.',
    err_failed: 'This video could not be downloaded.', err_fmt: 'The requested format is unavailable.',
    err_busy: 'The server is busy. Please try again later.',
    err_large: 'The file is too large to process.', err_timeout: 'The download took too long and was stopped.',
    err_generic: 'An unexpected error occurred. Please try again.',
    meta_title: 'Title', meta_format: 'Format', meta_quality: 'Quality',
    meta_size: 'File Size', meta_type: 'File Type', meta_by: 'Downloader',
    views: 'views', likes: 'likes',
  },
  ar: {
    nav_home: 'الرئيسية', nav_how: 'كيف يعمل', nav_safety: 'الأمان',
    nav_faq: 'الأسئلة الشائعة', nav_terms: 'الشروط', nav_privacy: 'الخصوصية',
    badge: 'روابط عامة فقط — لا تسجيل دخول مطلوب',
    hero_title: 'تحميل فيديوهات يوتيوب<br/><span class="gradient-text">بسرعة ومسؤولية</span>',
    hero_sub: 'قم بتحميل فيديوهات يوتيوب المتاحة للعامة بصيغة MP4 أو MP3. لا حساب، لا مفتاح API، لا كوكيز.',
    url_placeholder: 'الصق رابط يوتيوب هنا...',
    paste: 'لصق', btn_download: 'احصل على الفيديو',
    loading_msg: 'جاري التحضير...', loading_sub: 'قد يستغرق هذا لحظة.',
    result_ready: 'التحميل جاهز!',
    btn_download_file: 'تحميل الملف', btn_copy: 'نسخ الرابط', btn_another: 'تحميل آخر',
    hero_legal: 'للمحتوى المتاح للعامة فقط. أنت مسؤول عن الامتثال لحقوق النشر.',
    how_title: 'كيف يعمل', how_sub: 'ثلاث خطوات لتحميل أي فيديو يوتيوب عام.',
    step1_title: 'الصق الرابط', step1_desc: 'انسخ رابط أي فيديو يوتيوب عام والصقه في حقل الإدخال.',
    step2_title: 'اختر الصيغة', step2_desc: 'اختر صيغة الإخراج: 360p أو 720p أو 1080p MP4 أو MP3.',
    step3_title: 'حمّل الملف', step3_desc: 'انقر "تحميل الملف" لحفظه. تُحذف الملفات تلقائياً بعد 30 دقيقة.',
    safety_title: 'الأمان والخصوصية', safety_sub: 'مبني على مبادئ الأمان أولاً للمحتوى العام.',
    s1_title: 'روابط عامة فقط', s1_desc: 'فيديوهات يوتيوب المتاحة للعامة فقط.',
    s2_title: 'لا تسجيل دخول', s2_desc: 'لا كلمات مرور أو كوكيز أو رموز جلسة.',
    s3_title: 'حذف تلقائي بعد 30 دقيقة', s3_desc: 'تُحذف جميع الملفات خلال 30 دقيقة.',
    s4_title: 'أسماء ملفات UUID', s4_desc: 'أسماء ملفات UUID تمنع هجمات اجتياز المسار.',
    s5_title: 'تحديد المعدل', s5_desc: 'تحديد المعدل بناءً على IP يحمي استقرار الخادم.',
    s6_title: 'لا تتبع', s6_desc: 'لا تحليلات أو خدمات تتبع.',
    copyright_notice: 'هذه الخدمة مخصصة فقط للمحتوى المتاح للعامة الذي تمتلكه أو لديك إذن باستخدامه.',
    terms_title: 'الشروط والاستخدام', priv_title: 'الخصوصية والأمان',
    terms_h1: 'الاستخدام المقبول', terms_p1: 'استخدم SwiftFetch لتحميل فيديوهات يوتيوب العامة التي تمتلكها.',
    terms_h2: 'مسؤوليتك', terms_p2: 'أنت وحدك المسؤول عن الامتثال لقوانين حقوق النشر.',
    terms_h3: 'لا ضمانات', terms_p3: 'قد تفشل التحميلات إذا غيّر يوتيوب أنظمته.',
    priv_h1: 'لا بيانات شخصية', priv_p1: 'لا كلمات مرور أو كوكيز أو رموز وصول محفوظة.',
    priv_h2: 'تخزين مؤقت', priv_p2: 'الملفات تُحذف تلقائياً بعد 30 دقيقة.',
    priv_h3: 'لا تحليلات', priv_p3: 'لا خدمات تتبع أو تحليلات خارجية.',
    faq_title: 'الأسئلة الشائعة', faq_sub: 'كل ما تحتاج معرفته عن SwiftFetch.',
    faq_q1: 'هل أحتاج حساباً أو مفتاح API؟', faq_a1: 'لا. لا حساب أو مفتاح API أو كلمة مرور أو كوكيز.',
    faq_q2: 'لماذا فشل تحميلي؟', faq_a2: 'قد يفشل التحميل إذا غيّر يوتيوب أنظمته أو كان الفيديو خاصاً.',
    faq_q3: 'لماذا تُحذف الملفات بعد 30 دقيقة؟', faq_a3: 'نستخدم تخزيناً مؤقتاً فقط لحماية خصوصيتك.',
    faq_q4: 'هل يمكنني تحميل قوائم تشغيل؟', faq_a4: 'لا. فيديوهات فردية عامة فقط.',
    faq_q5: 'ما الصيغ المتاحة؟', faq_a5: '360p MP4 و720p MP4 و1080p MP4 وMP3.',
    faq_q6: 'هل هذا سريع؟', faq_a6: 'نعم. التخزين المؤقت متعدد الطبقات يجعل النتائج المخزنة تعود في ميلي ثوانٍ.',
    footer_tagline: 'تحميل المحتوى العام فقط',
    fmt_360: '360p MP4', fmt_720: '720p MP4', fmt_1080: '1080p MP4', fmt_mp3: 'MP3 صوت',
    toast_copied: 'تم نسخ الرابط!', toast_pasted: 'تم لصق الرابط!', toast_paste_fail: 'فشل اللصق. يرجى اللصق يدوياً.',
    err_empty: 'يرجى إدخال رابط يوتيوب.',
    err_invalid: 'يرجى إدخال رابط فيديو يوتيوب صالح.',
    err_playlist: 'قوائم التشغيل غير مدعومة.',
    err_long: 'هذا الرابط غير مدعوم.',
    err_failed: 'تعذّر تحميل هذا الفيديو.',
    err_fmt: 'الصيغة المطلوبة غير متاحة.',
    err_busy: 'الخادم مشغول. يرجى المحاولة لاحقاً.',
    err_large: 'الملف كبير جداً.',
    err_timeout: 'استغرق التحميل وقتاً طويلاً وتم إيقافه.',
    err_generic: 'حدث خطأ غير متوقع. يرجى المحاولة مجدداً.',
    meta_title: 'العنوان', meta_format: 'الصيغة', meta_quality: 'الجودة',
    meta_size: 'حجم الملف', meta_type: 'نوع الملف', meta_by: 'المنزّل',
    views: 'مشاهدة', likes: 'إعجاب',
  },
  ur: {
    nav_home: 'گھر', nav_how: 'کام کیسے کرتا ہے', nav_safety: 'حفاظت',
    nav_faq: 'سوالات', nav_terms: 'شرائط', nav_privacy: 'رازداری',
    badge: 'صرف عوامی لنک — لاگ ان کی ضرورت نہیں',
    hero_title: 'یوٹیوب ویڈیوز ڈاؤنلوڈ کریں<br/><span class="gradient-text">تیزی اور ذمہ داری سے</span>',
    hero_sub: 'عوامی یوٹیوب ویڈیوز MP4 یا MP3 میں ڈاؤنلوڈ کریں۔ کوئی اکاؤنٹ، API کی، یا کوکیز نہیں۔',
    url_placeholder: 'یوٹیوب لنک یہاں پیسٹ کریں...',
    paste: 'پیسٹ', btn_download: 'ویڈیو حاصل کریں',
    loading_msg: 'ڈاؤنلوڈ تیار ہو رہا ہے...', loading_sub: 'اس میں کچھ وقت لگ سکتا ہے۔',
    result_ready: 'ڈاؤنلوڈ تیار ہے!',
    btn_download_file: 'فائل ڈاؤنلوڈ کریں', btn_copy: 'لنک کاپی کریں', btn_another: 'اور ڈاؤنلوڈ کریں',
    hero_legal: 'صرف عوامی مواد کے لیے جس پر آپ کا حق ہو۔ کاپی رائٹ کی تعمیل آپ کی ذمہ داری ہے۔',
    how_title: 'کام کیسے کرتا ہے', how_sub: 'کوئی بھی عوامی یوٹیوب ویڈیو ڈاؤنلوڈ کرنے کے تین مراحل۔',
    step1_title: 'لنک پیسٹ کریں', step1_desc: 'کوئی بھی عوامی یوٹیوب ویڈیو لنک کاپی کریں اور پیسٹ کریں۔',
    step2_title: 'فارمیٹ منتخب کریں', step2_desc: '360p، 720p، 1080p MP4 یا MP3 میں سے انتخاب کریں۔',
    step3_title: 'فائل ڈاؤنلوڈ کریں', step3_desc: '"ڈاؤنلوڈ" پر کلک کریں۔ فائلیں 30 منٹ بعد خودبخود حذف ہو جاتی ہیں۔',
    safety_title: 'حفاظت اور رازداری', safety_sub: 'عوامی مواد کے لیے سیکیورٹی-فرسٹ اصولوں پر بنایا گیا۔',
    s1_title: 'صرف عوامی لنک', s1_desc: 'صرف عوامی یوٹیوب ویڈیوز۔',
    s2_title: 'کوئی لاگ ان نہیں', s2_desc: 'کوئی پاس ورڈ، کوکیز، یا API کی نہیں۔',
    s3_title: '30 منٹ میں خودکار حذف', s3_desc: 'تمام فائلیں 30 منٹ میں حذف ہو جاتی ہیں۔',
    s4_title: 'UUID فائل نام', s4_desc: 'UUID فائل نام حملوں سے بچاتے ہیں۔',
    s5_title: 'ریٹ لمٹڈ', s5_desc: 'IP پر مبنی ریٹ لمٹنگ سرور کی استحکام کی حفاظت کرتی ہے۔',
    s6_title: 'کوئی ٹریکنگ نہیں', s6_desc: 'کوئی تجزیات یا ٹریکنگ خدمات نہیں۔',
    copyright_notice: 'یہ خدمت صرف اس عوامی مواد کے لیے ہے جس پر آپ کا حق ہو۔ کاپی رائٹ کی تعمیل آپ کی ذمہ داری ہے۔',
    terms_title: 'شرائط اور استعمال', priv_title: 'رازداری اور حفاظت',
    terms_h1: 'قابل قبول استعمال', terms_p1: 'صرف عوامی یوٹیوب ویڈیوز جن پر آپ کا حق ہو۔',
    terms_h2: 'آپ کی ذمہ داری', terms_p2: 'کاپی رائٹ قوانین کی تعمیل آپ کی ذمہ داری ہے۔',
    terms_h3: 'کوئی ضمانت نہیں', terms_p3: 'یوٹیوب کی تبدیلیوں سے ڈاؤنلوڈ ناکام ہو سکتا ہے۔',
    priv_h1: 'کوئی ذاتی ڈیٹا نہیں', priv_p1: 'کوئی پاس ورڈ، کوکیز یا ٹوکن محفوظ نہیں۔',
    priv_h2: 'عارضی اسٹوریج', priv_p2: 'فائلیں 30 منٹ بعد خودبخود حذف ہو جاتی ہیں۔',
    priv_h3: 'کوئی تجزیات نہیں', priv_p3: 'کوئی بیرونی ٹریکنگ یا تجزیاتی خدمات نہیں۔',
    faq_title: 'اکثر پوچھے جانے والے سوالات', faq_sub: 'SwiftFetch کے بارے میں سب کچھ جانیں۔',
    faq_q1: 'کیا مجھے اکاؤنٹ یا API کی چاہیے؟', faq_a1: 'نہیں۔ کوئی اکاؤنٹ، API کی، پاس ورڈ یا کوکیز درکار نہیں۔',
    faq_q2: 'ڈاؤنلوڈ کیوں ناکام ہوا؟', faq_a2: 'یوٹیوب کی تبدیلیوں یا پرائیویٹ ویڈیو کی وجہ سے ناکام ہو سکتا ہے۔',
    faq_q3: 'فائلیں 30 منٹ بعد کیوں حذف ہوتی ہیں؟', faq_a3: 'رازداری کے تحفظ کے لیے عارضی اسٹوریج استعمال کی جاتی ہے۔',
    faq_q4: 'کیا میں پلے لسٹ ڈاؤنلوڈ کر سکتا ہوں؟', faq_a4: 'نہیں۔ صرف انفرادی عوامی ویڈیوز۔',
    faq_q5: 'کون سے فارمیٹ دستیاب ہیں؟', faq_a5: '360p MP4، 720p MP4، 1080p MP4 اور MP3۔',
    faq_q6: 'کیا یہ تیز ہے؟', faq_a6: 'ہاں۔ ملٹی لیئر کیشنگ سے محفوظ نتائج ملی سیکنڈز میں واپس آتے ہیں۔',
    footer_tagline: 'صرف عوامی مواد کا ڈاؤنلوڈ',
    fmt_360: '360p MP4', fmt_720: '720p MP4', fmt_1080: '1080p MP4', fmt_mp3: 'MP3 آڈیو',
    toast_copied: 'لنک کاپی ہو گیا!', toast_pasted: 'URL پیسٹ ہو گیا!', toast_paste_fail: 'پیسٹ ناکام رہا۔ دستی طور پر پیسٹ کریں۔',
    err_empty: 'براہ کرم یوٹیوب لنک درج کریں۔',
    err_invalid: 'براہ کرم ایک درست یوٹیوب ویڈیو لنک درج کریں۔',
    err_playlist: 'پلے لسٹ سپورٹ نہیں ہیں۔', err_long: 'یہ لنک سپورٹ نہیں ہے۔',
    err_failed: 'یہ ویڈیو ڈاؤنلوڈ نہیں ہو سکی۔', err_fmt: 'مطلوبہ فارمیٹ دستیاب نہیں۔',
    err_busy: 'سرور مصروف ہے۔ بعد میں کوشش کریں۔', err_large: 'فائل بہت بڑی ہے۔',
    err_timeout: 'ڈاؤنلوڈ بہت لمبا ہو گیا اور بند کر دیا گیا۔',
    err_generic: 'غیر متوقع خرابی۔ دوبارہ کوشش کریں۔',
    meta_title: 'عنوان', meta_format: 'فارمیٹ', meta_quality: 'معیار',
    meta_size: 'فائل سائز', meta_type: 'فائل ٹائپ', meta_by: 'ڈاؤنلوڈر',
    views: 'مناظر', likes: 'پسند',
  },
  fr: {
    nav_home: 'Accueil', nav_how: 'Comment ça marche', nav_safety: 'Sécurité',
    nav_faq: 'FAQ', nav_terms: 'Conditions', nav_privacy: 'Confidentialité',
    badge: 'URLs publiques uniquement — Aucune connexion requise',
    hero_title: 'Télécharger des Vidéos YouTube<br/><span class="gradient-text">Rapidement et Responsablement</span>',
    hero_sub: 'Téléchargez des vidéos YouTube publiques en MP4 ou MP3. Aucun compte, clé API ou cookie requis.',
    url_placeholder: 'Collez l\'URL YouTube ici...', paste: 'Coller', btn_download: 'Obtenir la vidéo',
    loading_msg: 'Préparation du téléchargement...', loading_sub: 'Cela peut prendre un moment.',
    result_ready: 'Téléchargement prêt !',
    btn_download_file: 'Télécharger le fichier', btn_copy: 'Copier le lien', btn_another: 'Télécharger un autre',
    hero_legal: 'Pour le contenu public que vous possédez ou avez la permission d\'utiliser uniquement.',
    how_title: 'Comment ça marche', how_sub: 'Trois étapes pour télécharger n\'importe quelle vidéo YouTube publique.',
    step1_title: 'Coller l\'URL', step1_desc: 'Copiez un lien YouTube public et collez-le dans le champ.',
    step2_title: 'Choisir le format', step2_desc: 'Choisissez 360p, 720p, 1080p MP4 ou MP3.',
    step3_title: 'Télécharger', step3_desc: 'Cliquez sur "Télécharger". Les fichiers sont supprimés après 30 min.',
    safety_title: 'Sécurité et confidentialité', safety_sub: 'Construit selon des principes de sécurité pour le contenu public.',
    s1_title: 'URLs publiques uniquement', s1_desc: 'Uniquement les vidéos YouTube publiques.',
    s2_title: 'Aucune connexion', s2_desc: 'Zéro mot de passe, cookie ou jeton.',
    s3_title: 'Suppression auto en 30 min', s3_desc: 'Tous les fichiers sont purgés dans les 30 minutes.',
    s4_title: 'Noms UUID', s4_desc: 'Les noms UUID empêchent les attaques de traversée de chemin.',
    s5_title: 'Limité en débit', s5_desc: 'La limitation par IP protège la stabilité du serveur.',
    s6_title: 'Aucun suivi', s6_desc: 'Aucun service d\'analyse ou de suivi tiers.',
    copyright_notice: 'Ce service est uniquement destiné au contenu public que vous possédez ou avez la permission d\'utiliser.',
    terms_title: 'Conditions d\'utilisation', priv_title: 'Confidentialité et sécurité',
    terms_h1: 'Utilisation acceptable', terms_p1: 'Utilisez SwiftFetch pour les vidéos publiques YouTube que vous possédez.',
    terms_h2: 'Votre responsabilité', terms_p2: 'Vous êtes responsable du respect des lois sur le droit d\'auteur.',
    terms_h3: 'Aucune garantie', terms_p3: 'Les téléchargements peuvent échouer si YouTube change ses systèmes.',
    priv_h1: 'Aucune donnée personnelle', priv_p1: 'Aucun mot de passe, cookie ou jeton stocké.',
    priv_h2: 'Stockage temporaire', priv_p2: 'Fichiers supprimés après 30 minutes.',
    priv_h3: 'Aucune analyse', priv_p3: 'Aucun service de suivi ou d\'analyse externe.',
    faq_title: 'Questions fréquentes', faq_sub: 'Tout ce que vous devez savoir sur SwiftFetch.',
    faq_q1: 'Ai-je besoin d\'un compte ?', faq_a1: 'Non. Aucun compte, clé API, mot de passe ou cookie.',
    faq_q2: 'Pourquoi le téléchargement a échoué ?', faq_a2: 'Peut échouer si YouTube change ses systèmes ou si la vidéo est privée.',
    faq_q3: 'Pourquoi les fichiers sont supprimés ?', faq_a3: 'Stockage temporaire uniquement pour protéger votre vie privée.',
    faq_q4: 'Puis-je télécharger des playlists ?', faq_a4: 'Non. Vidéos individuelles publiques uniquement.',
    faq_q5: 'Quels formats sont disponibles ?', faq_a5: '360p MP4, 720p MP4, 1080p MP4 et MP3.',
    faq_q6: 'Est-ce rapide ?', faq_a6: 'Oui. Le cache multicouche renvoie les résultats en millisecondes.',
    footer_tagline: 'Téléchargements de contenu public uniquement',
    fmt_360: '360p MP4', fmt_720: '720p MP4', fmt_1080: '1080p MP4', fmt_mp3: 'Audio MP3',
    toast_copied: 'Lien copié !', toast_pasted: 'URL collée !', toast_paste_fail: 'Échec du collage. Collez manuellement.',
    err_empty: 'Veuillez entrer une URL YouTube.', err_invalid: 'Veuillez entrer une URL YouTube valide.',
    err_playlist: 'Les playlists ne sont pas prises en charge.', err_long: 'Cette URL n\'est pas prise en charge.',
    err_failed: 'Cette vidéo n\'a pas pu être téléchargée.', err_fmt: 'Le format demandé n\'est pas disponible.',
    err_busy: 'Le serveur est occupé.', err_large: 'Le fichier est trop volumineux.',
    err_timeout: 'Le téléchargement a trop duré.', err_generic: 'Une erreur inattendue s\'est produite.',
    meta_title: 'Titre', meta_format: 'Format', meta_quality: 'Qualité',
    meta_size: 'Taille', meta_type: 'Type', meta_by: 'Outil',
    views: 'vues', likes: 'j\'aime',
  },
  es: {
    nav_home: 'Inicio', nav_how: 'Cómo funciona', nav_safety: 'Seguridad',
    nav_faq: 'FAQ', nav_terms: 'Términos', nav_privacy: 'Privacidad',
    badge: 'Solo URLs públicas — No se requiere inicio de sesión',
    hero_title: 'Descargar Vídeos de YouTube<br/><span class="gradient-text">Rápida y Responsablemente</span>',
    hero_sub: 'Descarga vídeos de YouTube públicos en MP4 o MP3. Sin cuenta, sin clave API, sin cookies.',
    url_placeholder: 'Pega la URL de YouTube aquí...', paste: 'Pegar', btn_download: 'Obtener vídeo',
    loading_msg: 'Preparando tu descarga...', loading_sub: 'Esto puede tardar un momento.',
    result_ready: '¡Descarga lista!',
    btn_download_file: 'Descargar archivo', btn_copy: 'Copiar enlace', btn_another: 'Descargar otro',
    hero_legal: 'Solo para contenido público que poseas o tengas permiso de usar.',
    how_title: 'Cómo funciona', how_sub: 'Tres pasos para descargar cualquier vídeo público de YouTube.',
    step1_title: 'Pegar URL', step1_desc: 'Copia un enlace de YouTube público y pégalo en el campo.',
    step2_title: 'Seleccionar formato', step2_desc: 'Elige 360p, 720p, 1080p MP4 o MP3.',
    step3_title: 'Descargar archivo', step3_desc: 'Haz clic en "Descargar". Los archivos se eliminan tras 30 min.',
    safety_title: 'Seguridad y privacidad', safety_sub: 'Construido con principios de seguridad primero.',
    s1_title: 'Solo URLs públicas', s1_desc: 'Solo vídeos de YouTube accesibles públicamente.',
    s2_title: 'Sin inicio de sesión', s2_desc: 'Sin contraseñas, cookies ni tokens.',
    s3_title: 'Eliminación automática en 30 min', s3_desc: 'Todos los archivos se eliminan en 30 minutos.',
    s4_title: 'Nombres UUID', s4_desc: 'Los nombres UUID previenen ataques de traversal.',
    s5_title: 'Limitación de velocidad', s5_desc: 'Limitación por IP protege la estabilidad del servidor.',
    s6_title: 'Sin rastreo', s6_desc: 'Sin análisis ni servicios de rastreo de terceros.',
    copyright_notice: 'Este servicio está destinado solo al contenido público que posees o tienes permiso de usar.',
    terms_title: 'Términos de uso', priv_title: 'Privacidad y seguridad',
    terms_h1: 'Uso aceptable', terms_p1: 'Usa SwiftFetch para vídeos de YouTube públicos que poseas.',
    terms_h2: 'Tu responsabilidad', terms_p2: 'Eres responsable del cumplimiento de las leyes de derechos de autor.',
    terms_h3: 'Sin garantías', terms_p3: 'Las descargas pueden fallar si YouTube cambia sus sistemas.',
    priv_h1: 'Sin datos personales', priv_p1: 'Sin contraseñas, cookies ni tokens almacenados.',
    priv_h2: 'Almacenamiento temporal', priv_p2: 'Archivos eliminados tras 30 minutos.',
    priv_h3: 'Sin análisis', priv_p3: 'Sin servicios de análisis o rastreo externos.',
    faq_title: 'Preguntas frecuentes', faq_sub: 'Todo lo que necesitas saber sobre SwiftFetch.',
    faq_q1: '¿Necesito una cuenta o clave API?', faq_a1: 'No. Sin cuenta, clave API, contraseña ni cookies.',
    faq_q2: '¿Por qué falló mi descarga?', faq_a2: 'Puede fallar si YouTube cambia sus sistemas o el vídeo es privado.',
    faq_q3: '¿Por qué se eliminan los archivos?', faq_a3: 'Solo almacenamiento temporal para proteger tu privacidad.',
    faq_q4: '¿Puedo descargar listas de reproducción?', faq_a4: 'No. Solo vídeos individuales públicos.',
    faq_q5: '¿Qué formatos están disponibles?', faq_a5: '360p MP4, 720p MP4, 1080p MP4 y MP3.',
    faq_q6: '¿Es rápido?', faq_a6: 'Sí. El caché multicapa devuelve resultados en milisegundos.',
    footer_tagline: 'Solo descargas de contenido público',
    fmt_360: '360p MP4', fmt_720: '720p MP4', fmt_1080: '1080p MP4', fmt_mp3: 'Audio MP3',
    toast_copied: '¡Enlace copiado!', toast_pasted: '¡URL pegada!', toast_paste_fail: 'Error al pegar. Pega manualmente.',
    err_empty: 'Por favor ingresa una URL de YouTube.', err_invalid: 'Por favor ingresa una URL válida de YouTube.',
    err_playlist: 'Las listas de reproducción no son compatibles.', err_long: 'Esta URL no es compatible.',
    err_failed: 'No se pudo descargar este vídeo.', err_fmt: 'El formato solicitado no está disponible.',
    err_busy: 'El servidor está ocupado.', err_large: 'El archivo es demasiado grande.',
    err_timeout: 'La descarga tardó demasiado.', err_generic: 'Ocurrió un error inesperado.',
    meta_title: 'Título', meta_format: 'Formato', meta_quality: 'Calidad',
    meta_size: 'Tamaño', meta_type: 'Tipo', meta_by: 'Descargador',
    views: 'vistas', likes: 'me gusta',
  },
  de: {
    nav_home: 'Start', nav_how: 'Wie es funktioniert', nav_safety: 'Sicherheit',
    nav_faq: 'FAQ', nav_terms: 'AGB', nav_privacy: 'Datenschutz',
    badge: 'Nur öffentliche URLs — Keine Anmeldung erforderlich',
    hero_title: 'YouTube-Videos herunterladen<br/><span class="gradient-text">Schnell und Verantwortungsvoll</span>',
    hero_sub: 'Öffentliche YouTube-Videos als MP4 oder MP3 herunterladen. Kein Konto, kein API-Schlüssel, keine Cookies.',
    url_placeholder: 'YouTube-URL hier einfügen...', paste: 'Einfügen', btn_download: 'Video holen',
    loading_msg: 'Download wird vorbereitet...', loading_sub: 'Dies kann einen Moment dauern.',
    result_ready: 'Download bereit!',
    btn_download_file: 'Datei herunterladen', btn_copy: 'Link kopieren', btn_another: 'Weiteren herunterladen',
    hero_legal: 'Nur für öffentliche Inhalte, die Sie besitzen oder verwenden dürfen.',
    how_title: 'Wie es funktioniert', how_sub: 'Drei Schritte zum Herunterladen eines öffentlichen YouTube-Videos.',
    step1_title: 'URL einfügen', step1_desc: 'Kopieren Sie einen öffentlichen YouTube-Link und fügen Sie ihn ein.',
    step2_title: 'Format wählen', step2_desc: 'Wählen Sie 360p, 720p, 1080p MP4 oder MP3.',
    step3_title: 'Datei herunterladen', step3_desc: 'Klicken Sie auf "Herunterladen". Dateien werden nach 30 Min. gelöscht.',
    safety_title: 'Sicherheit & Datenschutz', safety_sub: 'Nach Security-First-Prinzipien entwickelt.',
    s1_title: 'Nur öffentliche URLs', s1_desc: 'Nur öffentlich zugängliche YouTube-Videos.',
    s2_title: 'Keine Anmeldung', s2_desc: 'Keine Passwörter, Cookies oder Tokens.',
    s3_title: 'Auto-Löschung nach 30 Min.', s3_desc: 'Alle Dateien werden innerhalb von 30 Minuten gelöscht.',
    s4_title: 'UUID-Dateinamen', s4_desc: 'UUID-Namen verhindern Pfad-Traversal-Angriffe.',
    s5_title: 'Rate-Limiting', s5_desc: 'IP-basiertes Limiting schützt die Serverstabilität.',
    s6_title: 'Kein Tracking', s6_desc: 'Keine externen Analyse- oder Tracking-Dienste.',
    copyright_notice: 'Dieser Dienst ist nur für öffentliche Inhalte bestimmt, die Sie besitzen oder verwenden dürfen.',
    terms_title: 'Nutzungsbedingungen', priv_title: 'Datenschutz & Sicherheit',
    terms_h1: 'Akzeptable Nutzung', terms_p1: 'Nutzen Sie SwiftFetch für öffentliche YouTube-Videos, die Sie besitzen.',
    terms_h2: 'Ihre Verantwortung', terms_p2: 'Sie sind für die Einhaltung des Urheberrechts verantwortlich.',
    terms_h3: 'Keine Garantien', terms_p3: 'Downloads können fehlschlagen, wenn YouTube seine Systeme ändert.',
    priv_h1: 'Keine persönlichen Daten', priv_p1: 'Keine Passwörter, Cookies oder Tokens gespeichert.',
    priv_h2: 'Temporäre Speicherung', priv_p2: 'Dateien werden nach 30 Minuten gelöscht.',
    priv_h3: 'Keine Analyse', priv_p3: 'Keine externen Tracking- oder Analysedienste.',
    faq_title: 'Häufig gestellte Fragen', faq_sub: 'Alles, was Sie über SwiftFetch wissen müssen.',
    faq_q1: 'Brauche ich ein Konto oder API-Schlüssel?', faq_a1: 'Nein. Kein Konto, API-Schlüssel, Passwort oder Cookies.',
    faq_q2: 'Warum ist mein Download fehlgeschlagen?', faq_a2: 'Kann fehlschlagen, wenn YouTube seine Systeme ändert oder das Video privat ist.',
    faq_q3: 'Warum werden Dateien nach 30 Min. gelöscht?', faq_a3: 'Nur temporäre Speicherung zum Schutz Ihrer Privatsphäre.',
    faq_q4: 'Kann ich Playlists herunterladen?', faq_a4: 'Nein. Nur einzelne öffentliche Videos.',
    faq_q5: 'Welche Formate sind verfügbar?', faq_a5: '360p MP4, 720p MP4, 1080p MP4 und MP3.',
    faq_q6: 'Ist das schnell?', faq_a6: 'Ja. Mehrstufiges Caching liefert gecachte Ergebnisse in Millisekunden.',
    footer_tagline: 'Nur Downloads öffentlicher Inhalte',
    fmt_360: '360p MP4', fmt_720: '720p MP4', fmt_1080: '1080p MP4', fmt_mp3: 'MP3 Audio',
    toast_copied: 'Link kopiert!', toast_pasted: 'URL eingefügt!', toast_paste_fail: 'Einfügen fehlgeschlagen. Bitte manuell einfügen.',
    err_empty: 'Bitte geben Sie eine YouTube-URL ein.', err_invalid: 'Bitte geben Sie eine gültige YouTube-URL ein.',
    err_playlist: 'Playlists werden nicht unterstützt.', err_long: 'Diese URL wird nicht unterstützt.',
    err_failed: 'Dieses Video konnte nicht heruntergeladen werden.', err_fmt: 'Das angeforderte Format ist nicht verfügbar.',
    err_busy: 'Der Server ist beschäftigt.', err_large: 'Die Datei ist zu groß.',
    err_timeout: 'Der Download hat zu lange gedauert.', err_generic: 'Ein unerwarteter Fehler ist aufgetreten.',
    meta_title: 'Titel', meta_format: 'Format', meta_quality: 'Qualität',
    meta_size: 'Dateigröße', meta_type: 'Dateityp', meta_by: 'Downloader',
    views: 'Aufrufe', likes: 'Likes',
  },
  zh: {
    nav_home: '首页', nav_how: '使用方法', nav_safety: '安全',
    nav_faq: '常见问题', nav_terms: '条款', nav_privacy: '隐私',
    badge: '仅限公开链接 — 无需登录',
    hero_title: '下载 YouTube 视频<br/><span class="gradient-text">快速且负责任</span>',
    hero_sub: '以 MP4 或 MP3 格式下载公开的 YouTube 视频。无需账号、API 密钥或 Cookie。',
    url_placeholder: '在此粘贴 YouTube 链接...', paste: '粘贴', btn_download: '获取视频',
    loading_msg: '正在准备下载...', loading_sub: '这可能需要一点时间。',
    result_ready: '下载准备就绪！',
    btn_download_file: '下载文件', btn_copy: '复制链接', btn_another: '下载另一个',
    hero_legal: '仅适用于您拥有或有权使用的公开内容。',
    how_title: '使用方法', how_sub: '三步下载任何公开 YouTube 视频。',
    step1_title: '粘贴链接', step1_desc: '复制任何公开 YouTube 视频链接并粘贴到输入框中。',
    step2_title: '选择格式', step2_desc: '选择 360p、720p、1080p MP4 或 MP3。',
    step3_title: '下载文件', step3_desc: '点击"下载"。文件将在 30 分钟后自动删除。',
    safety_title: '安全与隐私', safety_sub: '以安全优先原则构建，仅限公开内容。',
    s1_title: '仅限公开链接', s1_desc: '仅限公开可访问的 YouTube 视频。',
    s2_title: '无需登录', s2_desc: '零密码、Cookie 或会话令牌。',
    s3_title: '30 分钟后自动删除', s3_desc: '所有文件在 30 分钟内自动清除。',
    s4_title: 'UUID 文件名', s4_desc: 'UUID 文件名防止路径遍历攻击。',
    s5_title: '速率限制', s5_desc: '基于 IP 的速率限制保护服务器稳定性。',
    s6_title: '无追踪', s6_desc: '无外部分析或第三方追踪服务。',
    copyright_notice: '本服务仅适用于您拥有或有权使用的公开内容。您有责任遵守版权法。',
    terms_title: '条款与使用', priv_title: '隐私与安全',
    terms_h1: '可接受使用', terms_p1: '使用 SwiftFetch 下载您拥有的公开 YouTube 视频。',
    terms_h2: '您的责任', terms_p2: '您有责任遵守版权法和 YouTube 服务条款。',
    terms_h3: '无保证', terms_p3: '如果 YouTube 更改其系统，下载可能会失败。',
    priv_h1: '无个人数据', priv_p1: '不存储密码、Cookie 或访问令牌。',
    priv_h2: '临时存储', priv_p2: '文件在 30 分钟后自动删除。',
    priv_h3: '无分析', priv_p3: '无外部追踪或分析服务。',
    faq_title: '常见问题', faq_sub: '关于 SwiftFetch 您需要了解的一切。',
    faq_q1: '我需要账号或 API 密钥吗？', faq_a1: '不需要。无需账号、API 密钥、密码或 Cookie。',
    faq_q2: '为什么我的下载失败了？', faq_a2: '如果 YouTube 更改系统或视频是私有的，可能会失败。',
    faq_q3: '为什么文件 30 分钟后删除？', faq_a3: '仅临时存储以保护您的隐私。',
    faq_q4: '我可以下载播放列表吗？', faq_a4: '不可以。仅支持单个公开视频。',
    faq_q5: '有哪些格式可用？', faq_a5: '360p MP4、720p MP4、1080p MP4 和 MP3。',
    faq_q6: '速度快吗？', faq_a6: '是的。多层缓存使缓存结果在毫秒内返回。',
    footer_tagline: '仅限公开内容下载',
    fmt_360: '360p MP4', fmt_720: '720p MP4', fmt_1080: '1080p MP4', fmt_mp3: 'MP3 音频',
    toast_copied: '链接已复制！', toast_pasted: 'URL 已粘贴！', toast_paste_fail: '粘贴失败，请手动粘贴。',
    err_empty: '请输入 YouTube 链接。', err_invalid: '请输入有效的 YouTube 视频链接。',
    err_playlist: '不支持播放列表。', err_long: '不支持此链接。',
    err_failed: '无法下载此视频。', err_fmt: '请求的格式不可用。',
    err_busy: '服务器繁忙，请稍后重试。', err_large: '文件太大。',
    err_timeout: '下载超时已停止。', err_generic: '发生意外错误，请重试。',
    meta_title: '标题', meta_format: '格式', meta_quality: '质量',
    meta_size: '文件大小', meta_type: '文件类型', meta_by: '下载器',
    views: '次观看', likes: '次点赞',
  },
  hi: {
    nav_home: 'होम', nav_how: 'कैसे काम करता है', nav_safety: 'सुरक्षा',
    nav_faq: 'सामान्य प्रश्न', nav_terms: 'शर्तें', nav_privacy: 'गोपनीयता',
    badge: 'केवल सार्वजनिक URL — लॉगिन की आवश्यकता नहीं',
    hero_title: 'YouTube वीडियो डाउनलोड करें<br/><span class="gradient-text">तेज़ी और ज़िम्मेदारी से</span>',
    hero_sub: 'सार्वजनिक YouTube वीडियो MP4 या MP3 में डाउनलोड करें। कोई खाता, API कुंजी, या कुकीज़ नहीं।',
    url_placeholder: 'YouTube URL यहाँ पेस्ट करें...', paste: 'पेस्ट', btn_download: 'वीडियो लें',
    loading_msg: 'डाउनलोड तैयार हो रहा है...', loading_sub: 'इसमें कुछ समय लग सकता है।',
    result_ready: 'डाउनलोड तैयार!',
    btn_download_file: 'फ़ाइल डाउनलोड करें', btn_copy: 'लिंक कॉपी करें', btn_another: 'और डाउनलोड करें',
    hero_legal: 'केवल उस सार्वजनिक सामग्री के लिए जिसके आप मालिक हों।',
    how_title: 'कैसे काम करता है', how_sub: 'किसी भी सार्वजनिक YouTube वीडियो को डाउनलोड करने के तीन चरण।',
    step1_title: 'URL पेस्ट करें', step1_desc: 'कोई भी सार्वजनिक YouTube वीडियो लिंक कॉपी करें और पेस्ट करें।',
    step2_title: 'फ़ॉर्मेट चुनें', step2_desc: '360p, 720p, 1080p MP4 या MP3 चुनें।',
    step3_title: 'फ़ाइल डाउनलोड करें', step3_desc: '"डाउनलोड" पर क्लिक करें। 30 मिनट बाद फ़ाइलें स्वतः हट जाती हैं।',
    safety_title: 'सुरक्षा और गोपनीयता', safety_sub: 'सुरक्षा-प्रथम सिद्धांतों पर बनाया गया।',
    s1_title: 'केवल सार्वजनिक URL', s1_desc: 'केवल सार्वजनिक रूप से उपलब्ध YouTube वीडियो।',
    s2_title: 'लॉगिन नहीं', s2_desc: 'कोई पासवर्ड, कुकीज़ या टोकन नहीं।',
    s3_title: '30 मिनट में स्वतः हटाना', s3_desc: 'सभी फ़ाइलें 30 मिनट में स्वतः हट जाती हैं।',
    s4_title: 'UUID फ़ाइल नाम', s4_desc: 'UUID नाम पाथ ट्रैवर्सल हमलों को रोकते हैं।',
    s5_title: 'रेट लिमिटेड', s5_desc: 'IP आधारित रेट लिमिटिंग सर्वर स्थिरता की रक्षा करती है।',
    s6_title: 'कोई ट्रैकिंग नहीं', s6_desc: 'कोई बाहरी एनालिटिक्स या ट्रैकिंग सेवाएं नहीं।',
    copyright_notice: 'यह सेवा केवल उस सार्वजनिक सामग्री के लिए है जिसके आप मालिक हों या आपको उपयोग की अनुमति हो।',
    terms_title: 'शर्तें और उपयोग', priv_title: 'गोपनीयता और सुरक्षा',
    terms_h1: 'स्वीकार्य उपयोग', terms_p1: 'SwiftFetch का उपयोग उन सार्वजनिक YouTube वीडियो के लिए करें जिनके आप मालिक हों।',
    terms_h2: 'आपकी जिम्मेदारी', terms_p2: 'कॉपीराइट कानूनों का अनुपालन आपकी जिम्मेदारी है।',
    terms_h3: 'कोई वारंटी नहीं', terms_p3: 'यदि YouTube अपना सिस्टम बदले तो डाउनलोड विफल हो सकता है।',
    priv_h1: 'कोई व्यक्तिगत डेटा नहीं', priv_p1: 'कोई पासवर्ड, कुकीज़ या टोकन संग्रहीत नहीं।',
    priv_h2: 'अस्थायी भंडारण', priv_p2: 'फ़ाइलें 30 मिनट बाद स्वतः हट जाती हैं।',
    priv_h3: 'कोई एनालिटिक्स नहीं', priv_p3: 'कोई बाहरी ट्रैकिंग या एनालिटिक्स सेवाएं नहीं।',
    faq_title: 'सामान्य प्रश्न', faq_sub: 'SwiftFetch के बारे में सब कुछ जानें।',
    faq_q1: 'क्या मुझे खाते या API कुंजी की ज़रूरत है?', faq_a1: 'नहीं। कोई खाता, API कुंजी, पासवर्ड या कुकीज़ नहीं।',
    faq_q2: 'मेरा डाउनलोड क्यों विफल हुआ?', faq_a2: 'YouTube के बदलाव या वीडियो के निजी होने से विफल हो सकता है।',
    faq_q3: 'फ़ाइलें 30 मिनट बाद क्यों हटती हैं?', faq_a3: 'आपकी गोपनीयता की रक्षा के लिए अस्थायी भंडारण।',
    faq_q4: 'क्या मैं प्लेलिस्ट डाउनलोड कर सकता हूं?', faq_a4: 'नहीं। केवल एकल सार्वजनिक वीडियो।',
    faq_q5: 'कौन से फ़ॉर्मेट उपलब्ध हैं?', faq_a5: '360p MP4, 720p MP4, 1080p MP4 और MP3।',
    faq_q6: 'क्या यह तेज़ है?', faq_a6: 'हाँ। मल्टी-लेयर कैशिंग कैश्ड परिणाम मिलीसेकंड में लौटाती है।',
    footer_tagline: 'केवल सार्वजनिक सामग्री डाउनलोड',
    fmt_360: '360p MP4', fmt_720: '720p MP4', fmt_1080: '1080p MP4', fmt_mp3: 'MP3 ऑडियो',
    toast_copied: 'लिंक कॉपी हो गया!', toast_pasted: 'URL पेस्ट हो गया!', toast_paste_fail: 'पेस्ट विफल। कृपया मैन्युअली पेस्ट करें।',
    err_empty: 'कृपया YouTube URL दर्ज करें।', err_invalid: 'कृपया एक वैध YouTube वीडियो URL दर्ज करें।',
    err_playlist: 'प्लेलिस्ट समर्थित नहीं हैं।', err_long: 'यह URL समर्थित नहीं है।',
    err_failed: 'यह वीडियो डाउनलोड नहीं हो सका।', err_fmt: 'अनुरोधित प्रारूप उपलब्ध नहीं है।',
    err_busy: 'सर्वर व्यस्त है। बाद में पुनः प्रयास करें।', err_large: 'फ़ाइल बहुत बड़ी है।',
    err_timeout: 'डाउनलोड बहुत लंबा हो गया।', err_generic: 'अप्रत्याशित त्रुटि। पुनः प्रयास करें।',
    meta_title: 'शीर्षक', meta_format: 'प्रारूप', meta_quality: 'गुणवत्ता',
    meta_size: 'फ़ाइल आकार', meta_type: 'फ़ाइल प्रकार', meta_by: 'डाउनलोडर',
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

  // Update lang button
  const meta = LANG_META[lang] || LANG_META.en;
  document.getElementById('lang-flag').textContent = meta.flag;
  document.getElementById('lang-code').textContent = meta.code;
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  localStorage.setItem('sf_lang', lang);
  applyTranslations();
  closeLangMenu();
}

// ── Language menu ─────────────────────────────────────────────────────────────
const langBtn = document.getElementById('lang-btn');
const langMenu = document.getElementById('lang-menu');

function closeLangMenu() {
  langMenu.classList.remove('open');
  langBtn.setAttribute('aria-expanded', 'false');
}

langBtn.addEventListener('click', e => {
  e.stopPropagation();
  const isOpen = langMenu.classList.contains('open');
  if (isOpen) closeLangMenu();
  else {
    langMenu.classList.add('open');
    langBtn.setAttribute('aria-expanded', 'true');
  }
});

langMenu.addEventListener('click', e => {
  const opt = e.target.closest('[data-lang]');
  if (opt) setLanguage(opt.dataset.lang);
});

document.addEventListener('click', closeLangMenu);

// ── Hamburger ─────────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('nav-mobile');

hamburger.addEventListener('click', () => {
  const isOpen = navMobile.classList.contains('open');
  navMobile.classList.toggle('open');
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

// ── URL validation (client-side) ──────────────────────────────────────────────
const YT_REGEX = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?.*v=|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{6,}/;
const PLAYLIST_REGEX = /[?&](list|playlist)=/i;

function validateUrl(url) {
  if (!url || !url.trim()) return { valid: false, msg: t('err_empty') };
  if (url.length > 2048) return { valid: false, msg: t('err_long') };
  if (PLAYLIST_REGEX.test(url)) return { valid: false, msg: t('err_playlist') };
  if (!YT_REGEX.test(url)) return { valid: false, msg: t('err_invalid') };
  return { valid: true };
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
  const url = urlInput.value.trim();
  clearTimeout(infoDebounce);

  if (!url) {
    urlStatus.textContent = '';
    urlStatus.className = 'url-status';
    hideEl(infoPreview);
    return;
  }

  const { valid, msg } = validateUrl(url);
  if (!valid) {
    urlStatus.textContent = msg;
    urlStatus.className = 'url-status invalid';
    hideEl(infoPreview);
    return;
  }

  urlStatus.textContent = '✓ Valid YouTube URL';
  urlStatus.className = 'url-status valid';

  // Debounced info prefetch (600ms)
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
  const durationEl = document.getElementById('info-duration');
  const viewsEl = document.getElementById('info-views');
  const likesEl = document.getElementById('info-likes');

  titleEl.textContent = data.title || '';
  channelEl.textContent = data.uploader || '';

  if (data.thumbnail) {
    thumb.src = data.thumbnail;
    thumb.onerror = () => { thumb.style.display = 'none'; };
  }

  if (data.duration) {
    const d = parseInt(data.duration);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = d % 60;
    durationEl.textContent = h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      : `${m}:${String(s).padStart(2,'0')}`;
  }

  if (data.view_count) {
    viewsEl.textContent = `👁 ${formatNumber(data.view_count)} ${t('views')}`;
  }
  if (data.like_count) {
    likesEl.textContent = `👍 ${formatNumber(data.like_count)} ${t('likes')}`;
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

  const url = urlInput.value.trim();
  const { valid, msg } = validateUrl(url);
  if (!valid) { showError(msg); return; }

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
  // If we have info preview data (thumbnail etc.), keep it visible
  // Show thumbnail in result area too if available
  const thumb = document.getElementById('info-thumb');
  const thumbSrc = thumb && thumb.src ? thumb.src : '';

  // Video info header
  const videoInfo = document.getElementById('result-video-info');
  videoInfo.innerHTML = data.title
    ? `<strong style="color:var(--text-primary);font-size:.95rem">${data.title}</strong>`
    : '';

  // Meta grid
  const metaGrid = document.getElementById('result-meta-grid');
  const metas = [
    [t('meta_format'), data.option_requested?.toUpperCase()],
    [t('meta_quality'), data.quality_selected],
    [t('meta_type'), data.filename?.split('.').pop()?.toUpperCase()],
    [t('meta_size'), data.file_size],
    [t('meta_by'), data.downloader_used],
  ].filter(([, v]) => v);

  metaGrid.innerHTML = metas.map(([label, value]) => `
    <div class="result-meta-item">
      <div class="result-meta-label">${label}</div>
      <div class="result-meta-value">${value}</div>
    </div>
  `).join('');

  // Download button — set href and download filename
  lastDownloadUrl = window.location.origin + data.download_url;
  downloadFileBtn.href = data.download_url;
  const ext = data.filename?.split('.').pop() || 'mp4';
  const safeTitle = (data.title || 'video').replace(/[^a-zA-Z0-9 _-]/g, '').trim().substring(0, 80);
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
  footerCopy.textContent = `© ${new Date().getFullYear()} SwiftFetch. Public-content downloads only.`;
}

// ── Init ──────────────────────────────────────────────────────────────────────
applyTranslations();
