import { update, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ====================================================
// FILE SCRIPT_SC.JS
// Edition: NAVY GRID RENDERER
// Status: CLEANED (Unlock Logic Moved to awang2.js to prevent duplicates)
// ====================================================

// State Lokal
window.currentScSort = 'default'; 
window.isScExpanded = false; 

// --- FUNGSI UPDATE STATS REALTIME ---
window.updateOnlyScriptStats = () => {
    const downloads = window.siteData?.scriptDownloads || {};
    const cards = document.querySelectorAll('.script-card');
    cards.forEach(card => {
        const id = card.id.replace('card-', '');
        const dlEl = card.querySelector('.dl-count-val');
        if (dlEl) {
            const newVal = downloads[id] || 0;
            if (dlEl.innerText !== window.formatK(newVal)) {
                dlEl.innerText = window.formatK(newVal);
            }
        }
    });
};

// --- FUNGSI UTAMA RENDER HALAMAN SC (GRID VIEW) ---
window.renderScPageScripts = (data) => {
    const list = document.getElementById('scriptList');
    const searchInput = document.getElementById('scriptSearch');
    
    // Safety Check: Hanya jalan di halaman SC (Grid View)
    if (!list || (list.classList && !list.classList.contains('script-grid-view'))) return;

    injectFilterSystem(data);

    let allItems = searchInput.value ? (window.currentFilteredScripts || []) : [...data];
    
    // Sorting Logic
    if (window.currentScSort === 'popular') {
        const downloads = window.siteData?.scriptDownloads || {};
        allItems.sort((a, b) => (downloads[b.id] || 0) - (downloads[a.id] || 0));
    } else if (window.currentScSort === 'latest') {
        allItems.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    }

    const isSearching = !!searchInput.value;
    const LIMIT = 5;
    let itemsToRender = allItems;
    let showButton = false;
    let remainingCount = 0;

    // Pagination Logic (Expand/Collapse)
    if (!isSearching && allItems.length > LIMIT) {
        showButton = true;
        remainingCount = allItems.length - LIMIT;
        if (!window.isScExpanded) itemsToRender = allItems.slice(0, LIMIT);
    }

    // Empty State
    if (!itemsToRender || itemsToRender.length === 0) {
        list.innerHTML = `
        <div class="empty-state reveal-on-scroll is-visible" style="width:100%; grid-column: 1 / -1; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:300px; background: #0f172a; border-color: #334155;">
            <div class="mb-4 animate-bounce"><i class="fas fa-ghost text-4xl text-[#475569]"></i></div>
            <p class="text-[#f8fafc] font-black text-sm uppercase tracking-widest">Script tidak ditemukan</p>
            <button onclick="applyScFilter('default')" class="mt-4 text-[10px] text-[#60a5fa] font-bold hover:text-white transition-colors">Reset Filter</button>
        </div>`;
        renderPaginationButton(false); 
        initScrollReveal(); 
        return;
    }

    // [STAGGERED ANIMATION LOGIC]
    const htmlContent = itemsToRender.map((item, index) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = item.thumbnail.match(regExp);
        const videoId = (match && match[7].length == 11) ? match[7] : false;
        
        // Thumbnail Logic
        const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : item.thumbnail;
        const fallbackUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400/0f172a/60a5fa?text=No+Image';
        
        // Async Fetch Youtube Stats
        if(videoId && window.fetchYoutubeData) window.fetchYoutubeData(item.thumbnail, item.id);

        // Tags Rendering
        const tags = item.tags || ["#BotWA", "#JavaScript"]; 
        const tagsHtml = tags.slice(0, 10).map(tag => `
            <span class="text-[9px] font-black text-[#60a5fa] bg-[#1e3a8a]/30 border border-[#60a5fa]/20 px-2 py-1.5 rounded-lg tracking-wider uppercase">
                ${tag}
            </span>`).join('');

        const dlCount = (window.siteData?.scriptDownloads && window.siteData.scriptDownloads[item.id]) || 0;
        
        // Delay Animation
        const staggerDelay = (index % 10) * 150;

        return `
        <div class="script-card reveal-on-scroll group" id="card-${item.id}" 
             style="border-color: rgba(148, 163, 184, 0.1); transition-delay: ${staggerDelay}ms;">
            
            <div class="thumb-container" style="border-bottom-color: rgba(148, 163, 184, 0.05);">
                <img src="${thumbUrl}" 
                     loading="lazy" 
                     decoding="async" 
                     class="skeleton" 
                     alt="${item.title}"
                     style="width: 100%; height: 100%; object-fit: cover;"
                     onload="this.classList.remove('skeleton'); this.style.opacity='1'"
                     onerror="this.src='${fallbackUrl}'" 
                     onclick="openLightbox(this.src)">
                
                <div class="absolute top-2 right-2 bg-[#020617] px-2 py-1 rounded-md border border-[#334155] z-10 flex items-center gap-1 shadow-sm">
                     <i class="fas fa-download text-[8px] text-green-400"></i><span class="text-[8px] font-bold text-white dl-count-val">${window.formatK(dlCount)}</span>
                </div>
                
                <div class="absolute inset-0 bg-[#020617]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button onclick="shareScriptById('${item.id}'); event.stopPropagation()" class="w-10 h-10 rounded-full bg-[#1e293b] hover:bg-[#334155] flex items-center justify-center text-white border border-[#475569] transform scale-0 group-hover:scale-100 transition-all delay-75 shadow-lg"><i class="fas fa-share-alt"></i></button>
                    <button onclick="openLightbox(this.closest('.thumb-container').querySelector('img').src); event.stopPropagation()" class="w-10 h-10 rounded-full bg-[#1e3a8a] hover:bg-[#2563eb] flex items-center justify-center text-white border border-[#60a5fa] transform scale-0 group-hover:scale-100 transition-all delay-100 shadow-lg"><i class="fas fa-search-plus"></i></button>
                </div>
            </div>
            
            <div class="script-info-wrapper">
                <div class="mb-2"><h4 id="title-${item.id}" class="text-sm font-black text-[#f8fafc] leading-tight uppercase tracking-wide group-hover:text-[#60a5fa] transition-colors cursor-default line-clamp-2">${item.title}</h4></div>
                <div class="flex flex-wrap gap-2 mb-2">${tagsHtml}</div>
                
                <div class="card-stats-row mt-auto" style="border-top-color: rgba(148, 163, 184, 0.1);">
                    <div class="stats-left">
                        <div id="views-${item.id}" class="stat-item text-[#94a3b8]"><i class="fas fa-eye stat-icon-view" style="color: #60a5fa;"></i> -</div>
                        <div id="likes-${item.id}" class="stat-item text-[#94a3b8]"><i class="fas fa-thumbs-up stat-icon-like" style="color: #ec4899;"></i> -</div>
                    </div>
                    <div class="stat-item text-[#94a3b8]"><i class="fas fa-calendar-alt stat-icon-date" style="color: #fbbf24;"></i> ${window.formatUploadDate(item.uploadedAt)}</div>
                </div>
                
                <div class="flex gap-2 mt-3 pt-3 border-t border-[#334155]/30">
                    <button onclick="window.initUnlockProcess('${item.id}', '${item.downloadLink}'); playSfx('pop')" class="flex-1 py-3 bg-[#1e293b] hover:bg-[#334155] rounded-xl text-[10px] font-black uppercase text-white shadow-md shadow-[#0f172a]/30 active:scale-95 transition-all flex items-center justify-center gap-2"><i class="fas fa-download"></i> Download</button>
                </div>
            </div>
        </div>`;
    }).join('');

    window.requestAnimationFrame(() => {
        list.innerHTML = htmlContent;
        renderPaginationButton(showButton, remainingCount);
        initScrollReveal(); 
        window.isScriptRendered = true;
    });
};

