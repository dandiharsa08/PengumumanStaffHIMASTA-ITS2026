// js/cek_debug.js - debug version: beri tahu kalau gagal muat, binding, atau data kosong
(function () {
  const DATA_URL = 'staff.json'; // sesuaikan jadi 'data/staff.json' jika file di folder data/
  const form = document.getElementById('cekForm');
  const nrpInput = document.getElementById('nrp');
  const resultEl = document.getElementById('result');
  const resetBtn = document.getElementById('resetBtn');

  console.log('[debug] mulai skrip debug');

  // Cek elemen
  if (!form || !nrpInput || !resultEl) {
    console.error('[debug] ELEMEN TIDAK DITEMUKAN:', { form: !!form, nrp: !!nrpInput, result: !!resultEl, resetBtn: !!resetBtn });
    if (resultEl) resultEl.innerHTML = '<div class="error"><p>Elemen halaman tidak ditemukan (cekForm, nrp, result). Periksa HTML.</p></div>';
    return;
  } else {
    console.log('[debug] Elemen ditemukan: form, nrp, result');
  }

  let staffData = [];

  function show(text, cls='info') {
    console.log('[debug]', text);
    resultEl.innerHTML = `<div class="${cls}"><p>${text}</p></div>`;
  }

  // Muat data
  fetch(DATA_URL, {cache:'no-store'})
    .then(r => {
      console.log('[debug] fetch', DATA_URL, 'status', r.status);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(json => {
      if (!Array.isArray(json)) {
        console.error('[debug] data bukan array', json);
        show('Format data/staff.json salah (bukan array). Lihat console.', 'error');
        return;
      }
      staffData = json;
      show('Data staff dimuat. Entri: ' + staffData.length, 'success');
      console.log('[debug] contoh entri', staffData.slice(0,3));
    })
    .catch(err => {
      console.error('[debug] gagal load staff.json', err);
      show('Gagal memuat staff.json: ' + err.message, 'error');
    });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    resultEl.innerHTML = '';
    const nrp = (nrpInput.value || '').trim();
    if (!nrp) { show('Harap masukkan NRP', 'error'); return; }
    if (!staffData.length) { show('Data belum dimuat atau kosong. Periksa console/Network.', 'error'); return; }
    const found = staffData.find(s => String(s.nrp).trim() === nrp);
    console.log('[debug] cari nrp', nrp, '=>', found);
    if (!found) {
      show('❌ NRP tidak terdaftar.', 'error');
    } else {
      const status = String(found.status || '').toLowerCase().trim();
      if (status === 'lolos' || status === 'lulus' || status === 'accepted') {
        show('🎉 SELAMAT! ' + (found.nama || '') , 'success');
      } else {
        show('❌ Status ditemukan: "' + (found.status || 'tidak diketahui') + '" — tidak lolos.', 'error');
      }
    }
  });

  if (resetBtn) resetBtn.addEventListener('click', function () { form.reset(); resultEl.innerHTML = ''; nrpInput.focus(); });

  // Jika ada ?nrp=... di URL, otomatis isi dan submit setelah data dimuat
  const urlNrp = new URLSearchParams(window.location.search).get('nrp');
  if (urlNrp) {
    nrpInput.value = urlNrp;
    // tunggu sebentar sampai data dimuat
    setTimeout(()=>{ if (document.activeElement !== nrpInput) nrpInput.blur(); form.dispatchEvent(new Event('submit')); }, 600);
  }
})();