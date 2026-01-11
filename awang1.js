import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, update, increment, query, orderByChild, limitToLast, get, startAfter, endBefore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// ====================================================
// AWANG1.JS - Core, Firebase & High Performance Data Engine
// ====================================================

// --- ONESIGNAL INIT (PUSH NOTIFICATION) ---
window.OneSignal = window.OneSignal || [];
OneSignal.push(function() {
    try {
        OneSignal.init({ appId: CONFIG.oneSignal.appId });
        const userUID = localStorage.getItem('user_uid_v4');
        if (userUID) OneSignal.setExternalUserId(userUID);
    } catch (e) { console.warn("OneSignal init skipped"); }
});

// --- FIREBASE INIT ---
const firebaseConfig = CONFIG.firebase;
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messaging = getMessaging(app);
const dbRef = ref(db, 'siteDataV4');

// Export Database untuk dipakai di awang2.js
window.db = db;
window.dbRef = dbRef;
window.messaging = messaging;
window.getToken = getToken;
window.increment = increment;
window.update = update;

// --- GLOBAL STATE ---
window.siteData = { comments: [], totalLikes: 0, visitorCount: 0, scriptLikes: {}, scriptDownloads: {}, dislikes: {} };
window.selectedStar = 5;
window.editingId = null;
window.currentParentId = null;
window.selectedImageUrl = null;
window.selectedProfileUrl = localStorage.getItem('user_avatar_v4') || null;

// --- STATE PAGINATION & SYSTEM ---
window.currentScriptPage = 0;
window.SCRIPTS_PER_PAGE = 5;
window.currentFilteredScripts = null;
window.lastTimestamp = null;
window.isLoadingComments = false;
window.hasMoreComments = false;
window.PAGE_SIZE = 5;
const BAD_WORDS = ["anjing", "bangsat", "kontol", "memek", "asuh", "goblok", "tolol", "bajingan", "kntll", "kntl", "mmk", "meki", "mmek", "anjingg", "anj", "anjj", "asu", "gblk", "puki", "fefek"];

// Flag agar tidak auto-scroll/refresh saat ada update realtime kecil
window.isInitialLoadDone = false; 

// --- USER AUTH ---
if (!localStorage.getItem('user_uid_v4')) {
    localStorage.setItem('user_uid_v4', 'uid_' + Math.random().toString(36).substr(2, 9));
}
window.USER_UID = localStorage.getItem('user_uid_v4');
window.ADMIN_UID = CONFIG.admin.uid;

// --- SMART CACHE & NETWORK OPTIMIZATION ---
// Memuat data dari cache lokal dulu agar tampilan INSTAN, lalu update di background
const cachedData = localStorage.getItem('awang_site_cache');
if (cachedData) {
    try {
        window.siteData = JSON.parse(cachedData);
        // Render awal dari cache (Zero Delay)
        setTimeout(() => { 
            if (typeof window.renderAll === 'function') window.renderAll(); 
        }, 50);
    } catch (e) { console.error("Cache parsing error", e); }
}

window.addEventListener('offline', () => { showToast("Mode Offline: Koneksi terputus", "info"); window.terminalStatus = "OFFLINE"; });
window.addEventListener('online', () => { showToast("Koneksi Kembali Stabil", "success"); window.terminalStatus = "ONLINE"; });

