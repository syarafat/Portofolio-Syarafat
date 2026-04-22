/* AkademiQ - Application Logic */
const COLORS = ['#00e5c3','#7c5dfa','#3b82f6','#f59e0b','#ef4444','#a855f7','#ec4899','#4ade80'];
const SAMPLE_MHS = [
    {nim:'2020101001',nama:'Ahmad Fauzi',angkatan:2020,prodi:'Teknik Informatika',ipk:3.75,status:'aktif'},
    {nim:'2020101002',nama:'Budi Santoso',angkatan:2020,prodi:'Teknik Informatika',ipk:3.42,status:'aktif'},
    {nim:'2020101003',nama:'Cindy Wijaya',angkatan:2020,prodi:'Sistem Informasi',ipk:3.88,status:'aktif'},
    {nim:'2021101004',nama:'Dewi Lestari',angkatan:2021,prodi:'Teknik Informatika',ipk:3.56,status:'aktif'},
    {nim:'2021101005',nama:'Eko Prasetyo',angkatan:2021,prodi:'Sistem Informasi',ipk:3.21,status:'cuti'},
    {nim:'2019101006',nama:'Fitri Handayani',angkatan:2019,prodi:'Teknik Informatika',ipk:3.91,status:'lulus'},
    {nim:'2021101007',nama:'Gilang Ramadhan',angkatan:2021,prodi:'Teknik Informatika',ipk:3.33,status:'aktif'},
    {nim:'2022101008',nama:'Hana Permata',angkatan:2022,prodi:'Sistem Informasi',ipk:3.67,status:'aktif'},
    {nim:'2022101009',nama:'Ivan Setiawan',angkatan:2022,prodi:'Teknik Informatika',ipk:3.45,status:'aktif'},
    {nim:'2022101010',nama:'Jessica Tan',angkatan:2022,prodi:'Sistem Informasi',ipk:3.78,status:'aktif'},
];
const SAMPLE_MK = [
    {kode:'IF101',nama:'Algoritma & Pemrograman',sks:4,semester:1,dosen:'Dr. Andi Wijaya'},
    {kode:'IF102',nama:'Basis Data',sks:3,semester:2,dosen:'Prof. Budi Hartono'},
    {kode:'IF201',nama:'Struktur Data',sks:3,semester:3,dosen:'Dr. Andi Wijaya'},
    {kode:'IF202',nama:'Jaringan Komputer',sks:3,semester:4,dosen:'Dr. Citra Dewi'},
    {kode:'IF301',nama:'Rekayasa Perangkat Lunak',sks:4,semester:5,dosen:'Prof. Budi Hartono'},
    {kode:'IF302',nama:'Kecerdasan Buatan',sks:3,semester:5,dosen:'Dr. Eko Susanto'},
    {kode:'IF303',nama:'Pemrograman Web',sks:3,semester:6,dosen:'Dr. Citra Dewi'},
    {kode:'IF401',nama:'Machine Learning',sks:3,semester:7,dosen:'Dr. Eko Susanto'},
];
const SAMPLE_JADWAL = [
    {mk:'IF101',hari:'Senin',jam:'08:00-10:00',ruang:'Lab 1'},
    {mk:'IF102',hari:'Senin',jam:'10:00-12:00',ruang:'R.201'},
    {mk:'IF201',hari:'Selasa',jam:'08:00-10:00',ruang:'Lab 2'},
    {mk:'IF202',hari:'Selasa',jam:'13:00-15:00',ruang:'R.301'},
    {mk:'IF301',hari:'Rabu',jam:'08:00-11:00',ruang:'Lab 1'},
    {mk:'IF302',hari:'Rabu',jam:'13:00-15:00',ruang:'R.202'},
    {mk:'IF303',hari:'Kamis',jam:'08:00-10:00',ruang:'Lab 3'},
    {mk:'IF401',hari:'Jumat',jam:'09:00-11:00',ruang:'R.201'},
];
const SAMPLE_NILAI = [
    {nim:'2020101001',kodeMk:'IF101',nilai:85,grade:'A'},
    {nim:'2020101001',kodeMk:'IF102',nilai:78,grade:'B+'},
    {nim:'2020101001',kodeMk:'IF201',nilai:82,grade:'A-'},
    {nim:'2020101001',kodeMk:'IF202',nilai:75,grade:'B'},
    {nim:'2020101001',kodeMk:'IF301',nilai:88,grade:'A'},
    {nim:'2020101002',kodeMk:'IF101',nilai:72,grade:'B'},
    {nim:'2020101002',kodeMk:'IF102',nilai:80,grade:'A-'},
    {nim:'2020101002',kodeMk:'IF201',nilai:68,grade:'B-'},
    {nim:'2020101003',kodeMk:'IF101',nilai:92,grade:'A'},
    {nim:'2020101003',kodeMk:'IF102',nilai:88,grade:'A'},
];

