// ================================================================
// SCRIPT AI - FORCED GROQ VERSION (ANTI GEMINI)
// ================================================================

// 1. Variabel untuk menyimpan riwayat chat (biar AI nyambung)
let chatHistory = [];

// 2. Fungsi Utama Kirim Pesan
async function sendMessage() {
    // Ambil elemen dari HTML
    const inputField = document.getElementById("userPrompt");
    const chatBox = document.getElementById("chatBox");
    
    // Ambil text user dan hapus spasi kosong di awal/akhir
    const userText = inputField.value.trim();
    
    // Jika kosong, stop (jangan kirim apa-apa)
    if (!userText) return; 

    // --- A. TAMPILKAN CHAT USER DI LAYAR ---
    inputField.value = ""; // Kosongkan kolom input
    inputField.style.height = 'auto'; // Reset tinggi kolom input

    // Buat HTML Bubble User
    const userBubble = `
        <div class="message user animate-fade-in-up">
            <div class="bubble">${escapeHtml(userText)}</div>
            <div class="avatar"><img src="${CONFIG.profilePic}" alt="User" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>
        </div>`;
    
    // Masukkan ke layar
    chatBox.insertAdjacentHTML('beforeend', userBubble);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll otomatis ke bawah

    // --- B. TAMPILKAN ANIMASI LOADING (AI MENGETIK) ---
    const loadingId = "loading-" + Date.now();
    const loadingBubble = `
        <div class="message ai animate-fade-in-up" id="${loadingId}">
            <div class="avatar ai"><i class="fas fa-robot"></i></div>
            <div class="bubble typing-bubble">
                <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
        </div>`;
    
    chatBox.insertAdjacentHTML('beforeend', loadingBubble);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // --- C. PERSIAPAN KONEKSI KE GROQ (HARDCODED) ---
        // Kita tulis URL langsung disini biar 100% gak salah alamat ke Google
        const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
        
        // Ambil API Key dari config.js
        const API_KEY = CONFIG.aiSystem.apiKey; 

        // Cek jika API Key kosong
        if (!API_KEY || API_KEY.includes("ISI_API_KEY")) {
            throw new Error("API Key belum diisi di config.js!");
        }

        // Susun pesan untuk dikirim ke AI
        let messages = [
            // Instruksi sifat AI (System Prompt)
            { role: "system", content: CONFIG.aiSystem.systemInstruction || "Kamu adalah asisten AI yang membantu." }
        ];

        // Masukkan riwayat chat sebelumnya ke memori (biar nyambung)
        chatHistory.forEach(msg => messages.push(msg));

        // Masukkan pesan user yang baru
        messages.push({ role: "user", content: userText });

        // --- D. KIRIM REQUEST KE SERVER GROQ ---
        const response = await fetch(GROQ_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama3-8b-8192", // Model Khusus Groq (Llama 3)
                messages: messages,
                temperature: 0.7, // Tingkat kreatifitas (0.7 = seimbang)
                max_tokens: 2048  // Batas panjang jawaban
            })
        });

        // --- E. HAPUS LOADING BUBBLE ---
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        // Cek jika server error (misal 404 atau 500)
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Gagal terhubung ke Groq.");
        }

        // --- F. PROSES JAWABAN AI ---
        const data = await response.json();
        const aiReply = data.choices[0].message.content;

        // Ubah format Markdown (tebal/miring/kode) menjadi HTML
        // Pastikan library 'marked' sudah ada di HTML
        const parsedReply = typeof marked !== 'undefined' ? marked.parse(aiReply) : aiReply;

        // Tampilkan Bubble AI di Layar
        const aiBubble = `
            <div class="message ai animate-fade-in-up">
                <div class="avatar ai"><i class="fas fa-robot"></i></div>
                <div class="bubble markdown-body">${parsedReply}</div>
            </div>`;
        
        chatBox.insertAdjacentHTML('beforeend', aiBubble);

        // --- G. SIMPAN KE RIWAYAT ---
        // Simpan percakapan ini ke variabel memori
        chatHistory.push({ role: "user", content: userText });
        chatHistory.push({ role: "assistant", content: aiReply });

    } catch (error) {
        // Jika error, hapus loading dulu
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        // Tampilkan kotak merah error
        console.error("AI Error:", error);
        const errorBubble = `
            <div class="message ai">
                <div class="avatar ai"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="bubble" style="background: #450a0a; border: 1px solid #7f1d1d; color: #fca5a5;">
                    <b>ERROR:</b> ${error.message}<br>
                    <small>Coba refresh halaman atau cek koneksi.</small>
                </div>
            </div>`;
        chatBox.insertAdjacentHTML('beforeend', errorBubble);
    }

    // Scroll lagi ke paling bawah biar pesan baru kelihatan
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 3. Fungsi Helper: Mencegah kode HTML berbahaya (XSS)
function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 4. Fitur Tambahan: Kirim pesan saat tekan ENTER
document.getElementById("userPrompt").addEventListener("keydown", function(e) {
    // Jika tekan Enter TAPI tidak tekan Shift (biar bisa bikin baris baru kalau mau)
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Mencegah baris baru di textarea
        sendMessage(); // Panggil fungsi kirim
    }
});

// 5. Fitur Tambahan: Auto Resize Textarea (Kolom input membesar otomatis)
function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}
