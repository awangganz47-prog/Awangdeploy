import { update, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ====================================================
// SCRIPT_SC.JS - ULTIMATE EDITION (Fix Layout & Duplicate Buttons)
// Fitur: Smart Category Filter, Realtime Sorting, Scroll Reveal Animation
// ====================================================

// State Lokal untuk Filter
window.currentScSort = 'default'; // default, popular, latest

// Fungsi Utama Render Halaman SC (Grid View)
window.renderScPageScripts = (data) => {
    const list = document.getElementById('scriptList');
    const searchInput = document.getElementById('scriptSearch');
    
    // SAFETY CHECK: Pastikan list ini memang milik halaman SC (Grid)
    if (!list || (list.classList && !list.classList.contains('script-grid-view'))) return;

    // 1. INJECT SISTEM FILTER (MENGGANTIKAN TOMBOL HOME LAMA)
    // Fungsi ini diperbaiki agar tidak membuat tombol ganda (duplicate)
    injectFilterSystem(data);

    // 2. LOGIKA SORTING & FILTERING CANGGIH
    // Ambil nilai search jika elemen masih ada (karena mungkin sudah dipindahkan oleh injectFilterSystem)
    const currentInput = document.getElementById('scriptSearch');
    const query = currentInput ? currentInput.value : "";
    
    let itemsToRender = query ? (window.currentFilteredScripts || []) : [...data];

    // Logika Sorting
    if (window.currentScSort === 'popular') {
        // Sort berdasarkan jumlah download dari Firebase (siteData.scriptDownloads)
        const downloads = window.siteData?.scriptDownloads || {};
        itemsToRender.sort((a, b) => {
            const countA = downloads[a.id] || 0;
            const countB = downloads[b.id] || 0;
            return countB - countA; // Terbesar ke terkecil
        });
    } else if (window.currentScSort === 'latest') {
        // Sort berdasarkan tanggal upload (Terbaru ke Terlama)
        itemsToRender.sort((a, b) => {
            return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        });
    }

    // 3. JIKA DATA KOSONG
    if (!itemsToRender || itemsToRender.length === 0) {
        list.innerHTML = `
        <div class="empty-state" style="width:100%; grid-column: 1 / -1; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:300px; animation: menuFade 0.5s ease;">
            <div class="mb-4 animate-bounce">
                <i class="fas fa-ghost text-4xl text-blue-500/20"></i>
            </div>
            <p class="text-white font-black text-sm uppercase tracking-widest">Script tidak ditemukan</p>
        </div>`;
        return;
    }

    // 4. RENDER GRID ITEMS (DENGAN PERSIAPAN ANIMASI SCROLL)
    // Kita set opacity 0 di awal, nanti IntersectionObserver yang akan memunculkannya
    const htmlContent = itemsToRender.map((item, idx) => {
        // Thumbnail Logic
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = item.thumbnail.match(regExp);
        const thumbUrl = match ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` : item.thumbnail;
        
        // Fetch Youtube Stats (Non-blocking)
        if(match && window.fetchYoutubeData) window.fetchYoutubeData(item.thumbnail, item.id);

        // Tags Logic
        const tags = item.tags || ["#BotWA", "#FreeScript", "#JavaScript"]; 
        const tagsHtml = tags.slice(0, 3).map(tag => `
            <span class="text-[9px] font-black text-blue-400 bg-blue-500/5 border border-blue-500/20 px-2 py-1.5 rounded-lg tracking-wider uppercase backdrop-blur-sm">
                ${tag}
            </span>`).join('');

        // Hitung Download Count untuk badge (Opsional)
        const dlCount = (window.siteData?.scriptDownloads && window.siteData.scriptDownloads[item.id]) || 0;

        return `
        <div class="script-card scroll-reveal-item relative hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group" id="card-${item.id}" style="opacity: 0; transform: translateY(30px);">
            <div class="thumb-container">
                <img src="${thumbUrl}" 
                     loading="lazy" 
                     decoding="async" 
                     alt="${item.title}"
                     style="opacity: 1; transition: opacity 0.3s ease;"
                     onclick="openLightbox('${thumbUrl}')">
                
                <div class="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 z-10 flex items-center gap-1">
                     <i class="fas fa-download text-[8px] text-green-400"></i>
                     <span class="text-[8px] font-bold text-white">${dlCount}</span>
                </div>

                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                    <button onclick="shareScriptById('${item.id}'); event.stopPropagation()" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md border border-white/20 transform scale-0 group-hover:scale-100 transition-all delay-75">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button onclick="openLightbox('${thumbUrl}'); event.stopPropagation()" class="w-10 h-10 rounded-full bg-blue-600/80 hover:bg-blue-600 flex items-center justify-center text-white backdrop-blur-md border border-white/20 transform scale-0 group-hover:scale-100 transition-all delay-100">
                        <i class="fas fa-search-plus"></i>
                    </button>
                </div>
            </div>
            
            <div class="script-info-wrapper">
                <div class="mb-2">
                    <h4 id="title-${item.id}" class="text-sm font-black text-white leading-tight uppercase tracking-wide group-hover:text-blue-400 transition-colors cursor-default line-clamp-2">${item.title}</h4>
                </div>
                <div class="flex flex-wrap gap-2 mb-2">${tagsHtml}</div>
                
                <div class="card-stats-row mt-auto">
                    <div class="stats-left">
                        <div id="views-${item.id}" class="stat-item"><i class="fas fa-eye stat-icon-view"></i> -</div>
                        <div id="likes-${item.id}" class="stat-item"><i class="fas fa-thumbs-up stat-icon-like"></i> -</div>
                    </div>
                    <div class="stat-item"><i class="fas fa-calendar-alt stat-icon-date"></i> ${window.formatUploadDate(item.uploadedAt)}</div>
                </div>
                
                <div class="flex gap-2 mt-3 pt-3 border-t border-white/5">
                    <button onclick="trackDownload('${item.id}', '${item.downloadLink}'); playSfx('pop')" class="flex-1 py-3 bg-gradient-to-r from-blue-700 to-blue-600 rounded-xl text-[10px] font-black uppercase text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all hover:brightness-110 flex items-center justify-center gap-2 group-hover:shadow-blue-600/40">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');

    list.innerHTML = htmlContent;

    // 5. JALANKAN SCROLL REVEAL OBSERVER (Efek Muncul Bertahap)
    initScrollReveal();
};

// --- FITUR BARU: INJECT FILTER SYSTEM (FIXED STRUCTURE) ---
function injectFilterSystem(data) {
    const searchInput = document.getElementById('scriptSearch');
    
    // 1. Cek apakah input ada
    if(!searchInput) return;

    // 2. CEK PENTING: Apakah tombol filter SUDAH ada? Jika ya, STOP.
    // Ini mencegah tombol filter muncul berkali-kali (menumpuk)
    if(document.getElementById('filter-btn-group')) return;

    const parent = searchInput.parentElement;
    // Pastikan parent memiliki class untuk Flexbox
    parent.className = "sc-search-wrapper"; 
    
    // Simpan value lama agar tidak hilang saat dipindah
    const oldVal = searchInput.value;

    // 3. BUAT WRAPPER UNTUK INPUT (sc-input-group)
    const inputGroup = document.createElement('div');
    inputGroup.className = "sc-input-group"; // Class baru untuk flex-1
    
    // Pindahkan Input ke dalam Wrapper
    // Kita clone input untuk menghilangkan event listener lama dan pasang ulang dengan bersih
    const newInput = searchInput.cloneNode(true);
    newInput.value = oldVal;
    newInput.className = "w-full bg-[#111a2e] rounded-2xl py-4 pl-14 pr-4 text-sm outline-none text-white placeholder-gray-500 transition-all font-medium border border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)]";
    
    // Buat Icon Search Baru
    const searchIcon = document.createElement('i');
    searchIcon.className = "fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 z-10 text-sm pointer-events-none";
    
    // Masukkan Icon & Input ke Wrapper
    inputGroup.appendChild(searchIcon);
    inputGroup.appendChild(newInput);

    // 4. BUAT TOMBOL FILTER (GANTIKAN TOMBOL HOME)
    const filterBtnHtml = `
    <div class="relative" id="filter-container">
        <button id="btn-toggle-filter" onclick="toggleFilterMenu()" title="Filter & Urutkan">
            <i class="fas fa-sort-amount-down text-lg"></i>
            <div class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full hidden" id="filter-active-dot"></div>
        </button>
        
        <div id="filter-dropdown" class="absolute top-full right-0 mt-3 hidden z-50 rounded-2xl border border-blue-500/30 overflow-hidden">
            <div class="text-[9px] font-black text-gray-500 uppercase px-4 py-3 border-b border-white/5 bg-[#0a1120]">Urutkan Script</div>
            
            <button onclick="applyScFilter('latest')" class="w-full text-left px-4 py-3 text-[10px] font-bold text-white hover:bg-blue-600/20 hover:text-blue-400 transition-colors flex items-center justify-between group">
                <span><i class="fas fa-clock mr-2 text-blue-500"></i> Terbaru</span>
                <i class="fas fa-check text-blue-400 opacity-0 group-[.active-filter]:opacity-100" id="check-latest"></i>
            </button>
            
            <button onclick="applyScFilter('popular')" class="w-full text-left px-4 py-3 text-[10px] font-bold text-white hover:bg-blue-600/20 hover:text-blue-400 transition-colors flex items-center justify-between group">
                <span><i class="fas fa-fire mr-2 text-red-500"></i> Terpopuler</span>
                <i class="fas fa-check text-blue-400 opacity-0" id="check-popular"></i>
            </button>
            
            <div class="h-[1px] bg-white/10 my-1"></div>
            
             <button onclick="window.location.href='index.html'" class="w-full text-left px-4 py-3 text-[10px] font-bold text-gray-400 hover:bg-white/5 transition-colors flex items-center gap-2">
                <i class="fas fa-home"></i> Kembali ke Home
            </button>
        </div>
    </div>`;

    // Wrapper untuk Filter Button
    const filterContainer = document.createElement('div');
    filterContainer.id = "filter-btn-group"; // ID Penanda agar tidak duplikat
    filterContainer.innerHTML = filterBtnHtml;

    // 5. BERSIHKAN PARENT & SUSUN ULANG
    parent.innerHTML = ''; // Hapus elemen lama (termasuk duplikat jika ada)
    parent.appendChild(inputGroup); // Masukkan Input (Kiri)
    parent.appendChild(filterContainer.firstElementChild); // Masukkan Filter (Kanan)

    // Re-attach event listener
    newInput.addEventListener('keyup', window.filterScripts);
    newInput.focus(); // Kembalikan fokus
}

// Global Functions untuk Filter
window.toggleFilterMenu = () => {
    const menu = document.getElementById('filter-dropdown');
    if(menu) {
        if(menu.classList.contains('hidden')) {
            menu.classList.remove('hidden');
            menu.style.animation = 'menuFade 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        } else {
            menu.classList.add('hidden');
        }
        playSfx('pop');
    }
};

window.applyScFilter = (type) => {
    window.currentScSort = type;
    
    // Update UI Checkbox
    const checkLatest = document.getElementById('check-latest');
    const checkPopular = document.getElementById('check-popular');
    if(checkLatest) checkLatest.style.opacity = type === 'latest' ? '1' : '0';
    if(checkPopular) checkPopular.style.opacity = type === 'popular' ? '1' : '0';
    
    // Tanda Dot Merah di tombol
    const dot = document.getElementById('filter-active-dot');
    if(dot) dot.style.display = 'block';

    // Tutup Menu
    document.getElementById('filter-dropdown').classList.add('hidden');
    
    // Render Ulang dengan Sort Baru
    // Kita ambil data dari CONFIG.items karena kita butuh data mentah untuk disortir
    window.renderScPageScripts(CONFIG.items);
    playSfx('success');
};

// --- SCROLL REVEAL ANIMATION (Intersection Observer) ---
// Membuat efek kartu muncul satu per satu saat di-scroll
function initScrollReveal() {
    const observerOptions = {
        root: null, // viewport
        rootMargin: '50px', // load sedikit sebelum muncul
        threshold: 0.1 // 10% elemen terlihat baru muncul
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 80); // Delay 80ms per item
                
                obs.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const cards = document.querySelectorAll('.scroll-reveal-item');
    cards.forEach(card => observer.observe(card));
}
