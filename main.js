// ====================================================
// MAIN.JS - UI Initialization, Animation & Optimization
// Fitur: Smart Terminal (CPU Saver), Fail-Safe Loader, Typo Effect
// ====================================================

// --- FAIL-SAFE LOADER ---
// Memaksa loader hilang jika loading terlalu lama (5 detik)
// Berguna jika Firebase lambat merespon karena koneksi buruk
setTimeout(() => {
    const loader = document.getElementById('loader-wrapper');
    if (loader && loader.style.display !== 'none') {
        console.warn("Koneksi lambat, memaksa loader berhenti...");
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
        // Paksa render jika data cache ada untuk menghindari layar kosong
        if(window.renderAll && window.siteData) window.renderAll(); 
    }
}, 5000);

// --- UI INIT ---
function initUI() {
    // Set Basic Info dari Config
    const navBrand = document.getElementById('navBrand');
    const webSlogan = document.getElementById('webSlogan');
    if(navBrand) navBrand.innerText = CONFIG.title;
    if(webSlogan) webSlogan.innerText = CONFIG.description;
    
    // Set Images (Profile & Background)
    const mainAvatar = document.getElementById('mainAvatar');
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    if(mainAvatar) mainAvatar.src = CONFIG.profilePic;
    if(sidebarAvatar) sidebarAvatar.src = CONFIG.profilePic;
    
    const buyBtn = document.getElementById('buyPanelBtn');
    if(buyBtn) buyBtn.href = CONFIG.buyPanelLink;
    
    const customBg = document.getElementById('customBg');
    if(customBg) customBg.style.backgroundImage = `url('${CONFIG.background}')`;
    
    // 1. Sidebar Render (Smart Icon Integration & Animation)
    const side = document.getElementById('sidebarContent');
    if (side && CONFIG.sidebarCategories) {
        let globalDelay = 0; // Delay counter untuk animasi berurutan
        
        side.innerHTML = CONFIG.sidebarCategories.map(cat => {
            // Header kategori juga diberi animasi
            const headerHtml = `
            <div class="sidebar-category-header" style="animation: menuFade 0.5s ease backwards; animation-delay: ${globalDelay * 0.05}s">
                <span class="text-[10px] text-blue-400 font-black uppercase tracking-widest text-shadow-glow">${cat.categoryName}</span>
            </div>`;
            globalDelay++;

            const linksHtml = cat.links.map(l => {
                // Gunakan window.getIcon dari utils.js
                const iconClass = window.getIcon ? window.getIcon(l.icon || l.name) : 'fas fa-link';
                
                const itemHtml = `
                <a href="${l.link}" target="_blank" onclick="playSfx('pop')" class="sidebar-item flex items-center gap-4 px-6 py-4" style="animation: menuFade 0.5s ease backwards; animation-delay: ${globalDelay * 0.05}s">
                    <div class="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                        <i class="${iconClass} text-blue-400 text-sm"></i>
                    </div>
                    <span class="text-xs font-black uppercase text-gray-300 tracking-wider group-hover:text-white transition-colors">${l.name}</span>
                    <i class="fas fa-chevron-right ml-auto text-[8px] text-gray-600"></i>
                </a>`;
                globalDelay++;
                return itemHtml;
            }).join('');

            return headerHtml + linksHtml;
        }).join('');
    }
    
    // 2. Socials Render
    const sBox = document.getElementById('socialBox');
    if (sBox) {
        sBox.innerHTML = CONFIG.socials.map((s, idx) => {
             const iconClass = window.getIcon ? window.getIcon(s.icon || s.name) : 'fas fa-link';
             return `
            <a href="${s.link}" target="_blank" onclick="playSfx('pop')" class="w-11 h-11 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-blue-400 transition-all hover:scale-110 hover:bg-white/10 shadow-lg btn-3d" style="animation: menuFade 0.5s ease backwards; animation-delay: ${idx * 0.1}s">
                <i class="${iconClass} text-lg"></i>
            </a>`;
        }).join('');
    }
    
    renderFooter();
    
    // 3. Initial Script Render (Dispatcher)
    // Awang2.js sudah menangani logic Home vs SC Page
    if(window.renderScripts) window.renderScripts(CONFIG.items);
}

