// ============================================================
// KASIR APP - Single Page Application
// Data disimpan di localStorage browser
// ============================================================

// ============ DATA STORE ============
const Store = {
    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch {
            return [];
        }
    },
    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
};

// ============ STATE ============
let cart = [];
let paymentMethod = 'cash';
let currentEditProdukId = null;
let currentEditPengeluaranId = null;
let currentEditCatatanId = null;
let catatanFilter = 'semua';

// ============ UTILITIES ============
function formatRupiah(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function getTodayDate() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatTanggal(dateStr) {
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const [y, m, d] = dateStr.split('-');
    return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
}

function formatTanggalShort(dateStr) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

function formatWaktu(timestamp) {
    const date = new Date(timestamp);
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============ NAVIGATION ============
function initNavigation() {
    const allNavBtns = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    const mobileMenu = document.getElementById('mobileMenu');
    const hamburger = document.getElementById('hamburger');

    function switchPage(pageName) {
        pages.forEach(p => p.classList.remove('active'));
        allNavBtns.forEach(b => b.classList.remove('active'));
        document.getElementById(`page-${pageName}`).classList.add('active');
        allNavBtns.forEach(b => {
            if (b.dataset.page === pageName) b.classList.add('active');
        });
        mobileMenu.classList.remove('open');

        if (pageName === 'kasir') renderProductGrid();
        if (pageName === 'produk') renderProdukTable();
        if (pageName === 'pengeluaran') renderPengeluaranTable();
        if (pageName === 'catatan') renderCatatanList();
    }

    allNavBtns.forEach(btn => {
        btn.addEventListener('click', () => switchPage(btn.dataset.page));
    });

    hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });
}

// ============ PRODUK CRUD ============
function getProdukList() {
    return Store.get('produk');
}

function saveProdukList(list) {
    Store.set('produk', list);
}

