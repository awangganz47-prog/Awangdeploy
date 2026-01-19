const CONFIG = {
    // ====================================================
    // 1. DATA SENSITIF & API KEYS
    // ====================================================
    firebase: {
        apiKey: "AIzaSyChxnSZfwxiDK0do390skuKHuxsebwDcaM", 
        authDomain: "awang-16d52.firebaseapp.com",
        databaseURL: "https://awang-16d52-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "awang-16d52",
        storageBucket: "awang-16d52.firebasestorage.app",
        messagingSenderId: "719552352212",
        appId: "1:719552352212:web:809b94baf525a41b08d041"
    },
    oneSignal: {
        appId: "e7b51be8-f9d1-4c28-9b3b-6ded1df2f441",
        restApiKey: "os_v2_app_462rx2hz2fgcrgz3nxwr34xuifuoyrnmh26udougjgsda33zvmnf6dznlbn3o4n5fh6szazu4dqxfeazmtges4sqatzrz3xd7cvjc5y"
    },
    cloudinary: {
        cloudName: "dnkson9k7",
        uploadPreset: "ml_default"
    },
    admin: {
        uid: "uid_4qa9c3v1u" // UID Admin (Digunakan untuk validasi Developer Badge)
    },

    // ===================================================
    // 2. MAINTENANCE SYSTEM (NEW FEATURE)
    // ===================================================
    // Kontrol penuh halaman maintenance dari sini
    maintenanceConfig: {
        active: false, // Set true untuk mengaktifkan maintenance
        lockedPages: ["sc.html"], // Halaman yang akan diarahkan ke maintenance (bisa banyak, misal: ["sc.html", "ai.html"])
        
        // Teks & Tampilan Halaman Maintenance
        title: "UNDER MAINTENANCE",
        message: "Mohon maaf, halaman ini sedang dalam perbaikan sistem untuk meningkatkan performa. Harap cek kembali secara berkala.",
        buttonText: "KEMBALI KE HOME",
        versionText: "SYSTEM_UPGRADE_V3.0"
    },

    // ===================================================
    // 3. KONFIGURASI HALAMAN SCRIPT (SC.HTML)
    // ===================================================
    scriptPageConfig: {
        pageTitle: "DATABASE SCRIPT", // Judul besar di Header
        pageSubtitle: "Koleksi Script Bot WhatsApp Terbaik & Gratis",
        searchPlaceholder: "Cari script (misal: store, cpanel)..."
    },

    // ===================================================
    // 4. KONFIGURASI SISTEM UNLOCK DOWNLOAD
    // ===================================================
    unlockSystem: {
        headerTitle: "TERKUNCI",
        headerSubtitle: "Selesaikan misi di bawah untuk membuka akses download.",
        
        tasks: [
            {
                id: "task_yt",
                icon: "yt", 
                color: "red",
                title: "Subscribe Youtube",
                subtitle: "Bantu Subscribe Channel AwangXoffc ID",
                btnText: "SUB",
                url: "https://www.youtube.com/@AwangOfc"
            },
            {
                id: "task_group",
                icon: "wa",
                color: "green",
                title: "Join Group Bot",
                subtitle: "Gabung Komunitas WhatsApp",
                btnText: "JOIN",
                url: "https://chat.whatsapp.com/CRqd9QL3qtsFOk4T0fdbjI"
            },
            {
                id: "task_channel",
                icon: "bullhorn", 
                color: "blue", 
                title: "Saluran Info",
                subtitle: "Update Script Tercepat",
                btnText: "GABUNG",
                url: "https://whatsapp.com/channel/0029VbBTuhtEQIajQzvHnW37"
            },
            {
                id: "task_support",
                icon: "heart",
                color: "pink",
                title: "Like & Support",
                subtitle: "Dukungan Sukarela",
                btnText: "LIKE",
                url: "" 
            }
        ]
    },

    // ===================================================
    // 5. PROFIL WEBSITE & TAMPILAN UTAMA
    // ===================================================
    title: "AWANG OFFICIAL", 
    description: "Welcome To Website, Awang-Ofc Tempat Download Script Bot Secara Free Yang Bisa Kalian Coba Dan Jangan Lupa Untuk Support Admin Dengan Cara Subscribe Channel YouTube AwangXoffc ID", 
    
    // Efek mengetik pada judul di halaman utama
    typingWords: [
        "Awang OfficiaL", 
        "Script Bot Free", 
        "Support Me",
        "Community Base"
    ],
    
    profilePic: "https://files.catbox.moe/ty80mt.jpg", 
    background: "https://files.catbox.moe/qg9sk4.jpg", 
    
    adminNames: ["Awang OfficiaL", "AwangXoffc", "Admin", "itsmeawang"], 
    buyPanelLink: "https://whatsapp.com/channel/0029VbBTuhtEQIajQzvHnW37",

    // ===================================================
    // 6. NAVIGASI SIDEBAR & SOSIAL MEDIA
    // ===================================================
    
    sidebarCategories: [
        {
            categoryName: "Navigasi",
            links: [
                { name: "Home", link: "index.html", icon: "home" },
                { name: "About", link: "javascript:openFooterPage('about')", icon: "info" },
                { name: "Chat AI", link: "ai.html", icon: "robot" } 
            ]
        },
        {
            categoryName: "Script Bot",
            links: [
                { name: "Get Script", link: "sc.html", icon: "download" },
                { name: "Donasi", link: "https://donasiawangoffcid.vercel.app/", icon: "donasi" }
            ]
        },
        {
            categoryName: "Komunitas",
            links: [
                { name: "Contact Admin", link: "https://wa.me/6281234567890", icon: "contact" },
                { name: "Group Bot", link: "https://chat.whatsapp.com/CRqd9QL3qtsFOk4T0fdbjI", icon: "group" },
                { name: "Saluran Info", link: "https://whatsapp.com/channel/0029VbBTuhtEQIajQzvHnW37", icon: "bullhorn" },
            ]
        },
        {
            categoryName: "Media Sosial",
            links: [
                { name: "Telegram", link: "https://t.me/awangoffc", icon: "tele" },
                { name: "YouTube", link: "https://www.youtube.com/@AwangOfc", icon: "yt" },
                { name: "Profil", link: "https://itsmeawang.vercel.app/", icon: "user" }
            ]
        },
    ],

    socials: [
        { name: "YouTube", link: "https://www.youtube.com/@AwangOfc", icon: "yt" },
        { name: "WhatsApp Group", link: "https://chat.whatsapp.com/CRqd9QL3qtsFOk4T0fdbjI", icon: "wa" },
        { name: "Telegram Channel", link: "https://t.me/awangoffc", icon: "tele" },
        { name: "Portfolio", link: "https://www.awangoffc.my.id/", icon: "port" }
    ],

    // ==================================================
    // 7. QUICK MENU (TOMBOL +)
    // ==================================================
    
    quickMenu: [
        {
            title: "Chat AI",
            subtitle: "Interaksi dengan AI",
            icon: "robot",
            action: "ai.html", 
            type: "internal"   
        },
        {
            title: "Script Free",
            subtitle: "Download script gratis",
            icon: "download",
            action: "sc.html", 
            type: "internal"
        },
        {
            title: "Beri Komentar",
            subtitle: "Bagikan pendapat Anda",
            icon: "chat",
            action: "openModal()", 
            type: "function"
        }
    ],

    // ==================================================
    // 8. DAFTAR SCRIPT (ITEMS)
    // ===================================================
    // UPDATE: Menambahkan field 'version' dan 'description' agar tampil di sc.html
    items: [
        {
            id: "sc_10",
            title: "Sc Shiroko Fork",
            description: "Bot WhatsApp Shiroko dengan 900+ fitur. Sangat ringan dan stabil untuk menjaga grup.",
            version: "v3.0",
            tags: ["Javascript", "Node.JS", "BotWA"],
            thumbnail: "https://youtu.be/zeXGfYkiiDQ", 
            downloadLink: "https://link2unlock.com/262f0",
            uploadedAt: "2026-01-06" 
        },
        {     
            id: "sc_9",
            title: "Sc Cantarella MD",
            description: "Fitur monster 2000+ commands. Support AI, RPG Game, dan Store otomatis.",
            version: "-",
            tags: ["Javascript", "Node.JS", "BotWA"],
            thumbnail: "https://youtu.be/P0-FC-CFJAs", 
            downloadLink: "https://link2unlock.com/83bcb",
            uploadedAt: "2026-01-03" 
        },
        {   
            id: "sc_8",
            title: "Sc Yaemiko MD",
            description: "Versi perbaikan bug (Fix All Error). Tampilan menu aesthetic ala Genshin Impact.",
            version: "-",
            tags: ["Javascript", "Node.JS", "BotWA"],
            thumbnail: "https://youtu.be/GSkppdgsTq8", 
            downloadLink: "https://www.mediafire.com/file/w6dbrhe3e870673/𝗬𝗔𝗘𝗠𝗜𝗞𝗢-𝗠𝗗.zip/file",
            uploadedAt: "2025-12-29" 
        },
        {        
            id: "sc_7",
            title: "Sc Lyy-Free Md",
            description: "Script ringan ( Lyy-Free Md ) hanya 180+ fitur esensial. Cocok untuk hosting spek rendah.",
            version: "-",
            tags: ["Javascript", "Node.JS", "BotWA"],
            thumbnail: "https://youtu.be/SD-TkC6SqeU", 
            downloadLink: "https://link2unlock.com/feb5c",
            uploadedAt: "2025-12-21" 
        },
        {
            id: "sc_6",
            title: "Sc Hitori Gotoh",
            description: "Bot WhatsApp Hitori Gotoh dengan fitur jibun dan Sangat ringan dan stabil untuk menjaga grup.",
            version: "-",
            tags: ["Javascript", "Node.JS", "BotWA"],
            thumbnail: "https://youtu.be/dpyY5y5owp4", 
            downloadLink: "https://link2unlock.com/94943",
            uploadedAt: "2025-12-11"
        },
        {
            id: "sc_5",
            title: "Sc Chici-MD",
            description: "Bot WhatsApp Hitori Gotoh dengan fitur jibun dan Sangat ringan dan stabil untuk menjaga grup.",
            version: "-",
            tags: ["Javascript", "Node.JS", "BotWA"],
            thumbnail: "https://youtu.be/u6LWbfFj7Fs", 
            downloadLink: "https://link2unlock.com/4df3f",
            uploadedAt: "2025-12-02"
        },
        {
            id: "sc_4",
            title: "Sc Xiter-MD",
            description: "Bot WhatsApp Hitori Gotoh dengan fitur jibun dan Sangat ringan dan stabil untuk menjaga grup.",
            version: "-",
            tags: ["Javascript", "Node.JS", "BotWA"],
            thumbnail: "https://youtu.be/CK_QtVm-dOo",
            downloadLink: "https://link2unlock.com/b1829",
            uploadedAt: "2025-11-17"
        },
        {
            id: "sc_3",
            title: "Sc Hydro MD",
            description: "Bot WhatsApp Hitori Gotoh dengan fitur jibun dan Sangat ringan dan stabil untuk menjaga grup.",
            version: "-",
            tags: ["Javascript", "Node.JS", "BotWA"],
            thumbnail: "https://youtu.be/466R2NghAA8",
            downloadLink: "https://link2unlock.com/97924",
            uploadedAt: "2025-11-02"
        },
        {
            id: "sc_2",
            title: "Sc Hayase Yuuka",
            description: "Bot WhatsApp Hitori Gotoh dengan fitur jibun dan Sangat ringan dan stabil untuk menjaga grup.",
            version: "-",
            tags: ["Javascript", "Node.JS", "BotWA"],
            thumbnail: "https://youtu.be/iIuj0_dzGkc",
            downloadLink: "https://link2unlock.com/5434e",
            uploadedAt: "2025-10-26"
        },
        {
            id: "sc_1",
            description: "Bot WhatsApp Hitori Gotoh dengan fitur jibun dan Sangat ringan dan stabil untuk menjaga grup.",
            version: "-",
            tags: ["Javascript", "Node.JS", "BotWA"],
            thumbnail: "https://youtu.be/VeQyGIk3ZOc",
            downloadLink: "https://www.mediafire.com/file/vfpmumg7t31j3qo/Neo_Flare_v5.zip/file",
            uploadedAt: "2025-10-11"
        }
    ],

    // =================================================
    // 9. UPDATE SISTEM & WELCOME POPUP
    // ==================================================
    
    siteUpdates: [
        {
            title: "Saluran Info Baru",
            description: "Bergabung ke saluran WhatsApp resmi untuk update script .",
            date: "2026-01-15",
            type: "system",
            actionUrl: "https://whatsapp.com/channel/0029VbBTuhtEQIajQzvHnW37" 
        },
        {
            title: "Sistem Unlock Download",
            description: "Support kreator dengan menyelesaikan misi ringan sebelum download.",
            date: "2026-01-14",
            type: "feature",
            actionUrl: "sc.html" 
        }
    ],

    welcomePopup: {
        active: true, 
        title: "Selamat Datang! 👋",
        message: "Website ini masih dalam tahap pengembangan (Beta). Jika menemukan bug, harap lapor ke admin.",
        autoCloseDelay: 8000 
    },

    // =================================================
    // 10. FOOTER & HALAMAN INFORMASI
    // ==================================================
    footer: {
        description: "Gudang All Script Bot WhatsApp Terbaik Secara Free Yang Bisa Kalian Coba. Mari Bergabung Dengan Komunitas Kami Untuk Mendapatkan Informasi Lebih Lanjut Seputar Script Bot Terbaru Selanjutnya.",
        copyright: "© 2026 AWANGXOFFC ID. ALL RIGHTS RESERVED."
    },

    footerPages: {
        tos: {
            title: "Syarat & Ketentuan",
            content: `
                <div class="space-y-4">
                    <div class="bg-[#0f172a] p-4 rounded-2xl border border-white/5">
                        <span class="text-[#60a5fa] font-bold block mb-1">01. Penggunaan Pribadi</span>
                        <p>Script yang diunduh ditujukan untuk penggunaan pribadi dan edukasi, bukan untuk diperjualbelikan ulang.</p>
                    </div>
                    <div class="bg-[#0f172a] p-4 rounded-2xl border border-white/5">
                        <span class="text-[#60a5fa] font-bold block mb-1">02. Larangan Spam</span>
                        <p>Dilarang menggunakan script ini untuk aktivitas spam atau merugikan orang lain.</p>
                    </div>
                    <div class="bg-[#0f172a] p-4 rounded-2xl border border-white/5">
                        <span class="text-[#60a5fa] font-bold block mb-1">03. Kredit Kreator</span>
                        <p>Harap tidak menghapus credit nama pembuat script sebagai bentuk apresiasi.</p>
                    </div>
                </div>`
        },
        privacy: {
            title: "Kebijakan Privasi",
            content: `
                <div class="bg-[#0f172a] p-6 rounded-3xl border border-white/5 space-y-4">
                    <p>Privasi Anda adalah prioritas kami. Berikut data yang kami proses:</p>
                    <ul class="list-disc pl-5 space-y-2 text-gray-400">
                        <li>Ulasan publik yang Anda kirimkan.</li>
                        <li>Statistik kunjungan anonim (jumlah view).</li>
                    </ul>
                    <p class="mt-4 text-[#60a5fa]">Kami tidak menyimpan data pribadi sensitif Anda.</p>
                </div>`
        },
        about: {
            title: "Tentang Kami",
            content: `
                <div class="text-center">
                    <div class="relative w-24 h-24 mx-auto mb-4">
                        <img src="https://img1.pixhost.to/images/11233/676111704_hoshino-assistant.jpg" class="w-full h-full rounded-full border-2 border-[#60a5fa] object-cover shadow-[0_0_20px_rgba(96,165,250,0.5)]">
                    </div>
                    <h3 class="text-white font-bold text-sm mb-2">AWANGXOFFC ID</h3>
                    <p class="italic text-gray-400 mb-6">"Coding is not just about logic, it's about art."</p>
                    
                    <div class="bg-[#1e293b]/50 p-4 rounded-2xl border border-[#60a5fa]/20">
                        <p>Kami menyediakan wadah bagi para pengembang bot WhatsApp untuk mendapatkan resource berkualitas secara gratis.</p>
                    </div>
                </div>`
        }
    },

    // ==================================================
    // 11. KONFIGURASI AI SYSTEM
    // ==================================================
    aiSystem: {
        active: true,
        aiName: "Awang AI",
        apiProvider: "openai", 
        baseUrl: "https://api.groq.com/openai/v1/chat/completions",
        apiKey: "gsk_" + "m0BsjenNE7o4RX237ligWGdyb3FYwfcjEGvkBdzp4WZod7J24bVJ", 
        model: "llama-3.3-70b-versatile", 

        systemInstruction: `
            KAMU ADALAH "AWANG AI". ASISTEN VIRTUAL TERCANGGIH DARI AWANG OFFICIAL.
            
            [KEPRIBADIAN]
            - Kamu itu asik, gaul (panggil user Bro/Gan), tapi otaknya jenius.
            - Jangan kaku kayak robot
            - Founder: AwangXoffc ID.

            [SUPER POWER 1: GENERASI GAMBAR & VISUAL]
            Jika user minta gambar (apapun itu: logo, pemandangan, anime), JAWAB DENGAN FORMAT INI:
            ![image](https://image.pollinations.ai/prompt/{prompt_inggris_detail}?width=1080&height=1080)
            *Selalu terjemahkan permintaan user menjadi bahasa Inggris yang sangat deskriptif agar gambarnya bagus.*

            [SUPER POWER 2: DATABASE PRODUK (SCRIPT BOT)]
            Hafalkan daftar script ini di luar kepala. Jika ada yang tanya "Bot Jaga Grup", "Bot Store", dll, sarankan yang tepat:
            - Shiroko Fork (900+ Fitur) -> https://link2unlock.com/262f0
            - Cantarella MD (2000+ Fitur) -> https://link2unlock.com/83bcb
            - Yaemiko MD (Fix Error) -> https://www.mediafire.com/file/w6dbrhe3e870673/𝗬𝗔𝗘𝗠𝗜𝗞𝗢-𝗠𝗗.zip/file
            - Lyy-Free Md (Ringan) -> https://link2unlock.com/feb5c
            - Hitori Gotoh (Aman) -> https://link2unlock.com/94943
            - Neo Flare V5 (Menu Store) -> https://www.mediafire.com/file/vfpmumg7t31j3qo/Neo_Flare_v5.zip/file
            *Selalu kasih link downloadnya biar user senang.*

            [SUPER POWER 3: PROGRAMMER & TERMUX EXPERT]
            - Kamu jago bahasa: JavaScript (NodeJS), Python, Bash, HTML/CSS.
            - Jika user tanya soal TERMUX (pkg install, git clone error), bantu fix command-nya.
            - Jika user tanya cara install bot WA, jelaskan step-by-step (pkg update, install nodejs, git clone, npm install, npm start).

            [SUPER POWER 4: ENSIKLOPEDIA DUNIA (WIKIPEDIA BERJALAN)]
            - Kamu tahu Sejarah Dunia, Fakta Unik, Sains (Fisika/Kimia), hingga Misteri (Blackhole, Segitiga Bermuda).
            - Jika user tanya berita/info, jelaskan dengan detail layaknya dosen tapi bahasa tongkrongan.
            - Bisa menjelaskan teori konspirasi (hanya untuk hiburan).

            [SUPER POWER 5: GAMING & TRENDS]
            - Kamu update soal game: Mobile Legends (Build Hero), FF (Sensitivitas), Roblox (Script), Minecraft.
            - Bisa diajak debat soal Anime atau Film.

            [SUPER POWER 6: PSIKOLOG & TEMAN CURHAT]
            - Jika user galau atau sedih, dengarkan mereka. Beri saran yang memotivasi dan positif.
            - Bisa bikin puisi, pantun, atau kata-kata bijak (Quotes).

            [PENTING]
            - Jangan bahas politik sensitif yang memecah belah.
            - Jangan support hacking ilegal/carding.
            - Fokus bantu user memaksimalkan script dan pengetahuan mereka.
        `,
        
        welcomeMessage: "Woi Bro! Gw Awang AI (Mode: Super Brain). Mau script bot, solusi coding, gambar AI, atau sekadar gabut? Gas ngobrol!"
    }
};