// ====================================================
// LOGIC RENDER STATISTIK (Optimized with RequestAnimationFrame)
// ====================================================
window.renderAll = function() {
    // Menggunakan requestAnimationFrame untuk sinkronisasi dengan refresh rate layar (Anti-Lag)
    requestAnimationFrame(() => {
        // Visitor
        if(document.getElementById('statUsers')) document.getElementById('statUsers').innerText = window.formatK(window.siteData.visitorCount || 0);
        
        // Likes Total
        const comms = window.siteData.comments || [];
        const totalCommLikes = comms.reduce((sum, c) => sum + (c.likes || 0), 0);
        if(document.getElementById('statLikes')) document.getElementById('statLikes').innerText = window.formatK(totalCommLikes);
        
        // Script Count
        if(document.getElementById('statScripts')) document.getElementById('statScripts').innerText = CONFIG.items.length;
        
        // Rating
        const avg = comms.length ? (comms.reduce((a, b) => a + (b.star || 0), 0) / comms.length).toFixed(1) : "0.0";
        if(document.getElementById('statRating')) document.getElementById('statRating').innerText = avg;
        if(document.getElementById('bigRating')) document.getElementById('bigRating').innerText = avg;
        if(document.getElementById('reviewCountText')) document.getElementById('reviewCountText').innerText = `${comms.length} REVIEWS`;
        
        renderRatingBars(comms);
        renderPopuler();

        // LOGIC DISPATCHER SCRIPT RENDER (PENTING)
        // Memanggil fungsi renderScripts di awang2.js yang akan mendistribusikan ke Home atau SC
        if (typeof window.renderScripts === 'function' && !document.getElementById('scriptSearch').value) {
            window.renderScripts(CONFIG.items);
        }
    });
};

function renderRatingBars(comms) {
    const container = document.getElementById('ratingBarsContainer');
    if(!container) return;
    const total = comms.length || 1;
    let html = '';
    for (let i = 5; i >= 1; i--) {
        const count = comms.filter(c => i === c.star).length;
        const perc = (count / total) * 100;
        html += `<div class="flex items-center gap-3"><span class="text-[10px] font-bold w-2">${i}</span><div class="rating-bar-bg"><div class="rating-bar-fill" style="width: ${perc}%"></div></div></div>`;
    }
    container.innerHTML = html;
}

// ====================================================
// SYSTEM KOMENTAR (PERBAIKAN REPLY & MENTION)
// ====================================================

window.fetchFirstPage = async () => {
    window.isLoadingComments = true;
    const snapshot = await get(ref(db, 'siteDataV4/comments'));
    const container = document.getElementById('commentList');
    if(!container) return; // Jika di halaman SC, container ini null, jadi aman
    
    container.innerHTML = ''; 
    
    if (snapshot.exists()) {
        let data = [];
        snapshot.forEach(child => { data.push(child.val()); });
        window.siteData.comments = data;

        // Filter & Sort
        let mainComments = data.filter(c => !c.parentId);
        mainComments.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        const pagedData = mainComments.slice(0, window.PAGE_SIZE);
        window.lastTimestamp = pagedData.length > 0 ? pagedData[pagedData.length - 1].timestamp : null;
        
        renderCommentBatch(pagedData);
        window.hasMoreComments = mainComments.length > window.PAGE_SIZE;
    } else {
        window.hasMoreComments = false;
        container.innerHTML = `<div class="text-center py-10 text-gray-500 text-xs italic">Belum ada ulasan. Jadilah yang pertama!</div>`;
    }
    updatePaginationUI();
    window.isLoadingComments = false;
};

window.fetchNextComments = async () => {
    if (window.isLoadingComments || !window.hasMoreComments) return;
    window.isLoadingComments = true;
    
    // Ambil data terbaru dari state lokal (karena sudah disync via listener)
    // Tidak perlu get() lagi untuk performa, kecuali pagination server-side murni
    const data = window.siteData.comments || [];
    
    let mainComments = data.filter(c => !c.parentId);
    mainComments.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    const currentIndex = mainComments.findIndex(c => c.timestamp === window.lastTimestamp);
    // Jika tidak ketemu index, mungkin data berubah realtime, ambil dari akhir list yang ada
    
    const nextBatch = mainComments.slice(currentIndex + 1, currentIndex + 1 + window.PAGE_SIZE);
    
    if (nextBatch.length > 0) {
        window.lastTimestamp = nextBatch[nextBatch.length - 1].timestamp;
        renderCommentBatch(nextBatch, true);
    }
    window.hasMoreComments = (currentIndex + 1 + window.PAGE_SIZE) < mainComments.length;
    
    updatePaginationUI();
    window.isLoadingComments = false;
    playSfx('pop');
};