function renderProdukTable() {
    const tbody = document.getElementById('produkTableBody');
    const produkList = getProdukList();

    if (produkList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Belum ada produk. Tambahkan produk pertama Anda.</td></tr>';
        return;
    }

    tbody.innerHTML = produkList.map(p => `
        <tr>
            <td>${escapeHtml(p.nama)}</td>
            <td>${formatRupiah(p.harga)}</td>
            <td>${p.stok}</td>
            <td>${escapeHtml(p.kategori || '-')}</td>
            <td>
                <div class="actions">
                    <button class="btn btn-primary btn-sm" onclick="editProduk('${p.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="hapusProduk('${p.id}')">Hapus</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openModalProduk(editId = null) {
    const modal = document.getElementById('modalProduk');
    const title = document.getElementById('modalProdukTitle');
    const form = document.getElementById('formProduk');

    form.reset();
    currentEditProdukId = editId;

    if (editId) {
        title.textContent = 'Edit Produk';
        const produk = getProdukList().find(p => p.id === editId);
        if (produk) {
            document.getElementById('produkNama').value = produk.nama;
            document.getElementById('produkHarga').value = produk.harga;
            document.getElementById('produkStok').value = produk.stok;
            document.getElementById('produkKategori').value = produk.kategori || '';
        }
    } else {
        title.textContent = 'Tambah Produk';
    }

    modal.classList.add('open');
}

function closeModalProduk() {
    document.getElementById('modalProduk').classList.remove('open');
    currentEditProdukId = null;
}

function simpanProduk(e) {
    e.preventDefault();

    const nama = document.getElementById('produkNama').value.trim();
    const harga = parseInt(document.getElementById('produkHarga').value);
    const stok = parseInt(document.getElementById('produkStok').value);
    const kategori = document.getElementById('produkKategori').value.trim();

    if (!nama || isNaN(harga)) {
        showToast('Harap isi nama dan harga produk');
        return;
    }

    let produkList = getProdukList();

    if (currentEditProdukId) {
        produkList = produkList.map(p => {
            if (p.id === currentEditProdukId) {
                return { ...p, nama, harga, stok, kategori };
            }
            return p;
        });
        showToast('Produk berhasil diperbarui');
    } else {
        produkList.push({
            id: Store.generateId(),
            nama,
            harga,
            stok,
            kategori,
            createdAt: Date.now()
        });
        showToast('Produk berhasil ditambahkan');
    }

    saveProdukList(produkList);
    renderProdukTable();
    closeModalProduk();
}

function editProduk(id) {
    openModalProduk(id);
}

function hapusProduk(id) {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    let produkList = getProdukList();
    produkList = produkList.filter(p => p.id !== id);
    saveProdukList(produkList);
    renderProdukTable();
    showToast('Produk berhasil dihapus');
}

// ============ KASIR / POS ============
function renderProductGrid() {
    const grid = document.getElementById('productGrid');
    const produkList = getProdukList();
    const search = document.getElementById('searchProduct').value.toLowerCase();

    const filtered = produkList.filter(p =>
        p.nama.toLowerCase().includes(search) ||
        (p.kategori && p.kategori.toLowerCase().includes(search))
    );

    if (filtered.length === 0) {
        grid.innerHTML = '<p class="empty-state">Tidak ada produk ditemukan</p>';
        return;
    }

    grid.innerHTML = filtered.map(p => `
        <div class="product-card ${p.stok <= 0 ? 'out-of-stock' : ''}" 
             onclick="${p.stok > 0 ? `addToCart('${p.id}')` : ''}"
             title="${p.stok <= 0 ? 'Stok habis' : 'Klik untuk menambah ke keranjang'}">
            <div class="product-name">${escapeHtml(p.nama)}</div>
            <div class="product-price">${formatRupiah(p.harga)}</div>
            <div class="product-stock">Stok: ${p.stok}</div>
        </div>
    `).join('');
}

function addToCart(productId) {
    const produk = getProdukList().find(p => p.id === productId);
    if (!produk || produk.stok <= 0) return;

    const existing = cart.find(c => c.productId === productId);

    if (existing) {
        if (existing.qty >= produk.stok) {
            showToast('Stok tidak mencukupi');
            return;
        }
        existing.qty++;
    } else {
        cart.push({
            productId: produk.id,
            nama: produk.nama,
            harga: produk.harga,
            qty: 1
        });
    }

    renderCart();
    showToast(`${produk.nama} ditambahkan`);
}

function updateCartQty(productId, delta) {
    const item = cart.find(c => c.productId === productId);
    if (!item) return;

    const produk = getProdukList().find(p => p.id === productId);
    item.qty += delta;

    if (item.qty <= 0) {
        cart = cart.filter(c => c.productId !== productId);
    } else if (produk && item.qty > produk.stok) {
        item.qty = produk.stok;
        showToast('Stok tidak mencukupi');
    }

    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(c => c.productId !== productId);
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const btnBayar = document.getElementById('btnBayar');

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Keranjang kosong</p>';
        totalEl.textContent = 'Rp 0';
        btnBayar.disabled = true;
        return;
    }

    let total = 0;

    container.innerHTML = cart.map(item => {
        const subtotal = item.harga * item.qty;
        total += subtotal;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${escapeHtml(item.nama)}</div>
                    <div class="cart-item-price">${formatRupiah(item.harga)}</div>
                </div>
                <div class="cart-item-qty">
                    <button onclick="updateCartQty('${item.productId}', -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="updateCartQty('${item.productId}', 1)">+</button>
                </div>
                <div class="cart-item-subtotal">${formatRupiah(subtotal)}</div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.productId}')">&times;</button>
            </div>
        `;
    }).join('');

    totalEl.textContent = formatRupiah(total);
    btnBayar.disabled = false;
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);
}

// Payment method
function initPaymentButtons() {
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            paymentMethod = btn.dataset.method;
        });
    });
}