function renderFooter() {
    const foot = document.getElementById('mainFooter');
    if (!foot) return;
    
    foot.innerHTML = `<div class="px-8 max-w-lg mx-auto">
        <div class="text-center mb-10">
            <div class="pixel-font text-sm text-blue-500 mb-4 text-shadow-glow">${CONFIG.title}</div>
            <p class="text-gray-500 text-[11px] leading-relaxed">${CONFIG.footer.description}</p>
        </div>
        <div class="grid grid-cols-2 gap-8 mb-10 border-y border-white/5 py-10">
            <div>
                <h4 class="text-[10px] font-black text-white uppercase mb-4 tracking-widest border-l-2 border-blue-500 pl-2">PENTING</h4>
                <div class="flex flex-col gap-3">
                    <button onclick="openFooterPage('tos'); playSfx('pop')" class="text-left text-[11px] text-gray-500 font-bold uppercase hover:text-blue-400 transition-colors flex items-center gap-2"><i class="fas fa-file-alt text-[9px]"></i> Syarat & Ketentuan</button>
                    <button onclick="openFooterPage('privacy'); playSfx('pop')" class="text-left text-[11px] text-gray-500 font-bold uppercase hover:text-blue-400 transition-colors flex items-center gap-2"><i class="fas fa-user-secret text-[9px]"></i> Kebijakan Privasi</button>
                    <button onclick="openFooterPage('about'); playSfx('pop')" class="text-left text-[11px] text-gray-500 font-bold uppercase hover:text-blue-400 transition-colors flex items-center gap-2"><i class="fas fa-info-circle text-[9px]"></i> Tentang Kami</button>
                </div>
            </div>
            <div>
                <h4 class="text-[10px] font-black text-white uppercase mb-4 tracking-widest border-l-2 border-blue-500 pl-2">FOLLOW</h4>
                <div class="flex flex-wrap gap-2">
                    ${CONFIG.socials.map(s => {
                        const iconClass = window.getIcon ? window.getIcon(s.icon || s.name) : 'fas fa-link';
                        return `<a href="${s.link}" target="_blank" onclick="playSfx('pop')" class="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-sm text-blue-400 hover:bg-white/10 transition-all border border-white/5"><i class="${iconClass}"></i></a>`;
                    }).join('')}
                </div>
            </div>
        </div>
        <div class="text-center text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] opacity-70">${CONFIG.footer.copyright}</div>
    </div>`;
}

