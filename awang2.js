import { onValue, update, increment, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getToken } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// ====================================================
// FILE AWANG2.JS - DISPATCHER UTAMA & UNLOCK FIX
// Status: FIX DOWNLOAD BUG & RENDER
// ====================================================

// --- TRACK DOWNLOAD HELPER ---
window.trackDownload = (id, link) => {
    // 1. Update Statistik Firebase (Background Process)
    try {
        if(window.dbRef) {
            const updates = {};
            updates[`scriptDownloads/${id}`] = increment(1);
            update(window.dbRef, updates).catch(e => console.log("Stat update error (minor):", e));
        }
    } catch(e) {}

    // 2. Buka Link Download (Langsung)
    if(link && link !== "#") {
        window.open(link, '_blank');
    } else {
        showToast("Link download error/kosong", "info");
    }
};

// --- HELPER ICONS ---
function getIconClass(name) {
    const n = name.toLowerCase().trim();
    if(n === 'youtube') return 'fab fa-youtube';
    if(n === 'whatsapp' || n === 'group') return 'fab fa-whatsapp';
    if(n === 'instagram') return 'fab fa-instagram';
    if(n === 'telegram') return 'fab fa-telegram-plane';
    if(n === 'tiktok') return 'fab fa-tiktok';
    if(n === 'facebook') return 'fab fa-facebook-f';
    if(n === 'discord') return 'fab fa-discord';
    if(n === 'github') return 'fab fa-github';
    if(n === 'bullhorn' || n === 'channel') return 'fas fa-bullhorn';
    if(n === 'heart' || n === 'like') return 'fas fa-heart';
    if(n === 'globe' || n === 'web') return 'fas fa-globe';
    return 'fas fa-link'; 
}

function getColorHex(colorName) {
    const c = colorName.toLowerCase().trim();
    if(c === 'red') return '#ef4444';
    if(c === 'green') return '#22c55e';
    if(c === 'blue') return '#3b82f6';
    if(c === 'pink') return '#ec4899';
    if(c === 'purple') return '#a855f7';
    if(c === 'yellow') return '#eab308';
    if(c === 'orange') return '#f97316';
    if(c === 'cyan') return '#06b6d4';
    return '#60a5fa'; 
}

// --- INTERACTION LOGIC ---
window.toggleCommentMenu = (id) => {
    const allMenus = document.querySelectorAll('.dropdown-menu');
    const targetMenu = document.getElementById(`menu-${id}`);
    if (!targetMenu) return;
    const isActive = targetMenu.classList.contains('active');
    allMenus.forEach(m => m.classList.remove('active'));
    if (!isActive) targetMenu.classList.add('active');
    playSfx('pop');
};

window.toggleReplies = (id) => {
    const el = document.getElementById(`replies-${id}`);
    const toggleBtnIcon = document.querySelector(`#reply-toggle-${id} i`);
    if (el) {
        const isHidden = el.classList.contains('hidden');
        if (isHidden) {
            el.classList.remove('hidden');
            if(window.openReplyIds) window.openReplyIds.add(id);
            if(toggleBtnIcon) {
                toggleBtnIcon.classList.remove('fa-caret-down');
                toggleBtnIcon.classList.add('fa-caret-up');
            }
        } else {
            el.classList.add('hidden');
            if(window.openReplyIds) window.openReplyIds.delete(id);
            if(toggleBtnIcon) {
                toggleBtnIcon.classList.remove('fa-caret-up');
                toggleBtnIcon.classList.add('fa-caret-down');
            }
        }
        playSfx('pop');
    }
};

