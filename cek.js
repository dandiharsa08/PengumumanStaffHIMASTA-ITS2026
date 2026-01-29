// js/cek.js
// Mengambil data dari data/staff.json lalu melakukan validasi NRP di sisi klien.
// Semua pesan dan logika diselesaikan di sini (tidak ada backend).

(function () {
  const DATA_URL = 'data/staff.json';
  let staffData = [];

  // Element references
  const form = document.getElementById('cekForm');
  const nrpInput = document.getElementById('nrp');
  const resultEl = document.getElementById('result');
  const resetBtn = document.getElementById('resetBtn');

  // Muat data JSON saat DOM siap
  document.addEventListener('DOMContentLoaded', function () {
    fetch(DATA_URL, {cache: "no-store"})
      .then(resp => {
        if (!resp.ok) throw new Error('Gagal memuat data staff');
        return resp.json();
      })
      .then(json => {
        if (!Array.isArray(json)) throw new Error('Format data tidak valid');
        staffData = json;
      })
      .catch(err => {
        console.error(err);
        showMessage('Tidak dapat memuat data staff. Silakan coba lagi nanti.', 'error');
      });
  });

  // Reset form
  resetBtn.addEventListener('click', function () {
    form.reset();
    clearResult();
    nrpInput.focus();
  });

  // Form submit handler
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearResult();

    const raw = nrpInput.value || '';
    const nrp = raw.trim();

    if (!nrp) {
      showMessage('Harap masukkan NRP.', 'error');
      return;
    }

    // Cari NRP (exact match). Data NRP dianggap string.
    const found = staffData.find(s => String(s.nrp).trim() === nrp);

    if (!found) {
      showMessage('❌ NRP tidak terdaftar atau belum dinyatakan lolos.', 'error');
      return;
    }

    // Jika ketemu, periksa status
    if (String(found.status).toLowerCase() === 'lolos') {
      showSuccess(found);
    } else {
      showMessage('❌ NRP tidak terdaftar atau belum dinyatakan lolos.', 'error');
    }
  });

  // Tampilkan pesan error atau not found
  function showMessage(text, type = 'error') {
    resultEl.innerHTML = '';
    const div = document.createElement('div');
    div.className = type === 'error' ? 'error' : '';
    div.innerHTML = `<p>${text}</p>`;
    resultEl.appendChild(div);
  }

  // Tampilkan hasil sukses lengkap dengan tombol form dan kontak CP
  function showSuccess(staff) {
    resultEl.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'success';

    const namaEsc = escapeHtml(staff.nama || 'Nama tidak tersedia');
    // Pesan resmi sesuai permintaan
    wrapper.innerHTML = `
      <h3>SELAMAT!</h3>
      <p><strong>Kamu resmi menjadi bagian dari<br/>
      Staff HIMASTA-ITS 2026<br/>
      Kabinet Resonansi Sinergis</strong></p>
      <p>Silakan melengkapi data untuk kebutuhan Welcome Party dan konfirmasi ke CP.</p>
    `;

    // Controls: Isi Form & Konfirmasi CP (link wa.me)
    const controls = document.createElement('div');
    controls.className = 'controls';

    // Ganti URL berikut dengan Google Form resmi Anda
    const googleFormURL = 'https://docs.google.com/forms/d/e/1FAIpQLSf_example_form_link/viewform';

    const formBtn = document.createElement('a');
    formBtn.className = 'formBtn';
    formBtn.href = googleFormURL;
    formBtn.target = '_blank';
    formBtn.rel = 'noopener';
    formBtn.textContent = 'ISI FORM WELCOME PARTY';

    // CP yang Anda berikan — tampilkan nomor lokal (08...) tapi gunakan format wa.me (62...) untuk link
    // Gantilah '628xxxxxxxx' dengan nomor sebenarnya (hilangkan leading 0, gunakan 62)
    const cpList = [
      { name: 'Dandy', phoneWa: '628xxxxxxxx', display: '08xxxxxxxx' },
      { name: 'Sekdep HIMASTA', phoneWa: '628xxxxxxxx', display: '08xxxxxxxx' }
    ];

    controls.appendChild(formBtn);

    cpList.forEach(cp => {
      const waLink = `https://wa.me/${cp.phoneWa}`;
      const waBtn = document.createElement('a');
      waBtn.className = 'waBtn';
      waBtn.href = waLink;
      waBtn.target = '_blank';
      waBtn.rel = 'noopener';
      waBtn.textContent = `KONFIRMASI KE ${cp.name}`;
      controls.appendChild(waBtn);
    });

    wrapper.appendChild(controls);

    // Tambah detail CP tertulis di bawah
    const cpDetails = document.createElement('div');
    cpDetails.className = 'small muted';
    cpDetails.style.marginTop = '10px';
    cpDetails.innerHTML = `<strong>CP Konfirmasi:</strong><br/>${cpList.map(c => `${escapeHtml(c.name)} — <a href="https://wa.me/${c.phoneWa}" target="_blank" rel="noopener">${escapeHtml(c.display)}</a>`).join('<br/>')}`;
    wrapper.appendChild(cpDetails);

    resultEl.appendChild(wrapper);
    // Fokus ke tombol agar pengguna mudah berinteraksi
    formBtn.focus();
  }

  function clearResult() {
    resultEl.innerHTML = '';
  }

  // Simple HTML escape untuk keamanan saat menampilkan nama dari JSON
  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();