// --- ANIMATION TERMINAL (SMART CPU SAVER) ---
// Hanya merender animasi saat terminal terlihat di layar
// Ini adalah kunci agar HP tidak panas/lag
async function startTerminalAnimation() {
    const table = document.getElementById('terminalLines');
    const termWindow = document.querySelector('.terminal-window'); 
    
    if (!table || !termWindow) return;

    // --- INTERSECTION OBSERVER LOGIC ---
    let isTerminalVisible = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isTerminalVisible = entry.isIntersecting;
        });
    }, { threshold: 0.1 }); 

    observer.observe(termWindow);
    // -----------------------------------

    const logs = [
        { t: "system.init()", c: "text-blue-400" },
        { t: "fetching_database_v4... [OK]", c: "text-green-400" },
        { t: "syncing_user_profile...", c: "text-purple-400" },
        { t: "tracking_downloads_active...", c: "text-yellow-400" },
        { t: "root@shell: automation_active", c: "text-blue-300" },
        { t: "monitoring_api_status...", c: "text-white" }
    ];
    
    let line = 1;
    
    // Infinite Loop (Tapi Smart)
    while(true) {
        // Cek jika halaman sudah ganti/elemen hilang
        if(!document.getElementById('terminalLines')) {
            observer.disconnect(); 
            break;
        }
        
        // --- SMART PAUSE ---
        // Jika terminal tidak terlihat, skip rendering untuk hemat CPU
        if (!isTerminalVisible) {
            await new Promise(r => setTimeout(r, 1000)); // Cek lagi tiap 1 detik
            continue; 
        }

        table.innerHTML = ''; 
        line = 1;
        
        for(let log of logs) {
            if (!isTerminalVisible) break; // Break loop jika user scroll cepat menjauh

            const tr = document.createElement('tr'); 
            tr.className = 'term-row';
            tr.innerHTML = `<td class="term-num">${line++}</td><td class="term-code ${log.c}"><span class="txt"></span></td>`;
            table.appendChild(tr);
            
            const span = tr.querySelector('.txt');
            
            // Efek mengetik per karakter
            for(let char of log.t) { 
                span.innerHTML += char; 
                await new Promise(r => setTimeout(r, 30)); 
            }
            
            // Scroll ke bawah
            const termBody = document.getElementById('terminalContent');
            if(termBody) termBody.scrollTop = termBody.scrollHeight;
            
            await new Promise(r => setTimeout(r, 800)); // Delay antar baris
        }
        
        // Status Check Line
        if (isTerminalVisible) {
            const status = window.terminalStatus || (navigator.onLine ? "ONLINE" : "OFFLINE");
            const color = status === "ONLINE" ? "text-green-500" : "text-red-500";
            
            const statTr = document.createElement('tr'); 
            statTr.className = 'term-row';
            statTr.innerHTML = `<td class="term-num">${line++}</td><td class="term-code ${color}">System Status: ${status}</td>`;
            table.appendChild(statTr);
            
            const termBody = document.getElementById('terminalContent');
            if(termBody) termBody.scrollTop = termBody.scrollHeight;
        }

        await new Promise(r => setTimeout(r, 4000)); // Jeda sebelum restart loop
    }
}

// --- ANIMATION TITLE (Typing Effect) ---
function initTypingTitle() {
    const el = document.getElementById('webTitle');
    if(!el) return;
    
    const words = CONFIG.typingWords;
    let wIdx = 0, cIdx = 0, isDel = false;
    
    function type() {
        const cur = words[wIdx];
        const txt = isDel ? cur.substring(0, cIdx--) : cur.substring(0, cIdx++);
        
        el.innerHTML = txt === "" ? "&nbsp;" : txt;
        
        let typeSpeed = isDel ? 60 : 120;
        
        if(!isDel && cIdx > cur.length) { 
            isDel = true; 
            typeSpeed = 2000; 
        } else if(isDel && cIdx < 0) { 
            isDel = false; 
            wIdx = (wIdx+1) % words.length; 
            typeSpeed = 500; 
        }
        
        setTimeout(type, typeSpeed);
    }
    
    type();
}

// --- EXPORT UI ACTIONS ---
// Modal Footer (ToS, Privacy)
window.openFooterPage = (key) => { 
    const m = document.getElementById('footerPageModal'); 
    document.getElementById('fPageTitle').innerText = CONFIG.footerPages[key].title; 
    document.getElementById('fPageContent').innerHTML = CONFIG.footerPages[key].content; 
    m.classList.add('active'); 
};
window.closeFooterModal = () => { 
    document.getElementById('footerPageModal').classList.remove('active'); 
};

// Toggle Sidebar Menu
window.toggleMenu = () => { 
    document.getElementById('sidebar').classList.toggle('active'); 
    document.getElementById('overlay').classList.toggle('active'); 
};

// --- WINDOW ONLOAD ---
window.onload = () => {
    initUI();
    initTypingTitle();
    startTerminalAnimation(); 
    
    // Animasi progress bar loader manual
    const bar = document.getElementById('loader-bar-fill');
    if(bar) {
        let p = 0;
        const intv = setInterval(() => { 
            p += 10; 
            bar.style.width = p+'%'; 
            if(p>=100) clearInterval(intv); 
        }, 80);
    }
};
