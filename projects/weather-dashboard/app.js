/* ============================================
   CUACAVERSE - WEATHER DASHBOARD APP
   Core Application Logic
   ============================================ */

// ============================================
// CONFIG & API
// ============================================
const CONFIG = {
    // Free OpenWeatherMap API key - replace with your own for production
    API_KEY: '64e953e924d7341ec991af047a03a639',
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    GEO_URL: 'https://api.openweathermap.org/geo/1.0',
    UNITS: 'metric', // metric = Celsius, imperial = Fahrenheit
    LANG: 'id'
};

// ============================================
// STATE
// ============================================
let state = {
    unit: 'metric',
    currentCity: '',
    weatherData: null,
    forecastData: null,
    airData: null,
    isLoading: false
};

// ============================================
// DOM REFERENCES
// ============================================
const DOM = {
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    searchSuggestions: document.getElementById('searchSuggestions'),
    geoBtn: document.getElementById('geoBtn'),
    unitToggle: document.getElementById('unitToggle'),
    currentTime: document.getElementById('currentTime'),
    
    loadingState: document.getElementById('loadingState'),
    welcomeState: document.getElementById('welcomeState'),
    weatherContent: document.getElementById('weatherContent'),
    errorState: document.getElementById('errorState'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    
    // Current Weather
    cityName: document.getElementById('cityName'),
    countryName: document.getElementById('countryName'),
    currentTemp: document.getElementById('currentTemp'),
    feelsLike: document.getElementById('feelsLike'),
    tempHigh: document.getElementById('tempHigh'),
    tempLow: document.getElementById('tempLow'),
    currentCondition: document.getElementById('currentCondition'),
    lastUpdated: document.getElementById('lastUpdated'),
    weatherAnimation: document.getElementById('weatherAnimation'),
    
    // Details
    humidity: document.getElementById('humidity'),
    humidityBar: document.getElementById('humidityBar'),
    windSpeed: document.getElementById('windSpeed'),
    windDirection: document.getElementById('windDirection'),
    pressure: document.getElementById('pressure'),
    visibility: document.getElementById('visibility'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    
    // Forecast
    hourlyScroll: document.getElementById('hourlyScroll'),
    forecastList: document.getElementById('forecastList'),
    tempChart: document.getElementById('tempChart'),
    
    // Air Quality
    aqiFill: document.getElementById('aqiFill'),
    aqiValue: document.getElementById('aqiValue'),
    aqiLabel: document.getElementById('aqiLabel'),
    pm25: document.getElementById('pm25'),
    pm10: document.getElementById('pm10'),
    o3: document.getElementById('o3'),
    no2: document.getElementById('no2'),
    
    // UV
    uvValue: document.getElementById('uvValue'),
    uvLabel: document.getElementById('uvLabel'),
    uvIndicator: document.getElementById('uvIndicator'),
    uvAdvice: document.getElementById('uvAdvice'),
    
    // Map
    lat: document.getElementById('lat'),
    lon: document.getElementById('lon')
};

// ============================================
// WEATHER ICON MAPPING
// ============================================
const WEATHER_ICONS = {
    '01d': '☀️', '01n': '🌙',
    '02d': '🌤️', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '🌨️', '13n': '🌨️',
    '50d': '🌫️', '50n': '🌫️'
};

const CONDITION_ID = {
    id: {
        '01d': 'Cerah', '01n': 'Cerah',
        '02d': 'Berawan Sebagian', '02n': 'Berawan Sebagian',
        '03d': 'Berawan', '03n': 'Berawan',
        '04d': 'Mendung', '04n': 'Mendung',
        '09d': 'Hujan Ringan', '09n': 'Hujan Ringan',
        '10d': 'Hujan', '10n': 'Hujan',
        '11d': 'Badai Petir', '11n': 'Badai Petir',
        '13d': 'Salju', '13n': 'Salju',
        '50d': 'Berkabut', '50n': 'Berkabut'
    }
};

// ============================================
// API FUNCTIONS
// ============================================
async function fetchWeather(city) {
    const url = `${CONFIG.BASE_URL}/weather?q=${encodeURIComponent(city)}&units=${state.unit}&lang=${CONFIG.LANG}&appid=${CONFIG.API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('City not found');
    return response.json();
}

async function fetchWeatherByCoords(lat, lon) {
    const url = `${CONFIG.BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${state.unit}&lang=${CONFIG.LANG}&appid=${CONFIG.API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Location not found');
    return response.json();
}

async function fetchForecast(lat, lon) {
    const url = `${CONFIG.BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${state.unit}&lang=${CONFIG.LANG}&appid=${CONFIG.API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Forecast not available');
    return response.json();
}

async function fetchAirQuality(lat, lon) {
    const url = `${CONFIG.BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    return response.json();
}

async function searchCities(query) {
    if (query.length < 2) return [];
    const url = `${CONFIG.GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${CONFIG.API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    return response.json();
}

// ============================================
// UI STATE MANAGEMENT
// ============================================
function showState(stateName) {
    DOM.loadingState.style.display = 'none';
    DOM.welcomeState.style.display = 'none';
    DOM.weatherContent.style.display = 'none';
    DOM.errorState.style.display = 'none';
    
    switch (stateName) {
        case 'loading':
            DOM.loadingState.style.display = 'flex';
            break;
        case 'welcome':
            DOM.welcomeState.style.display = 'flex';
            break;
        case 'weather':
            DOM.weatherContent.style.display = 'block';
            // Re-trigger card animations
            DOM.weatherContent.querySelectorAll('.card').forEach(card => {
                card.style.animation = 'none';
                card.offsetHeight; // force reflow
                card.style.animation = '';
            });
            break;
        case 'error':
            DOM.errorState.style.display = 'flex';
            break;
    }
}

// ============================================
// MAIN WEATHER LOAD FUNCTION
// ============================================
async function loadWeather(city) {
    if (state.isLoading) return;
    state.isLoading = true;
    showState('loading');
    
    try {
        // Fetch current weather
        const weather = await fetchWeather(city);
        state.weatherData = weather;
        state.currentCity = city;
        
        const { lat, lon } = weather.coord;
        
        // Fetch forecast and air quality in parallel
        const [forecast, airQuality] = await Promise.all([
            fetchForecast(lat, lon),
            fetchAirQuality(lat, lon)
        ]);
        
        state.forecastData = forecast;
        state.airData = airQuality;
        
        // Update all UI
        updateCurrentWeather(weather);
        updateDetails(weather);
        updateHourlyForecast(forecast);
        updateDailyForecast(forecast);
        drawTemperatureChart(forecast);
        updateAirQuality(airQuality);
        updateUVIndex(weather);
        updateMap(lat, lon);
        drawWeatherAnimation(weather.weather[0].icon);
        
        showState('weather');
        
    } catch (error) {
        console.error('Error loading weather:', error);
        DOM.errorMessage.textContent = `Kota "${city}" tidak ditemukan. Pastikan nama kota benar dan coba lagi.`;
        showState('error');
    } finally {
        state.isLoading = false;
    }
}

async function loadWeatherByCoords(lat, lon) {
    if (state.isLoading) return;
    state.isLoading = true;
    showState('loading');
    
    try {
        const weather = await fetchWeatherByCoords(lat, lon);
        state.weatherData = weather;
        state.currentCity = weather.name;
        
        const [forecast, airQuality] = await Promise.all([
            fetchForecast(lat, lon),
            fetchAirQuality(lat, lon)
        ]);
        
        state.forecastData = forecast;
        state.airData = airQuality;
        
        updateCurrentWeather(weather);
        updateDetails(weather);
        updateHourlyForecast(forecast);
        updateDailyForecast(forecast);
        drawTemperatureChart(forecast);
        updateAirQuality(airQuality);
        updateUVIndex(weather);
        updateMap(lat, lon);
        drawWeatherAnimation(weather.weather[0].icon);
        
        showState('weather');
        
    } catch (error) {
        console.error('Error loading weather:', error);
        DOM.errorMessage.textContent = 'Gagal mengambil data cuaca untuk lokasi Anda.';
        showState('error');
    } finally {
        state.isLoading = false;
    }
}

// ============================================
// UPDATE UI FUNCTIONS
// ============================================
function updateCurrentWeather(data) {
    DOM.cityName.textContent = data.name;
    DOM.countryName.textContent = getCountryName(data.sys.country);
    DOM.currentTemp.textContent = Math.round(data.main.temp);
    DOM.feelsLike.textContent = Math.round(data.main.feels_like);
    DOM.tempHigh.textContent = Math.round(data.main.temp_max);
    DOM.tempLow.textContent = Math.round(data.main.temp_min);
    
    const iconCode = data.weather[0].icon;
    const condition = CONDITION_ID.id[iconCode] || data.weather[0].description;
    DOM.currentCondition.textContent = condition;
    
    // Update timestamp
    const now = new Date();
    DOM.lastUpdated.textContent = `Diperbarui: ${formatTime(now)}`;
    
    // Update page title
    document.title = `${Math.round(data.main.temp)}° ${data.name} - CuacaVerse`;
}

function updateDetails(data) {
    DOM.humidity.textContent = data.main.humidity;
    DOM.humidityBar.style.width = data.main.humidity + '%';
    
    DOM.windSpeed.textContent = Math.round(data.wind.speed * 3.6); // m/s to km/h
    DOM.windDirection.style.transform = `translate(-50%, -100%) rotate(${data.wind.deg}deg)`;
    
    DOM.pressure.textContent = data.main.pressure;
    DOM.visibility.textContent = (data.visibility / 1000).toFixed(1);
    
    DOM.sunrise.textContent = formatTime(new Date(data.sys.sunrise * 1000));
    DOM.sunset.textContent = formatTime(new Date(data.sys.sunset * 1000));
}

function updateHourlyForecast(data) {
    const hourlyItems = data.list.slice(0, 8);
    
    DOM.hourlyScroll.innerHTML = hourlyItems.map((item, index) => {
        const time = new Date(item.dt * 1000);
        const icon = WEATHER_ICONS[item.weather[0].icon] || '☁️';
        const temp = Math.round(item.main.temp);
        const rain = item.pop ? Math.round(item.pop * 100) : 0;
        
        return `
            <div class="hourly-item ${index === 0 ? 'now' : ''}">
                <span class="hourly-time">${index === 0 ? 'Sekarang' : formatHour(time)}</span>
                <span class="hourly-icon">${icon}</span>
                <span class="hourly-temp">${temp}°</span>
                ${rain > 0 ? `<span class="hourly-rain"><i class="ph ph-drop"></i>${rain}%</span>` : ''}
            </div>
        `;
    }).join('');
}

function updateDailyForecast(data) {
    // Group forecast by day
    const dailyMap = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toISOString().split('T')[0];
        
        if (!dailyMap[dayKey]) {
            dailyMap[dayKey] = {
                temps: [],
                icons: [],
                conditions: [],
                date: date
            };
        }
        
        dailyMap[dayKey].temps.push(item.main.temp);
        dailyMap[dayKey].icons.push(item.weather[0].icon);
        dailyMap[dayKey].conditions.push(item.weather[0].description);
    });
    
    const days = Object.values(dailyMap).slice(1, 6); // Skip today, take 5 days
    
    // Find global min/max for bar visualization
    let globalMin = Infinity, globalMax = -Infinity;
    days.forEach(day => {
        const min = Math.min(...day.temps);
        const max = Math.max(...day.temps);
        if (min < globalMin) globalMin = min;
        if (max > globalMax) globalMax = max;
    });
    const tempRange = globalMax - globalMin || 1;
    
    DOM.forecastList.innerHTML = days.map(day => {
        const min = Math.round(Math.min(...day.temps));
        const max = Math.round(Math.max(...day.temps));
        const icon = getMostFrequent(day.icons);
        const condition = getMostFrequent(day.conditions);
        
        // Calculate bar position
        const barLeft = ((Math.min(...day.temps) - globalMin) / tempRange) * 100;
        const barWidth = ((Math.max(...day.temps) - Math.min(...day.temps)) / tempRange) * 100;
        
        return `
            <div class="forecast-item">
                <span class="forecast-day">${formatDay(day.date)}</span>
                <span class="forecast-icon">${WEATHER_ICONS[icon] || '☁️'}</span>
                <span class="forecast-condition">${condition}</span>
                <div class="forecast-bar">
                    <div class="forecast-bar-fill" style="left: ${barLeft}%; width: ${Math.max(barWidth, 10)}%"></div>
                </div>
                <div class="forecast-temps">
                    <span class="forecast-high">${max}°</span>
                    <span class="forecast-low">${min}°</span>
                </div>
            </div>
        `;
    }).join('');
}

function updateAirQuality(data) {
    if (!data || !data.list || !data.list[0]) {
        DOM.aqiValue.textContent = '--';
        DOM.aqiLabel.textContent = 'N/A';
        DOM.pm25.textContent = '--';
        DOM.pm10.textContent = '--';
        DOM.o3.textContent = '--';
        DOM.no2.textContent = '--';
        return;
    }
    
    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;
    
    const aqiLabels = ['', 'Baik', 'Sedang', 'Moderat', 'Buruk', 'Sangat Buruk'];
    const aqiColors = ['', '#4ade80', '#facc15', '#f97316', '#ef4444', '#a855f7'];
    
    DOM.aqiValue.textContent = aqi;
    DOM.aqiLabel.textContent = aqiLabels[aqi] || '--';
    DOM.aqiValue.style.color = aqiColors[aqi] || 'var(--accent)';
    
    // Animate gauge
    const circumference = 2 * Math.PI * 52; // r = 52
    const progress = (aqi / 5) * circumference;
    DOM.aqiFill.style.strokeDashoffset = circumference - progress;
    DOM.aqiFill.style.stroke = aqiColors[aqi] || 'var(--accent)';
    
    DOM.pm25.textContent = components.pm2_5?.toFixed(1) || '--';
    DOM.pm10.textContent = components.pm10?.toFixed(1) || '--';
    DOM.o3.textContent = components.o3?.toFixed(1) || '--';
    DOM.no2.textContent = components.no2?.toFixed(1) || '--';
}

function updateUVIndex(data) {
    // OpenWeatherMap free tier doesn't include UV directly, estimate from clouds
    const clouds = data.clouds?.all || 0;
    const isDay = data.weather[0].icon.includes('d');
    
    let uv;
    if (!isDay) {
        uv = 0;
    } else {
        // Rough estimate based on cloud coverage and time
        uv = Math.max(0, Math.round((11 - (clouds / 10)) * 10) / 10);
        uv = Math.min(uv, 11);
    }
    
    const uvCategories = [
        { max: 2, label: 'Rendah', advice: 'Aman untuk beraktivitas di luar ruangan tanpa perlindungan khusus.' },
        { max: 5, label: 'Sedang', advice: 'Gunakan tabir surya dan topi saat berada di luar ruangan.' },
        { max: 7, label: 'Tinggi', advice: 'Hindari paparan matahari langsung antara jam 10-16. Gunakan tabir surya SPF 30+.' },
        { max: 10, label: 'Sangat Tinggi', advice: 'Sangat disarankan untuk tetap di dalam ruangan. Jika keluar, gunakan perlindungan penuh.' },
        { max: 15, label: 'Ekstrem', advice: 'Berbahaya! Hindari berada di luar ruangan. Risiko luka bakar dalam hitungan menit.' }
    ];
    
    const category = uvCategories.find(c => uv <= c.max) || uvCategories[uvCategories.length - 1];
    
    DOM.uvValue.textContent = uv.toFixed(1);
    DOM.uvLabel.textContent = category.label;
    DOM.uvAdvice.textContent = category.advice;
    DOM.uvIndicator.style.left = `${Math.min((uv / 11) * 100, 100)}%`;
}

function updateMap(lat, lon) {
    DOM.lat.textContent = lat.toFixed(4);
    DOM.lon.textContent = lon.toFixed(4);
}

// ============================================
// TEMPERATURE CHART (Canvas-based)
// ============================================
function drawTemperatureChart(data) {
    const canvas = DOM.tempChart;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size with pixel ratio for sharpness
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    const padding = { top: 30, right: 20, bottom: 40, left: 45 };
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Prepare data
    const points = data.list.slice(0, 16).map(item => ({
        temp: Math.round(item.main.temp),
        time: new Date(item.dt * 1000),
        icon: item.weather[0].icon
    }));
    
    const temps = points.map(p => p.temp);
    const minTemp = Math.min(...temps) - 2;
    const maxTemp = Math.max(...temps) + 2;
    const tempRange = maxTemp - minTemp || 1;
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartHeight / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        
        // Y-axis labels
        const tempLabel = Math.round(maxTemp - (tempRange / gridLines) * i);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '11px "Space Grotesk", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(tempLabel + '°', padding.left - 10, y + 4);
    }
    
    // Calculate points
    const chartPoints = points.map((p, i) => ({
        x: padding.left + (chartWidth / (points.length - 1)) * i,
        y: padding.top + chartHeight - ((p.temp - minTemp) / tempRange) * chartHeight,
        temp: p.temp,
        time: p.time
    }));
    
    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(0, 229, 195, 0.15)');
    gradient.addColorStop(1, 'rgba(0, 229, 195, 0)');
    
    ctx.beginPath();
    ctx.moveTo(chartPoints[0].x, height - padding.bottom);
    
    // Use bezier curves for smooth line
    for (let i = 0; i < chartPoints.length; i++) {
        if (i === 0) {
            ctx.lineTo(chartPoints[i].x, chartPoints[i].y);
        } else {
            const prevPoint = chartPoints[i - 1];
            const cpx = (prevPoint.x + chartPoints[i].x) / 2;
            ctx.bezierCurveTo(cpx, prevPoint.y, cpx, chartPoints[i].y, chartPoints[i].x, chartPoints[i].y);
        }
    }
    
    ctx.lineTo(chartPoints[chartPoints.length - 1].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    for (let i = 0; i < chartPoints.length; i++) {
        if (i === 0) {
            ctx.moveTo(chartPoints[i].x, chartPoints[i].y);
        } else {
            const prevPoint = chartPoints[i - 1];
            const cpx = (prevPoint.x + chartPoints[i].x) / 2;
            ctx.bezierCurveTo(cpx, prevPoint.y, cpx, chartPoints[i].y, chartPoints[i].x, chartPoints[i].y);
        }
    }
    
    const lineGradient = ctx.createLinearGradient(padding.left, 0, width - padding.right, 0);
    lineGradient.addColorStop(0, '#00e5c3');
    lineGradient.addColorStop(1, '#7c5dfa');
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // Draw points
    chartPoints.forEach((point, i) => {
        // Glow
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 229, 195, 0.15)';
        ctx.fill();
        
        // Point
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#00e5c3';
        ctx.fill();
        
        // X-axis labels (every other)
        if (i % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = '10px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(formatHour(point.time), point.x, height - padding.bottom + 20);
        }
        
        // Temp labels on top of points (every other)
        if (i % 3 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '600 11px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(point.temp + '°', point.x, point.y - 12);
        }
    });
}

// ============================================
// WEATHER ANIMATION (Canvas)
// ============================================
function drawWeatherAnimation(iconCode) {
    const canvas = DOM.weatherAnimation;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    // Cancel any existing animation
    if (canvas._animFrame) cancelAnimationFrame(canvas._animFrame);
    
    let frame = 0;
    
    function animate() {
        ctx.clearRect(0, 0, w, h);
        frame++;
        
        const centerX = w / 2;
        const centerY = h / 2;
        
        if (iconCode.startsWith('01')) {
            // Sun
            drawSun(ctx, centerX, centerY, 35, frame);
        } else if (iconCode.startsWith('02')) {
            // Sun + Cloud
            drawSun(ctx, centerX - 15, centerY - 15, 22, frame);
            drawCloud(ctx, centerX + 10, centerY + 10, 30, 0.9);
        } else if (iconCode.startsWith('03') || iconCode.startsWith('04')) {
            // Clouds
            drawCloud(ctx, centerX - 10, centerY - 5, 35, 0.8);
            drawCloud(ctx, centerX + 15, centerY + 10, 28, 0.5);
        } else if (iconCode.startsWith('09') || iconCode.startsWith('10')) {
            // Rain
            drawCloud(ctx, centerX, centerY - 15, 35, 0.7);
            drawRain(ctx, centerX, centerY + 20, frame);
        } else if (iconCode.startsWith('11')) {
            // Thunderstorm
            drawCloud(ctx, centerX, centerY - 15, 35, 0.6);
            drawLightning(ctx, centerX, centerY + 5, frame);
            drawRain(ctx, centerX, centerY + 20, frame);
        } else if (iconCode.startsWith('13')) {
            // Snow
            drawCloud(ctx, centerX, centerY - 15, 35, 0.7);
            drawSnow(ctx, centerX, centerY + 20, frame);
        } else if (iconCode.startsWith('50')) {
            // Fog
            drawFog(ctx, centerX, centerY, frame);
        } else {
            // Default moon
            drawMoon(ctx, centerX, centerY, 30, frame);
        }
        
        canvas._animFrame = requestAnimationFrame(animate);
    }
    
    animate();
}

function drawSun(ctx, x, y, r, frame) {
    const pulse = Math.sin(frame * 0.03) * 3;
    
    // Outer glow
    const glow = ctx.createRadialGradient(x, y, r, x, y, r + 20 + pulse);
    glow.addColorStop(0, 'rgba(250, 204, 21, 0.2)');
    glow.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.beginPath();
    ctx.arc(x, y, r + 20 + pulse, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
    
    // Rays
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(frame * 0.005);
    for (let i = 0; i < 8; i++) {
        ctx.save();
        ctx.rotate((Math.PI * 2 / 8) * i);
        ctx.beginPath();
        ctx.moveTo(0, -(r + 5));
        ctx.lineTo(-3, -(r + 15 + pulse));
        ctx.lineTo(3, -(r + 15 + pulse));
        ctx.closePath();
        ctx.fillStyle = 'rgba(250, 204, 21, 0.6)';
        ctx.fill();
        ctx.restore();
    }
    ctx.restore();
    
    // Sun body
    const sunGrad = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, r);
    sunGrad.addColorStop(0, '#fde047');
    sunGrad.addColorStop(1, '#f59e0b');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();
}

function drawMoon(ctx, x, y, r, frame) {
    const glow = ctx.createRadialGradient(x, y, r - 5, x, y, r + 15);
    glow.addColorStop(0, 'rgba(226, 232, 240, 0.15)');
    glow.addColorStop(1, 'rgba(226, 232, 240, 0)');
    ctx.beginPath();
    ctx.arc(x, y, r + 15, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
    
    const moonGrad = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, r);
    moonGrad.addColorStop(0, '#e2e8f0');
    moonGrad.addColorStop(1, '#94a3b8');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = moonGrad;
    ctx.fill();
    
    // Crescent shadow
    ctx.beginPath();
    ctx.arc(x + 10, y - 5, r - 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(7, 11, 20, 0.6)';
    ctx.fill();
    
    // Stars
    for (let i = 0; i < 5; i++) {
        const sx = x - 40 + Math.sin(i * 1.5 + frame * 0.02) * 3 + i * 18;
        const sy = y - 30 + Math.cos(i * 2.1 + frame * 0.015) * 3 + (i % 2) * 25;
        const ss = 1 + Math.sin(frame * 0.05 + i) * 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, ss, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(frame * 0.05 + i) * 0.2})`;
        ctx.fill();
    }
}

function drawCloud(ctx, x, y, size, opacity) {
    ctx.globalAlpha = opacity;
    const grad = ctx.createLinearGradient(x - size, y, x + size, y);
    grad.addColorStop(0, '#94a3b8');
    grad.addColorStop(1, '#64748b');
    ctx.fillStyle = grad;
    
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x - size * 0.4, y + size * 0.1, size * 0.35, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y + size * 0.1, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x - size * 0.15, y + size * 0.15, size * 0.35, 0, Math.PI * 2);
    ctx.arc(x + size * 0.15, y + size * 0.2, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

function drawRain(ctx, x, y, frame) {
    for (let i = 0; i < 6; i++) {
        const rx = x - 20 + i * 8;
        const ry = y + ((frame * 2 + i * 15) % 30);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 2, ry + 8);
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
}

function drawSnow(ctx, x, y, frame) {
    for (let i = 0; i < 6; i++) {
        const sx = x - 20 + i * 8 + Math.sin(frame * 0.03 + i) * 5;
        const sy = y + ((frame + i * 12) % 25);
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
    }
}

function drawLightning(ctx, x, y, frame) {
    if (frame % 60 < 5) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5, y + 12);
        ctx.lineTo(x + 2, y + 12);
        ctx.lineTo(x - 3, y + 25);
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Flash
        ctx.fillStyle = 'rgba(253, 224, 71, 0.05)';
        ctx.fillRect(0, 0, 140, 140);
    }
}

function drawFog(ctx, x, y, frame) {
    for (let i = 0; i < 4; i++) {
        const fy = y - 15 + i * 12;
        const offset = Math.sin(frame * 0.02 + i) * 10;
        ctx.beginPath();
        ctx.moveTo(x - 35 + offset, fy);
        ctx.lineTo(x + 35 + offset, fy);
        ctx.strokeStyle = `rgba(148, 163, 184, ${0.3 - i * 0.05})`;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
}

// ============================================
// BACKGROUND PARTICLES (subtle)
// ============================================
function initBgParticles() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    const particles = [];
    const count = Math.min(40, Math.floor((window.innerWidth * window.innerHeight) / 25000));
    
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5,
            speedX: (Math.random() - 0.5) * 0.2,
            speedY: (Math.random() - 0.5) * 0.2,
            opacity: Math.random() * 0.3 + 0.1
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 229, 195, ${p.opacity})`;
            ctx.fill();
        });
        
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 229, 195, ${(1 - dist / 120) * 0.08})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatTime(date) {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatHour(date) {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDay(date) {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Hari Ini';
    if (date.toDateString() === tomorrow.toDateString()) return 'Besok';
    return days[date.getDay()] + ', ' + date.getDate() + '/' + (date.getMonth() + 1);
}

function getCountryName(code) {
    const countries = {
        'ID': 'Indonesia', 'JP': 'Jepang', 'US': 'Amerika Serikat',
        'GB': 'Inggris', 'SG': 'Singapura', 'MY': 'Malaysia',
        'AU': 'Australia', 'DE': 'Jerman', 'FR': 'Prancis',
        'KR': 'Korea Selatan', 'CN': 'Tiongkok', 'TH': 'Thailand',
        'IN': 'India', 'BR': 'Brasil', 'CA': 'Kanada',
        'IT': 'Italia', 'ES': 'Spanyol', 'NL': 'Belanda',
        'TR': 'Turki', 'SA': 'Arab Saudi', 'AE': 'Uni Emirat Arab',
        'PH': 'Filipina', 'VN': 'Vietnam'
    };
    return countries[code] || code;
}

function getMostFrequent(arr) {
    const count = {};
    let maxCount = 0;
    let maxItem = arr[0];
    arr.forEach(item => {
        count[item] = (count[item] || 0) + 1;
        if (count[item] > maxCount) {
            maxCount = count[item];
            maxItem = item;
        }
    });
    return maxItem;
}

// Clock
function updateClock() {
    const now = new Date();
    DOM.currentTime.textContent = formatTime(now);
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
let searchTimeout;

DOM.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        DOM.searchSuggestions.classList.remove('active');
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        try {
            const cities = await searchCities(query);
            if (cities.length > 0) {
                DOM.searchSuggestions.innerHTML = cities.map(city => `
                    <div class="suggestion-item" data-city="${city.name}" data-lat="${city.lat}" data-lon="${city.lon}">
                        <i class="ph ph-map-pin"></i>
                        <span>${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}</span>
                    </div>
                `).join('');
                DOM.searchSuggestions.classList.add('active');
            } else {
                DOM.searchSuggestions.classList.remove('active');
            }
        } catch (err) {
            console.error('Search error:', err);
        }
    }, 300);
});

DOM.searchSuggestions.addEventListener('click', (e) => {
    const item = e.target.closest('.suggestion-item');
    if (item) {
        const city = item.dataset.city;
        DOM.searchInput.value = city;
        DOM.searchSuggestions.classList.remove('active');
        loadWeather(city);
    }
});

DOM.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const city = DOM.searchInput.value.trim();
        if (city) {
            DOM.searchSuggestions.classList.remove('active');
            loadWeather(city);
        }
    }
});

DOM.searchBtn.addEventListener('click', () => {
    const city = DOM.searchInput.value.trim();
    if (city) {
        DOM.searchSuggestions.classList.remove('active');
        loadWeather(city);
    }
});

// Close suggestions on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        DOM.searchSuggestions.classList.remove('active');
    }
});

// ============================================
// GEOLOCATION
// ============================================
DOM.geoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('Geolocation tidak didukung di browser Anda.');
        return;
    }
    
    DOM.geoBtn.style.color = 'var(--accent)';
    DOM.geoBtn.style.borderColor = 'var(--accent)';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            loadWeatherByCoords(latitude, longitude);
        },
        (error) => {
            console.error('Geolocation error:', error);
            DOM.geoBtn.style.color = '';
            DOM.geoBtn.style.borderColor = '';
            
            let msg = 'Gagal mendapatkan lokasi Anda.';
            if (error.code === 1) msg = 'Akses lokasi ditolak. Silakan izinkan akses lokasi di pengaturan browser.';
            alert(msg);
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
});

// ============================================
// UNIT TOGGLE
// ============================================
DOM.unitToggle.addEventListener('click', () => {
    state.unit = state.unit === 'metric' ? 'imperial' : 'metric';
    DOM.unitToggle.querySelector('.unit-text').textContent = state.unit === 'metric' ? '°C' : '°F';
    
    if (state.currentCity) {
        loadWeather(state.currentCity);
    }
});

// ============================================
// QUICK CITIES
// ============================================
document.querySelectorAll('.quick-city').forEach(btn => {
    btn.addEventListener('click', () => {
        const city = btn.dataset.city;
        DOM.searchInput.value = city;
        loadWeather(city);
    });
});

// ============================================
// RETRY BUTTON
// ============================================
DOM.retryBtn.addEventListener('click', () => {
    if (state.currentCity) {
        loadWeather(state.currentCity);
    } else {
        showState('welcome');
    }
});

// ============================================
// RESPONSIVE CHART REDRAW
// ============================================
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (state.forecastData) {
            drawTemperatureChart(state.forecastData);
        }
    }, 250);
});

// ============================================
// INITIALIZE APP
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initBgParticles();
    updateClock();
    setInterval(updateClock, 1000);
    showState('welcome');
});