let mahasiswa=[], mataKuliah=[], jadwal=[], nilai=[];
let modalMode='', modalEditIdx=-1;

document.addEventListener('DOMContentLoaded', () => { loadData(); renderCurrentPage(); initEvents(); });

function loadData() {
    mahasiswa = JSON.parse(localStorage.getItem('aq_mhs')) || SAMPLE_MHS.map(m=>({...m}));
    mataKuliah = JSON.parse(localStorage.getItem('aq_mk')) || SAMPLE_MK.map(m=>({...m}));
    jadwal = JSON.parse(localStorage.getItem('aq_jadwal')) || SAMPLE_JADWAL.map(j=>({...j}));
    nilai = JSON.parse(localStorage.getItem('aq_nilai')) || SAMPLE_NILAI.map(n=>({...n}));
    saveAll();
}
function saveAll() {
    localStorage.setItem('aq_mhs', JSON.stringify(mahasiswa));
    localStorage.setItem('aq_mk', JSON.stringify(mataKuliah));
    localStorage.setItem('aq_jadwal', JSON.stringify(jadwal));
    localStorage.setItem('aq_nilai', JSON.stringify(nilai));
}

function initEvents() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
            item.classList.add('active');
            showPage(item.dataset.page);
        });
    });
    document.getElementById('menuToggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('mCancel').addEventListener('click', closeModal);
    document.getElementById('mSave').addEventListener('click', handleSave);
    document.getElementById('modalOverlay').addEventListener('click', e => { if(e.target===e.currentTarget) closeModal(); });
    document.getElementById('addMhsBtn').addEventListener('click', () => openModal('mhs'));
    document.getElementById('addMkBtn').addEventListener('click', () => openModal('mk'));
    document.getElementById('addJadwalBtn').addEventListener('click', () => openModal('jadwal'));
    document.getElementById('nilaiMhsFilter').addEventListener('change', renderNilai);
    document.getElementById('nilaiSemFilter').addEventListener('change', renderNilai);
    document.getElementById('globalSearch').addEventListener('input', renderCurrentPage);
}

function showPage(page) {
    document.querySelectorAll('.page').forEach(p=>p.style.display='none');
    const map = {dashboard:'pageDashboard',mahasiswa:'pageMahasiswa',matakuliah:'pageMatakuliah',jadwal:'pageJadwal',nilai:'pageNilai'};
    document.getElementById(map[page]).style.display='block';
    renderCurrentPage();
}

function renderCurrentPage() {
    renderDashboard(); renderMahasiswa(); renderMataKuliah(); renderJadwal(); renderNilai();
}

// Dashboard
function renderDashboard() {
    document.getElementById('statMhs').textContent = mahasiswa.length;
    document.getElementById('statMk').textContent = mataKuliah.length;
    document.getElementById('statJadwal').textContent = jadwal.length;
    const avgIpk = mahasiswa.length ? (mahasiswa.reduce((a,m)=>a+m.ipk,0)/mahasiswa.length).toFixed(2) : '0.00';
    document.getElementById('statIPK').textContent = avgIpk;

    // Chart
    drawChart();

    // Recent
    const recent = document.getElementById('recentMhs');
    recent.innerHTML = mahasiswa.slice(-5).reverse().map((m,i) =>
        `<div class="recent-item"><div class="recent-avatar" style="background:${COLORS[i%COLORS.length]}">${m.nama[0]}</div><div><span class="recent-name">${m.nama}</span><span class="recent-nim">${m.nim} - ${m.prodi}</span></div></div>`
    ).join('');
}

