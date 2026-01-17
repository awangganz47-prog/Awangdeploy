import { onValue, update, increment, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getToken } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// ====================================================
// FILE AWANG2.JS
// Edition: NAVY & DENIM THEME (INTERACTION LAYER + SHARED UNLOCK)
// Status: OPTIMIZED (Supports Unlock System Everywhere)
// ====================================================

// --- HELPER: ICON & COLOR MAPPER (Moved Here for Global Usage) ---
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
    return '#60a5fa'; // Default Denim Blue
}

// --- INTERACTION HANDLERS (Like, Reply, Delete, etc) ---

window.toggleCommentMenu = (id) => {
    const allMenus = document.querySelectorAll('.dropdown-menu');
    const targetMenu = document.getElementById(`menu-${id}`);
    
    // Safety check jika elemen tidak ditemukan
    if (!targetMenu) return;
    
    const isActive = targetMenu.classList.contains('active');
    
    // Tutup semua menu dulu agar tidak tumpang tindih
    allMenus.forEach(m => m.classList.remove('active'));
    
    // Buka yang ditarget jika belum aktif
    if (!isActive) targetMenu.classList.add('active');
    playSfx('pop');
};

// [CRITICAL FIX] Logic Toggle Replies dengan State Persistence
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
    
    // 1. Optimistic UI Update
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

    // 2. DOM Update
    if (targetComment) {
        const isReply = counterId.startsWith('rep');
        const likeCountEl = document.getElementById(isReply ? `rep-like-${id}` : `cnt-like-${id}`);
        const dislikeCountEl = document.getElementById(isReply ? `rep-dislike-${id}` : `cnt-dislike-${id}`);
        const likeBtn = document.getElementById(`btn-like-${id}`);
        const dislikeBtn = document.getElementById(`btn-dislike-${id}`);

        if (likeCountEl) likeCountEl.innerText = targetComment.likes || 0;
        if (dislikeCountEl) dislikeCountEl.innerText = targetComment.dislikes || 0;

        if (likeBtn && dislikeBtn) {
            likeBtn.className = isReply ? 
                `text-[10px] font-black ${myInts[id] === 'like' ? 'text-[#60a5fa]' : 'text-gray-500'}` : 
                `eng-btn flex items-center gap-1.5 text-[10px] font-black ${myInts[id] === 'like' ? 'text-[#60a5fa]' : 'text-gray-500'}`;
            
            dislikeBtn.className = isReply ? 
                `text-[10px] font-black ${myInts[id] === 'dislike' ? 'text-red-400' : 'text-gray-500'}` : 
                `eng-btn flex items-center gap-1.5 text-[10px] font-black ${myInts[id] === 'dislike' ? 'text-red-400' : 'text-gray-500'}`;
            
            const likeIcon = likeBtn.querySelector('i');
            const dislikeIcon = dislikeBtn.querySelector('i');
            
            if(likeIcon) likeIcon.className = `${myInts[id] === 'like' ? 'fas' : 'far'} fa-thumbs-up`;
            if(dislikeIcon) dislikeIcon.className = `${myInts[id] === 'dislike' ? 'fas' : 'far'} fa-thumbs-down`;
        }
    }

    // 3. Simpan ke LocalStorage dan Firebase
    localStorage.setItem('my_ints_v4', JSON.stringify(myInts));
    update(window.dbRef, { comments: updated });
    playSfx('pop');
};

window.loveComment = (id) => {
    const updated = (window.siteData.comments || []).map(c => {
        if(c.id === id) c.adminLoved = !c.adminLoved;
        return c;
    });
    update(window.dbRef, { comments: updated });
    showToast("Status Love Diperbarui", "success");
    playSfx('success');
};

window.pinComment = (id) => {
    const updated = (window.siteData.comments || []).map(c => {
        if(c.id === id) c.isPinned = !c.isPinned;
        else if(!c.parentId) c.isPinned = false;
        return c;
    });
    update(window.dbRef, { comments: updated });
    showToast("Status Semat Diperbarui", "success");
    playSfx('success');
    setTimeout(() => { if(window.fetchFirstPage) window.fetchFirstPage(); }, 300);
};

