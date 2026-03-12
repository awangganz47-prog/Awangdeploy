import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

document.addEventListener('contextmenu', e => e.preventDefault());

document.onkeydown = e => { 
    if(e.keyCode==123 || (e.ctrlKey && e.shiftKey && (e.keyCode==73||e.keyCode==67||e.keyCode==74)) || (e.ctrlKey && e.keyCode==85)) return false; 
}

window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        splash.style.opacity = '0';
        splash.style.visibility = 'hidden';
    }, 2500);
});

if(config.background) document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.9)), url('${config.background}')`;

const app = initializeApp(config.firebaseConfig);
const db = getDatabase(app);
const viewsRef = ref(db, 'stats/views');
const likesRef = ref(db, 'stats/likes');

if (!sessionStorage.getItem('viewed')) runTransaction(viewsRef, v => (v||0)+1).then(() => sessionStorage.setItem('viewed', 'true'));

onValue(viewsRef, s => document.getElementById('viewCount').innerText = (s.val()||0).toLocaleString());
onValue(likesRef, s => document.getElementById('likeCount').innerText = (s.val()||0).toLocaleString());

const likeBtn = document.getElementById('likeBtn');
const likeIcon = document.getElementById('likeIcon');

if(likeBtn) {
    if(localStorage.getItem('liked') === 'true') { 
        likeIcon.className = 'fas fa-heart text-red'; 
        likeBtn.style.color = '#d4d4d4'; 
    }
    likeBtn.onclick = () => {
        const isLiked = localStorage.getItem('liked') === 'true';
        runTransaction(likesRef, v => isLiked ? (v||0)-1 : (v||0)+1);
        localStorage.setItem('liked', !isLiked);
        likeIcon.className = !isLiked ? 'fas fa-heart text-red' : 'far fa-heart';
        likeBtn.style.color = !isLiked ? '#d4d4d4' : '#fff';
    }
}

document.getElementById('webName').innerText = config.name;
document.getElementById('webDesc').innerText = config.description;
document.getElementById('footerName').innerText = config.name;
document.getElementById('profileImg').src = config.profileUrl;

if(config.verified) document.getElementById('verifiedBadge').style.display = "inline-block";
if(config.runningText) document.getElementById('marqueeText').innerText = config.runningText;

const tagsCont = document.getElementById('profileTags');
if(tagsCont && config.profileTags) {
    tagsCont.innerHTML = '';
    config.profileTags.forEach(tag => tagsCont.innerHTML += `<div class="profile-tag"><i class="${tag.icon}" style="color:#d4d4d4"></i><span>${tag.label}</span></div>`);
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

const track = document.getElementById('sliderTrack');
const sliderClip = document.querySelector('.slider-outer-clip');
let isUserInteracting = false;

if(track && sliderClip && config.sliderImages) {
    const allImages = [...config.sliderImages, ...config.sliderImages, ...config.sliderImages, ...config.sliderImages];
    allImages.forEach(src => track.innerHTML += `<img src="${src}" class="slide-img">`);
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

let curIdx = 0;
const audio = document.getElementById('audioPlayer');
const cover = document.getElementById('musicCover');
const visualBg = document.getElementById('visualBg');
const pBtn = document.getElementById('playIcon');
const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
audio.crossOrigin = "anonymous"; 
audio.preload = "auto";

let audioCtx, analyser, dataArray, bufferLength;
let isAudioCtxSetup = false, isVisualizerRunning = false;

function setupAudio() {
    if(isAudioCtxSetup) return;
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AC();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const src = audioCtx.createMediaElementSource(audio);
        src.connect(analyser);
        analyser.connect(audioCtx.destination);
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        isAudioCtxSetup = true;
        if(canvas) { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
    } catch(e) {}
}

function renderFrame() {
    if(audio.paused || document.hidden || !ctx) {
        if(ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        isVisualizerRunning = false; return;
    }
    requestAnimationFrame(renderFrame);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    for(let i=0; i<bufferLength; i++) {
        let barHeight = (dataArray[i] / 255) * canvas.height * 0.7;
        const grad = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        grad.addColorStop(0, '#d4d4d4');
        grad.addColorStop(1, 'rgba(212, 212, 212, 0.1)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
}

function initPlaylist() {
    const list = document.getElementById('playlistContainer');
    list.innerHTML = '';
    config.music.forEach((m, i) => {
        list.innerHTML += `<div class="list-item ${i===curIdx?'active':''}" onclick="playTrack(${i})">
            <i class="fas fa-music" style="font-size:7px;color:${i===curIdx?'#d4d4d4':'#444'}"></i>
            <div><div class="list-title" style="color:${i===curIdx?'#d4d4d4':'#e0e0e0'}">${m.title}</div><div class="list-artist">${m.artist}</div></div>
        </div>`;
    });
}

window.loadTrack = (i) => {
    curIdx = i; audio.src = config.music[i].url;
    cover.src = config.music[i].cover;
    visualBg.style.backgroundImage = `url('${config.music[i].cover}')`;
    cover.classList.remove('spinning');
    if(ctx) ctx.clearRect(0,0,canvas.width,canvas.height);
    initPlaylist();
}

window.playTrack = (i) => { window.loadTrack(i); window.togglePlay(); }

window.togglePlay = async () => {
    if(!isAudioCtxSetup) setupAudio();
    if(audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
    if(audio.paused) {
        audio.play().then(() => {
            pBtn.className = "fas fa-pause"; cover.classList.add('spinning');
            if(!isVisualizerRunning) { isVisualizerRunning = true; renderFrame(); }
        }).catch(() => pBtn.className = "fas fa-play");
    } else {
        audio.pause(); pBtn.className = "fas fa-play"; cover.classList.remove('spinning');
        if(ctx) ctx.clearRect(0,0,canvas.width,canvas.height);
    }
}

window.addEventListener('resize', () => { if(canvas) { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; } });

document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !audio.paused && !isVisualizerRunning) { isVisualizerRunning = true; renderFrame(); }
});

window.toggleShuffle = () => { document.getElementById('shuffleBtn').classList.toggle('active'); }
window.toggleRepeat = () => { document.getElementById('repeatBtn').classList.toggle('active'); }
window.nextTrack = () => { curIdx = (curIdx+1)%config.music.length; window.playTrack(curIdx); }
window.prevTrack = () => { curIdx = (curIdx-1+config.music.length)%config.music.length; window.playTrack(curIdx); }

audio.onended = () => window.nextTrack();
audio.ontimeupdate = () => {
    if(audio.duration) {
        document.getElementById('progressFill').style.width = (audio.currentTime/audio.duration)*100+"%";
        document.getElementById('currentTime').innerText = fmtTime(audio.currentTime);
        document.getElementById('durationTime').innerText = fmtTime(audio.duration);
    }
}

window.seekAudio = (e) => audio.currentTime = (e.offsetX/e.currentTarget.clientWidth)*audio.duration;
window.setVolume = (e) => {
    audio.volume = e.offsetX/e.currentTarget.clientWidth;
    document.getElementById('volFill').style.width = (audio.volume*100)+"%";
}

function fmtTime(s) { const m=Math.floor(s/60),sec=Math.floor(s%60); return `${m<10?'0'+m:m}:${sec<10?'0'+sec:sec}`; }

window.clearChat = () => document.getElementById('chatBox').innerHTML = '<div class="bot-msg">Chat cleaned.</div>';
window.handleGroqChat = async () => {
    const inp = document.getElementById('chatInput');
    const val = inp.value.trim();
    if(!val) return;
    document.getElementById('chatBox').innerHTML += `<div class="user-msg">${val}</div>`;
    inp.value = "";
    const loadingId = "loading-"+Date.now();
    document.getElementById('chatBox').innerHTML += `<div class="bot-msg" id="${loadingId}">...</div>`;
    try {
        const res = await fetch(config.aiSystem.baseUrl, {
            method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${config.aiSystem.apiKey}`},
            body:JSON.stringify({model:config.aiSystem.model, messages:[{role:"system",content:config.aiSystem.systemPrompt},{role:"user",content:val}]})
        });
        const data = await res.json();
        document.getElementById(loadingId).innerText = data.choices?.[0]?.message?.content || "Error";
    } catch(e) { document.getElementById(loadingId).innerText = "Error"; }
}

const chatInp = document.getElementById('chatInput');
if(chatInp) chatInp.addEventListener("keypress", (e) => { if (e.key === "Enter") window.handleGroqChat(); });

function updateClock() { document.getElementById('clockTime').innerText = new Date().toLocaleTimeString('id-ID',{hour12:false}); }
setInterval(updateClock, 1000); updateClock();

window.addEventListener('DOMContentLoaded', () => { window.loadTrack(0); });