function drawChart() {
    const canvas = document.getElementById('chartAngkatan');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio||1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width*dpr; canvas.height = 250*dpr;
    canvas.style.width = rect.width+'px'; canvas.style.height = '250px';
    ctx.scale(dpr,dpr);
    const w = rect.width, h = 250;

    const angkatan = {};
    mahasiswa.forEach(m => { angkatan[m.angkatan] = (angkatan[m.angkatan]||0)+1; });
    const labels = Object.keys(angkatan).sort();
    const values = labels.map(l=>angkatan[l]);
    const max = Math.max(...values,1);

    const pad = {top:20,right:20,bottom:40,left:50};
    const cw = w-pad.left-pad.right;
    const ch = h-pad.top-pad.bottom;
    const barW = Math.min(60, cw/labels.length - 20);

    ctx.clearRect(0,0,w,h);

    // Grid
    for(let i=0;i<=4;i++){
        const y = pad.top + (ch/4)*i;
        ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(w-pad.right,y); ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='11px "Space Grotesk"'; ctx.textAlign='right';
        ctx.fillText(Math.round(max-(max/4)*i), pad.left-10, y+4);
    }

    labels.forEach((label,i) => {
        const x = pad.left + (cw/labels.length)*i + (cw/labels.length)/2;
        const barH = (values[i]/max)*ch;
        const y = pad.top + ch - barH;

        const grad = ctx.createLinearGradient(x,y,x,pad.top+ch);
        grad.addColorStop(0,'#00e5c3'); grad.addColorStop(1,'#7c5dfa');
        ctx.fillStyle = grad;
        ctx.beginPath();
        const r = 4;
        ctx.moveTo(x-barW/2+r,y); ctx.lineTo(x+barW/2-r,y);
        ctx.quadraticCurveTo(x+barW/2,y,x+barW/2,y+r);
        ctx.lineTo(x+barW/2,pad.top+ch); ctx.lineTo(x-barW/2,pad.top+ch);
        ctx.lineTo(x-barW/2,y+r);
        ctx.quadraticCurveTo(x-barW/2,y,x-barW/2+r,y);
        ctx.fill();

        ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='12px "Space Grotesk"'; ctx.textAlign='center';
        ctx.fillText(label, x, h-pad.bottom+20);
        ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='bold 12px "Space Grotesk"';
        ctx.fillText(values[i], x, y-8);
    });
}

// Mahasiswa
function renderMahasiswa() {
    const search = document.getElementById('globalSearch').value.toLowerCase();
    const body = document.getElementById('mhsTableBody');
    body.innerHTML = mahasiswa
        .filter(m => !search || m.nama.toLowerCase().includes(search) || m.nim.includes(search))
        .map((m,i) => `<tr>
            <td>${m.nim}</td><td>${m.nama}</td><td>${m.angkatan}</td><td>${m.prodi}</td>
            <td>${m.ipk.toFixed(2)}</td>
            <td><span class="status-badge ${m.status}">${m.status.charAt(0).toUpperCase()+m.status.slice(1)}</span></td>
            <td><div class="action-btns"><button class="action-btn" onclick="editMhs(${i})"><i class="ph ph-pencil-simple"></i></button><button class="action-btn del" onclick="delMhs(${i})"><i class="ph ph-trash"></i></button></div></td>
        </tr>`).join('');
}

// Mata Kuliah
function renderMataKuliah() {
    const body = document.getElementById('mkTableBody');
    body.innerHTML = mataKuliah.map((m,i) => `<tr>
        <td>${m.kode}</td><td>${m.nama}</td><td>${m.sks}</td><td>${m.semester}</td><td>${m.dosen}</td>
        <td><div class="action-btns"><button class="action-btn" onclick="editMk(${i})"><i class="ph ph-pencil-simple"></i></button><button class="action-btn del" onclick="delMk(${i})"><i class="ph ph-trash"></i></button></div></td>
    </tr>`).join('');
}