window.deleteComment = (id) => {
    Swal.fire({ 
        title: 'Hapus?', 
        text: "Pesan Anda akan hilang selamanya.", 
        icon: 'warning', 
        background: '#020617',
        color: '#f8fafc',
        showCancelButton: true, 
        confirmButtonColor: '#1e3a8a',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
    }).then(res => {
        if(res.isConfirmed) {
            const updated = (window.siteData.comments || []).filter(c => c.id !== id && c.parentId !== id);
            update(window.dbRef, { comments: updated });
            showToast("Ulasan berhasil dihapus", "info");
            playSfx('pop');
            setTimeout(() => { 
                if(window.renderCommentsPreservingState) window.renderCommentsPreservingState();
            }, 500); 
        }
    });
};

window.replyComment = (parentId, name) => {
    window.currentParentId = parentId; 
    
    const savedName = localStorage.getItem('user_name_v4');
    if(savedName) document.getElementById('revName').value = savedName;
    
    const savedAvatar = localStorage.getItem('user_avatar_v4');
    if(savedAvatar) {
        window.selectedProfileUrl = savedAvatar;
        const imgEl = document.getElementById('profilePreviewImg');
        const container = document.getElementById('profilePreviewContainer');
        if(imgEl && container) {
            imgEl.src = savedAvatar;
            container.style.display = 'block';
        }
    }

    document.getElementById('revText').value = `@${name} `; 
    window.openModal();
    document.getElementById('modalTitle').innerText = "Balas Ulasan";
    
    const txtArea = document.getElementById('revText');
    setTimeout(() => {
        txtArea.focus();
        txtArea.setSelectionRange(txtArea.value.length, txtArea.value.length);
    }, 100);

    playSfx('pop');
    requestNotificationPermission(); 
};

window.editComment = (id) => {
    const comment = (window.siteData.comments || []).find(c => c.id === id);
    if(!comment) return;
    
    window.editingId = id;
    window.currentParentId = comment.parentId || null; 
    window.selectedStar = comment.star || 5;
    
    document.getElementById('revName').value = comment.name;
    document.getElementById('revText').value = comment.text;
    
    if(comment.userAvatar) {
        document.getElementById('profilePreviewImg').src = comment.userAvatar;
        document.getElementById('profilePreviewContainer').style.display = 'block';
        window.selectedProfileUrl = comment.userAvatar;
    } else { window.clearProfileSelection(); }
    
    if(comment.imageUrl) {
        document.getElementById('imagePreviewImg').src = comment.imageUrl;
        document.getElementById('imagePreviewContainer').style.display = 'block';
        window.selectedImageUrl = comment.imageUrl;
    } else { window.clearImageSelection(); }
    
    updateStarsUI();
    window.openModal();
    document.getElementById('modalTitle').innerText = "Edit Ulasan";
};

async function requestNotificationPermission() {
    try {
        if (!("Notification" in window)) return;
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(window.messaging, { vapidKey: 'BIsyB_HhO4Q5T7Kx_8V4T0N4H_M-YOUR_PUBLIC_VAPID_KEY_HERE' });
            if (token) {
                const tokenRef = ref(window.db, `siteDataV4/tokens/${window.USER_UID}`);
                await update(tokenRef, { token: token, lastUpdated: new Date().toISOString() });
            }
        }
    } catch (error) { console.log("Notif Error (Silent):", error); }
}

// --- SCRIPT SYSTEM (SMART DISPATCHER) ---

window.filterScripts = () => {
    const q = document.getElementById('scriptSearch').value;
    if(!q) { 
        window.currentFilteredScripts = null; 
        window.renderScripts(CONFIG.items); 
        return; 
    }
    const options = { keys: ['title', 'description', 'tags'], threshold: 0.4, distance: 50 };
    const fuse = new Fuse(CONFIG.items, options);
    const result = fuse.search(q);
    window.currentFilteredScripts = result.map(r => r.item); 
    window.renderScripts(window.currentFilteredScripts);
};

window.trackDownload = (index, downloadUrl) => {
    const updates = {};
    updates[`scriptDownloads/${index}`] = increment(1); 
    
    update(window.dbRef, updates).then(() => {
        if (downloadUrl) {
            setTimeout(() => window.open(downloadUrl, '_blank'), 500);
        }
    }).catch((e) => {
        console.warn("Tracking failed, opening anyway", e);
        if (downloadUrl) window.open(downloadUrl, '_blank');
    });
};

