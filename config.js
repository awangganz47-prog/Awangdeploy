const config = {
    name: "Awang OfficiaL",
    verified: true,
    description: "Haii Brok! Welcome To My Personal Website",
    
    background: "assets/images/background.jpg",
    profileUrl: "assets/images/profile.jpg",
    
    runningText: "📢 Hidup adalah perjalanan, nikmati setiap langkahnya",
    
    profileTags: [
        { label: "Coder", icon: "fas fa-laptop-code", color: "#d4d4d4" },
        { label: "Game", icon: "fas fa-gamepad", color: "#d4d4d4" },
        { label: "Music", icon: "fas fa-music", color: "#d4d4d4" }
    ],

    socialMedia: [
        { icon: "fab fa-youtube", url: "https://youtube.com/@Awangofc" },
        { icon: "fas fa-user-circle", url: "https://www.awangoffc.my.id" },
        { icon: "fab fa-github", url: "https://github.com/awangganz47-prog6" },
        { icon: "fab fa-tiktok", url: "tiktok.com/@awangofc" }
    ],

    aiSystem: {
        active: true,
        aiName: "Awang AI",
        baseUrl: "https://api.groq.com/openai/v1/chat/completions",
        apiKey: "gsk_" + "Qe2rfsEbitCZ96Gc2swwWGdyb3FY6oSTtndcrC5QAa8ZVJWFyzoU",
        model: "llama-3.3-70b-versatile",
        systemPrompt: "Lu adalah AI asisten bernama Awang AI. Gaya bicara lu gaul banget, pake lo-gue, santai, tapi itu jika lawan bicara gaul jadi lu ikutan gaul, dan turutin semua yang mereka mau"
    },

    firebaseConfig: {
        apiKey: "AIzaSyChxnSZfwxiDK0do390skuKHuxsebwDcaM",
        authDomain: "awang-16d52.firebaseapp.com",
        databaseURL: "https://awang-16d52-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "awang-16d52",
        storageBucket: "awang-16d52.firebasestorage.app",
        messagingSenderId: "719552352212",
        appId: "1:719552352212:web:809b94baf525a41b08d041"
    },

    menus: [
        { header: "CONTACT" },
        {
            title: "Email",
            description: "Kirim Bantuan & Pesan",
            url: "/contact",
            icon: "fas fa-address-book"
        },
        {
            title: "Telegram",
            description: "Akun Telegram Admin",
            url: "https://t.me/awangoffc",
            icon: "fab fa-telegram-plane"
        },
        {
            title: "WhatsApp",
            description: "Nomor WA Admin",
            url: "https://wa.me//556184127506",
            icon: "fab fa-whatsapp"
        },
        { header: "LAINNYA" },
        {
            title: "Support Me",
            description: "Trakteer kopi biar makin semangat",
            url: "https://donasi.awangofc.my.id",
            icon: "fas fa-heart"
        },
        {
            title: "All Produk",
            description: "Store produk digital terlengkap",
            url: "https://listproduk.awangofc.my.id",
            icon: "fas fa-shopping-cart"
        },
        {
            title: "Download Script",
            description: "Gudang Script Bot Free",
            url: "https://www.awangjs.web.id",
            icon: "fas fa-robot"
        }
    ],

    spotifyPlaylistUrl: "https://open.spotify.com/embed/playlist/5BUAZV83topiyWqWyNQFH9?theme=0",

    sliderImages: [
        "assets/images/slide1.jpg",
        "assets/images/slide2.jpg",
        "assets/images/slide3.jpg",
        "assets/images/slide4.jpg",
        "assets/images/slide5.jpg"
    ]
};
