// js/cek.js
// Versi final: menampilkan pesan sesuai permintaan:
// - jika lolos: pesan SELAMAT + tombol WA ke CP + tombol isi form
// - jika tidak lolos: pesan penyemangat
// - jika tidak terdaftar: pesan "Kamu tidak terdaftar. Maaf yaa"

(function () {
  const POSSIBLE_PATHS = ['data/staff.json', 'staff.json'];
  let staffData = [];

  // CONFIG: ganti sesuai data Anda
  const CP = { name: 'Dandy', phoneWa: '62xxxxxxxx', display: '08xxxxxxxx' }; // ganti phoneWa & display
  const GOOGLE_FORM_URL = 'https://form.id'; // ganti dengan link form

  const form = document.getElementById('cekForm');
  const nrpInput = document.getElementById('nrp');
  const resultEl = document.getElementById('result');
  const resetBtn = document.getElementById('resetBtn');

  if (!form || !nrpInput || !resultEl) {
    console.error('[cek.js] Elemen halaman tidak ditemukan. Pastikan id cekForm, nrp, result ada.');
    return;
  }

  function showHtml(html) { resultEl.innerHTML = html; }

  async function loadData() {
    for (const p of POSSIBLE_PATHS) {
      try {
        const r = await fetch(p, { cache: 'no-store' });
        console.log('[cek.js] fetch', p, '=>', r.status);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const json = await r.json();
        if (!Array.isArray(json)) throw new Error('Format JSON bukan array');
        staffData = json;
        return;
      } catch (err) {
        console.warn('[cek.js] gagal load', p, err.message || err);
      }
    }
    throw new Error('Tidak dapat memuat data staff');
  }

  function findStaff(nrp) {
    return staffData.find(s => String(s.nrp).trim() === String(nrp).trim());
  }

  function renderLolos(found) {
    const name = escapeHtml(found.nama || '-');
    const waLink = `https://wa.me/${CP.phoneWa}`;
    const formLink = GOOGLE_FORM_URL;
    showHtml(`
      <div class="success" role="status">
        <h3>SELAMAT!</h3>
        <p><strong>Kamu lolos menjadi bagian dari Staff HIMASTA-ITS 2026<br/>Kabinet Resonansi Sinergis</strong></p>
        <p>Nama: ${name}</p>
        <p>Silahkan menghubungi CP berikut</p>
        <p><strong>${escapeHtml(CP.name)} (${escapeHtml(CP.display)})</strong></p>
        <p style="margin-top:10px;">dan mengisi form berikut</p>
        <p><strong><a href="${escapeAttr(formLink)}" target="_blank" rel="noopener">${escapeHtml(formLink)}</a></strong></p>

        <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
          <a class="btn" href="${escapeAttr(formLink)}" target="_blank" rel="noopener" style="background:linear-gradient(90deg,var(--brand-blue),var(--brand-green)); color:white;">ISI FORM</a>
          <a class="btn" href="${escapeAttr(waLink)}" target="_blank" rel="noopener" style="background:var(--brand-blue); color:white;">KONFIRMASI KE ${escapeHtml(CP.name)}</a>
        </div>
      </div>
    `);
  }

  function renderTidakLolos() {
    showHtml(`
      <div class="error" role="status">
        <p>Maaf.... mungkin ini bukan rezeki mu untuk bergabung bersama HIMASTA-ITS 2026.</p>
        <p>Tapi jangan berkecil hati karena tempat belajar tidak hanya di HIMASTA-ITS. Semangat teruss yaaa dan Goodluck!</p>
      </div>
    `);
  }

  function renderTidakTerdaftar() {
    showHtml(`<div class="error"><p>Kamu tidak terdaftar. Maaf yaa</p></div>`);
  }

  function doCheck(nrp) {
    resultEl.innerHTML = '';
    if (!nrp || !nrp.trim()) {
      renderTidakTerdaftar();
      return;
    }
    if (!staffData || staffData.length === 0) {
      showHtml('<div class="error"><p>Data staff belum ter-load. Coba refresh halaman.</p></div>');
      return;
    }
    const found = findStaff(nrp);
    if (!found) { renderTidakTerdaftar(); return; }
    const status = String(found.status || '').trim().toLowerCase();
    if (status === 'lolos' || status === 'lulus' || status === 'accepted') renderLolos(found);
    else renderTidakLolos();
  }

  function bindForm() {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      doCheck(nrpInput.value);
    });
    if (resetBtn) resetBtn.addEventListener('click', function () { form.reset(); resultEl.innerHTML = ''; nrpInput.focus(); });
  }

  function escapeHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }
  function escapeAttr(s){ return String(s||'').replace(/"/g,'%22'); }

  // init
  document.addEventListener('DOMContentLoaded', async function () {
    try {
      await loadData();
    } catch (err) {
      console.error('[cek.js] loadData error', err);
      showHtml('<div class="error"><p>Gagal memuat data staff. Periksa staff.json di repo.</p></div>');
    }
    bindForm();
    const q = new URLSearchParams(window.location.search).get('nrp');
    if (q) {
      nrpInput.value = q;
      setTimeout(()=> doCheck(q), 200);
    }
  });
})();