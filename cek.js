// js/cek.js
// Versi final: menampilkan pesan sesuai permintaan pengguna:
// - jika lolos: pesan SELAMAT + tombol WA ke CP + tombol isi form
// - jika tidak lolos: pesan penyemangat
// - jika tidak terdaftar: pesan "Kamu tidak terdaftar. Maaf yaa"
// Juga mencoba memuat data dari 'data/staff.json' lalu 'staff.json', dan mendukung ?nrp=... otomatis.

(function () {
  const POSSIBLE_PATHS = ['data/staff.json', 'staff.json'];
  let staffData = [];

  // -- KONFIGURASI: ganti nomor WA dan link form sesuai data sebenarnya --
  // Nomor WA harus dalam format internasional tanpa '+', contoh untuk 08xxxxxxxx -> 628xxxxxxxx
  const CP = {
    name: 'Dandy',
    phoneWa: '62xxxxxxxx', // ganti menjadi nomor CP (contoh: '6281234567890')
    display: '08xxxxxxxx'   // tampilan nomor lokal (opsional)
  };
  const GOOGLE_FORM_URL = 'https://form.id'; // ganti dengan link Google Form / form.id sesuai permintaan

  // ---------------------------------------------------------------------
  const form = document.getElementById('cekForm');
  const nrpInput = document.getElementById('nrp');
  const resultEl = document.getElementById('result');
  const resetBtn = document.getElementById('resetBtn');

  if (!form || !nrpInput || !resultEl) {
    console.error('[cek.js] Elemen halaman (cekForm / nrp / result) tidak ditemukan. Periksa pengumuman.html');
    return;
  }

  function showMessageHtml(html) {
    resultEl.innerHTML = html;
  }

  function showSimpleMessage(text, kind = 'info') {
    if (kind === 'error') {
      showMessageHtml(`<div class="error"><p>${escapeHtml(text)}</p></div>`);
    } else if (kind === 'success') {
      showMessageHtml(`<div class="success"><p>${escapeHtml(text)}</p></div>`);
    } else {
      showMessageHtml(`<div class="hint"><p>${escapeHtml(text)}</p></div>`);
    }
  }

  async function loadData() {
    for (const p of POSSIBLE_PATHS) {
      try {
        const resp = await fetch(p, { cache: 'no-store' });
        console.log('[cek.js] fetching', p, resp.status);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const json = await resp.json();
        if (!Array.isArray(json)) throw new Error('Format JSON bukan array');
        staffData = json;
        console.log('[cek.js] data loaded from', p, 'entries=', staffData.length);
        return;
      } catch (err) {
        console.warn('[cek.js] gagal load', p, err && err.message ? err.message : err);
      }
    }
    throw new Error('Tidak dapat memuat data staff dari lokasi yang diharapkan');
  }

  function findStaff(nrp) {
    return staffData.find(s => String(s.nrp).trim() === String(nrp).trim());
  }

  function renderSuccess(found) {
    const name = escapeHtml(found.nama || '-');
    const waLink = `https://wa.me/${CP.phoneWa}`;
    const formLink = GOOGLE_FORM_URL;

    const html = `
      <div class="success" role="status">
        <h3>SELAMAT!</h3>
        <p><strong>Kamu lolos menjadi bagian dari<br/>Staff HIMASTA-ITS 2026<br/>Kabinet Resonansi Sinergis</strong></p>
        <p>Nama: ${name}</p>

        <div style="margin-top:12px;">
          <p>Silahkan menghubungi CP berikut</p>
          <p><strong>${escapeHtml(CP.name)} (${escapeHtml(CP.phoneWa)})</strong></p>

          <p style="margin-top:10px;">dan mengisi form berikut</p>
          <p><strong><a href="${escapeAttr(formLink)}" target="_blank" rel="noopener">${escapeHtml(formLink)}</a></strong></p>

          <div class="controls" style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
            <a class="btn" href="${escapeAttr(formLink)}" target="_blank" rel="noopener" style="background:linear-gradient(90deg,var(--brand-blue),var(--brand-green)); color:white;">ISI FORM</a>
            <a class="btn" href="${escapeAttr(waLink)}" target="_blank" rel="noopener" style="background:var(--brand-blue); color:white;">KONFIRMASI KE ${escapeHtml(CP.name)}</a>
          </div>
        </div>
      </div>
    `;
    showMessageHtml(html);
  }

  function renderNotPassed(found) {
    const html = `
      <div class="error" role="status">
        <p>Maaf.... mungkin ini bukan rezeki mu untuk bergabung bersama HIMASTA-ITS 2026.</p>
        <p>Tapi jangan berkecil hati karena tempat belajar tidak hanya di HIMASTA-ITS. Semangat teruss yaaa dan Goodluck!</p>
      </div>
    `;
    showMessageHtml(html);
  }

  function renderNotRegistered() {
    const html = `<div class="error"><p>Kamu tidak terdaftar. Maaf yaa</p></div>`;
    showMessageHtml(html);
  }

  function doCheck(nrp) {
    resultEl.innerHTML = '';
    if (!nrp || !nrp.trim()) {
      renderNotRegistered();
      return;
    }
    if (!staffData || staffData.length === 0) {
      showSimpleMessage('Data staff belum ter-load/ kosong. Periksa console/Network.', 'error');
      return;
    }
    const found = findStaff(nrp);
    console.log('[cek.js] mencari nrp=', nrp, '=>', found);

    if (!found) {
      renderNotRegistered();
      return;
    }

    const status = String(found.status || '').trim().toLowerCase();
    if (status === 'lolos' || status === 'lulus' || status === 'accepted') {
      renderSuccess(found);
    } else {
      renderNotPassed(found);
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
        resultEl.innerHTML = '';
        nrpInput.focus();
      });
    }
  }

  // escape helpers
  function escapeHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
  function escapeAttr(s){ return String(s || '').replace(/"/g, '%22'); }

  // init
  document.addEventListener('DOMContentLoaded', async function () {
    try {
      await loadData();
      bindForm();
      // auto-check from ?nrp=...
      const params = new URLSearchParams(window.location.search);
      const qnrp = params.get('nrp');
      if (qnrp) {
        nrpInput.value = qnrp;
        setTimeout(()=> doCheck(qnrp), 250);
      }
    } catch (err) {
      console.error('[cek.js] init error:', err);
      showSimpleMessage('Gagal memuat data staff. Periksa file staff.json atau data/staff.json di repo.', 'error');
      bindForm(); // tetap bind supaya user bisa submit dan melihat pesan
    }
  });
})();