// Jadwal
function renderJadwal() {
    const grid = document.getElementById('scheduleGrid');
    const days = ['Senin','Selasa','Rabu','Kamis','Jumat'];
    const times = ['08:00-10:00','10:00-12:00','13:00-15:00','15:00-17:00'];

    let html = '<div class="schedule-day-header">Jam</div>';
    days.forEach(d => html += `<div class="schedule-day-header">${d}</div>`);

    times.forEach(time => {
        html += `<div class="schedule-time">${time}</div>`;
        days.forEach(day => {
            const slot = jadwal.filter(j => j.hari === day && j.jam === time);
            const items = slot.map(s => {
                const mk = mataKuliah.find(m=>m.kode===s.mk);
                const color = COLORS[mataKuliah.indexOf(mk)%COLORS.length];
                return `<div class="schedule-item" style="background:${color}15;color:${color};border-left:3px solid ${color}">${mk?mk.nama:s.mk}<br><small>${s.ruang}</small></div>`;
            }).join('');
            html += `<div class="schedule-slot">${items}</div>`;
        });
    });
    grid.innerHTML = html;
}

// Nilai
function renderNilai() {
    const selMhs = document.getElementById('nilaiMhsFilter');
    const selSem = document.getElementById('nilaiSemFilter');

    // Populate mhs filter
    if(selMhs.options.length <= 1) {
        mahasiswa.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.nim; opt.textContent = `${m.nim} - ${m.nama}`;
            selMhs.appendChild(opt);
        });
    }

    const nimFilter = selMhs.value;
    const semFilter = selSem.value;

    let filtered = nilai;
    if(nimFilter) filtered = filtered.filter(n=>n.nim===nimFilter);

    if(semFilter) {
        const semMks = mataKuliah.filter(m=>m.semester==semFilter).map(m=>m.kode);
        filtered = filtered.filter(n=>semMks.includes(n.kodeMk));
    }

    const body = document.getElementById('nilaiTableBody');
    body.innerHTML = filtered.map(n => {
        const mk = mataKuliah.find(m=>m.kode===n.kodeMk);
        const bobot = gradeToBobot(n.grade);
        const gradeClass = n.grade.startsWith('A')?'A':n.grade.startsWith('B')?'B':n.grade.startsWith('C')?'C':'D';
        return `<tr>
            <td>${n.kodeMk}</td><td>${mk?mk.nama:'-'}</td><td>${mk?mk.sks:'-'}</td>
            <td>${n.nilai}</td><td><span class="grade-badge grade-${gradeClass}">${n.grade}</span></td><td>${bobot.toFixed(1)}</td>
        </tr>`;
    }).join('');

    // IPK Summary
    const summary = document.getElementById('ipkSummary');
    if(filtered.length > 0) {
        let totalSks=0, totalBobot=0;
        filtered.forEach(n=>{
            const mk = mataKuliah.find(m=>m.kode===n.kodeMk);
            const sks = mk?mk.sks:0;
            totalSks += sks;
            totalBobot += sks * gradeToBobot(n.grade);
        });
        const ipk = totalSks>0?(totalBobot/totalSks):0;
        summary.innerHTML = `
            <div class="ipk-item"><span class="ipk-val">${filtered.length}</span><span class="ipk-lbl">Mata Kuliah</span></div>
            <div class="ipk-item"><span class="ipk-val">${totalSks}</span><span class="ipk-lbl">Total SKS</span></div>
            <div class="ipk-item"><span class="ipk-val">${ipk.toFixed(2)}</span><span class="ipk-lbl">IPK</span></div>
        `;
    } else { summary.innerHTML = ''; }
}

function gradeToBobot(g) {
    const map = {'A':4,'A-':3.7,'B+':3.3,'B':3,'B-':2.7,'C+':2.3,'C':2,'C-':1.7,'D':1,'E':0};
    return map[g]||0;
}