function renderPaginationButton(shouldShow, remainingCount) {
    let btnContainer = document.getElementById('scPaginationBtn');
    if (!btnContainer) {
        const list = document.getElementById('scriptList');
        btnContainer = document.createElement('div');
        btnContainer.id = 'scPaginationBtn';
        btnContainer.className = 'w-full flex justify-center mt-6 mb-4 reveal-on-scroll is-visible';
        list.parentNode.insertBefore(btnContainer, list.nextSibling);
    } else {
        btnContainer.className = 'w-full flex justify-center mt-6 mb-4 reveal-on-scroll is-visible';
    }

    if (!shouldShow) { btnContainer.innerHTML = ''; btnContainer.style.display = 'none'; return; }
    btnContainer.style.display = 'flex';
    
    const isExpanded = window.isScExpanded;
    const btnText = isExpanded ? 'Sembunyikan Menu' : `Lihat Semua Script (${remainingCount}+ Lainnya)`;
    const btnIcon = isExpanded ? 'fa-chevron-up' : 'fa-chevron-down';

    btnContainer.innerHTML = `
        <button onclick="toggleScView()" class="group relative px-8 py-4 bg-[#0f172a] rounded-2xl border border-[#334155] hover:border-[#60a5fa] transition-all active:scale-95 shadow-lg overflow-hidden">
            <div class="absolute inset-0 bg-[#60a5fa]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div class="relative flex items-center gap-3">
                <span class="text-[10px] font-black uppercase tracking-widest text-[#f8fafc] group-hover:text-[#60a5fa] transition-colors">${btnText}</span>
                <i class="fas ${btnIcon} text-xs text-[#94a3b8] group-hover:text-white transition-colors animate-bounce"></i>
            </div>
        </button>`;
}