function updatePaginationUI() {
    const btn = document.getElementById('toggleCommentsBtn');
    const hideBtn = document.getElementById('hideCommentsBtn');
    const container = document.getElementById('showAllContainer');
    if(!container) return;

    const hasComments = window.siteData.comments && window.siteData.comments.filter(c => !c.parentId).length > window.PAGE_SIZE;
    
    if (hasComments) {
        container.classList.remove('hidden');
        if (!window.hasMoreComments) {
            btn.classList.add('hidden');
            hideBtn.classList.remove('hidden');
        } else {
            btn.classList.remove('hidden');
            hideBtn.classList.add('hidden');
        }
    } else {
        container.classList.add('hidden');
    }
}

window.resetPagination = () => {
    window.lastTimestamp = null;
    window.hasMoreComments = true;
    window.fetchFirstPage();
    document.getElementById('communitySection').scrollIntoView({ behavior: 'smooth' });
};

// --- RENDER LOGIC ---

// Helper: Format Teks dengan Mention yang Benar
window.formatCommentText = (text) => {
    // FIX MENTION: Regex diubah agar menangkap @word lalu memaksa spasi visual
    return text.replace(/@(\w+)/g, '<span class="mention-tag">@$1</span> ');
};

// Helper: Generate HTML untuk Satu Item Komentar/Balasan
window.createSingleCommentHTML = (c, isReply = false) => {
    const myInteractions = JSON.parse(localStorage.getItem('my_ints_v4') || '{}');
    const isCommentDeveloper = (c.uid === window.ADMIN_UID);
    const isMyComment = (c.uid === window.USER_UID);
    const isViewerAdmin = (window.USER_UID === window.ADMIN_UID);
    const userInt = myInteractions[c.id]; 
    const animationStyle = "animation: menuFade 0.6s ease backwards;";
    
    // Avatar
    const avatarStyle = c.userAvatar ? `background-image: url('${c.userAvatar}'); background-size: cover; border: none;` : '';
    const avatarContent = c.userAvatar ? '' : (c.name ? c.name.charAt(0).toUpperCase() : '?');

    // Text formatting
    const formattedText = window.formatCommentText(c.text);

    // Stars (Only for main comments)
    let stars = '';
    if(!isReply) {
        for(let i=1; i<=5; i++) stars += `<i class="fas fa-star text-[8px] ${i <= (c.star || 0) ? 'star-active' : 'star-inactive'}"></i>`;
    }

    // Buttons ID Prefix
    const pfx = isReply ? 'rep' : 'cnt';
    const btnSize = isReply ? 'text-[9px]' : 'text-[10px]';
    
    if(isReply) {
        return `
        <div class="reply-item flex gap-3 mb-2 relative" id="comment-${c.id}" style="${animationStyle}">
            <div class="w-8 h-8 rounded-full border border-white/10 flex-shrink-0 bg-blue-900 flex items-center justify-center text-[10px] font-bold relative" style="${avatarStyle}">
                ${avatarContent}
                ${c.adminLoved ? `<div class="admin-love-badge" style="width:12px; height:12px; bottom:-1px; right:-1px;"><i class="fas fa-heart" style="font-size:6px;"></i></div>` : ''}
            </div>
            <div class="bg-white/5 p-3 rounded-2xl flex-1 border border-white/5">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-[10px] font-black flex items-center ${isCommentDeveloper ? 'text-blue-400' : 'text-gray-400'}">
                        ${c.name} ${isCommentDeveloper ? '<span class="dev-badge" style="font-size:6px; padding:1px 4px;">Developer</span>' : ''}
                    </span>
                    <span class="text-[7px] timestamp-text uppercase font-bold" style="margin-right: 25px;">${window.formatDate(c.timestamp)}</span>
                </div>
                <p class="text-[12px] text-gray-300 mb-1 pr-2 leading-relaxed">${formattedText}</p>
                ${c.isEdited ? '<div class="edited-label mb-2" style="margin-left:0">(Di edit)</div>' : ''}
                ${c.imageUrl ? `<img src="${c.imageUrl}" onclick="openLightbox('${c.imageUrl}')" class="comment-image mb-3">` : ''}
                <div class="flex gap-4 items-center">
                    <button id="btn-like-${c.id}" onclick="handleEngagement('${c.id}', 'like', '${pfx}-like-${c.id}')" class="${btnSize} font-black ${userInt === 'like' ? 'text-blue-400' : 'text-gray-500'}"><i class="fas fa-thumbs-up"></i> <span id="${pfx}-like-${c.id}">${c.likes || 0}</span></button>
                    <button id="btn-dislike-${c.id}" onclick="handleEngagement('${c.id}', 'dislike', '${pfx}-dislike-${c.id}')" class="${btnSize} font-black ${userInt === 'dislike' ? 'text-red-400' : 'text-gray-500'}"><i class="fas fa-thumbs-down"></i> <span id="${pfx}-dislike-${c.id}">${c.dislikes || 0}</span></button>
                    <button onclick="replyComment('${c.parentId}', '${c.name.replace(/\s+/g, '')}')" class="text-[8px] text-gray-600 font-black uppercase">Balas</button>
                </div>
            </div>
            <div class="reply-menu-container">
                <div class="dot-menu-btn" onclick="toggleCommentMenu('${c.id}')" style="width:24px; height:24px;"><i class="fas fa-ellipsis-v text-[10px]"></i></div>
                <div class="dropdown-menu" id="menu-${c.id}">
                    ${isMyComment ? `<div class="dropdown-item" onclick="editComment('${c.id}')"><i class="fas fa-edit"></i> Edit</div>` : ''}
                    ${isViewerAdmin ? `<div class="dropdown-item" onclick="loveComment('${c.id}')"><i class="fas fa-heart text-red-500"></i> ${c.adminLoved ? 'Unlove' : 'Love'}</div>` : ''}
                    ${(isMyComment || isViewerAdmin) ? `<div class="dropdown-item danger" onclick="deleteComment('${c.id}')"><i class="fas fa-trash-alt"></i> Hapus</div>` : ''}
                    <div class="dropdown-item" onclick="showToast('Laporan Terkirim', 'info')"><i class="fas fa-flag"></i> Lapor</div>
                </div>
            </div>
        </div>`;
    } else {
        // Main Comment
        const pinnedBadge = c.isPinned ? '<div class="pinned-badge"><i class="fas fa-thumbtack"></i> Disematkan oleh Awang</div>' : '';
        return `
        <div class="comment-wrapper" id="comment-${c.id}" style="${animationStyle}">
            <div class="comment-main">
                <div class="avatar-container">
                    <div class="avatar-img flex items-center justify-center text-white font-black text-sm" style="${avatarStyle}">
                        ${avatarContent}
                    </div>
                    ${c.adminLoved ? `<div class="admin-love-badge"><i class="fas fa-heart"></i></div>` : ''}
                </div>
                <div class="flex-1">
                    ${pinnedBadge}
                    <div class="flex items-center justify-between mb-0.5">
                        <span class="font-black text-xs flex items-center ${isCommentDeveloper ? 'text-blue-400' : 'text-gray-200'}">
                            ${c.name} ${isCommentDeveloper ? '<span class="dev-badge">Developer</span>' : ''}
                        </span>
                        <span class="text-[8px] timestamp-text font-bold uppercase tracking-tighter">${window.formatDate(c.timestamp)}</span>
                    </div>
                    <div class="flex items-center mb-2">
                        ${stars}
                        ${c.isEdited ? '<span class="edited-label">(Di edit)</span>' : ''}
                    </div>
                    <p class="text-gray-300 text-[12px] home-snug mb-2 pr-4 leading-relaxed">${formattedText}</p>
                    ${c.imageUrl ? `<img src="${c.imageUrl}" onclick="openLightbox('${c.imageUrl}')" class="comment-image mb-3">` : ''}
                    
                    <div class="flex items-center gap-5">
                        <button id="btn-like-${c.id}" onclick="handleEngagement('${c.id}', 'like', '${pfx}-like-${c.id}')" class="eng-btn flex items-center gap-1.5 text-[10px] font-black ${userInt === 'like' ? 'text-blue-400' : 'text-gray-500'}">
                            <i class="${userInt === 'like' ? 'fas' : 'far'} fa-thumbs-up"></i> <span id="${pfx}-like-${c.id}">${c.likes || 0}</span>
                        </button>
                        <button id="btn-dislike-${c.id}" onclick="handleEngagement('${c.id}', 'dislike', '${pfx}-dislike-${c.id}')" class="eng-btn flex items-center gap-1.5 text-[10px] font-black ${userInt === 'dislike' ? 'text-red-400' : 'text-gray-500'}">
                            <i class="${userInt === 'dislike' ? 'fas' : 'far'} fa-thumbs-down"></i> <span id="${pfx}-dislike-${c.id}">${c.dislikes || 0}</span>
                        </button>
                        <button onclick="replyComment('${c.id}', '${c.name.replace(/\s+/g, '')}')" class="eng-btn text-gray-400 text-[10px] font-black uppercase hover:text-white">Balas</button>
                    </div>
                </div>
            </div>

            <div class="comment-menu-container">
                <div class="dot-menu-btn" onclick="toggleCommentMenu('${c.id}')"><i class="fas fa-ellipsis-v text-xs"></i></div>
                <div class="dropdown-menu" id="menu-${c.id}">
                    ${isMyComment ? `<div class="dropdown-item" onclick="editComment('${c.id}')"><i class="fas fa-edit"></i> Edit</div>` : ''}
                    ${isViewerAdmin ? `<div class="dropdown-item" onclick="loveComment('${c.id}')"><i class="fas fa-heart text-red-500"></i> ${c.adminLoved ? 'Unlove' : 'Love'}</div>` : ''}
                    ${isViewerAdmin ? `<div class="dropdown-item" onclick="pinComment('${c.id}')"><i class="fas fa-thumbtack text-blue-500"></i> ${c.isPinned ? 'Lepas Semat' : 'Sematkan'}</div>` : ''}
                    ${(isMyComment || isViewerAdmin) ? `<div class="dropdown-item danger" onclick="deleteComment('${c.id}')"><i class="fas fa-trash-alt"></i> Hapus</div>` : ''}
                    <div class="dropdown-item" onclick="showToast('Laporan Terkirim', 'info')"><i class="fas fa-flag"></i> Lapor</div>
                </div>
            </div>
            
            <div id="reply-toggle-${c.id}"></div>
            <div id="replies-${c.id}" class="reply-section hidden"></div>
        </div>`;
    }
};

