/* SentiVerse - App Logic */

// Lexicon-based sentiment analysis (Indonesian)
const POSITIVE_WORDS = ['bagus','baik','senang','suka','indah','hebat','mantap','keren','luar biasa','puas','nyaman','cinta','sukses','berhasil','menakjubkan','sempurna','unggul','membantu','menarik','ramah','cepat','mudah','aman','bersih','murah','rekomendasi','terbaik','prima','optimal','efektif','efisien','inovatif','canggih','elegan','profesional','menyenangkan','mengagumkan','fantastis','brilian','istimewa','memuaskan','berkualitas','responsif','stabil','handal'];
const NEGATIVE_WORDS = ['buruk','jelek','marah','benci','gagal','rusak','lambat','susah','sulit','mengecewakan','kecewa','parah','mahal','bohong','sampah','payah','bodoh','menyesal','masalah','error','bug','crash','lemot','ribet','rumit','kotor','berbahaya','tidak aman','mengkhawatirkan','menjengkelkan','membosankan','mengerikan','menyedihkan','frustasi','kesal','tertipu','penipuan','abal','murahan','cacat'];

const EMOTIONS = [
    { name:'Senang', icon:'😊', key:'joy' },
    { name:'Sedih', icon:'😢', key:'sadness' },
    { name:'Marah', icon:'😠', key:'anger' },
    { name:'Takut', icon:'😨', key:'fear' },
    { name:'Terkejut', icon:'😲', key:'surprise' },
    { name:'Jijik', icon:'🤢', key:'disgust' }
];

const EMOTION_KEYWORDS = {
    joy: ['senang','suka','bahagia','cinta','hebat','mantap','keren','puas','bangga','gembira','tertawa','semangat'],
    sadness: ['sedih','kecewa','gagal','kehilangan','menyesal','menangis','putus asa','nelangsa','pilu','duka'],
    anger: ['marah','kesal','benci','jengkel','frustasi','geram','murka','dongkol','emosi','sebal'],
    fear: ['takut','khawatir','cemas','panik','ngeri','was-was','gelisah','resah'],
    surprise: ['kaget','terkejut','wow','astaga','tidak percaya','luar biasa','mengejutkan'],
    disgust: ['jijik','muak','bosan','mual','eneg','menggelikan']
};

const SAMPLE_TEXTS = [
    'Aplikasi ini sangat bagus dan membantu pekerjaan saya sehari-hari! Sangat puas dengan fiturnya yang lengkap dan responsif.',
    'Pelayanan sangat buruk dan mengecewakan. Sudah tiga kali komplain tapi tidak ada tanggapan sama sekali. Sangat kecewa!',
    'Produknya biasa saja, tidak ada yang spesial. Harganya standar untuk kualitas seperti ini.',
    'Luar biasa! Tim developer sangat profesional dan inovatif. Hasil kerjanya sempurna dan memuaskan semua pihak.',
    'Website sering error dan crash, loading sangat lambat. Desainnya juga membosankan dan tidak user-friendly.',
    'Makanan di restoran ini enak banget! Pelayanannya ramah dan tempatnya bersih. Pasti akan datang lagi.',
    'Kecewa berat dengan kualitas barang yang diterima. Tidak sesuai deskripsi dan bahan murahan. Merasa tertipu.',
    'Hasil rapat hari ini cukup produktif. Ada beberapa poin yang perlu ditindaklanjuti minggu depan.',
    'Film ini benar-benar menakjubkan! Ceritanya menarik, aktingnya hebat, dan efek visualnya fantastis. Wajib ditonton!',
    'Pengalaman menginap di hotel ini sangat mengecewakan. Kamar kotor, AC rusak, dan staf tidak ramah sama sekali.'
];

let history = [];

