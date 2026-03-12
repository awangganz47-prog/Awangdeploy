import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = e => { 
    if(e.keyCode==123 || (e.ctrlKey && e.shiftKey && (e.keyCode==73||e.keyCode==67||e.keyCode==74)) || (e.ctrlKey && e.keyCode==85)) return false; 
}

if(config.background) document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.9)), url('${config.background}')`;

const app = initializeApp(config.firebaseConfig);
const db = getDatabase(app);
const ticketsRef = ref(db, 'siteDataV4/tickets');

const ADMIN_EMAIL = "awangcustomerservice@gmail.com";
window.currentCategory = 'bug';

window.selectCategory = (cat) => {
    window.currentCategory = cat;
    document.querySelectorAll('.cat-btn-pill').forEach(b => b.classList.remove('active'));
    const targetBtn = document.getElementById(`cat-${cat}`);
    if(targetBtn) targetBtn.classList.add('active');
};

window.submitTicket = async () => {
    const name = document.getElementById('ticketName').value.trim();
    const msg = document.getElementById('ticketMsg').value.trim();
    const btn = document.getElementById('submitTicketBtn');

    if (!navigator.onLine) {
        alert("Waduh koneksi keputus nih brok, coba cek internet lu dulu ya.");
        return;
    }

    if (!name || !msg) {
        alert("Nama sama isi pesannya jangan dikosongin ya brok, wajib diisi nih!");
        return;
    }

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> LAGI PROSES...';
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
    } catch (e) {
        console.error("Database Error:", e);
    }

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
            alert("Mantap brok! Pesan lu udah sukses meluncur ke email gue.");
            document.getElementById('ticketMsg').value = '';
            
            btn.innerHTML = '<i class="fas fa-check-circle"></i> PESAN TERKIRIM';
            btn.classList.remove('btn-loading');
            btn.classList.add('btn-success');
        } else {
            throw new Error("Server Reject");
        }

    } catch (err) {
        alert("Sistem email lagi padat brok, pesan dialihin otomatis ke WhatsApp gue ya...");
        setTimeout(() => {
            const waText = `*Pesan Dari Website*%0A%0A*Nama:* ${name}%0A*Kategori:* ${window.currentCategory.toUpperCase()}%0A*Pesan:* ${msg}`;
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
