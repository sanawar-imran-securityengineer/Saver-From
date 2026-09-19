# Hostinger Deployment Guide for SaverFrom (ہوسٹنگر پر ڈپلائے کرنے کا آسان طریقہ)

یہ گائیڈ آپ کو **SaverFrom** ویڈیو ڈاؤنلوڈر کو Hostinger پر کامیابی سے ڈپلائے اور لائیو کرنے کے لیے بنائی گئی ہے۔ آپ اسے Hostinger کے **hPanel Node.js**, **Hostinger VPS**, یا **Docker** پر آسانی سے چلا سکتے ہیں۔

---

## طریقہ نمبر 1: Hostinger hPanel Node.js (Web Hosting / Cloud Hosting)

اگر آپ کے پاس Hostinger کی Business Web Hosting یا Cloud Hosting ہے، تو Hostinger کے پاس بلٹ ان **Node.js Selector** موجود ہے:

1. **فائلیں اپلوڈ کریں**:
   - اس پروجیکٹ کی تمام فائلوں کو ایک `.zip` فائل میں کمپریس کریں (یا براہ راست GitHub سے کنیکٹ کریں)۔
   - Hostinger hPanel میں جائیں -> **File Manager** کھولیں۔
   - `public_html` (یا اپنے سب ڈومین کے فولڈر) میں تمام فائلیں اپلوڈ اور Extract کریں۔

2. **Node.js Application بنائیں**:
   - Hostinger hPanel میں سرچ بار میں **Node.js** لکھیں اور کھولیں۔
   - **Create Application** پر کلک کریں۔
   - درج ذیل سیٹنگز درج کریں:
     - **Node.js Version**: `20.x` یا `22.x` منتخب کریں۔
     - **Application Mode**: `Production`
     - **Application Root**: `public_html` (یا جہاں آپ نے فائلیں رکھی ہیں)۔
     - **Application Startup File**: `server.js`
   - **Save** پر کلک کریں۔

3. **Dependencies انسٹال کریں**:
   - اسی Node.js پیج پر **Run NPM Install** کے بٹن پر کلک کریں۔
   - یہ خود بخود تمام ضروری لائبریریز (`express`, `cors`, `compression`) انسٹال کر دے گا۔

4. **Restart Application**:
   - **Restart Application** پر کلک کریں۔ آپ کی ویب سائٹ کامیابی کے ساتھ لائیو ہو جائے گی!

---

## طریقہ نمبر 2: Hostinger VPS (Ubuntu / Debian + PM2)

اگر آپ Hostinger کا VPS استعمال کر رہے ہیں تو یہ بہترین اور تیز ترین طریقہ ہے:

1. **اپنے VPS میں لاگ ان کریں**:
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

2. **Node.js اور PM2 انسٹال کریں**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

3. **پروجیکٹ اپلوڈ کریں اور چلائیں**:
   ```bash
   cd /var/www
   git clone YOUR_REPO_URL saverfrom
   cd saverfrom
   npm install --omit=dev
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   ```

4. **Nginx Reverse Proxy سیٹ کریں** (پورٹ 80/443 کو 3000 پر بھیجنے کے لیے):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   اور مفت SSL سرٹیفکیٹ لگانے کے لیے:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## طریقہ نمبر 3: Hostinger VPS پر Docker کے ذریعے

اگر آپ Docker استعمال کرنا پسند کرتے ہیں:
```bash
docker compose up -d --build
```
بس! آپ کا پروجیکٹ بیک گراؤنڈ میں پورٹ 3000 پر خود بخود آن ہو جائے گا۔

---

## پورٹ کی معلومات
- پروجیکٹ خود بخود Hostinger کے ماحول سے `PORT` ویری ایبل کو ڈیٹیکٹ کرتا ہے۔ اگر پورٹ سیٹ نہ ہو تو یہ پورٹ `3000` پر چلتا ہے۔
- تمام سٹیٹک پیجز (`/youtube`, `/tiktok`, `/instagram`, وغیرہ) پہلے ہی مکمل تیار اور روٹ شدہ ہیں۔
