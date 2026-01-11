import { update, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ====================================================
// SCRIPT_HOME.JS - HIGH PERFORMANCE & AUTO-LAYOUT EDITION
// Fitur: Anti-Lag Slider, Auto-Popular Fallback, Layout Reordering
// ====================================================

window.renderHomeScripts = (data) => {
    const list = document.getElementById('scriptList');
    
    // SAFETY CHECK: Hentikan jika ini bukan halaman Home
    if (!list || (list.classList && list.classList.contains('script-grid-view'))) return;

    // 1. TRANSFORM LAYOUT (SEARCH -> BUTTON & POSISI JUDUL)
    // Fungsi ini akan memindahkan tombol ke atas dan mengubah judul
    transformHomeLayout();

    // Gunakan requestAnimationFrame untuk rendering mulus (Anti-Lag)
    requestAnimationFrame(() => {
        const now = new Date();
        
        // --- LOGIKA CERDAS: AUTO-FILL SLIDER ---
        // 1. Ambil Script Baru (7 Hari Terakhir)
        let displayScripts = data.filter(item => {
            const uploadDate = item.uploadedAt ? new Date(item.uploadedAt) : new Date(0);
            const diffTime = Math.abs(now - uploadDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        });

        // 2. JIKA SCRIPT BARU SEDIKIT, ISI DENGAN YANG LAIN (POPULER)
        if (displayScripts.length < 5) {
            const existingIds = new Set(displayScripts.map(s => s.id));
            const otherScripts = data.filter(s => !existingIds.has(s.id));
            
            // Randomize/Sort agar variatif
            otherScripts.sort(() => 0.5 - Math.random());
            
            const needed = 5 - displayScripts.length;
            const toAdd = otherScripts.slice(0, needed);
            displayScripts = [...displayScripts, ...toAdd];
        }

        // 3. RENDER SLIDER
        const animationStyle = "animation: menuFade 0.6s ease backwards;";
        
        let htmlContent = displayScripts.map((item, idx) => {
            const uploadDate = item.uploadedAt ? new Date(item.uploadedAt) : new Date(0);
            const diffDays = Math.ceil(Math.abs(now - uploadDate) / (1000 * 60 * 60 * 24));
            const isReallyNew = diffDays <= 7;
            
            // Thumbnail Logic
            const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = item.thumbnail.match(regExp);
            const thumbUrl = match ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` : item.thumbnail;
            
            if(match && window.fetchYoutubeData) window.fetchYoutubeData(item.thumbnail, item.id);

            // Tags
            const tags = item.tags || ["#BotWA", "#Free"]; 
            const tagsHtml = tags.slice(0, 2).map(tag => `
                <span class="text-[8px] font-black text-blue-300 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-[4px] tracking-wider uppercase">
                    ${tag}
                </span>`).join('');

            // Loading Strategy: Item pertama eager load, sisanya lazy
            const loadMode = idx < 2 ? "eager" : "lazy";

            return `
            <div class="script-card snap-center relative hover:scale-[1.02] transition-transform" id="card-${item.id}" style="${animationStyle} animation-delay: ${idx * 0.1}s;">
                ${isReallyNew ? '<div class="new-badge-modern">NEW</div>' : ''}
                
                <div class="thumb-container">
                    <img src="${thumbUrl}" 
                         loading="${loadMode}" 
                         decoding="async" 
                         alt="${item.title}"
                         style="opacity: 1; transition: opacity 0.3s ease;">
                </div>
                
                <div class="script-info-wrapper">
                    <div class="mb-2">
                        <h4 class="text-sm font-black text-white leading-tight uppercase tracking-wide line-clamp-2 mb-2">${item.title}</h4>
                        <div class="flex flex-wrap gap-1 mb-1">${tagsHtml}</div>
                    </div>
                    
                    <div class="card-stats-row mt-auto">
                        <div class="stats-left">
                            <div id="views-${item.id}" class="stat-item"><i class="fas fa-eye stat-icon-view"></i> ..</div>
                            <div id="likes-${item.id}" class="stat-item"><i class="fas fa-thumbs-up stat-icon-like"></i> ..</div>
                        </div>
                        <div class="stat-item text-[8px]"><i class="fas fa-calendar-alt text-yellow-500"></i> ${window.formatUploadDate(item.uploadedAt)}</div>
                    </div>
                    
                    <div class="flex gap-2 mt-3 pt-3 border-t border-white/5">
                        <button onclick="window.trackDownload('${item.id}', '${item.downloadLink}'); playSfx('pop')" class="flex-1 py-3 bg-gradient-to-r from-blue-700 to-blue-600 rounded-xl text-[10px] font-black uppercase text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:brightness-110">
                            <i class="fas fa-download"></i> Get
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');

        // Card "Lihat Semua"
        htmlContent += `
        <div class="script-card snap-center flex flex-col items-center justify-center cursor-pointer group hover:bg-white/5 transition-all border border-dashed border-white/10 bg-transparent" onclick="window.location.href='sc.html'; playSfx('pop')" style="${animationStyle} animation-delay: 0.8s;">
            <div class="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <i class="fas fa-arrow-right text-xl text-blue-400"></i>
            </div>
            <h4 class="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Database</h4>
            <span class="text-[9px] text-gray-500 uppercase">Lihat ${data.length}+ Script</span>
        </div>`;

        list.innerHTML = htmlContent;
        if(window.updateScrollDots) window.updateScrollDots('scriptList', 'scrollDots');
    });
};

// --- FUNGSI RE-LAYOUT & TRANSFORM ---
function transformHomeLayout() {
    const searchInput = document.getElementById('scriptSearch');
    if(!searchInput) return;

    // 1. Ambil Elemen Wrapper & Parent
    const wrapper = searchInput.parentElement;
    const parentContainer = wrapper.parentElement;
    
    // 2. Cari Judul H2 "Latest Free Scripts"
    // Biasanya judul ada sebelum wrapper input
    let title = wrapper.previousElementSibling;
    
    // Fallback: Jika struktur HTML berubah, cari manual di parent
    if (!title || title.tagName !== 'H2') {
        title = parentContainer.querySelector('h2');
    }

    // 3. TUKAR POSISI & GANTI TEXT
    if (title && wrapper) {
        // Pindahkan Wrapper ke SEBELUM Title (Jadi di atas)
        parentContainer.insertBefore(wrapper, title);
        
        // Ubah Teks Judul
        title.innerText = "SCRIPT POPULER";
        
        // Atur Margin agar rapi
        title.classList.remove('mb-6');
        title.classList.add('mt-8', 'mb-6'); // Jarak atas lebih lega setelah tombol
        
        wrapper.classList.remove('mb-6');
        wrapper.classList.add('mb-2'); // Kurangi margin bawah tombol
    }

    // 4. UBAH INPUT JADI TOMBOL "BUKA DATABASE"
    if(document.getElementById('btn-home-action')) return;

    wrapper.className = "relative group w-full"; 
    
    const newButtonHtml = `
    <button id="btn-home-action" onclick="window.location.href='sc.html'; playSfx('pop')" class="w-full relative overflow-hidden bg-[#111a2e] border border-blue-500/30 rounded-2xl py-5 px-6 flex items-center justify-between group hover:border-blue-500 transition-all shadow-lg shadow-blue-900/10">
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform duration-300">
                <i class="fas fa-database text-lg"></i>
            </div>
            <div class="text-left">
                <div class="text-white font-black text-sm uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Buka Database</div>
                <div class="text-gray-400 text-[10px] font-medium group-hover:text-gray-300">Temukan ${CONFIG.items.length}+ Script Gratis</div>
            </div>
        </div>
        <div class="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-inner">
            <i class="fas fa-arrow-right text-xs"></i>
        </div>
    </button>`;
    
    wrapper.innerHTML = newButtonHtml;
}
