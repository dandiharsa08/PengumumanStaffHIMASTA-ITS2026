// js/cek.js - versi yang memuat data, mendebug, dan otomatis cek dari URL ?nrp=...
(function () {
  const DATA_URL = 'data/staff.json';
  let staffData = [];

  const form = document.getElementById('cekForm');
  const nrpInput = document.getElementById('nrp');
  const resultEl = document.getElementById('result');
  const resetBtn = document.getElementById('resetBtn');

  if (!form || !nrpInput || !resultEl) {
    console.error('[cek.js] Elemen halaman tidak ditemukan (cekForm, nrp, result).');
    return;
  }

  function showMessage(text, type = 'info') {
    const cls = type === 'error' ? 'error' : (type === 'success' ? 'success' : 'small muted');
    resultEl.innerHTML = `<div class="${cls}"><p>${text}</p></div>`;
  }

  // Ambil query param 'nrp' jika ada
  function getQueryNrp() {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('nrp');
      return q ? q.trim() : null;
    } catch (e) {
      return null;
    }
  }

  // Muat data staff
  function loadData() {
    showMessage('Memuat data staff...');
    return fetch(DATA_URL, { cache: 'no-store' })
      .then(resp => {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      })
      .then(json => {
        if (!Array.isArray(json)) throw new Error('Format JSON bukan array');
        staffData = json;
        console.log('[cek.js] staffData loaded, count=', staffData.length);
        showMessage('Data staff dimuat. Jumlah entri: ' + staffData.length);
        return staffData;
      })
      .catch(err => {
        console.error('[cek.js] gagal muat data:', err);
        showMessage('Gagal memuat data/staff.json: ' + err.message, 'error');
        throw err;
      });
  }

  function findStaffByNrp(nrp) {
    if (!nrp) return null;
    return staffData.find(s => String(s.nrp).trim() === String(nrp).trim());
  }

  function doCheck(nrp) {
    resultEl.innerHTML = '';
    if (!nrp) {
      showMessage('Harap masukkan NRP.', 'error');
      return;
    }
    if (!staffData || staffData.length === 0) {
      showMessage('Data staff belum ter-load. Coba refresh halaman.', 'error');
      return;
    }
    const found = findStaffByNrp(nrp);
    console.log('[cek.js] mencari nrp=', nrp, '=>', found);
    if (!found) {
      showMessage('❌ NRP tidak terdaftar atau belum dinyatakan lolos.', 'error');
      return;
    }
    const status = String(found.status || '').trim().toLowerCase();
    if (status === 'lolos' || status === 'lulus' || status === 'accepted') {
      // tampilkan pesan sukses
      resultEl.innerHTML = `
        <div class="success">
          <h3>SELAMAT!</h3>
          <p><strong>Kamu resmi menjadi bagian dari<br/>Staff HIMASTA-ITS 2026<br/>Kabinet Resonansi Sinergis</strong></p>
          <p>Nama: ${escapeHtml(found.nama || '-')}</p>
        </div>`;
    } else {
      showMessage(`❌ Ditemukan NRP tetapi status: "${escapeHtml(found.status || 'tidak diketahui')}". Tidak dinyatakan lolos.`, 'error');
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Event binding
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

  // Inisialisasi: load data, kemudian kalau ada ?nrp=... otomatis cek dan isi input
  document.addEventListener('DOMContentLoaded', function () {
    loadData()
      .then(() => {
        const qnrp = getQueryNrp();
        if (qnrp) {
          nrpInput.value = qnrp;
          // beri sedikit delay supaya UI sudah siap lalu langsung cek
          setTimeout(() => doCheck(qnrp), 300);
        }
      })
      .catch(() => {
        // gagal load data sudah ditangani di loadData()
      });
  });
})();