window.toggleScView = () => {
    window.isScExpanded = !window.isScExpanded;
    playSfx('pop');
    if(window.renderScPageScripts) window.renderScPageScripts(CONFIG.items);
    if (!window.isScExpanded) {
        const list = document.getElementById('scriptList');
        if(list) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// --- FILTER & UI SYSTEM ---
function injectFilterSystem(data) {
    const searchInput = document.getElementById('scriptSearch');
    if(!searchInput || document.getElementById('filter-btn-group')) return;
    const parent = searchInput.parentElement;
    parent.className = "sc-search-wrapper"; 
    
    const filterGroup = document.createElement('div');
    filterGroup.id = "filter-btn-group";
    filterGroup.style.position = "relative"; filterGroup.style.zIndex = "10002";
    
    filterGroup.innerHTML = `
    <button id="btn-toggle-filter" onclick="toggleFilterMenu(event)"><i class="fas fa-sort-amount-down text-lg"></i></button>
    <div id="filter-dropdown" class="hidden">
        <div class="text-[9px] font-black text-[#94a3b8] uppercase px-3 py-2 border-b border-[#334155] mb-1">Filter Kategori</div>
        <button onclick="applyScFilter('latest'); event.stopPropagation()" class="w-full text-left px-3 py-3 rounded-xl text-[10px] font-bold text-[#f8fafc] hover:bg-[#334155] transition-colors flex items-center justify-between group mb-1"><span class="flex items-center gap-2"><div class="w-6 h-6 rounded-lg bg-[#334155]/30 flex items-center justify-center"><i class="fas fa-clock text-[#60a5fa]"></i></div> Terbaru</span><i class="fas fa-check text-[#60a5fa] opacity-0 group-[.active-filter]:opacity-100" id="check-latest"></i></button>
        <button onclick="applyScFilter('popular'); event.stopPropagation()" class="w-full text-left px-3 py-3 rounded-xl text-[10px] font-bold text-[#f8fafc] hover:bg-[#334155] transition-colors flex items-center justify-between group mb-1"><span class="flex items-center gap-2"><div class="w-6 h-6 rounded-lg bg-[#334155]/30 flex items-center justify-center"><i class="fas fa-fire text-red-500"></i></div> Terpopuler</span><i class="fas fa-check text-[#60a5fa] opacity-0" id="check-popular"></i></button>
        <div class="h-[1px] bg-[#334155] my-2 mx-2"></div>
         <button onclick="window.location.href='index.html'; playSfx('pop'); event.stopPropagation()" class="w-full text-left px-3 py-3 rounded-xl text-[10px] font-bold text-[#94a3b8] hover:bg-[#334155] transition-colors flex items-center gap-2"><i class="fas fa-home text-[#64748b]"></i> Kembali ke Home</button>
    </div>`;

    const searchIconWrapper = document.createElement('div');
    searchIconWrapper.className = "absolute"; searchIconWrapper.innerHTML = '<i class="fas fa-search"></i>';
    const savedValue = searchInput.value;
    parent.innerHTML = ''; 
    parent.appendChild(filterGroup); parent.appendChild(searchIconWrapper); parent.appendChild(searchInput);
    searchInput.value = savedValue;
    searchInput.removeEventListener('keyup', window.filterScripts); searchInput.addEventListener('keyup', window.filterScripts);
    
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('filter-dropdown');
        const btn = document.getElementById('btn-toggle-filter');
        if (menu && !menu.classList.contains('hidden')) {
            if (!menu.contains(e.target) && !btn.contains(e.target)) {
                menu.classList.add('hidden');
            }
        }
    });
}

window.toggleFilterMenu = (event) => {
    if(event) event.stopPropagation(); 
    const menu = document.getElementById('filter-dropdown');
    if(menu) {
        menu.classList.toggle('hidden');
        if (!menu.classList.contains('hidden')) { menu.style.animation = "menuFade 0.2s ease"; }
        playSfx('pop');
    }
};

window.applyScFilter = (type) => {
    window.currentScSort = type;
    const checkLatest = document.getElementById('check-latest');
    const checkPopular = document.getElementById('check-popular');
    if(checkLatest) checkLatest.style.opacity = type === 'latest' ? '1' : '0';
    if(checkPopular) checkPopular.style.opacity = type === 'popular' ? '1' : '0';
    document.getElementById('filter-dropdown').classList.add('hidden');
    window.isScExpanded = false;
    if(window.renderScPageScripts) window.renderScPageScripts(CONFIG.items);
    playSfx('success');
};

function initScrollReveal() {
    const observerOptions = { root: null, rootMargin: '50px 0px', threshold: 0.1 };
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                window.requestAnimationFrame(() => { entry.target.classList.add('is-visible'); });
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);
    const cards = document.querySelectorAll('.reveal-on-scroll:not(.is-visible)');
    cards.forEach(el => observer.observe(el));
}