// Bayar
function openModalBayar() {
    if (cart.length === 0) return;

    const modal = document.getElementById('modalBayar');
    const summary = document.getElementById('bayarSummary');
    const total = getCartTotal();
    const atasNama = document.getElementById('atasNama').value.trim();

    let html = '<div>';
    if (atasNama) {
        html += `<div class="bayar-method" style="margin-bottom:0.5rem;">Atas Nama: <strong>${escapeHtml(atasNama)}</strong></div>`;
    }
    cart.forEach(item => {
        html += `<div class="bayar-item">
            <span>${escapeHtml(item.nama)} x${item.qty}</span>
            <span>${formatRupiah(item.harga * item.qty)}</span>
        </div>`;
    });
    html += `<div class="bayar-total">
        <span>TOTAL</span>
        <span>${formatRupiah(total)}</span>
    </div>`;
    html += `<div class="bayar-method">Pembayaran: ${paymentMethod.toUpperCase()}</div>`;
    html += '</div>';

    summary.innerHTML = html;
    modal.classList.add('open');
}

function closeModalBayar() {
    document.getElementById('modalBayar').classList.remove('open');
}

function konfirmasiBayar() {
    const total = getCartTotal();
    const atasNama = document.getElementById('atasNama').value.trim();

    const transaksi = {
        id: Store.generateId(),
        tanggal: getTodayDate(),
        waktu: Date.now(),
        atasNama: atasNama || '',
        items: cart.map(c => ({
            productId: c.productId,
            nama: c.nama,
            harga: c.harga,
            qty: c.qty,
            subtotal: c.harga * c.qty
        })),
        total: total,
        metode: paymentMethod
    };

    const transaksiList = Store.get('transaksi');
    transaksiList.push(transaksi);
    Store.set('transaksi', transaksiList);

    let produkList = getProdukList();
    cart.forEach(item => {
        const produk = produkList.find(p => p.id === item.productId);
        if (produk) {
            produk.stok = Math.max(0, produk.stok - item.qty);
        }
    });
    saveProdukList(produkList);

    cart = [];
    document.getElementById('atasNama').value = '';
    renderCart();
    renderProductGrid();
    closeModalBayar();

    showToast('Transaksi berhasil disimpan!');
}

// ============ PENGELUARAN CRUD ============
function getPengeluaranList() {
    return Store.get('pengeluaran');
}

function savePengeluaranList(list) {
    Store.set('pengeluaran', list);
}