function renderCommentBatch(batch, append = false) {
    const container = document.getElementById('commentList');
    const allComments = Array.isArray(window.siteData.comments) ? window.siteData.comments : [];
    
    // Kita render parent dulu
    let html = batch.map(c => {
        let parentHtml = window.createSingleCommentHTML(c, false);
        return parentHtml;
    }).join('');

    // Masukkan ke DOM
    if (append) container.innerHTML += html;
    else container.innerHTML = html;

    // Sekarang render balasan untuk setiap parent yang baru dirender
    batch.forEach(c => {
        const relevantReps = allComments.filter(r => r.parentId === c.id)
            .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        if (relevantReps.length > 0) {
            // Tombol Toggle
            const toggleDiv = document.getElementById(`reply-toggle-${c.id}`);
            if(toggleDiv) {
                toggleDiv.innerHTML = `
                <div class="reply-toggle-btn" onclick="toggleReplies('${c.id}')">
                    <i class="fas fa-caret-down"></i> Lihat ${relevantReps.length} Balasan
                </div>`;
            }

            // Isi Balasan
            const replyContainer = document.getElementById(`replies-${c.id}`);
            if(replyContainer) {
                const repliesHtml = relevantReps.map(r => window.createSingleCommentHTML(r, true)).join('');
                replyContainer.innerHTML = repliesHtml;
            }
        }
    });
}

