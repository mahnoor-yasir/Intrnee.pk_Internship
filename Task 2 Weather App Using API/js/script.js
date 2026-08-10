/* ========================================
   WEATHER DASHBOARD — Complete JavaScript
   ======================================== */

(function() {
    'use strict';

    // -------- Config --------
    const CONFIG = window.WEATHER_CONFIG || {};
    const API_KEY = CONFIG.API_KEY || '';
    const API_BASE = CONFIG.API_BASE || 'https://api.openweathermap.org/data/2.5';

    // -------- DOM Cache --------
    const $ = (id) => document.getElementById(id);
    const el = {
        html: document.documentElement,
        form: $('searchForm'),
        input: $('cityInput'),
        clearBtn: $('clearBtn'),
        searchBtn: $('searchBtn'),
        geoBtn: $('geoBtn'),
        emptyGeoBtn: $('emptyGeoBtn'),
        emptyFocusBtn: $('emptyFocusBtn'),
        themeToggle: $('themeToggle'),
        errorBox: $('errorBox'),
        errorTitle: $('errorTitle'),
        errorText: $('errorText'),
        errorClose: $('errorClose'),
        empty: $('emptyState'),
        skeleton: $('skeleton'),
        results: $('results'),
        cityName: $('cityName'),
        datetime: $('datetime'),
        weatherIcon: $('weatherIcon'),
        temperature: $('temperature'),
        tempUnit: $('tempUnit'),
        condition: $('condition'),
        description: $('description'),
        feelsLike: $('feelsLike'),
        summary: $('summary'),
        advisories: $('advisories'),
        details: $('details'),
        hourlyList: $('hourlyList'),
        dailyList: $('dailyList'),
        favList: $('favList'),
        favEmpty: $('favEmpty'),
        recentList: $('recentList'),
        recentEmpty: $('recentEmpty'),
        clearFavs: $('clearFavs'),
        clearRecents: $('clearRecents'),
        favBtn: $('favBtn'),
        toast: $('toast'),
        weatherBg: $('weatherBg'),
    };

    // -------- Storage --------
    const STORE = {
        theme: 'weather.theme',
        unit: 'weather.unit',
        recents: 'weather.recents',
        favs: 'weather.favourites',
    };
    const MAX_RECENTS = 8;

    function readList(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed.filter(v => typeof v === 'string' && v.trim()) : [];
        } catch { return []; }
    }
    function writeList(key, list) {
        try { localStorage.setItem(key, JSON.stringify(list)); } catch {}
    }
    function readSetting(key, fallback) {
        try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
    }
    function writeSetting(key, value) {
        try { localStorage.setItem(key, value); } catch {}
    }

    // -------- State --------
    const state = {
        unit: readSetting(STORE.unit, 'metric'),
        theme: readSetting(STORE.theme, null),
        current: null,
        forecast: null,
        busy: false,
    };

    // -------- Helpers --------
    function toDisplayTemp(c) {
        return state.unit === 'imperial' ? c * 9/5 + 32 : c;
    }
    function tempText(c) {
        return Math.round(toDisplayTemp(c));
    }
    function unitSymbol() {
        return state.unit === 'imperial' ? '°F' : '°C';
    }
    function windText(ms) {
        if (typeof ms !== 'number') return '—';
        return state.unit === 'imperial' 
            ? (ms * 2.237).toFixed(1) + ' mph'
            : (ms * 3.6).toFixed(1) + ' km/h';
    }
    function visibilityText(m) {
        if (typeof m !== 'number') return '—';
        return state.unit === 'imperial'
            ? (m / 1609).toFixed(1) + ' mi'
            : m >= 1000 ? (m/1000).toFixed(1) + ' km' : m + ' m';
    }
    function titleCase(s) {
        return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    }
    function escapeHTML(s) {
        return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
    function getWeatherIcon(icon) {
        const map = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌧️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        return map[icon] || '🌤️';
    }
    function getWeatherBg(condition) {
        const map = {
            'clear': 'linear-gradient(145deg, #87CEEB, #e8f0fe)',
            'clouds': 'linear-gradient(145deg, #b0c4de, #d5dbe0)',
            'rain': 'linear-gradient(145deg, #4a6fa5, #2c3e50)',
            'thunderstorm': 'linear-gradient(145deg, #2c3e50, #1a1a2e)',
            'snow': 'linear-gradient(145deg, #e8f0fe, #ffffff)',
            'mist': 'linear-gradient(145deg, #bdc3c7, #95a5a6)',
        };
        return map[condition] || 'linear-gradient(145deg, var(--bg), var(--surface))';
    }

    // -------- API Layer --------
    class WeatherError extends Error {
        constructor(title, message) { super(message); this.title = title; }
    }

    async function apiGet(path, params) {
        const url = new URL(API_BASE + path);
        Object.keys(params).forEach(k => url.searchParams.set(k, params[k]));
        url.searchParams.set('appid', API_KEY);
        url.searchParams.set('units', 'metric');

        let res;
        try { res = await fetch(url.toString()); } 
        catch { throw new WeatherError('Network Error', 'Please check your internet connection.'); }

        if (res.status === 404) throw new WeatherError('City Not Found', 'Please check the spelling and try again.');
        if (res.status === 401) throw new WeatherError('Invalid API Key', 'Please check your API key in config.js.');
        if (res.status === 429) throw new WeatherError('Too Many Requests', 'Please wait a moment and try again.');
        if (!res.ok) throw new WeatherError('Service Error', 'Something went wrong. Please try again.');

        let data;
        try { data = await res.json(); } 
        catch { throw new WeatherError('Invalid Response', 'Could not read weather data.'); }
        return data;
    }

    const api = {
        currentByCity: (city) => apiGet('/weather', { q: city }),
        currentByCoords: (lat, lon) => apiGet('/weather', { lat, lon }),
        forecastByCoords: (lat, lon) => apiGet('/forecast', { lat, lon }),
    };

    // -------- Render Functions --------
    function renderDetails(data) {
        const wind = data.wind || {};
        const sys = data.sys || {};
        const tz = data.timezone || 0;
        const sunrise = sys.sunrise ? new Date((sys.sunrise + tz) * 1000) : null;
        const sunset = sys.sunset ? new Date((sys.sunset + tz) * 1000) : null;

        const details = [
            { label: 'Humidity', value: data.main.humidity + '%', sub: data.main.humidity >= 70 ? 'Humid' : 'Comfortable' },
            { label: 'Wind', value: windText(wind.speed), sub: wind.deg ? Math.round(wind.deg) + '°' : '' },
            { label: 'Pressure', value: data.main.pressure + ' hPa', sub: data.main.pressure > 1013 ? 'High' : 'Low' },
            { label: 'Visibility', value: visibilityText(data.visibility), sub: data.visibility >= 10000 ? 'Clear' : 'Reduced' },
        ];
        if (sunrise) details.push({ label: 'Sunrise', value: sunrise.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'}), sub: 'Local time' });
        if (sunset) details.push({ label: 'Sunset', value: sunset.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'}), sub: 'Local time' });

        el.details.innerHTML = details.map(d => `
            <div class="detail-card">
                <div class="label">${d.label}</div>
                <div class="value">${d.value}</div>
                <div class="sub">${d.sub}</div>
            </div>
        `).join('');
    }

    function renderCurrent(data) {
        const w = data.weather[0] || {};
        const tz = data.timezone || 0;
        const now = new Date((Math.floor(Date.now()/1000) + tz) * 1000);
        const icon = getWeatherIcon(w.icon);

        el.cityName.textContent = data.name + (data.sys?.country ? ', ' + data.sys.country : '');
        el.datetime.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) + 
            ' · ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        el.weatherIcon.textContent = icon;
        el.temperature.textContent = tempText(data.main.temp);
        el.tempUnit.textContent = unitSymbol();
        el.condition.textContent = titleCase(w.main);
        el.description.textContent = titleCase(w.description);
        el.feelsLike.textContent = tempText(data.main.feels_like) + unitSymbol();

        // Summary
        const tempWord = data.main.temp >= 30 ? 'warm' : data.main.temp >= 15 ? 'mild' : data.main.temp >= 5 ? 'cool' : 'cold';
        el.summary.textContent = `Expect ${w.description} with ${tempWord} temperatures around ${tempText(data.main.temp)}${unitSymbol().slice(1)}.`;

        // Advisories
        const adv = [];
        if (data.main.temp >= 35) adv.push('🔥 High heat — stay hydrated');
        if (data.main.temp <= 0) adv.push('❄️ Freezing temperatures — dress warm');
        if (data.main.humidity >= 85) adv.push('💧 Very humid — may feel warmer');
        if ((data.wind?.speed || 0) >= 12) adv.push('💨 Strong winds — secure outdoor items');
        if (w.id >= 200 && w.id < 300) adv.push('⚡ Thunderstorms in the area');
        if (w.id >= 500 && w.id < 600) adv.push('🌧️ Rain expected — carry an umbrella');
        el.advisories.innerHTML = adv.map(a => `<li>${a}</li>`).join('');

        renderDetails(data);
        updateFavButton();
        updateBackground(w.main.toLowerCase());
    }

    function renderHourly(forecast) {
        if (!forecast?.list?.length) {
            el.hourlyList.innerHTML = '<p class="empty-msg">Hourly data unavailable</p>';
            return;
        }
        const tz = state.current?.timezone || 0;
        const slots = forecast.list.slice(0, 8);
        el.hourlyList.innerHTML = slots.map(s => {
            const d = new Date((s.dt + tz) * 1000);
            return `
                <div class="hourly-item">
                    <div class="time">${d.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'})}</div>
                    <div class="icon">${getWeatherIcon(s.weather[0]?.icon)}</div>
                    <div class="temp">${tempText(s.main.temp)}°</div>
                    <div class="cond">${titleCase(s.weather[0]?.main || '')}</div>
                </div>
            `;
        }).join('');
    }

    function renderDaily(forecast) {
        if (!forecast?.list?.length) {
            el.dailyList.innerHTML = '<p class="empty-msg">Forecast unavailable</p>';
            return;
        }
        const tz = state.current?.timezone || 0;
        const buckets = {};
        forecast.list.forEach(s => {
            const d = new Date((s.dt + tz) * 1000);
            const key = d.toDateString();
            if (!buckets[key]) buckets[key] = { date: d, min: Infinity, max: -Infinity, counts: {}, sample: s };
            const b = buckets[key];
            b.min = Math.min(b.min, s.main.temp);
            b.max = Math.max(b.max, s.main.temp);
            const id = s.weather[0]?.id || 800;
            b.counts[id] = (b.counts[id] || 0) + 1;
            if (d.getHours() >= 11 && d.getHours() <= 14) b.sample = s;
        });

        const days = Object.values(buckets).slice(0, 5);
        const today = new Date((Math.floor(Date.now()/1000) + tz) * 1000).toDateString();

        el.dailyList.innerHTML = days.map(b => {
            let topId = 800, topN = -1;
            Object.keys(b.counts).forEach(id => { if (b.counts[id] > topN) { topN = b.counts[id]; topId = Number(id); } });
            const label = b.date.toDateString() === today ? 'Today' : b.date.toLocaleDateString('en-US', { weekday: 'short' });
            const cond = b.sample.weather[0]?.description || '';
            return `
                <div class="daily-item">
                    <div>
                        <div class="day">${label}</div>
                        <div class="date">${b.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div class="icon">${getWeatherIcon(b.sample.weather[0]?.icon)}</div>
                    <div class="cond">${titleCase(cond)}</div>
                    <div class="temps">
                        ${tempText(b.max)}°
                        <span class="low">${tempText(b.min)}°</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderAll() {
        if (!state.current) return;
        renderCurrent(state.current);
        renderHourly(state.forecast);
        renderDaily(state.forecast);
    }

    // -------- Background --------
    function updateBackground(condition) {
        const bg = getWeatherBg(condition);
        el.weatherBg.style.background = bg;
    }

    // -------- Favorites & Recents --------
    function currentCityLabel() {
        if (!state.current) return '';
        return state.current.name + (state.current.sys?.country ? ', ' + state.current.sys.country : '');
    }

    function renderChips() {
        const recents = readList(STORE.recents);
        const favs = readList(STORE.favs);
        
        el.recentList.innerHTML = recents.map(c => `
            <li class="chip">
                <button data-city="${escapeHTML(c)}">${escapeHTML(c)}</button>
                <button class="remove" data-remove="${escapeHTML(c)}">✕</button>
            </li>
        `).join('');
        
        el.favList.innerHTML = favs.map(c => `
            <li class="chip">
                <button data-city="${escapeHTML(c)}">${escapeHTML(c)}</button>
                <button class="remove" data-remove="${escapeHTML(c)}">✕</button>
            </li>
        `).join('');
        
        el.recentEmpty.hidden = recents.length > 0;
        el.favEmpty.hidden = favs.length > 0;
        el.clearRecents.hidden = recents.length === 0;
        el.clearFavs.hidden = favs.length === 0;
    }

    function addRecent(name) {
        if (!name) return;
        const list = readList(STORE.recents).filter(c => c.toLowerCase() !== name.toLowerCase());
        list.unshift(name);
        writeList(STORE.recents, list.slice(0, MAX_RECENTS));
        renderChips();
    }

    function updateFavButton() {
        const name = currentCityLabel();
        const isFav = readList(STORE.favs).some(c => c.toLowerCase() === name.toLowerCase());
        el.favBtn.classList.toggle('active', isFav);
        el.favBtn.querySelector('.heart').textContent = isFav ? '♥' : '♡';
        el.favBtn.querySelector('.fav-label').textContent = isFav ? 'Saved' : 'Favorite';
    }

    // -------- UI Helpers --------
    function setLoading(on) {
        state.busy = on;
        el.searchBtn.disabled = on;
        el.searchBtn.classList.toggle('loading', on);
        if (on) {
            el.empty.hidden = true;
            el.results.hidden = true;
            el.skeleton.hidden = false;
        } else {
            el.skeleton.hidden = true;
        }
    }

    function showError(title, message) {
        el.errorTitle.textContent = title;
        el.errorText.textContent = message;
        el.errorBox.hidden = false;
        if (!state.current) el.empty.hidden = false;
    }

    function clearError() { el.errorBox.hidden = true; }

    let toastTimer = null;
    function toast(msg) {
        el.toast.textContent = msg;
        el.toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.toast.classList.remove('show'), 2500);
    }

    // -------- Main Logic --------
    async function loadWeather(fetcher, labelForHistory) {
        if (state.busy) return;
        setLoading(true);
        clearError();
        try {
            const current = await fetcher();
            if (!current.main || !current.weather) throw new WeatherError('Invalid Data', 'Incomplete weather data received.');
            state.current = current;
            const { lat, lon } = current.coord || {};
            state.forecast = await api.forecastByCoords(lat, lon).catch(() => null);
            
            renderAll();
            el.results.hidden = false;
            el.empty.hidden = true;
            addRecent(labelForHistory || currentCityLabel());
        } catch (err) {
            console.error('Weather Error:', err);
            if (err instanceof WeatherError) showError(err.title, err.message);
            else showError('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    function searchCity(rawName) {
        const city = rawName?.trim();
        if (!city) {
            showError('Enter a city', 'Please type a city name and try again.');
            el.input.focus();
            return;
        }
        loadWeather(() => api.currentByCity(city), null);
    }

    function useMyLocation() {
        clearError();
        if (!navigator.geolocation) {
            showError('Location Unavailable', 'Your browser does not support geolocation.');
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            pos => {
                setLoading(false);
                const { latitude, longitude } = pos.coords;
                loadWeather(() => api.currentByCoords(latitude.toFixed(4), longitude.toFixed(4)), null);
            },
            err => {
                setLoading(false);
                const msg = err.code === 1 ? 'Please allow location access.' :
                           err.code === 2 ? 'Could not determine your position.' :
                           'Location request timed out.';
                showError('Location Error', msg + ' Please search manually.');
            },
            { enableHighAccuracy: false, timeout: 10000 }
        );
    }

    function setUnit(unit) {
        if (state.unit === unit) return;
        state.unit = unit;
        writeSetting(STORE.unit, unit);
        document.querySelectorAll('.unit-btn').forEach(b => {
            const isActive = b.dataset.unit === unit;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-pressed', isActive);
        });
        renderAll();
    }

    function setTheme(theme) {
        state.theme = theme;
        el.html.setAttribute('data-theme', theme);
        writeSetting(STORE.theme, theme);
    }

    // -------- Events --------
    function wireEvents() {
        // Search
        el.form.addEventListener('submit', e => {
            e.preventDefault();
            searchCity(el.input.value);
        });

        el.input.addEventListener('input', () => {
            el.clearBtn.hidden = el.input.value.trim().length === 0;
        });
        el.clearBtn.addEventListener('click', () => {
            el.input.value = '';
            el.clearBtn.hidden = true;
            clearError();
            el.input.focus();
        });

        el.geoBtn.addEventListener('click', useMyLocation);
        el.emptyGeoBtn.addEventListener('click', useMyLocation);
        el.emptyFocusBtn.addEventListener('click', () => el.input.focus());
        el.errorClose.addEventListener('click', clearError);

        // Unit toggle
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.addEventListener('click', () => setUnit(btn.dataset.unit));
        });

        // Theme toggle
        el.themeToggle.addEventListener('click', () => {
            setTheme(state.theme === 'dark' ? 'light' : 'dark');
        });

        // Favorites
        el.favBtn.addEventListener('click', () => {
            const name = currentCityLabel();
            if (!name) return;
            const list = readList(STORE.favs);
            const exists = list.some(c => c.toLowerCase() === name.toLowerCase());
            const next = exists ? list.filter(c => c.toLowerCase() !== name.toLowerCase()) : [name, ...list];
            writeList(STORE.favs, next.slice(0, 12));
            renderChips();
            updateFavButton();
            toast(exists ? name + ' removed from favorites' : name + ' added to favorites');
        });

        // Chips delegation
        function chipHandler(listKey) {
            return function(e) {
                const remove = e.target.closest('[data-remove]');
                if (remove) {
                    const name = remove.dataset.remove;
                    writeList(listKey, readList(listKey).filter(c => c !== name));
                    renderChips();
                    updateFavButton();
                    return;
                }
                const cityBtn = e.target.closest('[data-city]');
                if (cityBtn) {
                    const name = cityBtn.dataset.city;
                    el.input.value = name;
                    el.clearBtn.hidden = false;
                    searchCity(name);
                }
            };
        }
        el.recentList.addEventListener('click', chipHandler(STORE.recents));
        el.favList.addEventListener('click', chipHandler(STORE.favs));

        el.clearRecents.addEventListener('click', () => {
            writeList(STORE.recents, []);
            renderChips();
            toast('Recent searches cleared');
        });
        el.clearFavs.addEventListener('click', () => {
            writeList(STORE.favs, []);
            renderChips();
            updateFavButton();
            toast('Favorites cleared');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', e => {
            if (e.key === '/' && document.activeElement !== el.input) {
                e.preventDefault();
                el.input.focus();
            }
            if (e.key === 'Escape' && document.activeElement === el.input) {
                el.input.blur();
            }
        });
    }

    // -------- Boot --------
    function boot() {
        // Theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(state.theme || (prefersDark ? 'dark' : 'light'));

        // Unit
        const unit = state.unit;
        document.querySelectorAll('.unit-btn').forEach(b => {
            const isActive = b.dataset.unit === unit;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-pressed', isActive);
        });

        renderChips();
        wireEvents();

        // Load last city
        const recents = readList(STORE.recents);
        const favs = readList(STORE.favs);
        const startCity = recents[0] || favs[0];
        if (startCity) {
            el.input.value = startCity;
            el.clearBtn.hidden = false;
            searchCity(startCity);
        }
    }

    document.addEventListener('DOMContentLoaded', boot);
})();
