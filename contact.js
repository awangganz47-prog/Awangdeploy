import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = e => { 
    if(e.keyCode==123 || (e.ctrlKey && e.shiftKey && (e.keyCode==73||e.keyCode==67||e.keyCode==74)) || (e.ctrlKey && e.keyCode==85)) return false; 
}

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

const bgBase = document.getElementById('bg-base');
const currentTheme = localStorage.getItem('theme') || 'dark';

if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
}
if(bgBase) bgBase.style.backgroundImage = getBgStyle(currentTheme);

const app = initializeApp(config.firebaseConfig);
const db = getDatabase(app);
const ticketsRef = ref(db, 'siteDataV4/tickets');

const ADMIN_EMAIL = "awangcustomerservice@gmail.com";
window.currentCategory = 'bug';

window.selectCategory = (cat) => {
    window.currentCategory = cat;
    document.querySelectorAll('.cat-btn-modern').forEach(b => b.classList.remove('active'));
    const targetBtn = document.getElementById(`cat-${cat}`);
    if(targetBtn) targetBtn.classList.add('active');
};

window.submitTicket = async () => {
    const name = document.getElementById('ticketName').value.trim();
    const msg = document.getElementById('ticketMsg').value.trim();
    const btn = document.getElementById('submitTicketBtn');

    if (!navigator.onLine) {
        alert("Koneksi terputus! Silakan periksa jaringan Anda.");
        return;
    }

    if (!name || !msg) {
        alert("Semua kolom form wajib diisi!");
        return;
    }

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> MEMPROSES...';
    btn.classList.add('btn-loading');

    const ticketId = 'AWG-' + Math.floor(1000 + Math.random() * 9000);

    try {
        await push(ticketsRef, {
            ticketId: ticketId,
            name: name,
            message: msg,
            category: window.currentCategory,
            status: 'pending',
            timestamp: serverTimestamp(),
            device: navigator.userAgent
        });
    } catch (e) {}

    try {
        const response = await fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: `Pesan Masuk: ${name} [${ticketId}]`,
                _template: "table",
                _captcha: "false",
                Pengirim: name,
                Kategori: window.currentCategory.toUpperCase(),
                Isi_Pesan: msg,
                ID_Tiket: ticketId
            })
        });

        if (response.ok) {
            alert("Pesan berhasil terkirim dengan aman!");
            document.getElementById('ticketMsg').value = '';
            document.getElementById('ticketName').value = '';
            
            btn.innerHTML = '<i class="fas fa-check-circle"></i> BERHASIL';
            btn.classList.remove('btn-loading');
            btn.classList.add('btn-success');
        } else {
            throw new Error("Server Reject");
        }

    } catch (err) {
        alert("Server email sibuk, mengalihkan otomatis ke WhatsApp...");
        setTimeout(() => {
            const waText = `*Pesan Website Baru*%0A%0A*Nama:* ${name}%0A*Kategori:* ${window.currentCategory.toUpperCase()}%0A*Pesan:* ${msg}`;
            const waLink = `https://wa.me/6281234567890?text=${waText}`;
            window.open(waLink, '_blank');
        }, 1500);

    } finally {
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalText;
            btn.classList.remove('btn-loading', 'btn-success');
        }, 4000);
    }
};
