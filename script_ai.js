// ====================================================
// FILE SCRIPT_AI.JS - GROQ / OPENAI HANDLER
// Edition: FAST & STABLE (NO GOOGLE ERROR)
// ====================================================

const chatBox = document.getElementById('chatBox');
const userPrompt = document.getElementById('userPrompt');
const sendBtn = document.getElementById('sendBtn');
const aiTyping = document.getElementById('aiTyping');
const emptyState = document.getElementById('emptyState');
const historyList = document.getElementById('historyList');
const replyPreview = document.getElementById('replyPreview');
const appContainer = document.querySelector('.ai-container');

// --- 1. VISUAL VIEWPORT FIX ---
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        appContainer.style.height = `${window.visualViewport.height}px`;
        scrollToBottom();
    });
}

// --- 2. LOCAL DATA ---
const DB_NAME = 'awang_ai_db_v5_groq'; // Ganti nama DB biar fresh
let chats = JSON.parse(localStorage.getItem(DB_NAME)) || [];
let currentId = localStorage.getItem('awang_ai_active_id');
let isGenerating = false;
let replyTarget = null;

// --- 3. INIT ---
window.onload = () => {
    if (!currentId || !chats.find(c => c.id === currentId)) {
        startNewChat(false);
    } else {
        loadChat(currentId);
    }
    renderSidebar();
    if(window.visualViewport) appContainer.style.height = `${window.visualViewport.height}px`;
};

function saveToLocal() {
    localStorage.setItem(DB_NAME, JSON.stringify(chats));
}

// --- 4. CHAT LOGIC ---
function startNewChat(refresh = true) {
    const newId = "c_" + Date.now();
    const newChat = {
        id: newId,
        title: "Percakapan Baru",
        messages: [{ role: 'assistant', text: CONFIG.aiSystem.welcomeMessage, timestamp: Date.now() }],
        timestamp: Date.now()
    };
    chats.unshift(newChat);
    currentId = newId;
    localStorage.setItem('awang_ai_active_id', newId);
    saveToLocal();
    if(refresh) {
        loadChat(newId);
        if(window.innerWidth < 768) toggleMenu();
    }
}

function loadChat(id) {
    currentId = id;
    localStorage.setItem('awang_ai_active_id', id);
    const chat = chats.find(c => c.id === id);
    
    chatBox.innerHTML = '';
    chatBox.appendChild(emptyState);
    chatBox.appendChild(aiTyping);

    if (chat && chat.messages.length > 1) {
        emptyState.style.display = 'none';
        chat.messages.forEach(m => renderMessage(m.role === 'assistant' ? 'ai' : 'user', m.text, false, m.replyTo));
    } else {
        emptyState.style.display = 'flex';
    }
    renderSidebar();
    scrollToBottom();
}

function renderSidebar() {
    historyList.innerHTML = '';
    chats.forEach(c => {
        const item = document.createElement('div');
        item.className = `history-item ${c.id === currentId ? 'active' : ''}`;
        item.onclick = () => loadChat(c.id);
        item.innerHTML = `
            <i class="fas fa-comment-alt text-xs"></i>
            <span class="truncate flex-1 font-bold text-[11px]">${c.title}</span>
            <i class="fas fa-trash-alt del-btn text-[10px]" onclick="deleteChat('${c.id}', event)"></i>
        `;
        historyList.appendChild(item);
    });
}

function deleteChat(id, e) {
    e.stopPropagation();
    chats = chats.filter(c => c.id !== id);
    saveToLocal();
    if(chats.length === 0) startNewChat();
    else if(currentId === id) loadChat(chats[0].id);
    renderSidebar();
}

function clearAllHistory() {
    if(confirm("Hapus semua riwayat?")) {
        chats = [];
        startNewChat();
    }
}

function clearCurrentChat() {
    const chat = chats.find(c => c.id === currentId);
    if(chat) {
        chat.messages = chat.messages.slice(0, 1);
        chat.title = "Percakapan Baru";
        saveToLocal();
        loadChat(currentId);
    }
}

