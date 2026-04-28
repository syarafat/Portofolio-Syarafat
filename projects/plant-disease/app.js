/* ============================================
   PLANTDOC AI - APPLICATION LOGIC
   ============================================ */

// Disease Database
const DISEASES = {
    healthy: {
        name: 'Daun Sehat',
        plant: 'Tanaman dalam kondisi baik',
        isHealthy: true,
        confidence: 96.8,
        description: 'Daun tanaman dalam kondisi sehat tanpa tanda-tanda infeksi penyakit. Warna hijau merata, struktur jaringan utuh, dan tidak ada lesi atau bercak abnormal.',
        symptoms: [
            'Warna hijau merata dan cerah',
            'Tekstur daun halus dan elastis',
            'Tidak ada bercak atau lesi',
            'Pertumbuhan normal dan simetris'
        ],
        treatment: [
            'Lanjutkan perawatan rutin saat ini',
            'Pastikan penyiraman teratur sesuai kebutuhan tanaman',
            'Berikan pupuk sesuai jadwal pemupukan',
            'Monitor secara berkala untuk deteksi dini'
        ],
        prevention: [
            'Jaga kebersihan area tanam',
            'Lakukan rotasi tanaman secara berkala',
            'Pastikan drainase tanah baik',
            'Gunakan benih/bibit yang bersertifikat'
        ],
        otherPredictions: [
            { name: 'Nutrient Deficiency', percent: 2.1 },
            { name: 'Early Blight', percent: 0.6 },
            { name: 'Leaf Spot', percent: 0.3 },
            { name: 'Powdery Mildew', percent: 0.2 }
        ]
    },
    leaf_blight: {
        name: 'Leaf Blight (Hawar Daun)',
        plant: 'Solanum lycopersicum (Tomat)',
        isHealthy: false,
        confidence: 92.4,
        description: 'Leaf Blight atau Hawar Daun adalah penyakit yang disebabkan oleh jamur Alternaria solani (Early Blight) atau Phytophthora infestans (Late Blight). Penyakit ini menyebabkan kerusakan signifikan pada daun dan dapat menurunkan hasil panen hingga 80%.',
        symptoms: [
            'Bercak coklat gelap berbentuk konsentris pada daun tua',
            'Lesi menyebar dari daun bawah ke atas',
            'Jaringan daun menguning di sekitar bercak',
            'Daun mengering dan gugur prematur',
            'Pada kasus parah, batang dan buah juga terinfeksi'
        ],
        treatment: [
            'Aplikasikan fungisida berbahan aktif Mancozeb atau Chlorothalonil',
            'Pangkas dan buang daun yang terinfeksi segera',
            'Tingkatkan sirkulasi udara dengan jarak tanam yang tepat',
            'Hindari penyiraman dari atas yang membasahi daun',
            'Gunakan mulsa untuk mencegah percikan tanah ke daun'
        ],
        prevention: [
            'Gunakan varietas yang tahan terhadap blight',
            'Lakukan rotasi tanaman minimal 2 tahun',
            'Bersihkan sisa tanaman setelah panen',
            'Aplikasikan fungisida preventif saat musim hujan',
            'Jaga kebersihan alat pertanian'
        ],
        otherPredictions: [
            { name: 'Late Blight', percent: 4.8 },
            { name: 'Septoria Leaf Spot', percent: 1.5 },
            { name: 'Bacterial Spot', percent: 0.8 },
            { name: 'Healthy', percent: 0.5 }
        ]
    },
    leaf_spot: {
        name: 'Leaf Spot (Bercak Daun)',
        plant: 'Oryza sativa (Padi)',
        isHealthy: false,
        confidence: 89.7,
        description: 'Leaf Spot atau Bercak Daun disebabkan oleh berbagai patogen jamur seperti Cercospora, Septoria, atau bakteri Xanthomonas. Penyakit ini ditandai dengan munculnya bercak-bercak kecil hingga besar pada permukaan daun yang dapat mengurangi luas permukaan fotosintesis.',
        symptoms: [
            'Bercak bulat atau tidak beraturan berwarna coklat/hitam',
            'Halo kuning di sekitar bercak',
            'Bercak dapat menyatu membentuk area nekrotik besar',
            'Daun menguning dan mengering',
            'Penurunan vigor tanaman secara keseluruhan'
        ],
        treatment: [
            'Gunakan fungisida berbahan aktif Propiconazole atau Azoxystrobin',
            'Buang daun yang parah terinfeksi',
            'Kurangi kelembapan berlebih di sekitar tanaman',
            'Aplikasikan pupuk kalium untuk meningkatkan ketahanan',
            'Semprot dengan larutan tembaga sulfat 0.5%'
        ],
        prevention: [
            'Pilih varietas yang tahan penyakit',
            'Atur jarak tanam untuk ventilasi optimal',
            'Hindari pemupukan nitrogen berlebihan',
            'Siram tanaman di pagi hari agar daun kering sebelum malam',
            'Lakukan sanitasi lahan secara rutin'
        ],
        otherPredictions: [
            { name: 'Brown Spot', percent: 5.2 },
            { name: 'Blast', percent: 3.1 },
            { name: 'Bacterial Blight', percent: 1.2 },
            { name: 'Healthy', percent: 0.8 }
        ]
    },
    rust: {
        name: 'Rust (Karat Daun)',
        plant: 'Triticum aestivum (Gandum)',
        isHealthy: false,
        confidence: 91.3,
        description: 'Rust atau Karat Daun disebabkan oleh jamur Puccinia spp. Penyakit ini sangat umum pada tanaman serealia dan ditandai dengan pustula berwarna oranye-kecoklatan pada permukaan daun. Infeksi berat dapat menyebabkan kerugian panen yang signifikan.',
        symptoms: [
            'Pustula berwarna oranye/coklat pada permukaan daun',
            'Serbuk spora berwarna karat saat pustula pecah',
            'Daun menguning dan mengering prematur',
            'Penurunan ukuran biji pada tanaman serealia',
            'Infeksi menyebar cepat pada kondisi lembab'
        ],
        treatment: [
            'Aplikasikan fungisida triazole (Tebuconazole) segera',
            'Pangkas bagian tanaman yang terinfeksi berat',
            'Tingkatkan drainase untuk mengurangi kelembapan',
            'Gunakan fungisida sistemik untuk perlindungan internal',
            'Lakukan aplikasi fungisida setiap 14 hari saat musim hujan'
        ],
        prevention: [
            'Tanam varietas tahan karat yang telah diuji',
            'Hilangkan tanaman inang alternatif di sekitar lahan',
            'Lakukan penanaman tepat waktu sesuai rekomendasi',
            'Monitor lahan secara rutin terutama saat musim hujan',
            'Aplikasikan fungisida preventif pada fase rentan'
        ],
        otherPredictions: [
            { name: 'Stripe Rust', percent: 4.5 },
            { name: 'Septoria', percent: 2.3 },
            { name: 'Powdery Mildew', percent: 1.2 },
            { name: 'Healthy', percent: 0.7 }
        ]
    },
    powdery_mildew: {
        name: 'Powdery Mildew (Embun Tepung)',
        plant: 'Cucumis sativus (Mentimun)',
        isHealthy: false,
        confidence: 93.6,
        description: 'Powdery Mildew atau Embun Tepung disebabkan oleh jamur Erysiphe cichoracearum atau Podosphaera xanthii. Ditandai dengan lapisan tepung putih pada permukaan daun. Penyakit ini sangat umum pada cucurbits dan dapat menyebar dengan cepat melalui spora udara.',
        symptoms: [
            'Lapisan tepung putih pada permukaan atas daun',
            'Bercak putih yang menyebar dan menyatu',
            'Daun menguning, mengering, dan melengkung',
            'Pertumbuhan tanaman terhambat',
            'Buah menjadi kecil dan kualitas menurun'
        ],
        treatment: [
            'Semprot dengan fungisida berbahan aktif Sulfur atau Potassium bicarbonate',
            'Gunakan minyak neem sebagai alternatif organik',
            'Aplikasikan larutan susu (1:9 dengan air) sebagai biofungisida',
            'Buang daun yang terinfeksi parah',
            'Tingkatkan sirkulasi udara di sekitar tanaman'
        ],
        prevention: [
            'Tanam varietas tahan embun tepung',
            'Jaga jarak tanam yang cukup untuk sirkulasi udara',
            'Hindari pemupukan nitrogen berlebihan',
            'Siram di bagian akar, bukan daun',
            'Aplikasikan fungisida preventif sebelum musim rawan'
        ],
        otherPredictions: [
            { name: 'Downy Mildew', percent: 3.8 },
            { name: 'Leaf Spot', percent: 1.5 },
            { name: 'Anthracnose', percent: 0.7 },
            { name: 'Healthy', percent: 0.4 }
        ]
    }
};

