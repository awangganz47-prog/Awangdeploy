// ====================================================
// UTILS.JS - Global Helper Functions & Formatters
// Fitur: Smart Icon V3 (Super Complete), Performance Scroll, Cloudinary Handler
// ====================================================

// --- FITUR SMART ICON V3 (EXPANDED EDITION) ---
// Mendeteksi ikon berdasarkan kata kunci pada nama atau link secara sangat lengkap
window.getIcon = function(input) {
    if (!input) return 'fas fa-link';
    const s = input.toLowerCase().trim();

    // Jika input sudah berupa class font-awesome, kembalikan langsung
    if (s.includes('fa-') || s.includes('fab ') || s.includes('fas ') || s.includes('far ')) return input;

    // --- 1. SOCIAL MEDIA & CHAT (PRIORITAS TINGGI) ---
    if (s.includes('wa') || s.includes('whats') || s.includes('w.a')) return 'fab fa-whatsapp';
    if (s.includes('tele') || s.includes('t.me') || s.includes('tg')) return 'fab fa-telegram-plane';
    if (s.includes('yt') || s.includes('you') || s.includes('tube')) return 'fab fa-youtube';
    if (s.includes('ig') || s.includes('insta')) return 'fab fa-instagram';
    if (s.includes('fb') || s.includes('face') || s.includes('book')) return 'fab fa-facebook-f';
    if (s.includes('mess') || s.includes('msg')) return 'fab fa-facebook-messenger';
    if (s.includes('twit') || s.includes('x.com') || s.includes('tweet')) return 'fab fa-twitter'; // atau fa-x-twitter jika update
    if (s.includes('tiktok') || s.includes('tt') || s.includes('vt')) return 'fab fa-tiktok';
    if (s.includes('discord') || s.includes('dc')) return 'fab fa-discord';
    if (s.includes('line')) return 'fab fa-line';
    if (s.includes('snap')) return 'fab fa-snapchat-ghost';
    if (s.includes('skype')) return 'fab fa-skype';
    if (s.includes('slack')) return 'fab fa-slack';
    if (s.includes('linkedin') || s.includes('linked')) return 'fab fa-linkedin-in';
    if (s.includes('pin') || s.includes('pinterest')) return 'fab fa-pinterest';
    if (s.includes('reddit')) return 'fab fa-reddit-alien';
    if (s.includes('quora')) return 'fab fa-quora';
    if (s.includes('tumblr')) return 'fab fa-tumblr';
    if (s.includes('twitch')) return 'fab fa-twitch';
    if (s.includes('vimeo')) return 'fab fa-vimeo-v';
    if (s.includes('wechat')) return 'fab fa-weixin';
    if (s.includes('kakaotalk')) return 'fas fa-comment'; // Fallback
    if (s.includes('signal')) return 'fas fa-comment-dots';

    // --- 2. DEVELOPMENT & CODE (POPULER DI KOMUNITAS BOT) ---
    if (s.includes('git') || s.includes('hub') || s.includes('repo')) return 'fab fa-github';
    if (s.includes('gitlab')) return 'fab fa-gitlab';
    if (s.includes('bitbucket')) return 'fab fa-bitbucket';
    if (s.includes('stack') || s.includes('overflow')) return 'fab fa-stack-overflow';
    if (s.includes('npm')) return 'fab fa-npm';
    if (s.includes('yarn')) return 'fab fa-yarn';
    if (s.includes('docker')) return 'fab fa-docker';
    if (s.includes('python') || s.includes('py')) return 'fab fa-python';
    if (s.includes('js') || s.includes('node') || s.includes('javascript')) return 'fab fa-js';
    if (s.includes('java')) return 'fab fa-java';
    if (s.includes('php')) return 'fab fa-php';
    if (s.includes('html')) return 'fab fa-html5';
    if (s.includes('css')) return 'fab fa-css3-alt';
    if (s.includes('react')) return 'fab fa-react';
    if (s.includes('vue')) return 'fab fa-vuejs';
    if (s.includes('angular')) return 'fab fa-angular';
    if (s.includes('laravel')) return 'fab fa-laravel';
    if (s.includes('bootstrap')) return 'fab fa-bootstrap';
    if (s.includes('android') || s.includes('apk')) return 'fab fa-android';
    if (s.includes('apple') || s.includes('ios') || s.includes('mac')) return 'fab fa-apple';
    if (s.includes('windows') || s.includes('win') || s.includes('exe')) return 'fab fa-windows';
    if (s.includes('linux') || s.includes('ubuntu') || s.includes('termux')) return 'fab fa-linux';
    if (s.includes('bot') || s.includes('robot') || s.includes('auto')) return 'fas fa-robot';
    if (s.includes('code') || s.includes('script') || s.includes('sc') || s.includes('source')) return 'fas fa-code';
    if (s.includes('term') || s.includes('shell') || s.includes('cmd') || s.includes('bash')) return 'fas fa-terminal';
    if (s.includes('api') || s.includes('key') || s.includes('apikey')) return 'fas fa-key';
    if (s.includes('database') || s.includes('sql') || s.includes('mongo') || s.includes('db')) return 'fas fa-database';
    if (s.includes('bug') || s.includes('error') || s.includes('fix')) return 'fas fa-bug';

    // --- 3. SERVER, CLOUD & HOSTING ---
    if (s.includes('aws') || s.includes('amazon')) return 'fab fa-aws';
    if (s.includes('google cloud') || s.includes('gcp')) return 'fab fa-google';
    if (s.includes('cloudflare')) return 'fab fa-cloudflare';
    if (s.includes('digital') || s.includes('ocean')) return 'fab fa-digital-ocean';
    if (s.includes('heroku')) return 'fab fa-salesforce'; // Icon terdekat
    if (s.includes('vercel')) return 'fas fa-server'; 
    if (s.includes('cpanel') || s.includes('panel')) return 'fas fa-cogs';
    if (s.includes('server') || s.includes('vps') || s.includes('rdp') || s.includes('ssh')) return 'fas fa-server';
    if (s.includes('domain') || s.includes('host') || s.includes('web')) return 'fas fa-globe';

    // --- 4. E-WALLET & PAYMENT (INDONESIA & GLOBAL) ---
    if (s.includes('dana')) return 'fas fa-wallet';
    if (s.includes('gopay') || s.includes('gojek')) return 'fas fa-motorcycle';
    if (s.includes('ovo')) return 'fas fa-mobile-alt';
    if (s.includes('shopeepay') || s.includes('shopee')) return 'fas fa-shopping-bag';
    if (s.includes('saweria')) return 'fas fa-coffee';
    if (s.includes('trakteer')) return 'fas fa-cookie-bite';
    if (s.includes('paypal')) return 'fab fa-paypal';
    if (s.includes('bitcoin') || s.includes('btc')) return 'fab fa-bitcoin';
    if (s.includes('eth') || s.includes('ethereum') || s.includes('crypto')) return 'fab fa-ethereum';
    if (s.includes('bank') || s.includes('bca') || s.includes('bri') || s.includes('mandiri')) return 'fas fa-university';
    if (s.includes('qr') || s.includes('qris')) return 'fas fa-qrcode';
    if (s.includes('money') || s.includes('uang') || s.includes('donasi') || s.includes('donate')) return 'fas fa-money-bill-wave';
    if (s.includes('shop') || s.includes('store') || s.includes('jual') || s.includes('beli') || s.includes('topup')) return 'fas fa-shopping-cart';
    if (s.includes('price') || s.includes('harga') || s.includes('list')) return 'fas fa-tags';

    // --- 5. DESIGN & CREATIVE ---
    if (s.includes('figma')) return 'fab fa-figma';
    if (s.includes('sketch')) return 'fab fa-sketch';
    if (s.includes('dribbble')) return 'fab fa-dribbble';
    if (s.includes('behance')) return 'fab fa-behance';
    if (s.includes('palette') || s.includes('color') || s.includes('art') || s.includes('theme')) return 'fas fa-palette';
    if (s.includes('camera') || s.includes('foto') || s.includes('photo') || s.includes('ig')) return 'fas fa-camera';
    if (s.includes('video') || s.includes('film') || s.includes('movie')) return 'fas fa-video';
    if (s.includes('music') || s.includes('lagu') || s.includes('mp3') || s.includes('spotify') || s.includes('soundcloud')) return 'fas fa-music';

    // --- 6. GENERAL UI & NAVIGATION ---
    if (s.includes('home') || s.includes('beranda') || s.includes('awal')) return 'fas fa-home';
    if (s.includes('user') || s.includes('profil') || s.includes('me') || s.includes('akun') || s.includes('admin') || s.includes('owner')) return 'fas fa-user-circle';
    if (s.includes('group') || s.includes('grup') || s.includes('gc') || s.includes('team') || s.includes('community')) return 'fas fa-users';
    if (s.includes('info') || s.includes('tentang') || s.includes('about')) return 'fas fa-info-circle';
    if (s.includes('contact') || s.includes('kontak') || s.includes('hubungi') || s.includes('email') || s.includes('mail')) return 'fas fa-envelope';
    if (s.includes('help') || s.includes('bantuan') || s.includes('faq') || s.includes('tanya')) return 'fas fa-question-circle';
    if (s.includes('setting') || s.includes('pengaturan') || s.includes('config') || s.includes('atur')) return 'fas fa-cog';
    if (s.includes('login') || s.includes('masuk') || s.includes('sign in')) return 'fas fa-sign-in-alt';
    if (s.includes('logout') || s.includes('keluar')) return 'fas fa-sign-out-alt';
    if (s.includes('map') || s.includes('lokasi') || s.includes('loc')) return 'fas fa-map-marker-alt';
    if (s.includes('search') || s.includes('cari')) return 'fas fa-search';
    if (s.includes('notif') || s.includes('bell') || s.includes('alert')) return 'fas fa-bell';
    if (s.includes('download') || s.includes('unduh') || s.includes('get')) return 'fas fa-download';
    if (s.includes('upload') || s.includes('unggah')) return 'fas fa-upload';
    if (s.includes('link') || s.includes('url') || s.includes('tautan') || s.includes('web')) return 'fas fa-link';
    if (s.includes('file') || s.includes('doc') || s.includes('pdf') || s.includes('txt') || s.includes('zip')) return 'fas fa-file-alt';
    if (s.includes('lock') || s.includes('private') || s.includes('kunci') || s.includes('secure')) return 'fas fa-lock';
    if (s.includes('trash') || s.includes('delete') || s.includes('hapus') || s.includes('remove')) return 'fas fa-trash-alt';
    if (s.includes('edit') || s.includes('ubah') || s.includes('update') || s.includes('write')) return 'fas fa-edit';
    if (s.includes('share') || s.includes('bagikan')) return 'fas fa-share-alt';
    if (s.includes('star') || s.includes('fav') || s.includes('rate') || s.includes('review')) return 'fas fa-star';
    if (s.includes('heart') || s.includes('love') || s.includes('like')) return 'fas fa-heart';
    if (s.includes('crown') || s.includes('vip') || s.includes('premium') || s.includes('pro')) return 'fas fa-crown';
    if (s.includes('fire') || s.includes('hot') || s.includes('trend')) return 'fas fa-fire';
    if (s.includes('game') || s.includes('play') || s.includes('fun')) return 'fas fa-gamepad';
    if (s.includes('check') || s.includes('success') || s.includes('done') || s.includes('ok')) return 'fas fa-check-circle';
    if (s.includes('warning') || s.includes('danger') || s.includes('banned')) return 'fas fa-exclamation-triangle';
    if (s.includes('rocket') || s.includes('boost') || s.includes('speed')) return 'fas fa-rocket';
    if (s.includes('chart') || s.includes('stat') || s.includes('grafik')) return 'fas fa-chart-line';
    if (s.includes('calendar') || s.includes('date') || s.includes('jadwal')) return 'fas fa-calendar-alt';
    if (s.includes('clock') || s.includes('time') || s.includes('waktu')) return 'fas fa-clock';
    if (s.includes('gift') || s.includes('hadiah') || s.includes('giveaway')) return 'fas fa-gift';

    // Default Fallback (Jika tidak ada yang cocok)
    return 'fas fa-link'; 
};