window.handleEngagement = (id, type, counterId) => {
    let myInts = JSON.parse(localStorage.getItem('my_ints_v4') || '{}');
    let targetComment = null;
    
    const updated = (window.siteData.comments || []).map(c => {
        if(c.id === id) {
            targetComment = c;
            if(myInts[id] === type) {
                c[type === 'like' ? 'likes' : 'dislikes'] = Math.max(0, (c[type === 'like' ? 'likes' : 'dislikes'] || 0) - 1);
                delete myInts[id];
            } else {
                if(myInts[id]) {
                    const prevType = myInts[id];
                    c[prevType === 'like' ? 'likes' : 'dislikes'] = Math.max(0, (c[prevType === 'like' ? 'likes' : 'dislikes'] || 0) - 1);
                }
                c[type === 'like' ? 'likes' : 'dislikes'] = (c[type === 'like' ? 'likes' : 'dislikes'] || 0) + 1;
                myInts[id] = type;
            }
        }
        return c;
    });

    if (targetComment) {
        const isReply = counterId.startsWith('rep');
        const likeCountEl = document.getElementById(isReply ? `rep-like-${id}` : `cnt-like-${id}`);
        const dislikeCountEl = document.getElementById(isReply ? `rep-dislike-${id}` : `cnt-dislike-${id}`);
        if (likeCountEl) likeCountEl.innerText = targetComment.likes || 0;
        if (dislikeCountEl) dislikeCountEl.innerText = targetComment.dislikes || 0;
    }

    localStorage.setItem('my_ints_v4', JSON.stringify(myInts));
    update(window.dbRef, { comments: updated });
    playSfx('pop');
};

// --- RENDER DISPATCHER ---
window.renderScripts = (data) => {
    const list = document.getElementById('scriptList');
    if(!list) return;
    
    requestAnimationFrame(() => {
        // DETEKSI HALAMAN SC
        const isScPage = list.closest('.sc-container') !== null;
        
        if(isScPage) {
            // JIKA HALAMAN SC.HTML -> PANGGIL RENDER KOTAK
            if (typeof window.renderScPageScripts === 'function') {
                window.renderScPageScripts(data);
            } else {
                setTimeout(() => { if (typeof window.renderScPageScripts === 'function') window.renderScPageScripts(data); }, 100);
            }
        } else {
            // JIKA HALAMAN HOME -> PANGGIL RENDER SLIDER
            if (typeof window.renderHomeScripts === 'function') {
                window.renderHomeScripts(data);
            } else {
                 setTimeout(() => { if (typeof window.renderHomeScripts === 'function') window.renderHomeScripts(data); }, 100);
            }
        }
    });
};

// --- UNLOCK SYSTEM (MISI DOWNLOAD) ---
window.initUnlockProcess = (id, downloadLink) => {
    const sys = CONFIG.unlockSystem;
    const tasks = sys.tasks || [];
    window.unlockState = {};
    tasks.forEach(t => { window.unlockState[t.id] = false; });

    let tasksHtml = '';
    tasks.forEach(t => {
        const iconClass = getIconClass(t.icon);
        const colorHex = getColorHex(t.color);
        tasksHtml += `
        <div class="ul-task-card p-3 rounded-xl flex items-center gap-4 cursor-pointer group" id="task-${t.id}" onclick="handleTask('${t.id}', '${t.url}')">
            <div class="w-10 h-10 rounded-lg bg-[#020617] flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-110 transition-transform" style="color: ${colorHex}; border-color: ${colorHex}30;">
                <i class="${iconClass} text-lg"></i>
            </div>
            <div class="flex-1">
                <div class="text-[#f8fafc] text-[10px] font-black uppercase group-hover:text-[#60a5fa] transition-colors">${t.title}</div>
                <div class="text-[#64748b] text-[8px] font-bold">${t.subtitle}</div>
            </div>
            <div class="w-12 py-1.5 rounded-lg bg-[#1e293b] flex items-center justify-center text-[#60a5fa] text-[8px] font-black uppercase border border-[#60a5fa]/20" id="btn-${t.id}">${t.btnText}</div>
        </div>`;
    });

    const customStyles = `
    <style>
        .ul-task-card {
            background: linear-gradient(145deg, #0f172a, #1e293b);
            border: 1px solid rgba(148, 163, 184, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative; overflow: hidden; margin-bottom: 8px;
        }
        .ul-task-card.completed { background: linear-gradient(145deg, #0f291e, #143828); border-color: #22c55e; }
        .ul-progress-bg { background: #1e293b; border-radius: 99px; height: 6px; width: 100%; overflow:hidden; }
        .ul-progress-fill { background: linear-gradient(90deg, #60a5fa, #3b82f6); height: 100%; width: 0%; transition: width 0.5s ease; }
    </style>`;

    Swal.fire({
        html: `${customStyles}
        <div class="text-left mt-2">
            <div class="flex flex-col items-center justify-center mb-6 relative">
                <div class="w-20 h-20 rounded-full bg-[#0f172a] border-4 border-[#1e293b] flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10">
                    <i class="fas fa-lock text-3xl text-[#60a5fa] animate-pulse" id="main-lock-icon"></i>
                </div>
                <h3 class="mt-4 text-[#f8fafc] font-black text-sm uppercase tracking-[0.2em]">${sys.headerTitle || "LOCKED"}</h3>
                <p class="text-[#94a3b8] text-[9px] mt-1">${sys.headerSubtitle || "Selesaikan misi untuk buka kunci"}</p>
            </div>
            <div class="mb-6 px-2">
                <div class="flex justify-between text-[9px] font-bold text-[#60a5fa] mb-1"><span>PROGRESS</span><span id="progress-text">0%</span></div>
                <div class="ul-progress-bg"><div class="ul-progress-fill" id="progress-bar"></div></div>
            </div>
            <div class="space-y-2">${tasksHtml}</div>
            <div class="mt-6">
                <button id="final-dl-btn" disabled onclick="window.executeDownload('${id}', '${downloadLink}')" class="w-full py-4 rounded-xl bg-[#020617] border-2 border-[#1e293b] text-[#475569] font-black uppercase text-[12px] tracking-widest cursor-not-allowed transition-all relative overflow-hidden">
                    <span class="relative z-10 flex items-center justify-center gap-3"><i class="fas fa-lock" id="dl-icon"></i> <span id="dl-text">LOCKED</span></span>
                </button>
            </div>
        </div>`,
        background: '#020617', showConfirmButton: false, showCloseButton: true, width: 400
    });
};