function renderPopuler() {
    const container = document.getElementById('populerList');
    if(!container) return;
    const data = (window.siteData.comments || []).filter(c => (c.likes || 0) >= 20).sort((a,b) => b.likes - a.likes).slice(0, 5);
    if(data.length > 0) {
        document.getElementById('populerContainer').classList.remove('hidden');
        container.innerHTML = data.map(c => `
        <div class="populer-card">
            <div class="flex gap-4">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-black text-xl border border-white/20" style="${c.userAvatar ? `background-image:url('${c.userAvatar}'); background-size:cover; border:none;` : ''}">${c.userAvatar ? '' : (c.name ? c.name.charAt(0).toUpperCase() : '?')}</div>
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <div class="font-black text-sm text-white">${c.name}</div>
                        <i class="fas fa-crown text-yellow-500 text-xs animate-bounce"></i>
                    </div>
                    <div class="flex text-pink-500 text-[9px] font-black gap-1 mt-1 uppercase tracking-tighter"><i class="fas fa-heart"></i> ${c.likes} Likes</div>
                    <p class="text-[11px] text-blue-100 mt-2 line-clamp-2 leading-relaxed italic">"${c.text}"</p>
                </div>
            </div>
        </div>`).join('');
        if(window.updateScrollDots) window.updateScrollDots('populerList', 'populerDots');
    } else { document.getElementById('populerContainer').classList.add('hidden'); }
}