// --- 5. SEND MESSAGE & API CALL ---
async function sendMessage() {
    const text = userPrompt.value.trim();
    if (!text || isGenerating) return;

    userPrompt.value = '';
    userPrompt.style.height = 'auto';
    const activeReply = replyTarget;
    cancelReply();

    const chat = chats.find(c => c.id === currentId);
    if(!chat) return;

    if (chat.messages.length <= 1) chat.title = text.substring(0, 20);

    chat.messages.push({ role: 'user', text: text, replyTo: activeReply });
    saveToLocal();
    renderMessage('user', text, false, activeReply);
    emptyState.style.display = 'none';

    isGenerating = true;
    sendBtn.disabled = true;
    aiTyping.classList.remove('hidden');
    scrollToBottom();

    try {
        const rawHistory = chat.messages.slice(-10); // Ambil 10 pesan terakhir
        const response = await fetchGroqAI(rawHistory); // Gunakan Fetch Groq
        
        aiTyping.classList.add('hidden');
        chat.messages.push({ role: 'assistant', text: response });
        saveToLocal();
        renderMessage('ai', response, true);
    } catch (e) {
        aiTyping.classList.add('hidden');
        console.error("AI Error:", e);
        renderMessage('ai', `⚠️ **Error:** ${e.message || "Gagal terhubung."}\n\n*Pastikan API Key Groq di config.js sudah benar (dimulai dengan 'gsk_').*`);
    } finally {
        isGenerating = false;
        sendBtn.disabled = false;
        renderSidebar();
    }
}

// --- 6. UNIVERSAL API HANDLER (GROQ SPECIALIZED) ---
async function fetchGroqAI(history) {
    const { baseUrl, apiKey, model, systemInstruction } = CONFIG.aiSystem;

    // Cek API Key
    if (!apiKey || apiKey.includes("ISI_API_KEY") || apiKey.length < 10) {
        throw new Error("API Key Groq belum diisi di config.js!");
    }

    const messages = [
        { role: "system", content: systemInstruction },
        ...history.map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : msg.role, // Pastikan role sesuai format Groq
            content: msg.text
        }))
    ];

    const payload = {
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
    };

    const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if(!res.ok) {
        const errorMsg = data.error?.message || `Status: ${res.status}`;
        throw new Error(`Groq API Error: ${errorMsg}`);
    }

    return data.choices?.[0]?.message?.content || "Maaf, tidak ada respon.";
}

// --- 7. UI HELPERS ---
function renderMessage(role, text, isTyping = false, replyContext = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    
    // Swipe Reply
    let startX = 0;
    msgDiv.addEventListener('touchstart', (e) => startX = e.touches[0].clientX);
    msgDiv.addEventListener('touchend', (e) => {
        if(e.changedTouches[0].clientX - startX > 80) setReply(role, text);
    });

    let rHtml = '';
    if (replyContext) {
        const shortText = replyContext.text.length > 50 ? replyContext.text.substring(0, 50) + "..." : replyContext.text;
        rHtml = `<div class="reply-context"><strong>${replyContext.role === 'assistant' ? 'AI' : 'Anda'}</strong>${shortText.replace(/</g, "&lt;")}</div>`;
    }

    const html = role === 'ai' ? marked.parse(text) : text.replace(/</g, "&lt;").replace(/\n/g, "<br>");

    msgDiv.innerHTML = `
        <div class="avatar ${role}"><i class="fas ${role==='user'?'fa-user':'fa-robot'}"></i></div>
        <div class="bubble-container">
            <div class="bubble">${rHtml}<div class="txt">${isTyping ? '' : html}</div></div>
            <div class="msg-actions">
                <span class="action-btn" onclick="setReply('${role}', '${text.replace(/'/g,"\\'")}')"><i class="fas fa-reply"></i> Reply</span>
                <span class="action-btn" onclick="navigator.clipboard.writeText('${text.replace(/'/g,"\\'")}'); showToast('Disalin', 'success')"><i class="fas fa-copy"></i> Copy</span>
            </div>
        </div>
    `;
    
    chatBox.insertBefore(msgDiv, aiTyping);
    scrollToBottom();
    msgDiv.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));
    if(isTyping) { msgDiv.querySelector('.txt').innerHTML = html; }
}

function setReply(role, text) {
    replyTarget = { role: role === 'ai' ? 'assistant' : 'user', text: text };
    replyPreview.classList.remove('hidden');
    document.getElementById('replyText').innerText = text;
    userPrompt.focus();
}

function cancelReply() { replyTarget = null; replyPreview.classList.add('hidden'); }
function scrollToBottom() { setTimeout(() => chatBox.scrollTop = chatBox.scrollHeight, 50); }

userPrompt.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter' && !e.shiftKey) { 
        e.preventDefault(); 
        sendMessage(); 
    } 
});
