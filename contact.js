import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = e => { 
    if(e.keyCode==123 || (e.ctrlKey && e.shiftKey && (e.keyCode==73||e.keyCode==67||e.keyCode==74)) || (e.ctrlKey && e.keyCode==85)) return false;
}

window.toggleDropdown = () => {
    const drop = document.getElementById('cpDropdown');
    const icon = document.getElementById('cpToggleIcon');
    if(drop && icon) {
        if(drop.classList.contains('show')) {
            drop.classList.remove('show');
            icon.className = 'fas fa-chevron-down';
        } else {
            drop.classList.add('show');
            icon.className = 'fas fa-chevron-up';
        }
    }
};

window.copyContact = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('copyToast');
        if(toast) {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2500);
        }
    }).catch(err => {
        alert("Gagal menyalin text!");
    });
};

if(typeof config !== 'undefined') {
    const nameEl = document.getElementById('contactWebName');
    const locNameEl = document.getElementById('locationNameConfig');
    
    if(nameEl && config.name) nameEl.innerText = config.name;
    if(locNameEl && config.locationName) locNameEl.innerText = config.locationName;
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

window.submitTicket = async () => {
    const name = document.getElementById('ticketName').value.trim();
    const email = document.getElementById('ticketEmail').value.trim();
    const msg = document.getElementById('ticketMsg').value.trim();
    const btn = document.getElementById('submitTicketBtn');

    if (!navigator.onLine) {
        alert("Koneksi terputus! Silakan periksa jaringan Anda.");
        return;
    }

    if (!name || !email || !msg) {
        alert("Semua kolom form wajib diisi!");
        return;
    }

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Memproses...';
    btn.classList.add('btn-loading');
    const ticketId = 'AWG-' + Math.floor(1000 + Math.random() * 9000);
    try {
        await push(ticketsRef, {
            ticketId: ticketId,
            name: name,
            email: email,
            message: msg,
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
                Email: email,
                Isi_Pesan: msg,
                ID_Tiket: ticketId
            })
        });
        if (response.ok) {
            alert("Pesan berhasil terkirim dengan aman!");
            document.getElementById('ticketMsg').value = '';
            document.getElementById('ticketEmail').value = '';
            document.getElementById('ticketName').value = '';
            
            btn.innerHTML = '<i class="fas fa-check-circle"></i> Berhasil Terkirim';
            btn.classList.remove('btn-loading');
            btn.classList.add('btn-success');
        } else {
            throw new Error("Server Reject");
        }

    } catch (err) {
        alert("Server email sibuk, mengalihkan otomatis ke WhatsApp...");
        setTimeout(() => {
            const waText = `*Pesan Website Baru*%0A%0A*Nama:* ${name}%0A*Email:* ${email}%0A*Pesan:* ${msg}`;
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
