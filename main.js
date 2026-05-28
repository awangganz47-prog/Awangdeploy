import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = e => {
    if(e.keyCode==123 || (e.ctrlKey && e.shiftKey && (e.keyCode==73||e.keyCode==67||e.keyCode==74)) || (e.ctrlKey && e.keyCode==85)) return false;
}

let _savedScrollY = 0;
window.addEventListener('scroll', () => {
    _savedScrollY = window.scrollY;
}, { passive: true });
window.addEventListener('message', (e) => {
    const isSpotify = e.origin === 'https://open.spotify.com' ||
        (typeof e.data === 'string' && e.data.toLowerCase().includes('spotify')) ||
        (e.data && typeof e.data === 'object' && JSON.stringify(e.data).toLowerCase().includes('spotify'));
    if (isSpotify) {
        requestAnimationFrame(() => {
            window.scrollTo({ top: _savedScrollY, behavior: 'instant' });
        });
    }
}, false);
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if(splash) {
            splash.classList.add('hide-splash');
        }
    }, 2800);
});
const getBgStyle = (theme) => {
    if(config.background && config.background !== "") {
        if(theme === 'light') {
            return `linear-gradient(rgba(245, 245, 245, 0.80), rgba(245, 245, 245, 0.90)), url('${config.background}')`;
        } else {
            return `linear-gradient(rgba(10, 10, 10, 0.80), rgba(10, 10, 10, 0.90)), url('${config.background}')`;
        }
    } else {
        if(theme === 'light') {
            return `linear-gradient(135deg, #e6e6e6 0%, #ffffff 100%)`;
        } else {
            return `linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)`;
        }
    }
};

const themeBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const bgBase = document.getElementById('bg-base');
const currentTheme = localStorage.getItem('theme') || 'dark';

if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if(themeIcon) themeIcon.className = 'fas fa-sun';
}
if(bgBase) bgBase.style.backgroundImage = getBgStyle(currentTheme);

function executeThemeChange(newTheme) {
    if (newTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
    }
    if(bgBase) bgBase.style.backgroundImage = getBgStyle(newTheme);
}