// Global Helper untuk Youtube Stats
window.fetchYoutubeData = async (url, id) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        const videoId = match[2];
        try {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${CONFIG.firebase.apiKey}`);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const stat = data.items[0].statistics;
                const vEl = document.getElementById(`views-${id}`);
                const lEl = document.getElementById(`likes-${id}`);
                if(vEl) vEl.innerHTML = `<i class="fas fa-eye stat-icon-view" style="color: #60a5fa;"></i> ${window.formatK(stat.viewCount)}`;
                if(lEl) lEl.innerHTML = `<i class="fas fa-thumbs-up stat-icon-like" style="color: #ec4899;"></i> ${window.formatK(stat.likeCount)}`;
            }
        } catch (e) { }
    }
};

window.renderScripts = (data) => {
    const list = document.getElementById('scriptList');
    if(!list) return;
    
    requestAnimationFrame(() => {
        if(list.classList.contains('script-grid-view')) {
            if (typeof window.renderScPageScripts === 'function') {
                window.renderScPageScripts(data);
            } else {
                setTimeout(() => {
                    if (typeof window.renderScPageScripts === 'function') window.renderScPageScripts(data);
                }, 100);
            }
        } else {
            if (typeof window.renderHomeScripts === 'function') {
                window.renderHomeScripts(data);
            } else {
                 setTimeout(() => {
                    if (typeof window.renderHomeScripts === 'function') window.renderHomeScripts(data);
                }, 100);
            }
        }
    });
};

// ===================================================
// SISTEM UNLOCK DOWNLOAD DYNAMIC (GLOBAL ACCESS)
// ===================================================
// Dipindahkan ke sini agar bisa diakses oleh Home dan SC

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
        .ul-task-card::before {
            content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
            background: #334155; transition: all 0.3s ease;
        }
        .ul-task-card:hover { transform: translateX(5px); border-color: #60a5fa; }
        .ul-task-card.completed { background: linear-gradient(145deg, #0f291e, #143828); border-color: #22c55e; }
        .ul-task-card.completed::before { background: #22c55e; box-shadow: 0 0 10px #22c55e; }
        .ul-progress-bg { background: #1e293b; border-radius: 99px; height: 6px; width: 100%; overflow:hidden; }
        .ul-progress-fill { background: linear-gradient(90deg, #60a5fa, #3b82f6); height: 100%; width: 0%; transition: width 0.5s ease; box-shadow: 0 0 10px rgba(96, 165, 250, 0.5); }
        .lock-icon-anim { animation: floatLock 3s ease-in-out infinite; }
        @keyframes floatLock { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    </style>`;

    Swal.fire({
        html: `${customStyles}
        <div class="text-left mt-2">
            <div class="flex flex-col items-center justify-center mb-6 relative">
                <div class="w-20 h-20 rounded-full bg-[#0f172a] border-4 border-[#1e293b] flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10">
                    <i class="fas fa-lock text-3xl text-[#60a5fa] lock-icon-anim" id="main-lock-icon"></i>
                </div>
                <div class="absolute top-1/2 left-0 w-full h-1 bg-[#1e293b] -z-0"></div>
                <h3 class="mt-4 text-[#f8fafc] font-black text-sm uppercase tracking-[0.2em]">${sys.headerTitle || "LOCKED"}</h3>
                <p class="text-[#94a3b8] text-[9px] mt-1">${sys.headerSubtitle || "Selesaikan misi untuk buka kunci"}</p>
            </div>
            <div class="mb-6 px-2">
                <div class="flex justify-between text-[9px] font-bold text-[#60a5fa] mb-1"><span>PROGRESS</span><span id="progress-text">0%</span></div>
                <div class="ul-progress-bg"><div class="ul-progress-fill" id="progress-bar"></div></div>
            </div>
            <div class="space-y-2">${tasksHtml}</div>
            <div class="mt-6">
                <button id="final-dl-btn" disabled onclick="window.executeDownload('${id}', '${downloadLink}')" class="w-full py-4 rounded-xl bg-[#020617] border-2 border-[#1e293b] text-[#475569] font-black uppercase text-[12px] tracking-widest cursor-not-allowed transition-all relative overflow-hidden group shadow-inner">
                    <span class="relative z-10 flex items-center justify-center gap-3"><i class="fas fa-lock" id="dl-icon"></i> <span id="dl-text">LOCKED</span></span>
                </button>
            </div>
        </div>`,
        background: '#020617', showConfirmButton: false, showCloseButton: true, allowOutsideClick: false, width: 400,
        customClass: { popup: 'border border-[#334155] rounded-[2rem] shadow-[0_0_60px_rgba(30,58,138,0.2)] pb-6' }
    });
};

