import { onValue, update, increment, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getToken } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// ====================================================
// AWANG2.JS - Core Interaction & Dispatcher System
// (Updated: Delegasi Rendering Cerdas ke script_home.js & script_sc.js)
// ====================================================

// --- INTERACTION HANDLERS (Like, Reply, Delete, etc) ---

window.toggleCommentMenu = (id) => {
    const allMenus = document.querySelectorAll('.dropdown-menu');
    const targetMenu = document.getElementById(`menu-${id}`);
    const isActive = targetMenu.classList.contains('active');
    allMenus.forEach(m => m.classList.remove('active'));
    if (!isActive) targetMenu.classList.add('active');
    playSfx('pop');
};

window.toggleReplies = (id) => {
    const el = document.getElementById(`replies-${id}`);
    if (el) {
        el.classList.toggle('hidden');
        playSfx('pop');
    }
};

window.handleEngagement = (id, type, counterId) => {
    let myInts = JSON.parse(localStorage.getItem('my_ints_v4') || '{}');
    let targetComment = null;
    
    // Optimistic UI Update (Update tampilan dulu sebelum ke server biar cepat/Instan)
    const updated = (window.siteData.comments || []).map(c => {
        if(c.id === id) {
            targetComment = c;
            if(myInts[id] === type) {
                // Jika sudah di-like/dislike, batalkan (toggle off)
                c[type === 'like' ? 'likes' : 'dislikes'] = Math.max(0, (c[type === 'like' ? 'likes' : 'dislikes'] || 0) - 1);
                delete myInts[id];
            } else {
                // Jika ganti dari like ke dislike atau sebaliknya
                if(myInts[id]) {
                    const prevType = myInts[id];
                    c[prevType === 'like' ? 'likes' : 'dislikes'] = Math.max(0, (c[prevType === 'like' ? 'likes' : 'dislikes'] || 0) - 1);
                }
                // Tambahkan like/dislike baru
                c[type === 'like' ? 'likes' : 'dislikes'] = (c[type === 'like' ? 'likes' : 'dislikes'] || 0) + 1;
                myInts[id] = type;
            }
        }
        return c;
    });

    // DOM Update (Manipulasi langsung elemen HTML agar user merasa responsif)
    if (targetComment) {
        const isReply = counterId.startsWith('rep');
        const prefix = isReply ? 'rep' : 'cnt';
        const likeCountEl = document.getElementById(`${prefix}-like-${id}`);
        const dislikeCountEl = document.getElementById(`${prefix}-dislike-${id}`);
        const likeBtn = document.getElementById(`btn-like-${id}`);
        const dislikeBtn = document.getElementById(`btn-dislike-${id}`);

        if (likeCountEl) likeCountEl.innerText = targetComment.likes || 0;
        if (dislikeCountEl) dislikeCountEl.innerText = targetComment.dislikes || 0;

        if (likeBtn && dislikeBtn) {
            // Update warna tombol
            if(isReply) {
                 likeBtn.className = `text-[9px] font-black ${myInts[id] === 'like' ? 'text-blue-400' : 'text-gray-500'}`;
                 dislikeBtn.className = `text-[9px] font-black ${myInts[id] === 'dislike' ? 'text-red-400' : 'text-gray-500'}`;
            } else {
                 likeBtn.className = `eng-btn flex items-center gap-1.5 text-[10px] font-black ${myInts[id] === 'like' ? 'text-blue-400' : 'text-gray-500'}`;
                 dislikeBtn.className = `eng-btn flex items-center gap-1.5 text-[10px] font-black ${myInts[id] === 'dislike' ? 'text-red-400' : 'text-gray-500'}`;
            }
            
            // Update Icon (Solid vs Outline)
            likeBtn.querySelector('i').className = `${myInts[id] === 'like' ? 'fas' : 'far'} fa-thumbs-up`;
            dislikeBtn.querySelector('i').className = `${myInts[id] === 'dislike' ? 'fas' : 'far'} fa-thumbs-down`;
        }
    }

    // Simpan ke LocalStorage dan Firebase (Background Process)
    localStorage.setItem('my_ints_v4', JSON.stringify(myInts));
    update(window.dbRef, { comments: updated });
    showToast(type === 'like' ? "Ulasan disukai" : "Ulasan tidak disukai", "info");
    playSfx('pop');
};

