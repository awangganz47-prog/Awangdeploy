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
        uid: "uid_4qa9c3v1u" // UID Admin untuk fitur Developer Badge & Hapus Komentar
    },

    // ===================================================
    // 2. PROFIL WEBSITE & TAMPILAN UTAMA
    // ===================================================
    title: "Awang OfficiaL",
    description: "Welcome To Website, Awang-Dev Tempat Download Script Bot Secara Free Yang Bisa Kalian Coba Dan Jangan Lupa Untuk Support Admin Dengan Cara Subscribe Channel YouTube AwangXoffc ID", 
    
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
    // 3. NAVIGASI SIDEBAR (AUTO RENDER) & SOSIAL MEDIA
    // ====================================================
    // NOTE: Cukup tulis nama aplikasinya saja di bagian 'icon'.
    // Sistem Smart Icon di utils.js akan otomatis mendeteksi icon yang paling relevan.
    
    sidebarCategories: [
        {
            categoryName: "Social Media",
            links: [
                { name: "WhatsApp", link: "https://wa.me/556184127506", icon: "WhatsApp" },
                { name: "Telegram", link: "https://t.me/awangoffc", icon: "Telegram" },
                { name: "YouTube", link: "https://www.youtube.com/@AwangOfc", icon: "YouTube" }
            ]
        },
        {
            categoryName: "Group Dan Saluran",
            links: [
                { name: "Group Bot", link: "https://chat.whatsapp.com/CRqd9QL3qtsFOk4T0fdbjI", icon: "group" },
                { name: "Informasi", link: "https://whatsapp.com/channel/0029VbBTuhtEQIajQzvHnW37", icon: "code" },
            ]
        },
        {
            categoryName: "Information",
            links: [
                { name: "Profile", link: "https://itsmeawang.vercel.app/", icon: "User" },
                { name: "Donasi", link: "https://donasiawangoffcid.vercel.app/", icon: "Wallet" }
            ]
        }
    ],

    socials: [
        { name: "YouTube", link: "https://www.youtube.com/@AwangOfc", icon: "YouTube" },
        { name: "WhatsApp Group", link: "https://chat.whatsapp.com/CRqd9QL3qtsFOk4T0fdbjI", icon: "Group" },
        { name: "Telegram Channel", link: "https://t.me/awangoffc", icon: "Telegram" },
        { name: "Portfolio", link: "https://www.awangoffc.my.id/", icon: "User" }
    ],

    // ==================================================
    // 4. DAFTAR SCRIPT (ITEMS)
    // ===================================================
    // NOTE: 'uploadedAt' sangat penting untuk fitur sorting "Terbaru" di halaman SC & Slider Home.
    // Format tanggal: YYYY-MM-DD
    items: [
        {
            id: "sc_10",
            title: "Sc Bot Wa Terbaru Shiroko Fork, 900+ Fitur Cocok Untuk Jaga Grub",
            tags: ["Shiroko", "Fork", "Jaga Grup"],
            thumbnail: "https://youtu.be/zeXGfYkiiDQ?si=4OinEbpYiplxvcJX", 
            downloadLink: "https://link2unlock.com/262f0",
            uploadedAt: "2026-01-07" 
        },
        {     
            id: "sc_9",
            title: "Sc Bot Wa Terbaru Cantarella MD, 2000+ Fitur Cocok Untuk Jaga Grub",
            tags: ["Cantarella", "Super Lengkap", "2000+ Fitur"],
            thumbnail: "https://youtu.be/P0-FC-CFJAs", 
            downloadLink: "https://link2unlock.com/83bcb",
            uploadedAt: "2026-01-04" 
        },
        {   
            id: "sc_8",
            title: "Sc Bot Wa Terbaru Yaemiko MD Terbaru Version 1x Fix All Error",
            tags: ["Yaemiko", "Fix Error", "Stabil"],
            thumbnail: "https://youtu.be/GSkppdgsTq8", 
            downloadLink: "https://www.mediafire.com/file/w6dbrhe3e870673/𝗬𝗔𝗘𝗠𝗜𝗞𝗢-𝗠𝗗.zip/file",
            uploadedAt: "2025-12-29" 
        },
        {        
            id: "sc_7",
            title: "Sc Bot Wa Terbaru Lyy-Free Md, 180+ Fitur Cocok Untuk Jaga Grub",
            tags: ["Lyy-Free", "Ringan", "Simple"],
            thumbnail: "https://youtu.be/SD-TkC6SqeU", 
            downloadLink: "https://link2unlock.com/feb5c",
            uploadedAt: "2025-12-26" 
        },
        {
            id: "sc_6",
            title: "Sc Bot Wa Terbaru, Hitori Gotoh, No Backdoor, Cocok Buat Jaga Grub",
            tags: ["Hitori Gotoh", "No Enc", "Clean"],
            thumbnail: "https://youtu.be/dpyY5y5owp4", 
            downloadLink: "https://link2unlock.com/94943",
            uploadedAt: "2025-12-12"
        },
        {
            id: "sc_5",
            title: "Sc Bot Wa Terbaru, Chici-MD Cocok Buat Jaga Grub, Nobackdoor",
            tags: ["Chici-MD", "New Base", "Button"],
            thumbnail: "https://youtu.be/u6LWbfFj7Fs", 
            downloadLink: "https://link2unlock.com/4df3f",
            uploadedAt: "2025-12-09"
        },
        {
            id: "sc_4",
            title: "Sc Bot Wa Terbaru, Xiter-MD Cocok Untuk Jaga Grub, Nobackdoor",
            tags: ["Xiter-MD", "Anti-Spam", "Moderation"],
            thumbnail: "https://youtu.be/CK_QtVm-dOo",
            downloadLink: "https://link2unlock.com/b1829",
            uploadedAt: "2025-12-09"
        },
        {
            id: "sc_3",
            title: "Sc Bot Wa Terbaru, Hydro MD Cocok Untuk Jaga Grub, Nobackdoor",
            tags: ["Hydro MD", "Water Theme", "Fresh"],
            thumbnail: "https://youtu.be/466R2NghAA8",
            downloadLink: "https://link2unlock.com/97924",
            uploadedAt: "2025-11-09"
        },
        {
            id: "sc_2",
            title: "Sc Bot Wa Terbaru, Hayase Yuuka Cocok Untuk Jaga Grub, Nobackdoor",
            tags: ["Yuuka", "Blue Archive", "Waifu"],
            thumbnail: "https://youtu.be/iIuj0_dzGkc",
            downloadLink: "https://link2unlock.com/5434e",
            uploadedAt: "2025-11-09"
        },
        {
            id: "sc_1",
            title: "Sc Bot Wa Terbaru, Neo Flare V5, Menu Cpanel, Cocok Untuk Store",
            tags: ["Store", "Topup", "Panel"],
            thumbnail: "https://youtu.be/VeQyGIk3ZOc",
            downloadLink: "https://www.mediafire.com/file/vfpmumg7t31j3qo/Neo_Flare_v5.zip/file",
            uploadedAt: "2025-11-09"
        }
    ],

    // =================================================
    // 5. FOOTER & HALAMAN INFORMASI
    // ==================================================
    footer: {
        description: "Gudang All Script Bot WhatsApp Terbaik Secara Free Yang Bisa Kalian Coba. Mari Bergabung Dengan Komunitas Kami Untuk Mendapatkan Informasi Lebih Lanjut Seputar Script Bot Terbaru Selanjutnya Dan Jangan Lupa Untuk Membaca Syarat Dan Ketentuan Yang Sudah Kami Terakan Di website Ini.",
        copyright: "© 2025 AWANGXOFFC ID. ALL RIGHTS RESERVED."
    },

    footerPages: {
        tos: {
            title: "Syarat & Ketentuan",
            content: `
                <div class="space-y-4">
                    <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span class="text-blue-500 font-bold block mb-1">01. Penggunaan Bijak</span>
                        <p>Penggunaan script bot harus bijak dan tidak merugikan pihak lain.</p>
                    </div>
                    <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span class="text-blue-500 font-bold block mb-1">02. Dilarang Komersil</span>
                        <p>Dilarang keras memperjualbelikan script gratis ini.</p>
                    </div>
                    <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span class="text-blue-500 font-bold block mb-1">03. Tanggung Jawab</span>
                        <p>Kami tidak bertanggung jawab atas penyalahgunaan script oleh pengguna.</p>
                    </div>
                </div>`
        },
        privacy: {
            title: "Kebijakan Privasi",
            content: `
                <div class="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                    <p>Kami sangat menghargai privasi Anda. Berikut adalah data yang kami kumpulkan:</p>
                    <ul class="list-disc pl-5 space-y-2 text-gray-400">
                        <li>Data ulasan (nama publik dan komentar).</li>
                        <li>Data analitik anonim (jumlah kunjungan).</li>
                    </ul>
                    <p class="mt-4 text-blue-400">Kami tidak pernah menjual data pribadi Anda kepada pihak ketiga.</p>
                </div>`
        },
        about: {
            title: "Tentang Kami",
            content: `
                <div class="text-center">
                    <div class="relative w-24 h-24 mx-auto mb-4">
                        <img src="https://img1.pixhost.to/images/11233/676111704_hoshino-assistant.jpg" class="w-full h-full rounded-full border-2 border-blue-500 object-cover shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                    </div>
                    <h3 class="text-white font-bold text-sm mb-2">AWANGXOFFC ID</h3>
                    <p class="italic text-gray-400 mb-6">"Wadah kreatif bagi para pengembang bot WhatsApp."</p>
                    
                    <div class="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                        <p>Kami berdedikasi untuk menyediakan script berkualitas tinggi secara gratis untuk komunitas edukasi dan pengembangan.</p>
                    </div>
                </div>`
        }
    }
};
