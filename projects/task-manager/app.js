/* TaskFlow - Application Logic */

const AVATAR_COLORS = ['#00e5c3','#7c5dfa','#f59e0b','#ef4444','#3b82f6','#a855f7','#ec4899'];

const SAMPLE_TASKS = [
    { id:1, title:'Implementasi Binary Search Tree', desc:'Buat implementasi BST dengan operasi insert, delete, dan search dalam Python', course:'Algoritma & Pemrograman', priority:'high', status:'progress', deadline:'2024-12-20', team:['Syarafat','Ahmad'] },
    { id:2, title:'Desain ERD Sistem Perpustakaan', desc:'Rancang Entity Relationship Diagram untuk sistem perpustakaan digital', course:'Basis Data', priority:'medium', status:'todo', deadline:'2024-12-22', team:['Syarafat','Cindy','Budi'] },
    { id:3, title:'Laporan Analisis Kebutuhan Software', desc:'Tulis dokumen SRS untuk proyek akhir mata kuliah RPL', course:'Rekayasa Perangkat Lunak', priority:'urgent', status:'review', deadline:'2024-12-18', team:['Syarafat','Dewi'] },
    { id:4, title:'Konfigurasi Router & Switch', desc:'Simulasi konfigurasi jaringan menggunakan Cisco Packet Tracer', course:'Jaringan Komputer', priority:'medium', status:'todo', deadline:'2024-12-25', team:['Ahmad','Budi'] },
    { id:5, title:'Implementasi Algoritma A*', desc:'Buat program pathfinding menggunakan algoritma A* dengan visualisasi', course:'Kecerdasan Buatan', priority:'high', status:'progress', deadline:'2024-12-28', team:['Syarafat'] },
    { id:6, title:'Tugas Teori Graf', desc:'Kerjakan soal-soal mengenai graph traversal dan minimum spanning tree', course:'Matematika Diskrit', priority:'low', status:'done', deadline:'2024-12-15', team:['Syarafat','Ahmad'] },
    { id:7, title:'Presentasi Thread & Process', desc:'Buat slide presentasi tentang multithreading dan multiprocessing di OS', course:'Sistem Operasi', priority:'medium', status:'done', deadline:'2024-12-10', team:['Cindy','Dewi'] },
    { id:8, title:'Portfolio Website dengan React', desc:'Buat website portfolio menggunakan React.js dan deploy ke Vercel', course:'Pemrograman Web', priority:'high', status:'progress', deadline:'2024-12-30', team:['Syarafat'] },
    { id:9, title:'Query Optimization Lab', desc:'Praktikum optimasi query SQL menggunakan indexing dan join strategies', course:'Basis Data', priority:'medium', status:'todo', deadline:'2024-12-23', team:['Budi','Cindy'] },
    { id:10, title:'UAS Kecerdasan Buatan', desc:'Persiapan UAS mencakup materi neural network, genetic algorithm, dan NLP', course:'Kecerdasan Buatan', priority:'urgent', status:'todo', deadline:'2024-12-19', team:['Syarafat','Ahmad','Dewi'] },
];

let tasks = [];
let editingId = null;
let currentView = 'board';
let calendarDate = new Date();

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderAll();
    initBg();
    initEvents();
});

function loadTasks() {
    const stored = localStorage.getItem('taskflow_tasks');
    if (stored) { tasks = JSON.parse(stored); }
    else { tasks = SAMPLE_TASKS.map(t => ({...t})); saveTasks(); }
}

function saveTasks() { localStorage.setItem('taskflow_tasks', JSON.stringify(tasks)); }

function renderAll() {
    renderBoard();
    renderList();
    renderCalendar();
    updateStats();
}

