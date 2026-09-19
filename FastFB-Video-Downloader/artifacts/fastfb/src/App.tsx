import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowDownToLine,
  Check,
  ChevronDown,
  Clipboard,
  Download,
  FileVideo,
  Globe2,
  Info,
  Link2,
  LockKeyhole,
  Menu,
  Moon,
  Play,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import {
  getHealthCheckQueryKey,
  useDownloadFacebookVideo,
  useGetFacebookVideoInfo,
  useHealthCheck,
  type FacebookVideoFormat,
  type FacebookVideoInfo,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type Language = 'en' | 'ur' | 'hi' | 'ar' | 'es';
type Theme = 'light' | 'dark';

const copy: Record<Language, {
  navHow: string; navFeatures: string; navFaq: string; navPrivacy: string;
  heroEyebrow: string; heroTitle: string; heroTitleAccent: string; heroLede: string;
  heroNote: string; inspectTitle: string; inspectLabel: string; placeholder: string;
  paste: string; pasted: string; clear: string; inspect: string; inspecting: string;
  safe: string; service: string; result: string; qualities: string; download: string;
  downloading: string; downloadHint: string; reset: string; howEyebrow: string;
  howTitle: string; howAccent: string; howIntro: string; featureEyebrow: string;
  featureTitle: string; featureAccent: string; faqTitle: string; footerCopy: string;
  privacy: string; terms: string;
}> = {
  en: {
    navHow: 'How It Works', navFeatures: 'Features', navFaq: 'FAQ', navPrivacy: 'Privacy',
    heroEyebrow: 'Free Facebook Video Downloader',
    heroTitle: 'Download Facebook Videos & Reels in',
    heroTitleAccent: 'Full HD 1080p',
    heroLede: 'Save public Facebook videos, Reels, and Watch clips directly to your device with highest available MP4 quality. Fast, secure, and 100% free.',
    heroNote: 'Compatible with Facebook Reels, Watch & Feed videos',
    inspectTitle: 'Enter Facebook Video Link',
    inspectLabel: 'Facebook video URL',
    placeholder: 'Paste Facebook link here...',
    paste: 'Paste', pasted: 'Pasted!', clear: 'Clear',
    inspect: 'Download', inspecting: 'Fetching Video…',
    safe: 'Safe & anonymous — No login required',
    service: 'Downloader ready',
    result: 'Video Ready for Download',
    qualities: 'Available Video Qualities',
    download: 'Download',
    downloading: 'Downloading…',
    downloadHint: '',
    reset: 'Download Another Video',
    howEyebrow: 'Simple 3-Step Process',
    howTitle: 'How to Download Facebook Videos',
    howAccent: 'in Seconds',
    howIntro: 'FastFB makes downloading Facebook videos effortless on any phone, tablet, or PC.',
    featureEyebrow: 'Why Choose FastFB',
    featureTitle: 'The Fastest & Cleanest FB',
    featureAccent: 'Downloader Online',
    faqTitle: 'Frequently Asked Questions',
    footerCopy: 'FastFB is the most reliable online tool for downloading Facebook videos, reels, and clips in Full HD 1080p MP4.',
    privacy: 'Privacy Policy', terms: 'Terms of Service',
  },
  ur: {
    navHow: 'طریقہ کار', navFeatures: 'خصوصیات', navFaq: 'عام سوالات', navPrivacy: 'رازداری',
    heroEyebrow: 'مفت فیس بک ویڈیو ڈاؤنلوڈر',
    heroTitle: 'فیس بک ویڈیوز اور ریلز ڈاؤنلوڈ کریں',
    heroTitleAccent: 'فل ایچ ڈی 1080p میں',
    heroLede: 'فیس بک کی پبلک ویڈیوز، ریلز اور واچ کلپس اپنے موبائل یا کمپیوٹر پر بہترین MP4 کوالٹی میں محفوظ کریں۔ تیز، محفوظ اور بالکل مفت۔',
    heroNote: 'فیس بک ریلز، واچ اور پبلک ویڈیوز کے لیے موزوں',
    inspectTitle: 'فیس بک ویڈیو لنک درج کریں',
    inspectLabel: 'فیس بک ویڈیو یو آر ایل',
    placeholder: 'یہاں فیس بک لنک پیسٹ کریں...',
    paste: 'پیسٹ کریں', pasted: 'پیسٹ ہو گیا!', clear: 'صاف کریں',
    inspect: 'ڈاؤنلوڈ کریں', inspecting: 'ویڈیو لائی جا رہی ہے…',
    safe: 'محفوظ اور گمنام — لاگ اِن کی ضرورت نہیں',
    service: 'سروس ڈاؤنلوڈ کے لیے تیار ہے',
    result: 'ویڈیو ڈاؤنلوڈ کے لیے تیار ہے',
    qualities: 'دستیاب ویڈیو کوالٹی',
    download: 'ڈاؤنلوڈ',
    downloading: 'ڈاؤنلوڈ ہو رہا ہے…',
    downloadHint: '',
    reset: 'ایک اور ویڈیو ڈاؤنلوڈ کریں',
    howEyebrow: 'تین آسان مراحل',
    howTitle: 'فیس بک ویڈیوز کیسے ڈاؤنلوڈ کریں',
    howAccent: 'چند سیکنڈز میں',
    howIntro: 'FastFB فیس بک ویڈیوز ڈاؤنلوڈ کرنے کے عمل کو انتہائی آسان اور تیز تر بناتا ہے۔',
    featureEyebrow: 'FastFB کیوں منتخب کریں؟',
    featureTitle: 'بہترین اور تیز ترین فیس بک',
    featureAccent: 'ڈاؤنلوڈر',
    faqTitle: 'اکثر پوچھے جانے والے سوالات',
    footerCopy: 'FastFB فیس بک ویڈیوز، ریلز اور کلپس کو فل ایچ ڈی 1080p میں ڈاؤنلوڈ کرنے کا بہترین ٹول ہے۔',
    privacy: 'رازداری کی پالیسی', terms: 'استعمال کی شرائط',
  },
  hi: {
    navHow: 'कैसे काम करता है', navFeatures: 'विशेषताएं', navFaq: 'सामान्य सवाल', navPrivacy: 'गोपनीयता',
    heroEyebrow: 'मुफ़्त फ़ेसबुक वीडियो डाउनलोडर',
    heroTitle: 'फ़ेसबुक वीडियो और रील्स डाउनलोड करें',
    heroTitleAccent: 'फ़ुल एचडी 1080p में',
    heroLede: 'पब्लिक फ़ेसबुक वीडियो, रील्स और वॉच क्लिप्स को बेहतरीन MP4 क्वालिटी में सीधे अपनी डिवाइस पर सेव करें। तेज़, सुरक्षित और बिल्कुल मुफ़्त।',
    heroNote: 'फ़ेसबुक रील्स, वॉच और फ़ीड वीडियो के लिए उपयुक्त',
    inspectTitle: 'फ़ेसबुक वीडियो लिंक डालें',
    inspectLabel: 'फ़ेसबुक वीडियो URL',
    placeholder: 'यहाँ फ़ेसबुक लिंक पेस्ट करें...',
    paste: 'पेस्ट', pasted: 'पेस्ट हो गया!', clear: 'हटाएं',
    inspect: 'डाउनलोड करें', inspecting: 'वीडियो ला रहे हैं…',
    safe: 'सुरक्षित और बेनाम — लॉगिन की ज़रूरत नहीं',
    service: 'डाउनलोडर तैयार है',
    result: 'वीडियो डाउनलोड के लिए तैयार है',
    qualities: 'उपलब्ध वीडियो क्वालिटी',
    download: 'डाउनलोड',
    downloading: 'डाउनलोड हो रहा है…',
    downloadHint: '',
    reset: 'दूसरा वीडियो डाउनलोड करें',
    howEyebrow: 'तीन आसान कदम',
    howTitle: 'फ़ेसबुक वीडियो कैसे डाउनलोड करें',
    howAccent: 'सिर्फ़ कुछ सेकंड में',
    howIntro: 'FastFB किसी भी फ़ोन या कंप्यूटर पर वीडियो डाउनलोड करना बेहद आसान बनाता है।',
    featureEyebrow: 'FastFB क्यों चुनें?',
    featureTitle: 'सबसे तेज़ और साफ़ फ़ेसबुक',
    featureAccent: 'डाउनलोडर',
    faqTitle: 'अक्सर पूछे जाने वाले सवाल',
    footerCopy: 'FastFB फ़ेसबुक वीडियो और रील्स को फुल एचडी 1080p में सेव करने का सबसे विश्वसनीय टूल है।',
    privacy: 'गोपनीयता नीति', terms: 'नियम व शर्तें',
  },
  ar: {
    navHow: 'كيف يعمل', navFeatures: 'المميزات', navFaq: 'الأسئلة الشائعة', navPrivacy: 'الخصوصية',
    heroEyebrow: 'برنامج تنزيل فيديو فيسبوك مجاناً',
    heroTitle: 'تنزيل فيديوهات وريلز فيسبوك بجودة',
    heroTitleAccent: 'Full HD 1080p',
    heroLede: 'احفظ فيديوهات وريلز فيسبوك العامة مباشرة على جهازك بأعلى جودة MP4 متاحة. سريع، آمن، ومجاني 100٪ بدون تسجيل دخول.',
    heroNote: 'يدعم فيسبوك ريلز، المقاطع العامة وفيديوهات ووتش',
    inspectTitle: 'أدخل رابط فيديو فيسبوك',
    inspectLabel: 'رابط فيديو فيسبوك',
    placeholder: 'الصق رابط فيسبوك هنا...',
    paste: 'لصق', pasted: 'تم اللصق!', clear: 'مسح',
    inspect: 'تنزيل', inspecting: 'جارٍ جلب الفيديو…',
    safe: 'آمن ومجهول — بدون تسجيل دخول',
    service: 'الخدمة جاهزة',
    result: 'الفيديو جاهز للتحميل',
    qualities: 'جودة الفيديو',
    download: 'تنزيل',
    downloading: 'جارٍ التنزيل…',
    downloadHint: '',
    reset: 'تنزيل فيديو آخر',
    howEyebrow: 'ثلاث خطوات سريعة',
    howTitle: 'كيفية تنزيل مقاطع فيسبوك',
    howAccent: 'في ثوانٍ معدودة',
    howIntro: 'FastFB يجعل تنزيل الفيديوهات من فيسبوك سهلاً للغاية على أي هاتف أو حاسوب.',
    featureEyebrow: 'لماذا تختار FastFB؟',
    featureTitle: 'أسرع وأفضل أداة تنزيل',
    featureAccent: 'لفيديوهات فيسبوك',
    faqTitle: 'الأسئلة الأكثر شيوعاً',
    footerCopy: 'FastFB هي الأداة الأفضل لحفظ فيديوهات وريلز فيسبوك بجودة عالية 1080p MP4.',
    privacy: 'سياسة الخصوصية', terms: 'شروط الخدمة',
  },
  es: {
    navHow: 'Cómo Funciona', navFeatures: 'Características', navFaq: 'Preguntas', navPrivacy: 'Privacidad',
    heroEyebrow: 'Descargador Gratuito de Videos de Facebook',
    heroTitle: 'Descarga Videos y Reels de Facebook en',
    heroTitleAccent: 'Full HD 1080p',
    heroLede: 'Guarda videos públicos, Reels y clips de Facebook directamente en tu dispositivo en máxima calidad MP4. Rápido, seguro y 100% gratis.',
    heroNote: 'Compatible con Facebook Reels, Watch y publicaciones públicas',
    inspectTitle: 'Ingresa el enlace del video',
    inspectLabel: 'URL del video de Facebook',
    placeholder: 'Pega el enlace de Facebook aquí...',
    paste: 'Pegar', pasted: '¡Pegado!', clear: 'Limpiar',
    inspect: 'Descargar', inspecting: 'Obteniendo video…',
    safe: 'Seguro y anónimo — Sin registrarte',
    service: 'Servicio listo',
    result: 'Video listo para descargar',
    qualities: 'Calidades disponibles',
    download: 'Descargar',
    downloading: 'Descargando…',
    downloadHint: '',
    reset: 'Descargar otro video',
    howEyebrow: 'Proceso de 3 pasos',
    howTitle: 'Cómo descargar videos de Facebook',
    howAccent: 'en segundos',
    howIntro: 'FastFB hace que descargar videos de Facebook sea rápido y sencillo en cualquier dispositivo.',
    featureEyebrow: 'Por qué elegir FastFB',
    featureTitle: 'El descargador de FB más rápido',
    featureAccent: 'y confiable',
    faqTitle: 'Preguntas Frecuentes',
    footerCopy: 'FastFB es la mejor herramienta para descargar videos y reels de Facebook en calidad Full HD 1080p MP4.',
    privacy: 'Política de Privacidad', terms: 'Términos de Servicio',
  },
};

type SectionCopy = {
  steps: Array<{ title: string; desc: string }>;
  features: Array<{ title: string; desc: string }>;
  faqs: Array<{ q: string; a: string }>;
  unavailable: string;
};

const sectionCopy: Record<Language, SectionCopy> = {
  en: {
    steps: [
      { title: '1. Copy Video URL', desc: 'Open Facebook and copy the link of the video, Reel, or Watch clip you want to download.' },
      { title: '2. Paste into FastFB', desc: 'Paste the copied URL into the download box above and click the Download button.' },
      { title: '3. Choose Quality & Save', desc: 'Pick your preferred quality (1080p, 720p, or SD) and download the MP4 file instantly.' },
    ],
    features: [
      { title: 'Ultra Fast Speed', desc: 'High-speed processing ensures your videos are parsed and ready for download within seconds.' },
      { title: 'Full HD & 4K Quality', desc: 'Download in the highest source quality provided by Facebook, including 1080p and 720p MP4.' },
      { title: 'No Account Required', desc: '100% free and private. No software installation, registration, or credit cards needed.' },
      { title: 'All Devices Supported', desc: 'Works smoothly across Android, iPhone, Windows, Mac, and any modern web browser.' },
    ],
    faqs: [
      { q: 'Is FastFB free to use?', a: 'Yes, FastFB is 100% free with unlimited downloads. You do not need to register or install any software.' },
      { q: 'Can I download Facebook Reels?', a: 'Yes! FastFB fully supports public Facebook Reels, Watch videos, and standard feed video posts.' },
      { q: 'Can I download private Facebook videos?', a: 'No. FastFB only works with public videos that you have permission to view and download.' },
      { q: 'Where are downloaded Facebook videos saved?', a: 'Videos are automatically saved in your browser’s default "Downloads" folder on your phone or computer.' },
      { q: 'What is the highest video quality available?', a: 'FastFB provides all resolutions offered by Facebook for that video, up to Full HD 1080p.' },
    ],
    unavailable: 'Service temporarily unavailable. Please retry shortly.',
  },
  ur: {
    steps: [
      { title: '1. ویڈیو کا لنک کاپی کریں', desc: 'فیس بک ایپ یا ویب سائٹ کھولیں اور مطلوبہ ویڈیو، ریل یا واچ کلپ کا لنک کاپی کریں۔' },
      { title: '2. لنک یہاں پیسٹ کریں', desc: 'کاپی کیا گیا لنک اوپر دیے گئے ان پٹ باکس میں پیسٹ کریں اور "ڈاؤنلوڈ" پر کلک کریں۔' },
      { title: '3. کوالٹی منتخب کریں اور محفوظ کریں', desc: 'اپنی پسند کی کوالٹی (1080p یا 720p) منتخب کریں اور فائل فوراً اپنے پاس محفوظ کریں۔' },
    ],
    features: [
      { title: 'انتہائی تیز رفتار', desc: 'جدید ترین نظام کے ذریعے ویڈیو چند سیکنڈز میں ڈاؤنلوڈ کے لیے تیار ہو جاتی ہے۔' },
      { title: 'فل ایچ ڈی 1080p کوالٹی', desc: 'فیس بک کی اصل اعلی ترین کوالٹی میں ویڈیوز محفوظ کریں بغیر کسی معیار کی کمی کے۔' },
      { title: 'اکاؤنٹ کی ضرورت نہیں', desc: 'مکمل طور پر مفت اور نجی۔ کسی لاگ اِن یا سافٹ ویئر انسٹالیشن کی قطعی ضرورت نہیں۔' },
      { title: 'تمام ڈیوائسز پر کارآمد', desc: 'اینڈرائیڈ، آئی فون، ونڈوز اور میک تمام ڈیوائسز اور براؤزرز پر یکساں کام کرتا ہے۔' },
    ],
    faqs: [
      { q: 'کیا FastFB مفت ہے؟', a: 'جی ہاں، FastFB مکمل طور پر مفت ہے اور آپ بغیر کسی حد کے جتنی چاہیں ویڈیوز ڈاؤنلوڈ کر سکتے ہیں۔' },
      { q: 'کیا فیس بک ریلز بھی ڈاؤنلوڈ کی جا سکتی ہیں؟', a: 'جی بالکل! FastFB فیس بک ریلز، واچ ویڈیوز اور عام پبلک پوسٹس سب کو سپورٹ کرتا ہے۔' },
      { q: 'ویڈیو ڈاؤنلوڈ ہونے کے بعد کہاں محفوظ ہوتی ہے؟', a: 'ویڈیو آپ کے موبائل یا کمپیوٹر کے ڈاؤنلوڈز (Downloads) فولڈر میں خودکار طور پر محفوظ ہو جاتی ہے۔' },
      { q: 'کیا پرائیویٹ ویڈیوز ڈاؤنلوڈ کی جا سکتی ہیں؟', a: 'نہیں۔ یہ سروس صرف پبلک ویڈیوز کے لیے بنائی گئی ہے جنہیں دیکھنے کی اجازت ہو۔' },
    ],
    unavailable: 'سروس فی الحال دستیاب نہیں ہے۔ براہ کرم کچھ دیر بعد دوبارہ کوشش کریں۔',
  },
  hi: {
    steps: [
      { title: '1. वीडियो लिंक कॉपी करें', desc: 'फ़ेसबुक खोलें और जो वीडियो या रील डाउनलोड करनी है उसका लिंक कॉपी करें।' },
      { title: '2. FastFB में पेस्ट करें', desc: 'कॉपी किए गए लिंक को ऊपर दिए गए बॉक्स में पेस्ट करें और डाउनलोड बटन दबाएं।' },
      { title: '3. क्वालिटी चुनें और सेव करें', desc: 'अपनी मनपसंद क्वालिटी (1080p या 720p) चुनें और MP4 फाइल तुरंत सेव करें।' },
    ],
    features: [
      { title: 'सुपर फास्ट स्पीड', desc: 'हाई-स्पीड प्रोसेसिंग सुनिश्चित करती है कि आपका वीडियो कुछ ही सेकंड में तैयार हो।' },
      { title: 'फुल एचडी और 4K क्वालिटी', desc: 'फ़ेसबुक द्वारा प्रदान की गई उच्चतम क्वालिटी में MP4 वीडियो डाउनलोड करें।' },
      { title: 'किसी अकाउंट की ज़रूरत नहीं', desc: '100% मुफ़्त और सुरक्षित। कोई ऐप डाउनलोड या रजिस्ट्रेशन करने की ज़रूरत नहीं।' },
      { title: 'सभी डिवाइस पर उपलब्ध', desc: 'एंड्रॉयड, आईफोन, विंडोज़ और मैक के सभी ब्राउज़र पर आसानी से काम करता है।' },
    ],
    faqs: [
      { q: 'क्या FastFB मुफ़्त है?', a: 'हाँ, FastFB बिना किसी सीमा के 100% मुफ़्त है। आपको कोई शुल्क नहीं देना पड़ता।' },
      { q: 'क्या मैं फ़ेसबुक रील्स डाउनलोड कर सकता हूँ?', a: 'हाँ! FastFB पब्लिक फ़ेसबुक रील्स, वॉच और सामान्य वीडियो को पूरी तरह सपोर्ट करता है।' },
      { q: 'डाउनलोड की गई वीडियो कहाँ सेव होती है?', a: 'वीडियो आपके डिवाइस के डिफ़ॉल्ट "Downloads" फ़ोल्डर में अपने आप सेव हो जाती है।' },
    ],
    unavailable: 'सर्विस अभी उपलब्ध नहीं है। कृपया कुछ समय बाद पुनः प्रयास करें।',
  },
  ar: {
    steps: [
      { title: '1. نسخ رابط الفيديو', desc: 'افتح فيسبوك وانسخ رابط الفيديو أو الريلز الذي ترغب في حفظه.' },
      { title: '2. لصق الرابط في FastFB', desc: 'الصق الرابط في المربع المخصص أعلاه واضغط على زر التنزيل.' },
      { title: '3. اختيار الجودة والحفظ', desc: 'اختر الجودة المفضلة لديك (1080p أو 720p) وقم بتحميل ملف MP4 فوراً.' },
    ],
    features: [
      { title: 'سرعة فائقة', desc: 'معالجة فورية تتيح لك تجهيز وتحميل الفيديوهات في ثوانٍ معدودة.' },
      { title: 'جودة Full HD عالية', desc: 'تحميل بأعلى دقة متوفرة من فيسبوك دون التأثير على جودة الصوت والصورة.' },
      { title: 'بدون حساب أو تسجيل', desc: 'مجاني تماماً وبدون جمع أي بيانات خاصة أو الحاجة لتسجيل الدخول.' },
      { title: 'متوافق مع كل الأجهزة', desc: 'يعمل بسلاسة على أجهزة أندرويد، آيفون، الكمبيوتر وجميع المتصفحات الحديثة.' },
    ],
    faqs: [
      { q: 'هل خدمة FastFB مجانية؟', a: 'نعم، الخدمة مجانية 100% بدون أي قيود على عدد الفيديوهات المحملة.' },
      { q: 'هل يمكنني تنزيل ريلز فيسبوك؟', a: 'نعم بكل تأكيد! يدعم FastFB ريلز فيسبوك ومقاطع الفيديو العامة بالكامل.' },
      { q: 'أين يتم حفظ الملفات؟', a: 'يتم حفظ الملفات تلقائياً في مجلد التنزيلات (Downloads) على جهازك.' },
    ],
    unavailable: 'الخدمة غير متوفرة حالياً، يرجى المحاولة بعد قليل.',
  },
  es: {
    steps: [
      { title: '1. Copia el enlace', desc: 'Abre Facebook y copia el enlace del video o Reel que deseas descargar.' },
      { title: '2. Pégalo en FastFB', desc: 'Pega el enlace en el recuadro superior y pulsa el botón Descargar.' },
      { title: '3. Elige la calidad', desc: 'Selecciona la resolución que prefieras (1080p, 720p o SD) y guarda tu MP4.' },
    ],
    features: [
      { title: 'Velocidad Ultrarrápida', desc: 'Procesamiento en tiempo récord para que tu video esté listo en cuestión de segundos.' },
      { title: 'Calidad Full HD', desc: 'Descarga en la mejor calidad disponible ofrecida por Facebook en formato MP4.' },
      { title: 'Sin Registro ni Cuentas', desc: '100% gratuito y anónimo. No necesitas instalar programas ni proporcionar datos.' },
      { title: 'Compatible con Todo', desc: 'Funciona perfectamente en Android, iPhone, Windows, Mac y cualquier navegador.' },
    ],
    faqs: [
      { q: '¿FastFB es gratuito?', a: 'Sí, FastFB es completamente gratis y ofrece descargas ilimitadas.' },
      { q: '¿Puedo descargar Facebook Reels?', a: '¡Por supuesto! FastFB es totalmente compatible con Reels, Watch y videos públicos de Facebook.' },
      { q: '¿Dónde se guardan los videos descargados?', a: 'Los videos se guardan automáticamente en la carpeta de "Descargas" de tu dispositivo.' },
    ],
    unavailable: 'El servicio no está disponible en este momento. Inténtalo de nuevo más tarde.',
  },
};

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const value = (error as { error?: unknown }).error;
    if (typeof value === 'string') return value;
  }
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === 'object' && data !== null && 'error' in data) {
      const value = (data as { error?: unknown }).error;
      if (typeof value === 'string') return value;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/* VIP Brand Logo */
function BrandLogo() {
  return (
    <a className="brand" href="#top" data-testid="link-brand">
      <div className="brand-icon">
        <svg width="24" height="24" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="90" cy="90" r="62" stroke="#00F5FF" strokeWidth="7" strokeDasharray="14 8" opacity="0.8"/>
          <path d="M 90 48 L 90 106" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round"/>
          <path d="M 62 86 L 90 114 L 118 86" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M 54 132 C 72 144 108 144 126 132" stroke="#00F5FF" strokeWidth="10" strokeLinecap="round"/>
          <path d="M 140 32 L 142 40 L 150 42 L 142 44 L 140 52 L 138 44 L 130 42 L 138 40 Z" fill="#00F5FF"/>
        </svg>
      </div>
      <div className="brand-name">
        <span className="brand-accent">FB</span> <span>Downloader</span>
      </div>
    </a>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button className="header-btn" type="button" onClick={onToggle} data-testid="button-toggle-theme" aria-label="Toggle dark mode">
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}

function LanguageMenu({ language, onChange }: { language: Language; onChange: (next: Language) => void }) {
  const [open, setOpen] = useState(false);
  const languages: Array<[Language, string]> = [
    ['en', 'English'],
    ['ur', 'اردو'],
    ['hi', 'हिन्दी'],
    ['ar', 'العربية'],
    ['es', 'Español'],
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button className="header-btn" type="button" onClick={() => setOpen((val) => !val)} data-testid="button-language">
        <Globe2 size={15} />
        <span>{languages.find(([k]) => k === language)?.[1]}</span>
        <ChevronDown size={13} />
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          zIndex: 60,
          top: '44px',
          right: 0,
          minWidth: '135px',
          padding: '6px',
          border: '1px solid hsl(var(--border))',
          borderRadius: '12px',
          background: 'hsl(var(--card))',
          boxShadow: '0 16px 36px rgba(0,0,0,0.18)',
        }}>
          {languages.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => { onChange(key); setOpen(false); }}
              data-testid={`button-language-${key}`}
              style={{
                display: 'block',
                width: '100%',
                padding: '9px 12px',
                border: 0,
                borderRadius: '8px',
                color: key === language ? 'var(--fb-blue)' : 'hsl(var(--foreground))',
                background: key === language ? 'var(--fb-blue-light)' : 'transparent',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Header({ language, setLanguage, theme, toggleTheme }: {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = copy[language];

  return (
    <header className="site-header">
      <div className="container header-inner">
        <BrandLogo />
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <a href="#top" onClick={() => setMenuOpen(false)}>Downloader</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} data-testid="link-how">{t.navHow}</a>
          <a href="#features" onClick={() => setMenuOpen(false)} data-testid="link-features">{t.navFeatures}</a>
          <a href="#faq" onClick={() => setMenuOpen(false)} data-testid="link-faq">{t.navFaq}</a>
        </nav>
        <div className="header-actions">
          <LanguageMenu language={language} onChange={setLanguage} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button
            className="mobile-menu-btn"
            type="button"
            onClick={() => setMenuOpen((val) => !val)}
            aria-label="Toggle navigation menu"
            data-testid="button-mobile-menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Inspector({ language, onResult }: {
  language: Language;
  onResult: (result: FacebookVideoInfo, url: string) => void;
}) {
  const t = copy[language];
  const sections = sectionCopy[language];
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [pastedFeedback, setPastedFeedback] = useState(false);

  const inspect = useGetFacebookVideoInfo();
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), staleTime: 60000 } });

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError(language === 'ur' ? 'براہ کرم فیس بک ویڈیو کا لنک درج کریں۔' : 'Please paste a Facebook video link to begin.');
      return;
    }
    setError('');
    inspect.mutate(
      { data: { url: trimmed } },
      {
        onSuccess: (result) => {
          onResult(result, trimmed);
          // Smooth scroll to result
          setTimeout(() => {
            document.getElementById('download-result')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        },
        onError: (mutationError) => {
          setError(
            getErrorMessage(
              mutationError,
              language === 'ur'
                ? 'ویڈیو تلاش نہیں کی جا سکی۔ یقینی بنائیں کہ یہ ایک پبلک فیس بک ویڈیو کا درست لنک ہے۔'
                : 'Could not fetch this video. Check that it is a public Facebook video and try again.'
            )
          );
        },
      }
    );
  };

  const paste = async () => {
    try {
      const value = await navigator.clipboard.readText();
      if (value) {
        setUrl(value);
        setError('');
        setPastedFeedback(true);
        setTimeout(() => setPastedFeedback(false), 1600);
      }
    } catch {
      setError(language === 'ur' ? 'کلپ بورڈ تک رسائی نہیں ہو سکی۔ براہ کرم لنک خود پیسٹ کریں۔' : 'Clipboard access unavailable. Please paste the link manually.');
    }
  };

  const clear = () => {
    setUrl('');
    setError('');
  };

  return (
    <div className="inspect-card-wrap" id="top">
      <div className="inspect-card">
        <form onSubmit={submit}>
          <div className="url-input-container">
            <div className="url-input-field-wrap">
              <Link2 className="url-icon" size={20} />
              <input
                className="url-input"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                placeholder={t.placeholder}
                type="url"
                autoComplete="off"
                data-testid="input-facebook-url"
              />
              <div className="input-actions">
                {url && (
                  <button className="btn-clear" type="button" onClick={clear} title={t.clear} aria-label="Clear input">
                    <X size={16} />
                  </button>
                )}
                <button className="btn-paste" type="button" onClick={paste} data-testid="button-paste-url">
                  {pastedFeedback ? <Check size={14} /> : <Clipboard size={14} />}
                  <span>{pastedFeedback ? t.pasted : t.paste}</span>
                </button>
              </div>
            </div>
            <button className="btn-download-primary" type="submit" disabled={inspect.isPending} data-testid="button-inspect-video">
              {inspect.isPending ? (
                <>
                  <Sparkles size={16} className="animate-spin" />
                  <span>{t.inspecting}</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine size={16} />
                  <span>{t.inspect}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-banner" role="alert" data-testid="status-inspect-error">
            <Info size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({
  result,
  url,
  language,
  onReset,
}: {
  result: FacebookVideoInfo;
  url: string;
  language: Language;
  onReset: () => void;
}) {
  const t = copy[language];
  const [downloadError, setDownloadError] = useState<string>('');

  const download = useDownloadFacebookVideo();
  const formats = useMemo<FacebookVideoFormat[]>(
    () => (Array.isArray(result.formats) ? result.formats : []),
    [result]
  );

  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);

  // Pick user-selected format, or default to highest resolution available
  const selectedFormat = useMemo(() => {
    if (selectedFormatId) {
      const match = formats.find((f) => f.formatId === selectedFormatId);
      if (match) return match;
    }
    return formats[0] || null;
  }, [formats, selectedFormatId]);

  useEffect(() => {
    setDownloadError('');
  }, [formats]);

  const duration =
    typeof result?.duration === 'number'
      ? `${Math.floor(result.duration / 60)}:${String(Math.floor(result.duration % 60)).padStart(2, '0')}`
      : null;

  const [isStartingDownload, setIsStartingDownload] = useState(false);

  const startDownload = () => {
    if (!selectedFormat) return;
    const formatId = selectedFormat.formatId;
    setDownloadError('');
    setIsStartingDownload(true);

    const downloadUrl = `/api/facebook/download?url=${encodeURIComponent(url)}&formatId=${encodeURIComponent(formatId)}`;
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.setAttribute('download', '');
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => {
      setIsStartingDownload(false);
    }, 2500);
  };

  return (
    <section className="result-section container" id="download-result" aria-live="polite">
      <div className="result-card-container">
        <div className="video-thumb-wrap">
          {result?.thumbnail ? (
            <img className="video-thumb-img" src={result.thumbnail} alt={result.title || 'Facebook video thumbnail'} data-testid="img-video-thumbnail" />
          ) : (
            <div className="video-thumb-fallback">
              <FileVideo size={48} />
            </div>
          )}
          <span className="video-source-pill">Facebook</span>
          {duration && <span className="video-duration-pill">{duration}</span>}
        </div>

        <div className="result-info">
          <div className="result-header">
            <span className="result-status-badge">
              <Check size={14} />
              {t.result}
            </span>
            <h2 className="result-video-title" title={result?.title || ''} data-testid="text-video-title">
              {result?.title || 'Facebook Video'}
            </h2>
          </div>

          <div className="result-meta-row">
            {result?.uploader && (
              <span className="meta-item">
                <UserRound size={14} />
                <strong>{result.uploader}</strong>
              </span>
            )}
            {selectedFormat?.label && (
              <span className="meta-item">
                <Check size={14} style={{ color: 'var(--fb-blue)' }} />
                <span>{selectedFormat.label} Quality</span>
              </span>
            )}
            {selectedFormat?.filesizeReadable && (
              <span className="meta-item">
                <span>{selectedFormat.filesizeReadable}</span>
              </span>
            )}
          </div>

          {formats.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '14px 0 6px 0' }}>
              {formats.map((f) => {
                const isActive = selectedFormat?.formatId === f.formatId;
                return (
                  <button
                    key={f.formatId}
                    type="button"
                    onClick={() => setSelectedFormatId(f.formatId)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '9999px',
                      border: isActive ? '2px solid var(--fb-blue, #1877f2)' : '1px solid hsl(var(--border))',
                      background: isActive ? 'var(--fb-blue-light, rgba(24,119,242,0.12))' : 'hsl(var(--card))',
                      color: isActive ? 'var(--fb-blue, #1877f2)' : 'hsl(var(--foreground))',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isActive && <Check size={13} />}
                    <span>{f.label}</span>
                    {f.filesizeReadable && <span style={{ opacity: 0.75, fontSize: '11px' }}>({f.filesizeReadable})</span>}
                  </button>
                );
              })}
            </div>
          )}

          <div className="download-action-wrap">
            <button
              className="btn-start-download"
              type="button"
              disabled={!selectedFormat || isStartingDownload}
              onClick={startDownload}
              data-testid="button-download-video"
            >
              {isStartingDownload ? (
                <>
                  <Sparkles size={18} className="animate-spin" />
                  <span>{t.downloading}</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine size={18} />
                  <span>{t.download}{selectedFormat?.label ? ` (${selectedFormat.label})` : ''}</span>
                </>
              )}
            </button>

            <button className="btn-reset-text" type="button" onClick={onReset} data-testid="button-reset-video">
              <RefreshCw size={14} />
              <span>{t.reset}</span>
            </button>

            {downloadError && (
              <div className="error-banner" role="alert" data-testid="status-download-error">
                <Info size={16} className="flex-shrink-0" />
                <span>{downloadError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ language }: { language: Language }) {
  const t = copy[language];
  const sections = sectionCopy[language];
  const icons = [Link2, Sparkles, Download];

  return (
    <section className="steps-section" id="how-it-works">
      <div className="container">
        <div className="section-head">
          <div className="section-badge">{t.howEyebrow}</div>
          <h2 className="section-title">
            {t.howTitle} <span className="accent">{t.howAccent}</span>
          </h2>
          <p className="section-lead">{t.howIntro}</p>
        </div>

        <div className="steps-cards-grid">
          {sections.steps.map((step, index) => {
            const Icon = icons[index];
            const number = `0${index + 1}`;
            return (
              <div className="step-box" key={number} data-testid={`card-step-${number}`}>
                <div className="step-num-badge">
                  <span className="step-index">{number}</span>
                  <div className="step-icon-wrap">
                    <Icon size={20} />
                  </div>
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Features({ language }: { language: Language }) {
  const t = copy[language];
  const sections = sectionCopy[language];
  const icons = [Zap, Sparkles, ShieldCheck, Play];

  return (
    <section className="features-section container" id="features">
      <div className="section-head">
        <div className="section-badge">{t.featureEyebrow}</div>
        <h2 className="section-title">
          {t.featureTitle} <span className="accent">{t.featureAccent}</span>
        </h2>
      </div>

      <div className="features-grid">
        {sections.features.map((feat, index) => {
          const Icon = icons[index % icons.length];
          return (
            <div className="feature-box" key={feat.title} data-testid={`feature-${index + 1}`}>
              <div className="feature-icon-circle">
                <Icon size={20} />
              </div>
              <h4>{feat.title}</h4>
              <p>{feat.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FAQ({ language }: { language: Language }) {
  const [open, setOpen] = useState<number | null>(0);
  const t = copy[language];
  const sections = sectionCopy[language];

  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="section-head">
          <div className="section-badge">FAQ</div>
          <h2 className="section-title">{t.faqTitle}</h2>
        </div>

        <div className="faq-container">
          {sections.faqs.map((faq, index) => {
            const isOpen = open === index;
            return (
              <div className={`faq-card-item ${isOpen ? 'open' : ''}`} key={faq.q}>
                <button
                  className="faq-btn"
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  data-testid={`button-faq-${index}`}
                >
                  <span>{faq.q}</span>
                  <Plus className="faq-btn-icon" size={18} />
                </button>
                {isOpen && (
                  <div className="faq-answer-content" data-testid={`text-faq-answer-${index}`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer({ language }: { language: Language }) {
  const t = copy[language];

  return (
    <footer className="site-footer" id="privacy">
      <div className="container">
        <div className="footer-main">
          <div className="footer-about">
            <BrandLogo />
            <p>{t.footerCopy}</p>
          </div>
          <div className="footer-nav">
            <a href="#top">Downloader</a>
            <a href="#how-it-works">{t.navHow}</a>
            <a href="#features">{t.navFeatures}</a>
            <a href="#faq">{t.navFaq}</a>
            <a href="#privacy">{t.privacy}</a>
            <a href="#terms">{t.terms}</a>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>© {new Date().getFullYear()} FB Downloader. All rights reserved.</span>
          <span>Fast, free & secure public Facebook video downloader.</span>
        </div>

        <p className="footer-disclaimer">
          <strong>Disclaimer:</strong> FB Downloader is an independent tool and is not associated, affiliated, authorized, endorsed by, or in any way officially connected with Facebook, Meta Platforms, Inc., or any of their subsidiaries. All product and company names are trademarks™ or registered® trademarks of their respective holders. FB Downloader does not host or store copyrighted videos on its servers.
        </p>
      </div>
    </footer>
  );
}

function Home() {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem('fastfb-language') as Language) || 'en'
  );
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('fastfb-theme') as Theme) || 'light'
  );
  const [result, setResult] = useState<{ data: FacebookVideoInfo; url: string } | null>(null);

  useEffect(() => {
    localStorage.setItem('fastfb-language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ur' || language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    localStorage.setItem('fastfb-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="page-shell">
      <Header
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={() => setTheme((val) => (val === 'dark' ? 'light' : 'dark'))}
      />
      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-badge-row">
              <span className="hero-pill">
                <Sparkles size={14} />
                {copy[language].heroEyebrow}
              </span>
            </div>
            <h1>
              {copy[language].heroTitle} <span className="gradient-text">{copy[language].heroTitleAccent}</span>
            </h1>

            <div className="format-tags">
              <span className="format-tag">🔥 Facebook Reels</span>
              <span className="format-tag">⚡ Watch Videos</span>
              <span className="format-tag">🎬 Public Stories</span>
              <span className="format-tag">💎 1080p Full HD</span>
              <span className="format-tag">🎵 MP3 Audio</span>
            </div>

            <Inspector language={language} onResult={(data, url) => setResult({ data, url })} />
          </div>
        </section>

        {result && (
          <ResultCard
            result={result.data}
            url={result.url}
            language={language}
            onReset={() => setResult(null)}
          />
        )}

        <HowItWorks language={language} />
        <Features language={language} />
        <FAQ language={language} />
      </main>
      <Footer language={language} />
    </div>
  );
}

function Router() {
  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
