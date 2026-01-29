// js/cek.js
// Versi final: pesan persis sesuai permintaan
// - Lolos: tampilkan pesan SELAMAT + info CP + link form
// - Tidak lolos: tampilkan pesan penyemangat
// - Tidak terdaftar: tampilkan "Kamu tidak terdaftar. Maaf yaa"
// Mendukung auto-check ?nrp=... dan mencoba memuat dari 'data/staff.json' lalu 'staff.json'

(function () {
  const POSSIBLE_PATHS = ['data/staff.json', 'staff.json'];
  let staffData = [];

  // === CONFIG: ganti nilai berikut sesuai data sebenarnya ===
  const CP = {
    name: 'Dandy',
    phoneWa: '62xxxxxxxx', // contoh: '6281234567890' (tanpa '+')
    display: '08xxxxxxxx'  // tampilan lokal jika mau (opsional)
  };
  const GOOGLE_FORM_URL = 'https://form.id'; // ganti jadi link form Anda (mis. https://forms.gle/...)
  // =========================================================

  const form = document.getElementById('cekForm');
  const nrpInput = document.getElementById('nrp');
  const resultEl = document.getElementById('result');
  const resetBtn = document.getElementById('resetBtn');

  if (!form || !nrpInput || !resultEl) {
    console.error('[cek.js] Elemen halaman tidak ditemukan. Pastikan id cekForm, nrp, result ada di HTML.');
    return;
  }

  async function loadData() {
    for (const path of POSSIBLE_PATHS) {
      try {
        const resp = await fetch(path, { cache: 'no-store' });
        console.log('[cek.js] fetching', path, '=>', resp.status);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const json = await resp.json();
        if (!Array.isArray(json)) throw new Error('Format JSON bukan array');
        staffData = json;
        return;
      } catch (err) {
        console.warn('[cek.js] gagal load', path, err && err.message ? err.message : err);
      }
    }
    // jika semua gagal, biarkan staffData kosong dan beri pesan di UI saat submit
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  function renderLolos(staff) {
    const name = escapeHtml(staff.nama || '-');
    const waLink = `https://wa.me/${CP.phoneWa}`;
    const formLink = GOOGLE_FORM_URL;

    resultEl.innerHTML = `
      <div class="success" role="status">
        <h3>SELAMAT!</h3>
        <p><strong>Kamu lolos menjadi bagian dari Staff HIMASTA-ITS 2026<br/>Kabinet Resonansi Sinergis</strong></p>
        <p>Nama: ${name}</p>

        <p style="margin-top:12px;"><strong>Silahkan menghubungi CP berikut</strong></p>
        <p>${escapeHtml(CP.name)} (${escapeHtml(CP.phoneWa)})</p>

        <p style="margin-top:12px;"><strong>dan mengisi form berikut</strong></p>
        <p><a href="${escapeHtml(formLink)}" target="_blank" rel="noopener">${escapeHtml(formLink)}</a></p>

        <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
          <a class="btn" href="${escapeHtml(formLink)}" target="_blank" rel="noopener" style="background:linear-gradient(90deg,var(--brand-blue),var(--brand-green)); color:white;">ISI FORM</a>
          <a class="btn" href="${escapeHtml(waLink)}" target="_blank" rel="noopener" style="background:var(--brand-blue); color:white;">KONFIRMASI KE ${escapeHtml(CP.name)}</a>
        </div>
      </div>
    `;
  }

  function renderTidakLolos() {
    resultEl.innerHTML = `
      <div class="error" role="status">
        <p>Maaf.... mungkin ini bukan rezeki mu untuk bergabung bersama HIMASTA-ITS 2026.</p>
        <p>Tapi jangan berkecil hati karena tempat belajar tidak hanya di HIMASTA-ITS. Semangat teruss yaaa dan Goodluck!</p>
      </div>
    `;
  }

  function renderTidakTerdaftar() {
    resultEl.innerHTML = `<div class="error"><p>Kamu tidak terdaftar. Maaf yaa</p></div>`;
  }

  function findStaffByNrp(nrp) {
    return staffData.find(s => String(s.nrp).trim() === String(nrp).trim());
  }

  function doCheck(nrp) {
    // normalisasi
    const nrpNorm = (nrp || '').trim();
    if (!nrpNorm) {
      // Jika user mengirim kosong, anggap tidak terdaftar sesuai permintaan
      renderTidakTerdaftar();
      return;
    }

    if (!staffData || staffData.length === 0) {
      // Jika data belum ter-load, beri tahu user
      resultEl.innerHTML = `<div class="error"><p>Data staff belum ter‑load. Silakan refresh halaman atau periksa file staff.json.</p></div>`;
      return;
    }

    const found = findStaffByNrp(nrpNorm);
    if (!found) {
      renderTidakTerdaftar();
      return;
    }

    const status = String(found.status || '').trim().toLowerCase();
    if (status === 'lolos' || status === 'lulus' || status === 'accepted') {
      renderLolos(found);
    } else {
      renderTidakLolos();
    }
  }

  function bindForm() {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      doCheck(nrpInput.value);
    });
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        form.reset();
        resultEl.innerHTML = `<div class="hint"><p class="muted">Hasil akan muncul di sini setelah pengecekan.</p></div>`;
        nrpInput.focus();
      });
    }
  }

  // init: muat data lalu bind form, juga support ?nrp=...
  document.addEventListener('DOMContentLoaded', async function () {
    await loadData();
    bindForm();

    // auto-check jika ada ?nrp=...
    const q = new URLSearchParams(window.location.search).get('nrp');
    if (q) {
      nrpInput.value = q;
      setTimeout(() => doCheck(q), 200);
    }
  });
})();