// DOM References
const DOM = {
    uploadArea: document.getElementById('uploadArea'),
    uploadPlaceholder: document.getElementById('uploadPlaceholder'),
    previewImage: document.getElementById('previewImage'),
    fileInput: document.getElementById('fileInput'),
    selectBtn: document.getElementById('selectBtn'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    resetBtn: document.getElementById('resetBtn'),
    processingState: document.getElementById('processingState'),
    welcomeState: document.getElementById('welcomeState'),
    resultState: document.getElementById('resultState'),
    diagnosisCard: document.getElementById('diagnosisCard'),
    diagnosisStatus: document.getElementById('diagnosisStatus'),
    diseaseName: document.getElementById('diseaseName'),
    plantName: document.getElementById('plantName'),
    confidenceValue: document.getElementById('confidenceValue'),
    confidenceFill: document.getElementById('confidenceFill'),
    predictionsList: document.getElementById('predictionsList'),
    diseaseDescription: document.getElementById('diseaseDescription'),
    symptomsList: document.getElementById('symptomsList'),
    treatmentList: document.getElementById('treatmentList'),
    preventionList: document.getElementById('preventionList'),
    steps: [
        document.getElementById('step1'),
        document.getElementById('step2'),
        document.getElementById('step3'),
        document.getElementById('step4')
    ]
};

let selectedDisease = null;
let hasImage = false;

// File Upload Handling
DOM.uploadArea.addEventListener('click', () => DOM.fileInput.click());
DOM.selectBtn.addEventListener('click', () => DOM.fileInput.click());

DOM.uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.uploadArea.classList.add('dragover');
});