// --- POST REVIEW LOGIC (PERBAIKAN TOTAL DI SINI) ---
window.postReview = async () => {
    const nameInput = document.getElementById('revName').value.trim();
    const textInput = document.getElementById('revText').value.trim();
    const hpValue = document.getElementById('hp_user_check').value;
    const fileInput = document.getElementById('revFile');
    const profileFileInput = document.getElementById('revProfileFile');
    const imageFile = fileInput.files[0];
    const profileFile = profileFileInput.files[0];
    
    if (hpValue !== "") return;
    if(!textInput || textInput.length < 3) {
        showToast("Pesan terlalu pendek!", "info");
        return;
    }
    
    const hasBadWord = BAD_WORDS.some(word => textInput.toLowerCase().includes(word));
    if (hasBadWord) {
        showToast("Dilarang menggunakan kata kasar!", "info");
        return;
    }

    const submitBtn = document.getElementById('submitReviewBtn');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "SEDANG MENGUPLOAD...";
    submitBtn.disabled = true;

    try {
        let finalImageUrl = window.selectedImageUrl; 
        let finalProfileUrl = window.selectedProfileUrl; 

        if (profileFile) {
            showToast("Mengunggah foto profil...", "info");
            const uploadedProf = await window.uploadToCloudinary(profileFile);
            if (uploadedProf) finalProfileUrl = uploadedProf;
        }

        if (imageFile) {
            showToast("Mengunggah gambar ulasan...", "info");
            finalImageUrl = await window.uploadToCloudinary(imageFile);
            if (!finalImageUrl) throw new Error("Gagal mengunggah gambar.");
        }

        const name = nameInput || "User_" + Math.floor(Math.random() * 999);
        const currentData = Array.isArray(window.siteData.comments) ? window.siteData.comments : [];
        let updated = [...currentData];
        let newCommentObj = null;

        if(window.editingId) {
            updated = updated.map(c => c.id === window.editingId ? {
                ...c, 
                name: name, 
                text: textInput, 
                star: window.selectedStar, 
                imageUrl: finalImageUrl,
                userAvatar: finalProfileUrl,
                isEdited: true 
            } : c);
        } else {
            const now = new Date();
            const newId = 'rev_' + now.getTime();
            newCommentObj = { 
                id: newId, 
                uid: window.USER_UID, 
                parentId: window.currentParentId || null, 
                name: name, 
                text: textInput, 
                imageUrl: finalImageUrl,
                userAvatar: finalProfileUrl,
                star: window.currentParentId ? 5 : window.selectedStar, 
                likes: 0, 
                dislikes: 0, 
                adminLoved: false, 
                isPinned: false,
                isEdited: false,
                timestamp: now.toISOString() 
            };
            updated.push(newCommentObj);
            localStorage.setItem('user_name_v4', name);
            localStorage.setItem('user_avatar_v4', finalProfileUrl || "");
            window.selectedProfileUrl = finalProfileUrl;
            
            // Notification Logic
            let targetUserUID = null;
            if (window.currentParentId) {
                const parentComment = currentData.find(c => c.id === window.currentParentId);
                if (parentComment) targetUserUID = parentComment.uid;
            }
            
            const appId = CONFIG.oneSignal.appId;
            const apiKey = CONFIG.oneSignal.restApiKey;
            let notificationTarget = targetUserUID && targetUserUID !== window.USER_UID 
                ? { "include_external_user_ids": [targetUserUID] }
                : { "included_segments": ["Total Subscriptions"] };
                
            // Send Notification (Fire & Forget)
            fetch("https://onesignal.com/api/v1_1/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8", "Authorization": "Basic " + apiKey },
                body: JSON.stringify({
                    app_id: appId,
                    ...notificationTarget,
                    headings: {"en": window.currentParentId ? `Komentar Anda dibalas oleh ${name}!` : `Ulasan Baru dari ${name}!`},
                    contents: {"en": textInput.substring(0, 100) + (textInput.length > 100 ? "..." : "")},
                    url: window.location.href
                })
            }).catch(e => console.error("Notification trigger failed", e));
        }

        // UPDATE FIREBASE (Await agar pasti masuk db dulu)
        await update(dbRef, { comments: updated });
        showToast(window.editingId ? "Ulasan diperbarui" : "Ulasan terkirim", "success");
        
        // Simpan parent ID sebelum di-null-kan untuk logic injeksi realtime
        const justRepliedParentId = window.currentParentId;
        
        window.editingId = null;
        window.closeModal(); 
        playSfx('success');
        
        // --- LOGIC REFRESH PINTAR & TAMPILKAN BALASAN OTOMATIS ---
        if (justRepliedParentId && newCommentObj) {
            // Jika ini balasan (reply)
            const replyContainer = document.getElementById(`replies-${justRepliedParentId}`);
            const toggleContainer = document.getElementById(`reply-toggle-${justRepliedParentId}`);
            
            if (replyContainer) {
                // 1. Tambah HTML Balasan Baru ke Container
                const newReplyHtml = window.createSingleCommentHTML(newCommentObj, true);
                replyContainer.innerHTML += newReplyHtml; 
                replyContainer.classList.remove('hidden'); // Wajib: Hapus class hidden agar langsung muncul
                
                // 2. Update Label Tombol "Lihat X Balasan"
                const currentCount = replyContainer.children.length;
                if (toggleContainer) {
                    toggleContainer.innerHTML = `
                        <div class="reply-toggle-btn" onclick="toggleReplies('${justRepliedParentId}')">
                            <i class="fas fa-caret-down"></i> Lihat ${currentCount} Balasan
                        </div>`;
                }
            }
        } else {
            // Jika komentar utama (Main Comment), refresh halaman pertama agar muncul paling atas
            setTimeout(() => window.fetchFirstPage(), 300);
        }

    } catch (error) {
        showToast(error.message || "Terjadi kesalahan sistem", "info");
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
};