// Board
function renderBoard() {
    const cols = { todo:'todoColumn', progress:'progressColumn', review:'reviewColumn', done:'doneColumn' };
    const counts = { todo:0, progress:0, review:0, done:0 };
    const search = document.getElementById('searchInput').value.toLowerCase();

    Object.values(cols).forEach(id => document.getElementById(id).innerHTML = '');

    tasks.filter(t => !search || t.title.toLowerCase().includes(search) || t.course.toLowerCase().includes(search))
    .forEach(task => {
        const col = document.getElementById(cols[task.status]);
        if (!col) return;
        counts[task.status]++;
        col.appendChild(createTaskCard(task));
    });

    document.getElementById('colTodo').textContent = counts.todo;
    document.getElementById('colProgress').textContent = counts.progress;
    document.getElementById('colReview').textContent = counts.review;
    document.getElementById('colDone').textContent = counts.done;
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card priority-${task.priority}`;
    card.dataset.id = task.id;

    const isOverdue = task.status !== 'done' && new Date(task.deadline) < new Date();
    const deadlineClass = isOverdue ? 'overdue' : '';

    card.innerHTML = `
        <div class="task-actions">
            <button class="task-action-btn edit-btn" title="Edit"><i class="ph ph-pencil-simple"></i></button>
            <button class="task-action-btn delete" title="Hapus"><i class="ph ph-trash"></i></button>
        </div>
        <span class="task-course">${task.course}</span>
        <div class="task-title">${task.title}</div>
        ${task.desc ? `<div class="task-desc">${task.desc}</div>` : ''}
        <div class="task-meta">
            <span class="task-deadline ${deadlineClass}">
                <i class="ph ph-calendar"></i> ${formatDate(task.deadline)}
            </span>
            <span class="task-priority-badge ${task.priority}">${task.priority}</span>
        </div>
        ${task.team && task.team.length ? `
            <div class="task-team">
                ${task.team.map((m, i) => `<span class="task-avatar" style="background:${AVATAR_COLORS[i % AVATAR_COLORS.length]};color:#070b14;z-index:${10-i}">${m[0]}</span>`).join('')}
            </div>` : ''}
    `;

    card.querySelector('.edit-btn').addEventListener('click', (e) => { e.stopPropagation(); openEditModal(task.id); });
    card.querySelector('.delete').addEventListener('click', (e) => { e.stopPropagation(); deleteTask(task.id); });

    // Click to cycle status
    card.addEventListener('click', () => {
        const statuses = ['todo','progress','review','done'];
        const idx = statuses.indexOf(task.status);
        task.status = statuses[(idx + 1) % statuses.length];
        saveTasks(); renderAll();
    });

    return card;
}

// List
function renderList() {
    const body = document.getElementById('listBody');
    const search = document.getElementById('searchInput').value.toLowerCase();
    body.innerHTML = '';

    tasks.filter(t => !search || t.title.toLowerCase().includes(search) || t.course.toLowerCase().includes(search))
    .sort((a,b) => new Date(a.deadline) - new Date(b.deadline))
    .forEach(task => {
        const isOverdue = task.status !== 'done' && new Date(task.deadline) < new Date();
        const row = document.createElement('div');
        row.className = 'list-item';
        row.innerHTML = `
            <span class="list-item-title">${task.title}</span>
            <span class="list-item-course">${task.course}</span>
            <span class="task-priority-badge ${task.priority}">${task.priority}</span>
            <span class="task-deadline ${isOverdue ? 'overdue' : ''}"><i class="ph ph-calendar"></i> ${formatDate(task.deadline)}</span>
            <span class="list-status-badge ${task.status}">${statusLabel(task.status)}</span>
            <div class="list-actions">
                <button class="task-action-btn edit-btn" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                <button class="task-action-btn delete" title="Hapus"><i class="ph ph-trash"></i></button>
            </div>
        `;
        row.querySelector('.edit-btn').addEventListener('click', () => openEditModal(task.id));
        row.querySelector('.delete').addEventListener('click', () => deleteTask(task.id));
        body.appendChild(row);
    });
}

// Calendar
function renderCalendar() {
    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    document.getElementById('calMonth').textContent = `${monthNames[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`;

    const grid = document.getElementById('calGrid');
    grid.innerHTML = '';

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const today = new Date();

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        grid.appendChild(createCalDay(daysInPrev - i, true));
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
        const dayTasks = tasks.filter(t => t.deadline === dateStr);
        grid.appendChild(createCalDay(d, false, isToday, dayTasks));
    }

    // Next month fill
    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
        grid.appendChild(createCalDay(i, true));
    }
}

function createCalDay(num, otherMonth, isToday = false, dayTasks = []) {
    const el = document.createElement('div');
    el.className = `cal-day${otherMonth ? ' other-month' : ''}${isToday ? ' today' : ''}`;
    let tasksHtml = dayTasks.slice(0, 3).map(t => {
        const colors = { todo:'var(--status-todo)', progress:'var(--status-progress)', review:'var(--status-review)', done:'var(--status-done)' };
        return `<span class="cal-task-dot" style="background:${colors[t.status]}20;color:${colors[t.status]}">${t.title.slice(0,15)}</span>`;
    }).join('');
    if (dayTasks.length > 3) tasksHtml += `<span class="cal-task-dot" style="color:var(--text-muted)">+${dayTasks.length-3} lagi</span>`;
    el.innerHTML = `<div class="cal-day-num">${num}</div>${tasksHtml}`;
    return el;
}

// Stats
function updateStats() {
    const total = tasks.length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const progress = tasks.filter(t => t.status === 'progress').length;
    const done = tasks.filter(t => t.status === 'done').length;
    const overdue = tasks.filter(t => t.status !== 'done' && new Date(t.deadline) < new Date()).length;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('todoCount').textContent = todo;
    document.getElementById('progressCount').textContent = progress;
    document.getElementById('doneCount').textContent = done;
    document.getElementById('overdueCount').textContent = overdue;

    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    document.getElementById('overallProgress').style.width = pct + '%';
    document.getElementById('progressText').textContent = pct + '%';
}

// Modal
function openModal(title = 'Tugas Baru') {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    editingId = null;
    clearForm();
}

function clearForm() {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDesc').value = '';
    document.getElementById('taskCourse').value = '';
    document.getElementById('taskPriority').value = 'medium';
    document.getElementById('taskDeadline').value = '';
    document.getElementById('taskStatus').value = 'todo';
    document.querySelectorAll('.team-check input').forEach(cb => cb.checked = false);
}

function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    editingId = id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDesc').value = task.desc || '';
    document.getElementById('taskCourse').value = task.course;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDeadline').value = task.deadline;
    document.getElementById('taskStatus').value = task.status;
    document.querySelectorAll('.team-check input').forEach(cb => {
        cb.checked = task.team && task.team.includes(cb.value);
    });
    openModal('Edit Tugas');
}

function saveTask() {
    const title = document.getElementById('taskTitle').value.trim();
    if (!title) { document.getElementById('taskTitle').style.borderColor = 'var(--priority-urgent)'; return; }

    const team = [];
    document.querySelectorAll('.team-check input:checked').forEach(cb => team.push(cb.value));

    const data = {
        title,
        desc: document.getElementById('taskDesc').value.trim(),
        course: document.getElementById('taskCourse').value,
        priority: document.getElementById('taskPriority').value,
        deadline: document.getElementById('taskDeadline').value,
        status: document.getElementById('taskStatus').value,
        team
    };

    if (editingId) {
        const task = tasks.find(t => t.id === editingId);
        if (task) Object.assign(task, data);
    } else {
        data.id = Date.now();
        tasks.push(data);
    }

    saveTasks();
    renderAll();
    closeModal();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderAll();
}

// Events
function initEvents() {
    document.getElementById('addTaskBtn').addEventListener('click', () => openModal());
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('saveBtn').addEventListener('click', saveTask);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const view = btn.dataset.view;
            document.getElementById('boardView').style.display = view === 'board' ? 'grid' : 'none';
            document.getElementById('listView').style.display = view === 'list' ? 'block' : 'none';
            document.getElementById('calendarView').style.display = view === 'calendar' ? 'block' : 'none';
            currentView = view;
        });
    });

    document.getElementById('searchInput').addEventListener('input', renderAll);

    document.getElementById('calPrev').addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('calNext').addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        renderCalendar();
    });
}

// Utilities
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
}

function statusLabel(s) {
    const map = { todo:'To Do', progress:'In Progress', review:'Review', done:'Done' };
    return map[s] || s;
}

// Background
function initBg() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    const particles = [];
    const count = Math.min(30, Math.floor((window.innerWidth * window.innerHeight) / 35000));
    for (let i = 0; i < count; i++) {
        particles.push({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, size:Math.random()*1.5+0.5, sx:(Math.random()-0.5)*0.15, sy:(Math.random()-0.5)*0.15, o:Math.random()*0.3+0.1 });
    }
    function animate() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(p => {
            p.x += p.sx; p.y += p.sy;
            if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
            ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
            ctx.fillStyle = `rgba(0,229,195,${p.o})`; ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}