DOM.uploadArea.addEventListener('dragleave', () => {
    DOM.uploadArea.classList.remove('dragover');
});

DOM.uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageFile(file);
    }
});

DOM.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleImageFile(file);
});

function handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        DOM.previewImage.src = e.target.result;
        DOM.previewImage.style.display = 'block';
        DOM.uploadPlaceholder.style.display = 'none';
        DOM.analyzeBtn.disabled = false;
        DOM.resetBtn.style.display = 'inline-flex';
        hasImage = true;

        // Random disease for uploaded images
        const keys = Object.keys(DISEASES);
        selectedDisease = keys[Math.floor(Math.random() * keys.length)];
    };
    reader.readAsDataURL(file);
}

// Sample Items
document.querySelectorAll('.sample-item').forEach(item => {
    item.addEventListener('click', () => {
        selectedDisease = item.dataset.disease;

        // Create a canvas-based sample image
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        drawSampleLeaf(ctx, canvas.width, canvas.height, selectedDisease);

        DOM.previewImage.src = canvas.toDataURL();
        DOM.previewImage.style.display = 'block';
        DOM.uploadPlaceholder.style.display = 'none';
        DOM.analyzeBtn.disabled = false;
        DOM.resetBtn.style.display = 'inline-flex';
        hasImage = true;
    });
});

function drawSampleLeaf(ctx, w, h, disease) {
    // Background
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;

    // Leaf shape
    ctx.save();
    ctx.translate(cx, cy);

    // Main leaf
    ctx.beginPath();
    ctx.moveTo(0, -120);
    ctx.bezierCurveTo(60, -80, 80, -20, 70, 40);
    ctx.bezierCurveTo(60, 80, 30, 120, 0, 140);
    ctx.bezierCurveTo(-30, 120, -60, 80, -70, 40);
    ctx.bezierCurveTo(-80, -20, -60, -80, 0, -120);
    ctx.closePath();

    const baseColor = disease === 'healthy' ? '#22c55e' : '#4a7c59';
    ctx.fillStyle = baseColor;
    ctx.fill();

    // Leaf vein
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -120);
    ctx.lineTo(0, 140);
    ctx.stroke();

    for (let i = -80; i < 120; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.bezierCurveTo(25, i - 10, 45, i - 15, 55, i - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.bezierCurveTo(-25, i - 10, -45, i - 15, -55, i - 5);
        ctx.stroke();
    }

    // Disease spots
    if (disease === 'leaf_blight') {
        for (let i = 0; i < 8; i++) {
            const sx = (Math.random() - 0.5) * 100;
            const sy = (Math.random() - 0.5) * 200;
            const sr = 8 + Math.random() * 15;
            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(101, 67, 33, ${0.6 + Math.random() * 0.3})`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(sx, sy, sr * 1.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(180, 160, 50, 0.2)';
            ctx.fill();
        }
    } else if (disease === 'leaf_spot') {
        for (let i = 0; i < 12; i++) {
            const sx = (Math.random() - 0.5) * 100;
            const sy = (Math.random() - 0.5) * 200;
            const sr = 4 + Math.random() * 8;
            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(60, 30, 10, ${0.7 + Math.random() * 0.3})`;
            ctx.fill();
        }
    } else if (disease === 'rust') {
        for (let i = 0; i < 15; i++) {
            const sx = (Math.random() - 0.5) * 100;
            const sy = (Math.random() - 0.5) * 200;
            const sr = 3 + Math.random() * 6;
            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(210, 120, 30, ${0.6 + Math.random() * 0.4})`;
            ctx.fill();
        }
    } else if (disease === 'powdery_mildew') {
        for (let i = 0; i < 20; i++) {
            const sx = (Math.random() - 0.5) * 110;
            const sy = (Math.random() - 0.5) * 220;
            const sr = 5 + Math.random() * 12;
            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + Math.random() * 0.2})`;
            ctx.fill();
        }
    }

    ctx.restore();
}