window.handleTask = (key, url) => {
    if (window.unlockState[key]) return;
    if (url && url !== "undefined" && url !== "") window.open(url, '_blank');
    window.unlockState[key] = true;
    const card = document.getElementById(`task-${key}`);
    const btn = document.getElementById(`btn-${key}`);
    if (card && btn) {
        card.classList.add('completed');
        btn.innerHTML = '<i class="fas fa-check text-white"></i>';
        btn.className = "w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center shadow-[0_0_10px_#22c55e] border-none";
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
            dlBtn.className = "w-full py-4 rounded-xl bg-gradient-to-r from-[#60a5fa] to-[#2563eb] text-white font-black uppercase text-[12px] tracking-widest shadow-[0_0_20px_rgba(96,165,250,0.4)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer animate-pulse border-none";
            dlIcon.className = "fas fa-download animate-bounce";
            dlText.innerText = "DOWNLOAD FILE";
            playSfx('success');
        }
    }
}

window.executeDownload = (id, link) => { Swal.close(); window.trackDownload(id, link); };

// --- MODAL & FORM HANDLERS (Utility UI) ---
window.openModal = () => { 
    document.getElementById('revModal').classList.remove('hidden'); 
    document.getElementById('revModal').style.display = 'flex'; 
    
    if(window.editingId) {
        document.getElementById('modalTitle').innerText = "Edit Ulasan";
    } else if (window.currentParentId) {
        document.getElementById('modalTitle').innerText = "Balas Ulasan";
    } else {
        document.getElementById('modalTitle').innerText = "Kirim Ulasan";
        
        const savedName = localStorage.getItem('user_name_v4');
        if(savedName) document.getElementById('revName').value = savedName;
        const savedAvatar = localStorage.getItem('user_avatar_v4');
        if(savedAvatar) {
            window.selectedProfileUrl = savedAvatar;
            document.getElementById('profilePreviewImg').src = savedAvatar;
            document.getElementById('profilePreviewContainer').style.display = 'block';
        }
    }
};

window.closeModal = () => { 
    document.getElementById('revModal').classList.add('hidden'); 
    document.getElementById('revModal').style.display = 'none';
    
    window.editingId = null; 
    window.currentParentId = null; 
    
    document.getElementById('revText').value = ""; 
    window.clearImageSelection(); 
};

window.previewImage = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { showToast("File Terlalu Besar (Maks 5MB)", "info"); return; }
        const reader = new FileReader();
        reader.onload = (e) => { 
            document.getElementById('imagePreviewImg').src = e.target.result; 
            document.getElementById('imagePreviewContainer').style.display = 'block'; 
        };
        reader.readAsDataURL(file);
        playSfx('pop');
    }
};

window.previewProfileImage = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) { showToast("Foto profil maks 2MB", "info"); return; }
        const reader = new FileReader();
        reader.onload = (e) => { 
            document.getElementById('profilePreviewImg').src = e.target.result; 
            document.getElementById('profilePreviewContainer').style.display = 'block'; 
        };
        reader.readAsDataURL(file);
        playSfx('pop');
    }
};

window.clearImageSelection = () => { 
    document.getElementById('revFile').value = ""; 
    document.getElementById('imagePreviewImg').src = ""; 
    document.getElementById('imagePreviewContainer').style.display = 'none'; 
    window.selectedImageUrl = null; 
};

window.clearProfileSelection = () => { 
    document.getElementById('revProfileFile').value = ""; 
    document.getElementById('profilePreviewImg').src = ""; 
    document.getElementById('profilePreviewContainer').style.display = 'none'; 
    window.selectedProfileUrl = null; 
    localStorage.removeItem('user_avatar_v4'); 
};

window.shareScriptById = (id) => {
    const script = CONFIG.items.find(x => x.id === id);
    if(!script) return;
    const text = `Cek script keren ini: ${script.title}\nDownload di: ${window.location.href}`;
    if (navigator.share) navigator.share({ title: script.title, text: text, url: window.location.href }).catch(console.error);
    else window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    playSfx('pop');
};

window.updateStarsUI = () => {
    document.querySelectorAll('#starInput span').forEach(x => {
        x.classList.toggle('text-yellow-500', x.dataset.v <= window.selectedStar);
        x.classList.toggle('text-gray-800', x.dataset.v > window.selectedStar);
    });
};

document.querySelectorAll('#starInput span').forEach(s => {
    s.onclick = () => { window.selectedStar = parseInt(s.dataset.v); updateStarsUI(); playSfx('pop'); };
});

window.addEventListener('click', (e) => {
    if (!e.target.closest('.comment-menu-container') && !e.target.closest('.reply-menu-container')) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
    }
});