function renderPengeluaranTable(filterDate = null) {
    const tbody = document.getElementById('pengeluaranTableBody');
    let pengeluaranList = getPengeluaranList();

    if (filterDate) {
        pengeluaranList = pengeluaranList.filter(p => p.tanggal === filterDate);
    }

    pengeluaranList.sort((a, b) => b.tanggal.localeCompare(a.tanggal));

    if (pengeluaranList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Belum ada pengeluaran tercatat.</td></tr>';
        return;
    }

    tbody.innerHTML = pengeluaranList.map(p => `
        <tr>
            <td>${formatTanggalShort(p.tanggal)}</td>
            <td>${escapeHtml(p.keterangan)}</td>
            <td>${formatRupiah(p.jumlah)}</td>
            <td>
                <div class="actions">
                    <button class="btn btn-primary btn-sm" onclick="editPengeluaran('${p.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="hapusPengeluaran('${p.id}')">Hapus</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openModalPengeluaran(editId = null) {
    const modal = document.getElementById('modalPengeluaran');
    const title = document.getElementById('modalPengeluaranTitle');
    const form = document.getElementById('formPengeluaran');

    form.reset();
    currentEditPengeluaranId = editId;

    if (editId) {
        title.textContent = 'Edit Pengeluaran';
        const item = getPengeluaranList().find(p => p.id === editId);
        if (item) {
            document.getElementById('pengeluaranTanggal').value = item.tanggal;
            document.getElementById('pengeluaranKeterangan').value = item.keterangan;
            document.getElementById('pengeluaranJumlah').value = item.jumlah;
        }
    } else {
        title.textContent = 'Tambah Pengeluaran';
        document.getElementById('pengeluaranTanggal').value = getTodayDate();
    }

    modal.classList.add('open');
}

function closeModalPengeluaran() {
    document.getElementById('modalPengeluaran').classList.remove('open');
    currentEditPengeluaranId = null;
}

function simpanPengeluaran(e) {
    e.preventDefault();

    const tanggal = document.getElementById('pengeluaranTanggal').value;
    const keterangan = document.getElementById('pengeluaranKeterangan').value.trim();
    const jumlah = parseInt(document.getElementById('pengeluaranJumlah').value);

    if (!tanggal || !keterangan || isNaN(jumlah)) {
        showToast('Harap isi semua field');
        return;
    }

    let pengeluaranList = getPengeluaranList();

    if (currentEditPengeluaranId) {
        pengeluaranList = pengeluaranList.map(p => {
            if (p.id === currentEditPengeluaranId) {
                return { ...p, tanggal, keterangan, jumlah };
            }
            return p;
        });
        showToast('Pengeluaran berhasil diperbarui');
    } else {
        pengeluaranList.push({
            id: Store.generateId(),
            tanggal,
            keterangan,
            jumlah,
            createdAt: Date.now()
        });
        showToast('Pengeluaran berhasil ditambahkan');
    }

    savePengeluaranList(pengeluaranList);
    renderPengeluaranTable();
    closeModalPengeluaran();
}

function editPengeluaran(id) {
    openModalPengeluaran(id);
}

function hapusPengeluaran(id) {
    if (!confirm('Yakin ingin menghapus pengeluaran ini?')) return;
    let list = getPengeluaranList();
    list = list.filter(p => p.id !== id);
    savePengeluaranList(list);
    renderPengeluaranTable();
    showToast('Pengeluaran berhasil dihapus');
}

// ============ CATATAN CRUD ============
function getCatatanList() {
    return Store.get('catatan');
}

function saveCatatanList(list) {
    Store.set('catatan', list);
}

function renderCatatanList() {
    const container = document.getElementById('catatanList');
    let list = getCatatanList();

    // Sort: belum selesai dulu, lalu selesai. Dalam grup, terbaru dulu
    list.sort((a, b) => {
        if (a.selesai !== b.selesai) return a.selesai ? 1 : -1;
        return (b.createdAt || 0) - (a.createdAt || 0);
    });

    // Filter
    if (catatanFilter === 'belum') {
        list = list.filter(c => !c.selesai);
    } else if (catatanFilter === 'selesai') {
        list = list.filter(c => c.selesai);
    }

    if (list.length === 0) {
        container.innerHTML = '<p class="empty-state">Belum ada catatan</p>';
        return;
    }

    container.innerHTML = list.map(c => {
        const dateStr = c.createdAt ? formatTanggalShort(new Date(c.createdAt).toISOString().split('T')[0]) : '';
        const statusClass = c.selesai ? 'selesai' : '';
        const badgeClass = c.selesai ? 'selesai' : 'belum';
        const badgeText = c.selesai ? 'Selesai' : 'Belum Selesai';
        const toggleText = c.selesai ? 'Buka Kembali' : 'Tandai Selesai';
        const toggleBtnClass = c.selesai ? 'btn-warning' : 'btn-success';

        let html = `<div class="catatan-card ${statusClass}">`;
        html += `<div class="catatan-card-header">`;
        html += `<div><span class="catatan-card-title">${escapeHtml(c.judul)}</span> <span class="catatan-badge ${badgeClass}">${badgeText}</span></div>`;
        html += `<span class="catatan-card-date">${dateStr}</span>`;
        html += `</div>`;

        if (c.isi) {
            html += `<div class="catatan-card-body">${escapeHtml(c.isi)}</div>`;
        }

        if (c.jumlah && c.jumlah > 0) {
            html += `<div class="catatan-card-amount">${formatRupiah(c.jumlah)}</div>`;
        }

        html += `<div class="catatan-card-actions">`;
        html += `<button class="btn ${toggleBtnClass} btn-sm" onclick="toggleCatatan('${c.id}')">${toggleText}</button>`;
        html += `<button class="btn btn-primary btn-sm" onclick="editCatatan('${c.id}')">Edit</button>`;
        html += `<button class="btn btn-danger btn-sm" onclick="hapusCatatan('${c.id}')">Hapus</button>`;
        html += `</div>`;
        html += `</div>`;

        return html;
    }).join('');
}

function openModalCatatan(editId = null) {
    const modal = document.getElementById('modalCatatan');
    const title = document.getElementById('modalCatatanTitle');
    const form = document.getElementById('formCatatan');

    form.reset();
    currentEditCatatanId = editId;

    if (editId) {
        title.textContent = 'Edit Catatan';
        const item = getCatatanList().find(c => c.id === editId);
        if (item) {
            document.getElementById('catatanJudul').value = item.judul;
            document.getElementById('catatanIsi').value = item.isi || '';
            document.getElementById('catatanJumlah').value = item.jumlah || '';
        }
    } else {
        title.textContent = 'Tambah Catatan';
    }

    modal.classList.add('open');
}

function closeModalCatatan() {
    document.getElementById('modalCatatan').classList.remove('open');
    currentEditCatatanId = null;
}

function simpanCatatan(e) {
    e.preventDefault();

    const judul = document.getElementById('catatanJudul').value.trim();
    const isi = document.getElementById('catatanIsi').value.trim();
    const jumlahVal = document.getElementById('catatanJumlah').value;
    const jumlah = jumlahVal ? parseInt(jumlahVal) : 0;

    if (!judul) {
        showToast('Harap isi judul catatan');
        return;
    }

    let list = getCatatanList();

    if (currentEditCatatanId) {
        list = list.map(c => {
            if (c.id === currentEditCatatanId) {
                return { ...c, judul, isi, jumlah };
            }
            return c;
        });
        showToast('Catatan berhasil diperbarui');
    } else {
        list.push({
            id: Store.generateId(),
            judul,
            isi,
            jumlah,
            selesai: false,
            createdAt: Date.now()
        });
        showToast('Catatan berhasil ditambahkan');
    }

    saveCatatanList(list);
    renderCatatanList();
    closeModalCatatan();
}

function editCatatan(id) {
    openModalCatatan(id);
}

function toggleCatatan(id) {
    let list = getCatatanList();
    list = list.map(c => {
        if (c.id === id) {
            return { ...c, selesai: !c.selesai };
        }
        return c;
    });
    saveCatatanList(list);
    renderCatatanList();
    showToast('Status catatan diperbarui');
}

function hapusCatatan(id) {
    if (!confirm('Yakin ingin menghapus catatan ini?')) return;
    let list = getCatatanList();
    list = list.filter(c => c.id !== id);
    saveCatatanList(list);
    renderCatatanList();
    showToast('Catatan berhasil dihapus');
}

// ============ LAPORAN HARIAN ============

/**
 * Hitung total cash akumulasi dari semua transaksi cash
 * DIKURANGI semua pengeluaran, dari hari pertama sampai tanggal yang dipilih (inklusif).
 * Pengeluaran mengurangi cash karena dibayar dari uang cash.
 */
function hitungCashAkumulasi(sampaiTanggal) {
    const semuaTransaksi = Store.get('transaksi');
    const semuaPengeluaran = getPengeluaranList();

    let totalCash = 0;

    // Tambah dari pemasukan cash
    semuaTransaksi.forEach(t => {
        if (t.tanggal <= sampaiTanggal && t.metode === 'cash') {
            totalCash += t.total;
        }
    });

    // Kurangi dari pengeluaran
    semuaPengeluaran.forEach(p => {
        if (p.tanggal <= sampaiTanggal) {
            totalCash -= p.jumlah;
        }
    });

    return totalCash;
}

function generateLaporan() {
    const tanggal = document.getElementById('tanggalLaporan').value;
    if (!tanggal) {
        showToast('Pilih tanggal terlebih dahulu');
        return;
    }

    const transaksiList = Store.get('transaksi').filter(t => t.tanggal === tanggal);
    const pengeluaranList = getPengeluaranList().filter(p => p.tanggal === tanggal);

    // Hitung total hari ini
    const totalPendapatan = transaksiList.reduce((sum, t) => sum + t.total, 0);
    const totalPengeluaran = pengeluaranList.reduce((sum, p) => sum + p.jumlah, 0);
    const laba = totalPendapatan - totalPengeluaran;

    const cashHariIni = transaksiList.filter(t => t.metode === 'cash').reduce((sum, t) => sum + t.total, 0);
    const qrisHariIni = transaksiList.filter(t => t.metode === 'qris').reduce((sum, t) => sum + t.total, 0);

    // Cash akumulasi: semua cash dari awal sampai tanggal ini
    const cashAkumulasi = hitungCashAkumulasi(tanggal);

    // Produk summary (digabung semua yang sama)
    const produkSummary = {};
    transaksiList.forEach(t => {
        t.items.forEach(item => {
            if (!produkSummary[item.nama]) {
                produkSummary[item.nama] = { qty: 0, total: 0 };
            }
            produkSummary[item.nama].qty += item.qty;
            produkSummary[item.nama].total += item.subtotal;
        });
    });

    // Update cards
    document.getElementById('laporanPendapatan').textContent = formatRupiah(totalPendapatan);
    document.getElementById('laporanPengeluaran').textContent = formatRupiah(totalPengeluaran);
    document.getElementById('laporanLaba').textContent = formatRupiah(laba);
    document.getElementById('laporanQris').textContent = formatRupiah(qrisHariIni);
    document.getElementById('laporanCashHariIni').textContent = formatRupiah(cashHariIni);
    document.getElementById('laporanCashAkumulasi').textContent = formatRupiah(cashAkumulasi);
    document.getElementById('laporanTotalTrx').textContent = transaksiList.length;

    // Product detail table
    const produkNames = Object.keys(produkSummary);
    if (produkNames.length > 0) {
        let tableHtml = '<table><thead><tr><th>Produk</th><th>Qty</th><th>Total</th></tr></thead><tbody>';
        produkNames.forEach(nama => {
            const p = produkSummary[nama];
            tableHtml += `<tr><td>${escapeHtml(nama)}</td><td>${p.qty}</td><td>${formatRupiah(p.total)}</td></tr>`;
        });
        tableHtml += '</tbody></table>';
        document.getElementById('laporanDetailProduk').innerHTML = tableHtml;
    } else {
        document.getElementById('laporanDetailProduk').innerHTML = '<p class="empty-state">Tidak ada penjualan pada tanggal ini</p>';
    }

    // Pengeluaran detail
    if (pengeluaranList.length > 0) {
        let tableHtml = '<table><thead><tr><th>Keterangan</th><th>Jumlah</th></tr></thead><tbody>';
        pengeluaranList.forEach(p => {
            tableHtml += `<tr><td>${escapeHtml(p.keterangan)}</td><td>${formatRupiah(p.jumlah)}</td></tr>`;
        });
        tableHtml += '</tbody></table>';
        document.getElementById('laporanDetailPengeluaran').innerHTML = tableHtml;
    } else {
        document.getElementById('laporanDetailPengeluaran').innerHTML = '<p class="empty-state">Tidak ada pengeluaran pada tanggal ini</p>';
    }

    // Transaction history
    if (transaksiList.length > 0) {
        let tableHtml = '<table><thead><tr><th>Waktu</th><th>Nama</th><th>Item</th><th>Total</th><th>Metode</th><th>Aksi</th></tr></thead><tbody>';
        transaksiList.sort((a, b) => a.waktu - b.waktu);
        transaksiList.forEach(t => {
            const itemNames = t.items.map(i => `${i.nama} x${i.qty}`).join(', ');
            const nama = t.atasNama ? escapeHtml(t.atasNama) : '-';
            tableHtml += `<tr>
                <td>${formatWaktu(t.waktu)}</td>
                <td>${nama}</td>
                <td>${escapeHtml(itemNames)}</td>
                <td>${formatRupiah(t.total)}</td>
                <td>${t.metode.toUpperCase()}</td>
                <td><button class="btn btn-danger btn-sm" onclick="hapusTransaksi('${t.id}')">Hapus</button></td>
            </tr>`;
        });
        tableHtml += '</tbody></table>';
        document.getElementById('laporanRiwayatTransaksi').innerHTML = tableHtml;
    } else {
        document.getElementById('laporanRiwayatTransaksi').innerHTML = '<p class="empty-state">Tidak ada transaksi pada tanggal ini</p>';
    }

    // Generate WhatsApp text
    generateWhatsAppText(tanggal, transaksiList, pengeluaranList, produkSummary, {
        totalPendapatan, totalPengeluaran, laba, cashHariIni, qrisHariIni, cashAkumulasi
    });

    document.getElementById('laporanContent').style.display = 'block';
    document.getElementById('copyStatus').textContent = '';
}

function hapusTransaksi(id) {
    if (!confirm('Yakin ingin menghapus transaksi ini? Stok produk akan dikembalikan.')) return;

    let transaksiList = Store.get('transaksi');
    const transaksi = transaksiList.find(t => t.id === id);

    if (transaksi) {
        // Kembalikan stok produk
        let produkList = getProdukList();
        transaksi.items.forEach(item => {
            const produk = produkList.find(p => p.id === item.productId);
            if (produk) {
                produk.stok += item.qty;
            }
        });
        saveProdukList(produkList);

        // Hapus transaksi
        transaksiList = transaksiList.filter(t => t.id !== id);
        Store.set('transaksi', transaksiList);

        showToast('Transaksi berhasil dihapus, stok dikembalikan');

        // Refresh laporan
        generateLaporan();
    }
}

function generateWhatsAppText(tanggal, transaksiList, pengeluaranList, produkSummary, totals) {
    const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const dateObj = new Date(tanggal + 'T00:00:00');
    const namaHari = hari[dateObj.getDay()];

    let text = '';

    // Header
    text += `Laporan Penjualan : ${namaHari}, ${formatTanggal(tanggal)}\n`;
    text += `\n`;

    // Total Pendapatan (cash + qris digabung)
    text += `Total Pendapatan : ${formatRupiah(totals.totalPendapatan)}\n`;
    text += `\n`;

    // Pengeluaran
    text += `Pengeluaran :\n`;
    if (pengeluaranList.length > 0) {
        pengeluaranList.forEach(p => {
            text += `- ${p.keterangan} : ${formatRupiah(p.jumlah)}\n`;
        });
        text += `Total Pengeluaran : ${formatRupiah(totals.totalPengeluaran)}\n`;
    } else {
        text += `- Tidak ada pengeluaran\n`;
    }
    text += `\n`;

    // QRIS / Transfer
    text += `QRIS/Transfer : ${formatRupiah(totals.qrisHariIni)}\n`;

    // Total Cash hari ini & akumulasi
    text += `Cash Hari Ini : ${formatRupiah(totals.cashHariIni)}\n`;
    text += `Total Cash (Akumulasi) : ${formatRupiah(totals.cashAkumulasi)}\n`;
    text += `\n`;

    // Produk terjual (digabung semua yang sama, penomoran) - di akhir
    const produkNames = Object.keys(produkSummary);
    if (produkNames.length > 0) {
        text += `Penjualan :\n`;
        let no = 1;
        produkNames.forEach(nama => {
            const p = produkSummary[nama];
            text += `${no}. ${nama} ; ${p.qty}\n`;
            no++;
        });
    }

    document.getElementById('laporanTeks').value = text;
}

function copyLaporan() {
    const textarea = document.getElementById('laporanTeks');
    const text = textarea.value;

    if (!text) {
        showToast('Tidak ada laporan untuk disalin');
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            const status = document.getElementById('copyStatus');
            status.textContent = 'Berhasil disalin! Tempel ke WhatsApp Anda.';
            status.className = 'copy-status success';
            showToast('Laporan berhasil disalin ke clipboard!');
        }).catch(() => {
            fallbackCopy(textarea);
        });
    } else {
        fallbackCopy(textarea);
    }
}

function fallbackCopy(textarea) {
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    try {
        document.execCommand('copy');
        const status = document.getElementById('copyStatus');
        status.textContent = 'Berhasil disalin! Tempel ke WhatsApp Anda.';
        status.className = 'copy-status success';
        showToast('Laporan berhasil disalin ke clipboard!');
    } catch (err) {
        showToast('Gagal menyalin. Silakan pilih teks dan salin manual.');
    }
}

// ============ EVENT LISTENERS ============
function initEventListeners() {
    // Produk
    document.getElementById('btnTambahProduk').addEventListener('click', () => openModalProduk());
    document.getElementById('closeModalProduk').addEventListener('click', closeModalProduk);
    document.getElementById('formProduk').addEventListener('submit', simpanProduk);

    // Pengeluaran
    document.getElementById('btnTambahPengeluaran').addEventListener('click', () => openModalPengeluaran());
    document.getElementById('closeModalPengeluaran').addEventListener('click', closeModalPengeluaran);
    document.getElementById('formPengeluaran').addEventListener('submit', simpanPengeluaran);

    // Pengeluaran filter
    document.getElementById('btnFilterPengeluaran').addEventListener('click', () => {
        const date = document.getElementById('filterTanggalPengeluaran').value;
        if (date) renderPengeluaranTable(date);
        else showToast('Pilih tanggal filter');
    });
    document.getElementById('btnResetFilterPengeluaran').addEventListener('click', () => {
        document.getElementById('filterTanggalPengeluaran').value = '';
        renderPengeluaranTable();
    });

    // Kasir
    document.getElementById('searchProduct').addEventListener('input', renderProductGrid);
    document.getElementById('btnBayar').addEventListener('click', openModalBayar);
    document.getElementById('closeModalBayar').addEventListener('click', closeModalBayar);
    document.getElementById('btnKonfirmasiBayar').addEventListener('click', konfirmasiBayar);

    // Laporan
    document.getElementById('tanggalLaporan').value = getTodayDate();
    document.getElementById('btnGenerateLaporan').addEventListener('click', generateLaporan);
    document.getElementById('btnCopyLaporan').addEventListener('click', copyLaporan);

    // Catatan
    document.getElementById('btnTambahCatatan').addEventListener('click', () => openModalCatatan());
    document.getElementById('closeModalCatatan').addEventListener('click', closeModalCatatan);
    document.getElementById('formCatatan').addEventListener('submit', simpanCatatan);

    // Catatan filter buttons
    document.querySelectorAll('.catatan-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.catatan-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            catatanFilter = btn.dataset.filter;
            renderCatatanList();
        });
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('open');
            }
        });
    });

    // Payment method buttons
    initPaymentButtons();
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initEventListeners();
    renderProductGrid();
    renderCart();

    // Seed sample data if first time
    if (!localStorage.getItem('kasir_initialized')) {
        const sampleProducts = [
            { id: Store.generateId(), nama: 'Nasi Goreng', harga: 15000, stok: 50, kategori: 'Makanan', createdAt: Date.now() },
            { id: Store.generateId(), nama: 'Mie Goreng', harga: 13000, stok: 50, kategori: 'Makanan', createdAt: Date.now() },
            { id: Store.generateId(), nama: 'Es Teh Manis', harga: 5000, stok: 100, kategori: 'Minuman', createdAt: Date.now() },
            { id: Store.generateId(), nama: 'Es Jeruk', harga: 7000, stok: 100, kategori: 'Minuman', createdAt: Date.now() },
            { id: Store.generateId(), nama: 'Kopi Hitam', harga: 8000, stok: 80, kategori: 'Minuman', createdAt: Date.now() },
            { id: Store.generateId(), nama: 'Ayam Bakar', harga: 25000, stok: 30, kategori: 'Makanan', createdAt: Date.now() },
            { id: Store.generateId(), nama: 'Sate Ayam', harga: 20000, stok: 40, kategori: 'Makanan', createdAt: Date.now() },
            { id: Store.generateId(), nama: 'Air Mineral', harga: 4000, stok: 200, kategori: 'Minuman', createdAt: Date.now() },
        ];
        saveProdukList(sampleProducts);
        localStorage.setItem('kasir_initialized', 'true');
        renderProductGrid();
        showToast('Selamat datang! Data contoh telah ditambahkan.');
    }
});