// Analyze
DOM.analyzeBtn.addEventListener('click', () => {
    if (!hasImage || !selectedDisease) return;
    runAnalysis(selectedDisease);
});

DOM.resetBtn.addEventListener('click', resetAll);

function resetAll() {
    DOM.previewImage.style.display = 'none';
    DOM.previewImage.src = '';
    DOM.uploadPlaceholder.style.display = 'block';
    DOM.analyzeBtn.disabled = true;
    DOM.resetBtn.style.display = 'none';
    DOM.fileInput.value = '';
    hasImage = false;
    selectedDisease = null;

    DOM.processingState.style.display = 'none';
    DOM.resultState.style.display = 'none';
    DOM.welcomeState.style.display = 'flex';

    DOM.steps.forEach(step => {
        step.classList.remove('done', 'active');
    });
}

async function runAnalysis(diseaseKey) {
    DOM.welcomeState.style.display = 'none';
    DOM.resultState.style.display = 'none';
    DOM.processingState.style.display = 'flex';

    DOM.steps.forEach(step => step.classList.remove('done', 'active'));

    for (let i = 0; i < DOM.steps.length; i++) {
        DOM.steps[i].classList.add('active');
        await delay(600 + Math.random() * 400);
        DOM.steps[i].classList.remove('active');
        DOM.steps[i].classList.add('done');
        DOM.steps[i].querySelector('i').className = 'ph ph-check-circle';
    }

    await delay(300);
    showResult(diseaseKey);
}

function showResult(diseaseKey) {
    const disease = DISEASES[diseaseKey];
    if (!disease) return;

    DOM.processingState.style.display = 'none';
    DOM.resultState.style.display = 'block';

    // Diagnosis
    DOM.diseaseName.textContent = disease.name;
    DOM.plantName.textContent = disease.plant;
    DOM.diagnosisStatus.className = 'diagnosis-status ' + (disease.isHealthy ? 'healthy' : 'diseased');
    DOM.diagnosisStatus.innerHTML = disease.isHealthy
        ? '<i class="ph ph-check-circle"></i>'
        : '<i class="ph ph-warning-circle"></i>';

    // Confidence
    const conf = disease.confidence + (Math.random() * 2 - 1);
    DOM.confidenceValue.textContent = conf.toFixed(1) + '%';
    setTimeout(() => {
        DOM.confidenceFill.style.width = conf.toFixed(1) + '%';
    }, 100);

    // Predictions
    const allPreds = [
        { name: disease.name, percent: conf },
        ...disease.otherPredictions
    ].sort((a, b) => b.percent - a.percent);

    DOM.predictionsList.innerHTML = allPreds.map((pred, i) => {
        const colors = ['var(--accent)', 'var(--accent-secondary)', 'var(--accent-warning)', '#ef4444', 'var(--text-muted)'];
        return `
            <div class="prediction-item">
                <span class="prediction-name">${pred.name}</span>
                <div class="prediction-bar-bg">
                    <div class="prediction-bar-fill" style="width: 0%; background: ${colors[i] || colors[4]};" data-width="${pred.percent}"></div>
                </div>
                <span class="prediction-percent">${pred.percent.toFixed(1)}%</span>
            </div>
        `;
    }).join('');

    // Animate bars
    setTimeout(() => {
        document.querySelectorAll('.prediction-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.width + '%';
        });
    }, 200);

    // Description
    DOM.diseaseDescription.textContent = disease.description;

    // Symptoms
    DOM.symptomsList.innerHTML = disease.symptoms.map(s => `<li>${s}</li>`).join('');

    // Treatment
    DOM.treatmentList.innerHTML = disease.treatment.map(t => `<li>${t}</li>`).join('');

    // Prevention
    DOM.preventionList.innerHTML = disease.prevention.map(p => `<li>${p}</li>`).join('');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Background Particles
function initBgParticles() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = Math.min(35, Math.floor((window.innerWidth * window.innerHeight) / 30000));
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5,
            speedX: (Math.random() - 0.5) * 0.15, speedY: (Math.random() - 0.5) * 0.15,
            opacity: Math.random() * 0.3 + 0.1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.speedX; p.y += p.speedY;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(74, 222, 128, ${p.opacity})`;
            ctx.fill();
        });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(74, 222, 128, ${(1 - dist / 120) * 0.06})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

document.addEventListener('DOMContentLoaded', initBgParticles);