window.handleTask = (key, url) => {
    if (window.unlockState[key]) return;
    if (url && url !== "undefined") window.open(url, '_blank');
    window.unlockState[key] = true;
    const card = document.getElementById(`task-${key}`);
    const btn = document.getElementById(`btn-${key}`);
    if (card && btn) {
        card.classList.add('completed');
        btn.innerHTML = '<i class="fas fa-check text-white"></i>';
        btn.className = "w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center shadow-none border-none";
        playSfx('pop');
    }
    updateProgressUI(); checkAllTasks();
};

function updateProgressUI() {
    const s = window.unlockState;
    const totalTasks = Object.keys(s).length;
    const completedTasks = Object.values(s).filter(v => v).length;
    const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    const bar = document.getElementById('progress-bar');
    const txt = document.getElementById('progress-text');
    if(bar && txt) { bar.style.width = `${percent}%`; txt.innerText = `${percent}%`; }
}

function checkAllTasks() {
    const allDone = Object.values(window.unlockState).every(v => v === true);
    if (allDone) {
        const dlBtn = document.getElementById('final-dl-btn');
        const dlIcon = document.getElementById('dl-icon');
        const dlText = document.getElementById('dl-text');
        const mainIcon = document.getElementById('main-lock-icon');
        if(mainIcon) { mainIcon.className = "fas fa-unlock-alt text-3xl text-[#22c55e] animate-bounce"; mainIcon.parentElement.style.borderColor = "#22c55e"; }
        if (dlBtn) {
            dlBtn.disabled = false;
            dlBtn.className = "w-full py-4 rounded-xl bg-gradient-to-r from-[#60a5fa] to-[#2563eb] text-white font-black uppercase text-[12px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all cursor-pointer animate-pulse border-none";
            dlIcon.className = "fas fa-download animate-bounce";
            dlText.innerText = "DOWNLOAD FILE";
            playSfx('success');
        }
    }
}

// FIX UTAMA: Panggil TrackDownload langsung dan tutup modal
window.executeDownload = (id, link) => { 
    Swal.close(); 
    // Panggil fungsi trackDownload yang sudah diperbaiki di atas
    window.trackDownload(id, link); 
};