const DOM = {
    textInput: document.getElementById('textInput'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    sampleBtn: document.getElementById('sampleBtn'),
    batchBtn: document.getElementById('batchBtn'),
    resultGrid: document.getElementById('resultGrid'),
    sentimentEmoji: document.getElementById('sentimentEmoji'),
    sentimentLabel: document.getElementById('sentimentLabel'),
    negFill: document.getElementById('negFill'),
    neuFill: document.getElementById('neuFill'),
    posFill: document.getElementById('posFill'),
    negVal: document.getElementById('negVal'),
    neuVal: document.getElementById('neuVal'),
    posVal: document.getElementById('posVal'),
    gaugeCanvas: document.getElementById('gaugeCanvas'),
    gaugeLabel: document.getElementById('gaugeLabel'),
    processTime: document.getElementById('processTime'),
    keywordsCloud: document.getElementById('keywordsCloud'),
    emotionBars: document.getElementById('emotionBars'),
    historyList: document.getElementById('historyList'),
    historyCount: document.getElementById('historyCount'),
    historyStats: document.getElementById('historyStats'),
    historyChart: document.getElementById('historyChart')
};

document.addEventListener('DOMContentLoaded', () => {
    history = JSON.parse(localStorage.getItem('senti_history')) || [];
    renderHistory();
    initBg();

    DOM.analyzeBtn.addEventListener('click', () => {
        const text = DOM.textInput.value.trim();
        if (text) analyzeText(text);
    });

    DOM.sampleBtn.addEventListener('click', () => {
        DOM.textInput.value = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
    });

    DOM.batchBtn.addEventListener('click', batchAnalyze);

    DOM.textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            const text = DOM.textInput.value.trim();
            if (text) analyzeText(text);
        }
    });
});

function analyzeText(text) {
    const start = performance.now();
    const result = performSentiment(text);
    const elapsed = (performance.now() - start).toFixed(1);

    // Show results
    DOM.resultGrid.style.display = 'grid';
    DOM.processTime.textContent = elapsed + 'ms';

    // Sentiment
    const emojis = { positive:'😊', negative:'😠', neutral:'😐' };
    const labels = { positive:'Positif', negative:'Negatif', neutral:'Netral' };
    DOM.sentimentEmoji.textContent = emojis[result.sentiment];
    DOM.sentimentLabel.textContent = labels[result.sentiment];
    DOM.sentimentLabel.className = 'sentiment-label ' + result.sentiment;

    // Score bars
    setTimeout(() => {
        DOM.negFill.style.setProperty('--w', result.scores.negative + '%');
        DOM.negFill.querySelector('::after') || null;
        document.querySelectorAll('.score-fill').forEach(el => {
            const seg = el.parentElement.parentElement;
            if (seg.classList.contains('negative')) el.style.cssText = `--w:${result.scores.negative}%`;
            if (seg.classList.contains('neutral')) el.style.cssText = `--w:${result.scores.neutral}%`;
            if (seg.classList.contains('positive')) el.style.cssText = `--w:${result.scores.positive}%`;
        });
        // Set width via ::after
        DOM.negFill.style.width = '100%';
        DOM.neuFill.style.width = '100%';
        DOM.posFill.style.width = '100%';
        DOM.negFill.style.setProperty('width', '100%');
        DOM.neuFill.style.setProperty('width', '100%');
        DOM.posFill.style.setProperty('width', '100%');

        // Direct approach
        setBarWidth('negFill', result.scores.negative);
        setBarWidth('neuFill', result.scores.neutral);
        setBarWidth('posFill', result.scores.positive);
    }, 100);

    DOM.negVal.textContent = result.scores.negative.toFixed(1) + '%';
    DOM.neuVal.textContent = result.scores.neutral.toFixed(1) + '%';
    DOM.posVal.textContent = result.scores.positive.toFixed(1) + '%';

    // Gauge
    drawGauge(result.confidence);
    DOM.gaugeLabel.textContent = result.confidence.toFixed(1) + '%';

    // Keywords
    DOM.keywordsCloud.innerHTML = result.keywords.map(k =>
        `<span class="keyword-tag ${k.type}">${k.word}</span>`
    ).join('');

    // Emotions
    DOM.emotionBars.innerHTML = result.emotions.map(e => {
        const colors = { joy:'#4ade80', sadness:'#3b82f6', anger:'#ef4444', fear:'#a855f7', surprise:'#f59e0b', disgust:'#6b7280' };
        return `<div class="emotion-item">
            <span class="emotion-icon">${e.icon}</span>
            <span class="emotion-name">${e.name}</span>
            <div class="emotion-bar"><div class="emotion-bar-fill" style="width:${e.score}%;background:${colors[e.key]}"></div></div>
            <span class="emotion-val" style="color:${colors[e.key]}">${e.score.toFixed(0)}%</span>
        </div>`;
    }).join('');

    // Add to history
    history.unshift({
        text: text.slice(0, 150),
        sentiment: result.sentiment,
        confidence: result.confidence,
        timestamp: Date.now()
    });
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem('senti_history', JSON.stringify(history));
    renderHistory();
}