window.loveComment = (id) => {
    // Fitur Admin: Memberikan tanda "Love" pada komentar
    const updated = (window.siteData.comments || []).map(c => {
        if(c.id === id) c.adminLoved = !c.adminLoved;
        return c;
    });
    update(window.dbRef, { comments: updated });
    showToast("Status Love Diperbarui", "success");
    playSfx('success');
};

window.pinComment = (id) => {
    // Fitur Admin: Menyematkan komentar di paling atas
    const updated = (window.siteData.comments || []).map(c => {
        if(c.id === id) c.isPinned = !c.isPinned;
        else if(!c.parentId) c.isPinned = false; // Hanya satu yang bisa dipin
        return c;
    });
    update(window.dbRef, { comments: updated });
    showToast("Status Semat Diperbarui", "success");
    playSfx('success');
    setTimeout(() => window.fetchFirstPage(), 300);
};

window.deleteComment = (id) => {
    Swal.fire({ title: 'Hapus?', text: "Pesan Anda akan hilang selamanya.", icon: 'warning', background: '#0d1425', color: '#fff', showCancelButton: true, confirmButtonColor: '#3b82f6', confirmButtonText: 'Ya, Hapus' }).then(res => {
        if(res.isConfirmed) {
            const updated = (window.siteData.comments || []).filter(c => c.id !== id && c.parentId !== id);
            update(window.dbRef, { comments: updated });
            showToast("Ulasan berhasil dihapus", "info");
            playSfx('pop');
            setTimeout(() => window.fetchFirstPage(), 500); 
        }
    });
};

window.replyComment = (parentId, name) => {
    window.currentParentId = parentId; 
    document.getElementById('revText').value = `@${name} `; 
    window.openModal();
    document.getElementById('modalTitle').innerText = "Balas Ulasan";
    const txtArea = document.getElementById('revText');
    txtArea.focus();
    // Taruh kursor di akhir text
    txtArea.setSelectionRange(txtArea.value.length, txtArea.value.length);
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
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(window.messaging, { vapidKey: 'BIsyB_HhO4Q5T7Kx_8V4T0N4H_M-YOUR_PUBLIC_VAPID_KEY_HERE' });
            if (token) {
                const tokenRef = ref(window.db, `siteDataV4/tokens/${window.USER_UID}`);
                await update(tokenRef, { token: token, lastUpdated: new Date().toISOString() });
            }
        }
    } catch (error) { console.log("Notif Error:", error); }
}

// --- SCRIPT SYSTEM (UPDATED: DISPATCHER LOGIC) ---

window.filterScripts = () => {
    const q = document.getElementById('scriptSearch').value;
    
    // Jika search kosong, kembalikan ke tampilan default masing-masing halaman
    if(!q) { 
        window.currentFilteredScripts = null; 
        window.renderScripts(CONFIG.items); 
        return; 
    }

    // Fuse Search Logic (Pencarian Fuzzy/Cerdas)
    const options = { keys: ['title', 'description', 'tags'], threshold: 0.4, distance: 50 };
    const fuse = new Fuse(CONFIG.items, options);
    const result = fuse.search(q);
    window.currentFilteredScripts = result.map(r => r.item); 
    
    // Render hasil search ke halaman yang aktif
    window.renderScripts(window.currentFilteredScripts);
};

window.trackDownload = (index, downloadUrl) => {
    // Increment counter di Firebase
    const updates = {};
    updates[`scriptDownloads/${index}`] = increment(1); 
    
    update(window.dbRef, updates).then(() => {
        showToast("Membuka tautan download...", "success");
        window.open(downloadUrl, '_blank');
    }).catch((e) => {
        console.warn("Tracking failed, opening anyway", e);
        window.open(downloadUrl, '_blank');
    });
};