// --- AUDIO & TOAST NOTIFICATION ---
window.playSfx = (type) => {
    // Memainkan efek suara ringan untuk interaksi (pop) atau sukses
    // Menggunakan try-catch agar tidak error jika browser memblokir autoplay
    try {
        const sound = document.getElementById(type === 'success' ? 'sound-success' : 'sound-pop');
        if (sound) { 
            sound.currentTime = 0; 
            sound.volume = 0.6; // Volume 60% agar tidak kaget
            const playPromise = sound.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {}); // Silent error
            }
        }
    } catch (e) { /* Ignore audio errors */ }
};

window.showToast = (msg, type = 'info') => {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    
    // Ikon berdasarkan tipe toast
    const icon = type === 'success' ? 'fa-check' : 'fa-info';
    
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icon}"></i></div>
        <div class="toast-msg">${msg}</div>
    `;
    
    container.appendChild(toast);
    
    // Trigger reflow agar animasi CSS berjalan
    void toast.offsetWidth; 
    
    // Animasi Masuk
    setTimeout(() => toast.classList.add('show'), 50);
    
    // Animasi Keluar & Hapus elemen
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
};

// --- DATE & NUMBER FORMATTERS ---
window.formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    // Format: DD MMM YYYY • HH:MM
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} • ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

window.formatUploadDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

window.formatK = (num) => {
    if (!num) return "0";
    // Format angka ribuan menjadi "1.5k" untuk tampilan ringkas
    return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.abs(num);
};

// --- CLOUDINARY UPLOAD HANDLER ---
window.uploadToCloudinary = async (file) => {
    const CLOUD_NAME = CONFIG.cloudinary.cloudName;
    const UPLOAD_PRESET = CONFIG.cloudinary.uploadPreset;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'user_reviews'); // Folder penyimpanan di Cloudinary

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || 'Upload gagal');
        }

        const data = await response.json();
        return data.secure_url; // Mengembalikan URL gambar HTTPS
    } catch (err) {
        console.error("Cloudinary Error Detail:", err);
        return null;
    }
};

// --- UI UTILITIES (SCROLL & LIGHTBOX) ---

// Optimized Scroll Dots Updater (THROTTLED VERSION FOR ANTI-LAG)
// Menggantikan logika requestAnimationFrame dengan setTimeout untuk menghemat CPU saat scroll cepat
let isScrollThrottled = false;
window.updateScrollDots = (cId, dId) => {
    // Jika sedang dalam masa tunggu (throttle), batalkan eksekusi
    if (isScrollThrottled) return;

    // Set flag menjadi true agar eksekusi berikutnya diblokir sementara
    isScrollThrottled = true;

    // Jalankan kalkulasi
    setTimeout(() => {
        const list = document.getElementById(cId);
        const dots = document.getElementById(dId);
        
        if (list && dots) {
            const scrollLeft = list.scrollLeft;
            const width = list.clientWidth;
            
            // Safety check untuk menghindari pembagian dengan nol
            if (width > 0) {
                // Menghitung index item yang aktif
                const active = Math.round(scrollLeft / width);
                // Hitung total dot yang diperlukan
                const count = Math.ceil(list.scrollWidth / width);

                // Hanya jika ada perubahan signifikan, kita render ulang
                // Jika elemen dot belum ada atau jumlahnya beda, render ulang
                if (dots.children.length !== count) {
                     let dotHtml = '';
                     for (let i = 0; i < count; i++) {
                         dotHtml += `<div class="dot-item ${i === active ? 'active' : ''}"></div>`;
                     }
                     dots.innerHTML = dotHtml;
                } else {
                    // Jika jumlah sama, cukup pindahkan class 'active' (Lebih ringan daripada innerHTML)
                    const currentActive = dots.querySelector('.active');
                    if (currentActive) currentActive.classList.remove('active');
                    if (dots.children[active]) dots.children[active].classList.add('active');
                }
            }
        }
        
        // Buka kembali akses setelah 200ms (Optimasi Scroll Smoothness)
        isScrollThrottled = false;
    }, 200);
};

// Lightbox Logic (Penampil Gambar Layar Penuh)
window.openLightbox = (url) => { 
    const lb = document.getElementById('lightbox'); 
    const img = document.getElementById('lightboxImg'); 
    if (lb && img) {
        img.src = url; 
        lb.classList.add('active'); 
        playSfx('pop'); 
    }
};

window.closeLightbox = () => { 
    const lb = document.getElementById('lightbox');
    if (lb) lb.classList.remove('active'); 
};
