import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = e => { 
    if(e.keyCode==123 || (e.ctrlKey && e.shiftKey && (e.keyCode==73||e.keyCode==67||e.keyCode==74)) || (e.ctrlKey && e.keyCode==85)) return false; 
}

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
        if(themeIcon) themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
        if(themeIcon) themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'dark');
    }
    if(bgBase) bgBase.style.backgroundImage = getBgStyle(newTheme);
}

if(themeBtn) {
    themeBtn.addEventListener('click', () => {
        const isCurrentlyLight = document.documentElement.hasAttribute('data-theme');
        const newTheme = isCurrentlyLight ? 'dark' : 'light';
        
        themeBtn.classList.add('rotating');
        setTimeout(() => themeBtn.classList.remove('rotating'), 800);

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

const app = initializeApp(config.firebaseConfig);
const db = getDatabase(app);
const viewsRef = ref(db, 'stats/views');
const likesRef = ref(db, 'stats/likes');

if (!sessionStorage.getItem('viewed')) {
    runTransaction(viewsRef, v => (v||0)+1).then(() => sessionStorage.setItem('viewed', 'true'));
}

onValue(viewsRef, s => {
    const el = document.getElementById('viewCount');
    if(el) el.innerText = (s.val()||0).toLocaleString();
});
onValue(likesRef, s => {
    const el = document.getElementById('likeCount');
    if(el) el.innerText = (s.val()||0).toLocaleString();
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
    if(tabId === 'tictactoe' && xoState.every(c => c === '')) initXO();
    if(tabId === 'memory' && memoryCards.length === 0) initMemory();
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

let xoState = ['', '', '', '', '', '', '', '', ''];
let xoCurrent = 'X';
let xoActive = true;
let scoreX = 0;
let scoreO = 0;
const winCond = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

window.initXO = () => {
    xoState = ['', '', '', '', '', '', '', '', ''];
    xoCurrent = 'X';
    xoActive = true;
    document.getElementById('xoStatus').innerText = 'Turn: X';
    const board = document.getElementById('xoBoard');
    board.innerHTML = '';
    for(let i = 0; i < 9; i++) {
        board.innerHTML += `<div class="xo-cell" onclick="handleXO(${i})" id="xo-cell-${i}"></div>`;
    }
};

window.handleXO = (idx) => {
    if(!xoActive || xoState[idx] !== '') return;
    xoState[idx] = xoCurrent;
    const cell = document.getElementById(`xo-cell-${idx}`);
    cell.innerText = xoCurrent;
    cell.style.color = xoCurrent === 'X' ? 'var(--c-cyan)' : 'var(--c-pink)';
    let won = false;
    let winCells = [];
    for(let i=0; i<winCond.length; i++) {
        const [a,b,c] = winCond[i];
        if(xoState[a] && xoState[a] === xoState[b] && xoState[a] === xoState[c]) {
            won = true;
            winCells = [a,b,c];
        }
    }
    if(won) {
        document.getElementById('xoStatus').innerText = `${xoCurrent} Wins!`;
        winCells.forEach(c => document.getElementById(`xo-cell-${c}`).classList.add('win'));
        if(xoCurrent === 'X') scoreX++; else scoreO++;
        document.getElementById('xoScore').innerText = `X: ${scoreX} | O: ${scoreO}`;
        xoActive = false;
        return;
    }
    if(!xoState.includes('')) {
        document.getElementById('xoStatus').innerText = 'Draw!';
        xoActive = false;
        return;
    }
    xoCurrent = xoCurrent === 'X' ? 'O' : 'X';
    document.getElementById('xoStatus').innerText = `Turn: ${xoCurrent}`;
};

const memIcons = ['fa-bug', 'fa-code', 'fa-ghost', 'fa-rocket', 'fa-fire', 'fa-bolt', 'fa-star', 'fa-moon'];
let memoryCards = [];
let memFlipped = [];
let memFlips = 0;
let memMatched = 0;
let memTimerInterval;
let memSeconds = 0;
let memGameActive = false;
let memBestTime = localStorage.getItem('memBestTime') || '-';
let memBestFlips = localStorage.getItem('memBestFlips') || '-';

const elMemBest = document.getElementById('memoryBest');
if(elMemBest) elMemBest.innerText = `Best: ${memBestTime}s (${memBestFlips})`;

window.initMemory = () => {
    clearInterval(memTimerInterval);
    memSeconds = 0;
    memFlips = 0;
    memMatched = 0;
    memFlipped = [];
    memGameActive = true;
    document.getElementById('memoryStatus').innerText = `Flips: ${memFlips}`;
    document.getElementById('memoryTime').innerText = `Time: ${memSeconds}s`;
    memoryCards = [...memIcons, ...memIcons].sort(() => Math.random() - 0.5);
    const board = document.getElementById('memoryBoard');
    board.innerHTML = '';
    memoryCards.forEach((icon, i) => {
        board.innerHTML += `<div class="memory-card" id="mem-${i}" onclick="handleMem(${i})"><i class="fas ${icon}"></i></div>`;
    });
    memTimerInterval = setInterval(() => {
        if(memGameActive) {
            memSeconds++;
            document.getElementById('memoryTime').innerText = `Time: ${memSeconds}s`;
        }
    }, 1000);
};

window.handleMem = (idx) => {
    if(!memGameActive) return;
    const card = document.getElementById(`mem-${idx}`);
    if(card.classList.contains('flipped') || memFlipped.length >= 2) return;
    card.classList.add('flipped');
    card.style.color = 'var(--card-bg)';
    memFlipped.push(idx);
    if(memFlipped.length === 2) {
        memFlips++;
        document.getElementById('memoryStatus').innerText = `Flips: ${memFlips}`;
        setTimeout(checkMem, 800);
    }
};

function checkMem() {
    const [i1, i2] = memFlipped;
    const c1 = document.getElementById(`mem-${i1}`);
    const c2 = document.getElementById(`mem-${i2}`);
    if(memoryCards[i1] === memoryCards[i2]) {
        c1.classList.add('matched');
        c2.classList.add('matched');
        memMatched += 2;
        if(memMatched === memoryCards.length) {
            memGameActive = false;
            clearInterval(memTimerInterval);
            document.getElementById('memoryStatus').innerText = 'You Win!';
            let bestT = parseInt(memBestTime);
            let isNewBest = false;
            if(memBestTime === '-' || memSeconds < bestT) {
                memBestTime = memSeconds;
                memBestFlips = memFlips;
                localStorage.setItem('memBestTime', memBestTime);
                localStorage.setItem('memBestFlips', memBestFlips);
                isNewBest = true;
            } else if(memSeconds === bestT && memFlips < parseInt(memBestFlips)) {
                memBestFlips = memFlips;
                localStorage.setItem('memBestFlips', memBestFlips);
                isNewBest = true;
            }
            if(isNewBest) document.getElementById('memoryBest').innerText = `Best: ${memBestTime}s (${memBestFlips})`;
        }
    } else {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
        c1.style.color = 'transparent';
        c2.style.color = 'transparent';
    }
    memFlipped = [];
}

const formatScore = (val) => String(Math.floor(val)).padStart(5, '0');

let dinoReqFrame;
let dinoActive = false;
let dinoScore = 0;
let dinoHighScore = localStorage.getItem('dinoHighScore') || 0;
let dinoY = 12;
let dinoVy = 0;
let gravity = 0.65;
let isJumping = false;
let obsX = 100;
let obsSpeed = 1.1;
let groundPosX = 0;

const elDinoHS = document.getElementById('dinoHighScore');
if(elDinoHS) elDinoHS.innerText = `HI: ${formatScore(dinoHighScore/10)}`;

window.startDino = () => {
    dinoActive = true;
    dinoScore = 0;
    dinoY = 12;
    dinoVy = 0;
    isJumping = false;
    obsX = 100;
    obsSpeed = 1.1;
    groundPosX = 0;
    
    document.getElementById('dinoStartText').style.display = 'none';
    const elObs = document.getElementById('dinoObstacle');
    if(elObs) {
        elObs.style.display = 'block';
        elObs.style.left = obsX + '%';
    }
    if(dinoReqFrame) cancelAnimationFrame(dinoReqFrame);
    dinoLoop();
};

window.dinoJump = () => {
    if(!dinoActive) {
        window.startDino();
        return;
    }
    if(!isJumping && dinoY <= 12) {
        dinoVy = 11.5;
        isJumping = true;
    }
};

function dinoLoop() {
    if(!dinoActive) return;
    
    dinoY += dinoVy;
    dinoVy -= gravity;
    if(dinoY <= 12) {
        dinoY = 12;
        dinoVy = 0;
        isJumping = false;
    }
    
    obsX -= obsSpeed;
    if(obsX < -15) {
        obsX = 100;
        obsSpeed += 0.02;
    }
    
    groundPosX -= (obsSpeed * 4);
    const ground = document.getElementById('dinoGround');
    if(ground) ground.style.backgroundPositionX = `${groundPosX}px, ${groundPosX * 0.7}px, ${groundPosX * 0.5}px`;
    
    const p = document.getElementById('dinoPlayer');
    const o = document.getElementById('dinoObstacle');
    
    if(p) p.style.bottom = dinoY + 'px';
    if(o) o.style.left = obsX + '%';
    
    dinoScore += 0.15;
    document.getElementById('dinoScore').innerText = `Score: ${formatScore(dinoScore/10)}`;
    
    const worldW = document.getElementById('dinoWorld').offsetWidth;
    const obsPx = (obsX / 100) * worldW;
    
    const dinoRight = 20 + 36;
    const dinoLeft = 20 + 8;
    const obsLeft = obsPx + 4;
    const obsRight = obsPx + 20;
    
    if (obsLeft < dinoRight && obsRight > dinoLeft && dinoY < 56) {
        dinoActive = false;
        document.getElementById('dinoStartText').innerText = 'Game Over. Tap to Restart';
        document.getElementById('dinoStartText').style.display = 'block';
        if(dinoScore > dinoHighScore) {
            dinoHighScore = dinoScore;
            localStorage.setItem('dinoHighScore', dinoHighScore);
            document.getElementById('dinoHighScore').innerText = `HI: ${formatScore(dinoHighScore/10)}`;
        }
        return;
    }
    
    dinoReqFrame = requestAnimationFrame(dinoLoop);
}

function updateClock() { 
    const clockEl = document.getElementById('clockTime');
    if(clockEl) clockEl.innerText = new Date().toLocaleTimeString('id-ID',{hour12:false}); 
}
setInterval(updateClock, 1000); 
updateClock();