function setBarWidth(id, pct) {
    const el = document.getElementById(id);
    // Create inner fill div
    el.innerHTML = `<div style="width:${pct}%;height:100%;border-radius:4px;transition:width 1s ease;background:inherit"></div>`;
    const inner = el.firstChild;
    const colors = { negFill:'#ef4444', neuFill:'#f59e0b', posFill:'#4ade80' };
    inner.style.background = colors[id];
    setTimeout(() => inner.style.width = pct + '%', 50);
}

function performSentiment(text) {
    const words = text.toLowerCase().replace(/[^a-zA-Z\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    
    let posScore = 0, negScore = 0;
    const foundKeywords = [];

    words.forEach(word => {
        if (POSITIVE_WORDS.includes(word)) {
            posScore += 1;
            if (!foundKeywords.find(k => k.word === word)) foundKeywords.push({ word, type: 'positive' });
        }
        if (NEGATIVE_WORDS.includes(word)) {
            negScore += 1;
            if (!foundKeywords.find(k => k.word === word)) foundKeywords.push({ word, type: 'negative' });
        }
    });

    // Check negation
    const negations = ['tidak','bukan','belum','tanpa','jangan'];
    for (let i = 0; i < words.length - 1; i++) {
        if (negations.includes(words[i])) {
            if (POSITIVE_WORDS.includes(words[i + 1])) { posScore -= 1; negScore += 0.5; }
            if (NEGATIVE_WORDS.includes(words[i + 1])) { negScore -= 1; posScore += 0.5; }
        }
    }

    const total = Math.max(posScore + negScore, 1);
    const rawPos = Math.max(posScore, 0);
    const rawNeg = Math.max(negScore, 0);
    const neutral = Math.max(0, 1 - (rawPos + rawNeg) / Math.max(words.length * 0.3, 1));

    let posP = (rawPos / total) * (1 - neutral * 0.5) * 100;
    let negP = (rawNeg / total) * (1 - neutral * 0.5) * 100;
    let neuP = 100 - posP - negP;
    if (neuP < 0) { const s = posP + negP; posP = (posP / s) * 100; negP = (negP / s) * 100; neuP = 0; }

    let sentiment = 'neutral';
    if (posP > negP && posP > neuP) sentiment = 'positive';
    else if (negP > posP && negP > neuP) sentiment = 'negative';

    const confidence = Math.min(95, 60 + Math.abs(posP - negP) * 0.5 + (foundKeywords.length * 3));

    // Emotions
    const emotions = EMOTIONS.map(e => {
        let score = 0;
        words.forEach(w => { if (EMOTION_KEYWORDS[e.key].includes(w)) score += 15; });
        // Base scores
        if (e.key === 'joy' && sentiment === 'positive') score += 20;
        if (e.key === 'sadness' && sentiment === 'negative') score += 15;
        if (e.key === 'anger' && sentiment === 'negative') score += 18;
        score += Math.random() * 10;
        return { ...e, score: Math.min(100, Math.max(0, score)) };
    }).sort((a, b) => b.score - a.score);

    // Neutral keywords
    if (foundKeywords.length === 0) {
        words.slice(0, 5).forEach(w => {
            if (w.length > 3) foundKeywords.push({ word: w, type: 'neutral' });
        });
    }

    return {
        sentiment,
        confidence,
        scores: { positive: posP, negative: negP, neutral: neuP },
        keywords: foundKeywords.slice(0, 12),
        emotions
    };
}

function batchAnalyze() {
    SAMPLE_TEXTS.forEach(text => analyzeText(text));
}

function renderHistory() {
    DOM.historyCount.textContent = history.length + ' analisis';

    // Stats
    const pos = history.filter(h => h.sentiment === 'positive').length;
    const neg = history.filter(h => h.sentiment === 'negative').length;
    const neu = history.filter(h => h.sentiment === 'neutral').length;
    DOM.historyStats.innerHTML = `
        <div class="hstat"><span class="hstat-val total">${history.length}</span><span class="hstat-lbl">Total</span></div>
        <div class="hstat"><span class="hstat-val pos">${pos}</span><span class="hstat-lbl">Positif</span></div>
        <div class="hstat"><span class="hstat-val neg">${neg}</span><span class="hstat-lbl">Negatif</span></div>
        <div class="hstat"><span class="hstat-val neu">${neu}</span><span class="hstat-lbl">Netral</span></div>
    `;

    // Chart
    drawHistoryChart(pos, neg, neu);

    // List
    const emojis = { positive: '😊', negative: '😠', neutral: '😐' };
    const labels = { positive: 'Positif', negative: 'Negatif', neutral: 'Netral' };
    DOM.historyList.innerHTML = history.slice(0, 20).map(h => `
        <div class="history-item">
            <span class="hi-emoji">${emojis[h.sentiment]}</span>
            <span class="hi-text">${h.text}</span>
            <span class="hi-label ${h.sentiment}">${labels[h.sentiment]}</span>
            <span class="hi-score">${h.confidence.toFixed(0)}%</span>
        </div>
    `).join('');
}

function drawGauge(value) {
    const canvas = DOM.gaugeCanvas;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 200 * dpr; canvas.height = 120 * dpr;
    canvas.style.width = '200px'; canvas.style.height = '120px';
    ctx.scale(dpr, dpr);

    const cx = 100, cy = 100, r = 70;
    ctx.clearRect(0, 0, 200, 120);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Fill
    const angle = Math.PI + (value / 100) * Math.PI;
    const grad = ctx.createLinearGradient(30, 100, 170, 100);
    grad.addColorStop(0, '#ef4444');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(1, '#4ade80');
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, angle);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function drawHistoryChart(pos, neg, neu) {
    const canvas = DOM.historyChart;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = 200 * dpr;
    canvas.style.width = rect.width + 'px'; canvas.style.height = '200px';
    ctx.scale(dpr, dpr);

    const w = rect.width, h = 200;
    const total = pos + neg + neu || 1;
    const data = [
        { label: 'Positif', val: pos, color: '#4ade80' },
        { label: 'Negatif', val: neg, color: '#ef4444' },
        { label: 'Netral', val: neu, color: '#f59e0b' }
    ];

    ctx.clearRect(0, 0, w, h);

    // Donut chart
    const cx = w / 2, cy = 90, r = 65, innerR = 40;
    let startAngle = -Math.PI / 2;

    data.forEach(d => {
        const sliceAngle = (d.val / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
        ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();
        startAngle += sliceAngle;
    });

    // Center text
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 18px "Space Grotesk"';
    ctx.textAlign = 'center';
    ctx.fillText(total, cx, cy - 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '11px "Space Grotesk"';
    ctx.fillText('Total', cx, cy + 14);

    // Legend
    const legendY = h - 15;
    data.forEach((d, i) => {
        const lx = (w / 3) * i + w / 6;
        ctx.beginPath();
        ctx.arc(lx - 20, legendY, 4, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '12px "Space Grotesk"';
        ctx.textAlign = 'left';
        ctx.fillText(`${d.label} (${d.val})`, lx - 12, legendY + 4);
    });
}

// BG Particles
function initBg() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    const particles = [];
    for (let i = 0; i < 25; i++) {
        particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 1.5 + 0.5, sx: (Math.random() - 0.5) * 0.12, sy: (Math.random() - 0.5) * 0.12, o: Math.random() * 0.2 + 0.1 });
    }
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.sx; p.y += p.sy;
            if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(124,93,250,${p.o})`; ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}