// Modal
function openModal(mode, idx=-1) {
    modalMode = mode; modalEditIdx = idx;
    const body = document.getElementById('modalBody');
    let title = '', html = '';

    if(mode==='mhs') {
        const m = idx>=0 ? mahasiswa[idx] : {};
        title = idx>=0 ? 'Edit Mahasiswa' : 'Tambah Mahasiswa';
        html = `
            <div class="form-row"><div class="form-group"><label>NIM</label><input id="fNim" value="${m.nim||''}"></div><div class="form-group"><label>Nama</label><input id="fNama" value="${m.nama||''}"></div></div>
            <div class="form-row"><div class="form-group"><label>Angkatan</label><input type="number" id="fAngkatan" value="${m.angkatan||2024}"></div><div class="form-group"><label>Prodi</label><select id="fProdi"><option ${m.prodi==='Teknik Informatika'?'selected':''}>Teknik Informatika</option><option ${m.prodi==='Sistem Informasi'?'selected':''}>Sistem Informasi</option></select></div></div>
            <div class="form-row"><div class="form-group"><label>IPK</label><input type="number" step="0.01" id="fIpk" value="${m.ipk||0}"></div><div class="form-group"><label>Status</label><select id="fStatus"><option value="aktif" ${m.status==='aktif'?'selected':''}>Aktif</option><option value="cuti" ${m.status==='cuti'?'selected':''}>Cuti</option><option value="lulus" ${m.status==='lulus'?'selected':''}>Lulus</option></select></div></div>
        `;
    } else if(mode==='mk') {
        const m = idx>=0 ? mataKuliah[idx] : {};
        title = idx>=0 ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah';
        html = `
            <div class="form-row"><div class="form-group"><label>Kode MK</label><input id="fKode" value="${m.kode||''}"></div><div class="form-group"><label>Nama MK</label><input id="fNamaMk" value="${m.nama||''}"></div></div>
            <div class="form-row"><div class="form-group"><label>SKS</label><input type="number" id="fSks" value="${m.sks||3}"></div><div class="form-group"><label>Semester</label><input type="number" id="fSem" value="${m.semester||1}"></div></div>
            <div class="form-group"><label>Dosen</label><input id="fDosen" value="${m.dosen||''}"></div>
        `;
    } else if(mode==='jadwal') {
        const j = idx>=0 ? jadwal[idx] : {};
        title = idx>=0 ? 'Edit Jadwal' : 'Tambah Jadwal';
        html = `
            <div class="form-group"><label>Mata Kuliah</label><select id="fMk">${mataKuliah.map(m=>`<option value="${m.kode}" ${j.mk===m.kode?'selected':''}>${m.kode} - ${m.nama}</option>`).join('')}</select></div>
            <div class="form-row"><div class="form-group"><label>Hari</label><select id="fHari">${['Senin','Selasa','Rabu','Kamis','Jumat'].map(d=>`<option ${j.hari===d?'selected':''}>${d}</option>`).join('')}</select></div><div class="form-group"><label>Jam</label><select id="fJam">${['08:00-10:00','10:00-12:00','13:00-15:00','15:00-17:00'].map(t=>`<option ${j.jam===t?'selected':''}>${t}</option>`).join('')}</select></div></div>
            <div class="form-group"><label>Ruang</label><input id="fRuang" value="${j.ruang||''}"></div>
        `;
    }

    document.getElementById('modalTitle').textContent = title;
    body.innerHTML = html;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }

function handleSave() {
    if(modalMode==='mhs') {
        const data = {nim:document.getElementById('fNim').value,nama:document.getElementById('fNama').value,angkatan:parseInt(document.getElementById('fAngkatan').value),prodi:document.getElementById('fProdi').value,ipk:parseFloat(document.getElementById('fIpk').value),status:document.getElementById('fStatus').value};
        if(!data.nim||!data.nama) return;
        if(modalEditIdx>=0) mahasiswa[modalEditIdx]=data; else mahasiswa.push(data);
    } else if(modalMode==='mk') {
        const data = {kode:document.getElementById('fKode').value,nama:document.getElementById('fNamaMk').value,sks:parseInt(document.getElementById('fSks').value),semester:parseInt(document.getElementById('fSem').value),dosen:document.getElementById('fDosen').value};
        if(!data.kode||!data.nama) return;
        if(modalEditIdx>=0) mataKuliah[modalEditIdx]=data; else mataKuliah.push(data);
    } else if(modalMode==='jadwal') {
        const data = {mk:document.getElementById('fMk').value,hari:document.getElementById('fHari').value,jam:document.getElementById('fJam').value,ruang:document.getElementById('fRuang').value};
        if(modalEditIdx>=0) jadwal[modalEditIdx]=data; else jadwal.push(data);
    }
    saveAll(); renderCurrentPage(); closeModal();
}

// Global edit/delete
window.editMhs = (i) => openModal('mhs',i);
window.delMhs = (i) => { mahasiswa.splice(i,1); saveAll(); renderCurrentPage(); };
window.editMk = (i) => openModal('mk',i);
window.delMk = (i) => { mataKuliah.splice(i,1); saveAll(); renderCurrentPage(); };