if(themeBtn) {
    themeBtn.addEventListener('click', () => {
        const isCurrentlyLight = document.documentElement.hasAttribute('data-theme');
        const newTheme = isCurrentlyLight ? 'dark' : 'light';

        themeBtn.classList.add('rotating');

        setTimeout(() => {
            if(themeIcon) themeIcon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        }, 200);

        setTimeout(() => themeBtn.classList.remove('rotating'), 600);

        if (!document.startViewTransition) {
            executeThemeChange(newTheme);
            return;
        }

        document.documentElement.classList.add('is-transitioning');

        const transition = document.startViewTransition(() => {
            executeThemeChange(newTheme);
        });

        transition.ready.then(() => {
            const x = window.innerWidth / 2;
            const y = window.innerHeight / 2;
            const endRadius = Math.hypot(x, y);

            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`
                    ]
                },
                {
                    duration: 800,
                    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
                    pseudoElement: '::view-transition-new(root)'
                }
            );
        });

        transition.finished.then(() => {
            document.documentElement.classList.remove('is-transitioning');
        });
    });
}

const formatK = (num) => {
    if (!num) return "0";
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
};

const app = initializeApp(config.firebaseConfig);
const db = getDatabase(app);
const viewsRef = ref(db, 'stats/views');
const likesRef = ref(db, 'stats/likes');

if (!sessionStorage.getItem('viewed')) {
    runTransaction(viewsRef, v => (v||0)+1).then(() => sessionStorage.setItem('viewed', 'true'));
}

onValue(viewsRef, s => {
    const el = document.getElementById('viewCount');
    if(el) el.innerText = formatK(s.val() || 0);
});
onValue(likesRef, s => {
    const el = document.getElementById('likeCount');
    if(el) el.innerText = formatK(s.val() || 0);
});
const likeBtn = document.getElementById('likeBtn');
const likeIcon = document.getElementById('likeIcon');

if(likeBtn && likeIcon) {
    if(localStorage.getItem('liked') === 'true') {
        likeIcon.className = 'fas fa-heart text-red';
        likeBtn.style.color = 'var(--text-primary)';
    }
    likeBtn.onclick = () => {
        const isLiked = localStorage.getItem('liked') === 'true';
        runTransaction(likesRef, v => isLiked ? (v||0)-1 : (v||0)+1);
        localStorage.setItem('liked', !isLiked);
        likeIcon.className = !isLiked ? 'fas fa-heart text-red' : 'far fa-heart';
        likeBtn.style.color = !isLiked ? 'var(--text-primary)' : 'var(--primary-gold)';
    }
}

const bannerContainer = document.getElementById('bannerContainer');
if(bannerContainer && config.bannerMedia) {
    if(config.bannerMedia.type === 'video') {
        bannerContainer.innerHTML = `<video src="${config.bannerMedia.url}" class="banner-media" autoplay loop muted playsinline></video>`;
    } else {
        bannerContainer.innerHTML = `<img src="${config.bannerMedia.url}" class="banner-media" loading="lazy" alt="Banner">`;
    }
}

const elWebName = document.getElementById('webName');
const elWebDesc = document.getElementById('webDesc');
const elFooterName = document.getElementById('footerName');
const elProfileImg = document.getElementById('profileImg');
const elVerifiedBadge = document.getElementById('verifiedBadge');
if(elWebName) elWebName.innerText = config.name;
if(elWebDesc) elWebDesc.innerText = config.description;
if(elFooterName) elFooterName.innerText = config.name;
if(elProfileImg) elProfileImg.src = config.profileUrl;
if(elVerifiedBadge && config.verified) elVerifiedBadge.style.display = "inline-block";

const marqueeEl = document.getElementById('marqueeText');
if(marqueeEl && config.runningText) {
    marqueeEl.innerText = config.runningText;
}

const tagsCont = document.getElementById('profileTags');
if(tagsCont && config.profileTags) {
    tagsCont.innerHTML = '';
    config.profileTags.forEach(tag => tagsCont.innerHTML += `<div class="profile-tag"><i class="${tag.icon}"></i><span>${tag.label}</span></div>`);
}

const socCont = document.getElementById('socialLinks');
if(socCont && config.socialMedia) {
    socCont.innerHTML = '';
    config.socialMedia.forEach(s => socCont.innerHTML += `<a href="${s.url}" target="_blank" class="soc-icon"><i class="${s.icon}"></i></a>`);
}

const linkCont = document.getElementById('linkContainer');
if(linkCont && config.menus) {
    linkCont.innerHTML = '';
    config.menus.forEach(m => {
        if(m.header) linkCont.innerHTML += `<div class="menu-category">${m.header}</div>`;
        else linkCont.innerHTML += `<a href="${m.url}" target="_blank" class="menu-card"><div class="menu-icon"><i class="${m.icon}"></i></div><div class="menu-text"><h4>${m.title}</h4><p>${m.description}</p></div><i class="fas fa-chevron-right menu-arrow"></i></a>`;
    });
}

const spotifyWidget = document.getElementById('spotifyWidget');
if(spotifyWidget && config.spotifyPlaylistUrl) {
    spotifyWidget.src = config.spotifyPlaylistUrl;
}

const track = document.getElementById('sliderTrack');
const sliderClip = document.querySelector('.slider-outer-clip');
let isUserInteracting = false;

if(track && sliderClip && config.sliderImages) {
    const allImages = [...config.sliderImages, ...config.sliderImages];
    allImages.forEach(src => track.innerHTML += `<img src="${src}" class="slide-img" loading="lazy">`);
    let scrollSpeed = 0.5;
    function autoScroll() {
        if (!isUserInteracting) {
            sliderClip.scrollLeft += scrollSpeed;
            if(sliderClip.scrollLeft >= (sliderClip.scrollWidth - sliderClip.clientWidth - 10)) sliderClip.scrollLeft = 0;
        }
        requestAnimationFrame(autoScroll);
    }
    autoScroll();
    sliderClip.addEventListener('touchstart', () => isUserInteracting = true, {passive:true});
    sliderClip.addEventListener('touchend', () => setTimeout(() => isUserInteracting = false, 1000), {passive:true});
}

window.switchHub = (tabId) => {
    document.querySelectorAll('.hub-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.hub-view').forEach(v => v.classList.remove('active-view'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.getElementById(`view-${tabId}`).classList.add('active-view');
};

window.clearChat = () => {
    const chatBox = document.getElementById('chatBox');
    if(chatBox) chatBox.innerHTML = '<div class="bot-msg">Chat cleaned.</div>';
};

window.handleGroqChat = async () => {
    const inp = document.getElementById('chatInput');
    const chatBox = document.getElementById('chatBox');
    if(!inp || !chatBox) return;
    const val = inp.value.trim();
    if(!val) return;
    chatBox.innerHTML += `<div class="user-msg">${val}</div>`;
    inp.value = "";
    const loadingId = "loading-"+Date.now();
    chatBox.innerHTML += `<div class="bot-msg" id="${loadingId}">...</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    try {
        const res = await fetch(config.aiSystem.baseUrl, {
            method:"POST",
            headers:{"Content-Type":"application/json","Authorization":`Bearer ${config.aiSystem.apiKey}`},
            body:JSON.stringify({model:config.aiSystem.model, messages:[{role:"system",content:config.aiSystem.systemPrompt},{role:"user",content:val}]})
        });
        const data = await res.json();
        const loadEl = document.getElementById(loadingId);
        if(loadEl) loadEl.innerText = data.choices?.[0]?.message?.content || "Error";
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch(e) {
        const loadEl = document.getElementById(loadingId);
        if(loadEl) loadEl.innerText = "Error";
    }
};

const chatInp = document.getElementById('chatInput');
if(chatInp) chatInp.addEventListener("keypress", (e) => { if (e.key === "Enter") window.handleGroqChat(); });

function updateClock() {
    const clockEl = document.getElementById('clockTime');
    if(clockEl) clockEl.innerText = new Date().toLocaleTimeString('id-ID',{hour12:false});
}
setInterval(updateClock, 1000);
updateClock();