// Global Helper untuk Youtube Stats (Dipakai oleh script_home.js & script_sc.js)
window.fetchYoutubeData = async (url, id, fallbackTitle, fallbackDesc) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        const videoId = match[2];
        try {
            // Cek apakah API Key ada sebelum fetch untuk menghindari error 400
            if (!CONFIG.firebase.apiKey) return;
            
            const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${CONFIG.firebase.apiKey}`);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const stat = data.items[0].statistics;
                const vEl = document.getElementById(`views-${id}`);
                const lEl = document.getElementById(`likes-${id}`);
                if(vEl) vEl.innerHTML = `<i class="fas fa-eye stat-icon-view"></i> ${window.formatK(stat.viewCount)}`;
                if(lEl) lEl.innerHTML = `<i class="fas fa-thumbs-up stat-icon-like"></i> ${window.formatK(stat.likeCount)}`;
            }
        } catch (e) { 
            // Silent error agar tidak mengganggu UX
        }
    }
};

// --- MAIN DISPATCHER RENDER FUNCTION (SMART RENDERER) ---
// Ini fungsi vital yang membedakan apakah kita sedang di Home atau di SC Page
// Inilah solusi untuk masalah "Slider Blank" saat salah render
window.renderScripts = (data) => {
    const list = document.getElementById('scriptList');
    if(!list) return;
    
    // Deteksi cerdas berdasarkan class container
    if(list.classList.contains('script-grid-view')) {
        // === HALAMAN SC (GRID) ===
        // Panggil logika render dari script_sc.js
        if (typeof window.renderScPageScripts === 'function') {
            window.renderScPageScripts(data);
        } else {
            console.log("Menunggu script_sc.js dimuat...");
        }
    } else {
        // === HALAMAN HOME (SLIDER) ===
        // Panggil logika render dari script_home.js
        if (typeof window.renderHomeScripts === 'function') {
            window.renderHomeScripts(data);
        } else {
            console.log("Menunggu script_home.js dimuat...");
        }
    }
};

// --- MODAL & FORM HANDLERS (Utility UI) ---
window.openModal = () => { 
    document.getElementById('revModal').classList.remove('hidden'); 
    document.getElementById('modalTitle').innerText = window.editingId ? "Edit Ulasan" : (window.currentParentId ? "Balas Ulasan" : "Kirim Ulasan"); 
};

window.closeModal = () => { 
    document.getElementById('revModal').classList.add('hidden'); 
    window.editingId = null; 
    window.currentParentId = null; 
    document.getElementById('revText').value = ""; 
    window.clearImageSelection(); 
    window.clearProfileSelection();
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

// Event Listeners untuk Bintang
document.querySelectorAll('#starInput span').forEach(s => {
    s.onclick = () => { window.selectedStar = parseInt(s.dataset.v); updateStarsUI(); playSfx('pop'); };
});

// Event Listeners untuk menutup menu saat klik di luar
window.addEventListener('click', (e) => {
    if (!e.target.closest('.comment-menu-container') && !e.target.closest('.reply-menu-container')) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
    }
});

// --- REALTIME LISTENER (Firebase Data Sync) ---
onValue(window.dbRef, (snap) => {
    try {
        const loader = document.getElementById('loader-wrapper');
        const bar = document.getElementById('loader-bar-fill');
        
        if(snap.exists()) {
            const val = snap.val();
            window.siteData.comments = val.comments || [];
            window.siteData.scriptDownloads = val.scriptDownloads || {};
            window.siteData.scriptLikes = val.scriptLikes || {};
            window.siteData.visitorCount = val.visitorCount || 0;
            localStorage.setItem('awang_site_cache', JSON.stringify(window.siteData));
        }

        // 1. Render Statistik & Komentar
        if(window.renderAll) window.renderAll();

        // 2. Load Komentar (Khusus Home agar tidak auto-load di SC)
        const isScriptPage = window.location.pathname.includes('sc.html') || window.location.href.includes('/sc');
        if (!window.isInitialLoadDone && !isScriptPage) {
            window.fetchFirstPage(); 
            window.isInitialLoadDone = true;
        }
        
        // 3. Panggil Dispatcher Render Script (CRUCIAL FIX)
        // Pastikan renderScripts dipanggil saat data masuk agar slider/grid terisi
        if (typeof window.renderScripts === 'function' && !document.getElementById('scriptSearch').value) {
            window.renderScripts(CONFIG.items);
        }

        // Hapus Loader dengan Animasi Halus
        if(bar) bar.style.width = '100%';
        setTimeout(() => {
            if(loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }
        }, 500);

    } catch (err) {
        console.error("Render Error:", err);
        // Fail-safe: hilangkan loader jika error agar user tidak stuck
        const ldr = document.getElementById('loader-wrapper');
        if(ldr) ldr.style.display = 'none';
    }
}, (error) => {
    console.error("Firebase Read Error:", error);
    document.getElementById('loader-wrapper').style.display = 'none';
    showToast("Gagal memuat data dari database", "info");
});
