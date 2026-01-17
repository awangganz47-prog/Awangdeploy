import { update, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ====================================================
// FILE SCRIPT_HOME.JS
// Edition: NAVY & DENIM THEME (HOME SLIDER + UNLOCK INTEGRATION)
// Status: OPTIMIZED (Unlock System Active & Badge Fixed)
// ====================================================

window.renderHomeScripts = (data) => {
    const list = document.getElementById('scriptList');
    
    // SAFETY CHECK: Hentikan jika ini bukan halaman Home
    if (!list || (list.classList && list.classList.contains('script-grid-view'))) return;

    // 1. TRANSFORM SEARCH BAR MENJADI BUTTON (Style Updated: Navy Tone)
    transformHomeSearch();

    window.requestAnimationFrame(() => {
        const now = new Date();
        
        // 2. FILTER DATA (Script 7 Hari Terakhir)
        let sortedData = [...data].sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        
        const recentScripts = sortedData.filter(item => {
            if (!item.uploadedAt) return false;
            const uploadDate = new Date(item.uploadedAt);
            const diffTime = Math.abs(now - uploadDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7; 
        });

        // 3. JIKA DATA KOSONG (Tidak ada script baru minggu ini)
        if (recentScripts.length === 0) {
            list.innerHTML = `
            <div class="snap-center w-full flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-[#334155] rounded-3xl bg-[#0f172a] mx-auto reveal-on-scroll is-visible" style="min-width: 100%;">
                <div class="mb-4 animate-bounce">
                    <i class="fas fa-history text-4xl text-[#475569]"></i>
                </div>
                <p class="text-[#60a5fa] font-bold text-[10px] uppercase leading-relaxed tracking-widest mb-4">
                    Belum ada script baru minggu ini
                </p>
                <button onclick="window.location.href='sc.html'; playSfx('pop')" class="px-6 py-3 bg-[#1e3a8a] rounded-xl text-white text-[10px] font-black uppercase shadow-md active:scale-95 transition-all hover:bg-[#1e40af]">
                    Cek Database Lengkap
                </button>
            </div>`;
            
            const dots = document.getElementById('scrollDots');
            if(dots) dots.style.display = 'none';
            
            initHomeScrollReveal();
            return;
        }

        // 4. RENDER SLIDER (NAVY THEME)
        let htmlContent = recentScripts.map((item, idx) => {
            const isNew = true; 
            
            // Logika Gambar (Regex Kuat + Fallback HQ)
            const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
            const match = item.thumbnail.match(regExp);
            const videoId = (match && match[7].length == 11) ? match[7] : false;
            
            // Gunakan hqdefault agar gambar selalu muncul (Anti-Blank)
            const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : item.thumbnail;
            const fallbackUrl = 'https://placehold.co/600x400/0f172a/60a5fa?text=No+Image';

            if(videoId && window.fetchYoutubeData) window.fetchYoutubeData(item.thumbnail, item.id);

            // Tags: Background Navy Transparan, Teks Denim
            const tags = item.tags || ["#BotWA", "#Free", "#New"]; 
            const tagsHtml = tags.slice(0, 3).map(tag => `
                <span class="text-[8px] font-black text-[#60a5fa] bg-[#1e3a8a]/20 border border-[#60a5fa]/20 px-1.5 py-0.5 rounded-[4px] tracking-wider uppercase">
                    ${tag}
                </span>`).join('');

            const loadMode = idx < 2 ? "eager" : "lazy";
            const revealClass = idx < 3 ? "reveal-on-scroll is-visible" : "reveal-on-scroll";
            const delayStyle = idx < 3 ? "" : `transition-delay: ${idx * 0.1}s;`;

            return `
            <div class="script-card snap-center relative hover:scale-[1.02] transition-transform ${revealClass}" id="card-${item.id}" style="${delayStyle}; border-color: rgba(148, 163, 184, 0.1);">
                ${isNew ? '<div class="new-badge-modern" style="background: #1e3a8a; border-color: #60a5fa; color: #ffffff;">NEW</div>' : ''}
                
                <div class="thumb-container" style="border-bottom-color: rgba(148, 163, 184, 0.05);">
                    <img src="${thumbUrl}" 
                         loading="${loadMode}" 
                         decoding="async" 
                         class="skeleton" 
                         alt="${item.title}"
                         onload="this.classList.remove('skeleton'); this.style.opacity='1'"
                         onerror="this.src='${fallbackUrl}';">
                </div>
                
                <div class="script-info-wrapper">
                    <div class="mb-2">
                        <h4 class="text-sm font-black text-[#f8fafc] leading-tight uppercase tracking-wide line-clamp-2 mb-2">${item.title}</h4>
                        <div class="flex flex-wrap gap-1 mb-1">${tagsHtml}</div>
                    </div>
                    
                    <div class="card-stats-row mt-auto" style="border-top-color: rgba(148, 163, 184, 0.1);">
                        <div class="stats-left">
                            <div id="views-${item.id}" class="stat-item text-[#94a3b8]"><i class="fas fa-eye stat-icon-view" style="color: #60a5fa;"></i> ..</div>
                            <div id="likes-${item.id}" class="stat-item text-[#94a3b8]"><i class="fas fa-thumbs-up stat-icon-like" style="color: #ec4899;"></i> ..</div>
                        </div>
                        <div class="stat-item text-[8px] text-[#94a3b8]"><i class="fas fa-calendar-alt stat-icon-date" style="color: #fbbf24;"></i> ${window.formatUploadDate(item.uploadedAt)}</div>
                    </div>
                    
                    <div class="flex gap-2 mt-3 pt-3 border-t border-[#334155]/30">
                        <button onclick="window.initUnlockProcess('${item.id}', '${item.downloadLink}'); playSfx('pop')" class="flex-1 py-3 bg-[#1e293b] hover:bg-[#334155] rounded-xl text-[10px] font-black uppercase text-white shadow-md shadow-[#0f172a]/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');

        list.innerHTML = htmlContent;
        if(window.updateScrollDots) window.updateScrollDots('scriptList', 'scrollDots');
        initHomeScrollReveal();
    });
};

// --- FUNGSI TRANSFORMA SEARCH BAR (UI Updated: Navy Tone) ---
function transformHomeSearch() {
    const searchInput = document.getElementById('scriptSearch');
    if(!searchInput) return;

    const parent = searchInput.parentElement;
    if(document.getElementById('btn-home-action')) return;

    parent.innerHTML = '';
    parent.className = "relative mb-10 group w-full reveal-on-scroll is-visible"; 

    // HTML Tombol "BUKA DATABASE" - Updated Colors (Navy/Blue)
    const newButtonHtml = `
    <button id="btn-home-action" onclick="window.location.href='sc.html'; playSfx('pop')" class="w-full relative overflow-hidden bg-[#0f172a] border border-[#334155] rounded-2xl py-5 px-6 flex items-center justify-between group hover:border-[#60a5fa] transition-all shadow-lg active:scale-95">
        <div class="flex items-center gap-5">
            <div class="w-12 h-12 rounded-full bg-[#1e293b] border border-[#334155] flex items-center justify-center text-[#60a5fa] group-hover:scale-110 transition-transform duration-300">
                <i class="fas fa-database text-lg"></i>
            </div>
            <div class="text-left">
                <div class="text-[#f8fafc] font-black text-xs uppercase tracking-[0.15em] mb-1 group-hover:text-[#60a5fa] transition-colors">Buka Database</div>
                <div class="text-[#94a3b8] text-[10px] font-bold group-hover:text-[#cbd5e1] transition-colors">Temukan Semua Script Gratis</div>
            </div>
        </div>
        <div class="w-10 h-10 rounded-full border border-[#334155] flex items-center justify-center text-[#64748b] group-hover:bg-[#60a5fa] group-hover:text-white group-hover:border-transparent transition-all duration-300">
            <i class="fas fa-arrow-right text-xs"></i>
        </div>
        
        <div class="absolute top-0 right-0 w-20 h-full bg-white/5 skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </button>`;
    
    parent.innerHTML = newButtonHtml;
}

// --- FUNGSI WATERFALL KHUSUS HOME ---
function initHomeScrollReveal() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                window.requestAnimationFrame(() => {
                    entry.target.classList.add('is-visible');
                });
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll:not(.is-visible)').forEach(el => observer.observe(el));
}
