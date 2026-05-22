// ═══════════════════════════════════════════
//  FINCAMARKET — script.js
//  Maneja: Auth (Cognito PKCE), tracking,
//  filtros, UI interacciones
// ═══════════════════════════════════════════

/* ─── API CONFIG ─────────────────────────── */
const API_BASE = "https://fg5vp93vp8.execute-api.us-east-2.amazonaws.com";

/* ─── COGNITO CONFIG ─────────────────────── */
const COGNITO_DOMAIN = "https://us-east-2mzugshofw.auth.us-east-2.amazoncognito.com";
const CLIENT_ID      = "2lbl587e02n721vnvtut0fmnq8";
const CLIENT_SECRET  = "12srkn4u0ss0o7td32mulpfsoouc7dtpk0pumepvqkjqs7eoka0v";
const REDIRECT_URI   = "https://d3cptxew4r31et.cloudfront.net";

/* ─── PKCE UTILS ─────────────────────────── */
function generateRandomString(length) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values  = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values).map(v => charset[v % charset.length]).join('');
}

async function sha256Base64URL(plain) {
    const data = new TextEncoder().encode(plain);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

async function redirectToLogin() {
    const codeVerifier  = generateRandomString(64);
    const codeChallenge = await sha256Base64URL(codeVerifier);

    localStorage.setItem("pkce_verifier", codeVerifier);

    const loginUrl =
        `${COGNITO_DOMAIN}/login` +
        `?client_id=${CLIENT_ID}` +
        `&response_type=code` +
        `&scope=openid+email` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&code_challenge=${codeChallenge}` +
        `&code_challenge_method=S256`;

    window.location.href = loginUrl;
}

async function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get("code");
    if (!code) return false;

    const codeVerifier = localStorage.getItem("pkce_verifier");

    try {
        const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type:    "authorization_code",
                client_id:     CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code:          code,
                redirect_uri:  REDIRECT_URI,
                code_verifier: codeVerifier
            })
        });

        const tokens = await response.json();

        if (tokens.id_token) {
            localStorage.setItem("idToken",      tokens.id_token);
            localStorage.setItem("accessToken",  tokens.access_token);
            localStorage.setItem("refreshToken", tokens.refresh_token);
            window.history.replaceState({}, document.title, "/");
            return true;
        }
    } catch (err) {
        console.error("Error intercambiando código:", err);
    }
    return false;
}

function parseJWT(token) {
    try {
        const base64Payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64Payload));
    } catch {
        return null;
    }
}

/* ─── SESSION INIT ───────────────────────── */
async function initSession() {
    const logged  = await handleCallback();
    const idToken = localStorage.getItem("idToken");

    if (!logged && !idToken) {
        // No hay sesión → redirigir a login
        await redirectToLogin();
        return;
    }

    // Hay token → parsear info del usuario
    const payload = parseJWT(idToken);
    if (payload) {
        updateUserUI(payload);
        trackEvent("page_view", { page: "home", user: payload.email });
    }
}

function updateUserUI(payload) {
    const name  = payload.name || payload.email?.split("@")[0] || "Usuario";
    const email = payload.email || "";
    const init  = name.charAt(0).toUpperCase();

    // Header avatar
    const userAvatar    = document.getElementById("userAvatar");
    const dropdownAvatar = document.getElementById("dropdownAvatar");
    const dropdownName   = document.getElementById("dropdownName");
    const dropdownEmail  = document.getElementById("dropdownEmail");

    if (userAvatar)    userAvatar.textContent    = init;
    if (dropdownAvatar) dropdownAvatar.textContent = init;
    if (dropdownName)  dropdownName.textContent   = name;
    if (dropdownEmail) dropdownEmail.textContent  = email;
}

/* ─── LOGOUT ─────────────────────────────── */
function logout() {
    localStorage.removeItem("idToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("pkce_verifier");

    const logoutUrl =
        `${COGNITO_DOMAIN}/logout` +
        `?client_id=${CLIENT_ID}` +
        `&logout_uri=${encodeURIComponent(REDIRECT_URI)}`;

    window.location.href = logoutUrl;
}

/* ─── FAVORITOS API ──────────────────────── */
function getUserEmail() {
    const token = localStorage.getItem("idToken");
    if (!token) return null;
    const payload = parseJWT(token);
    return payload?.email || null;
}

async function getFavoritos(email) {
    try {
        const res = await fetch(`${API_BASE}/favoritos?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch { return []; }
}

async function saveFavorito(email, propiedadId, propiedadNombre) {
    try {
        await fetch(`${API_BASE}/favoritos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, propiedad_id: propiedadId, propiedad_nombre: propiedadNombre })
        });
    } catch(e) { console.error("Error guardando favorito:", e); }
}

async function deleteFavorito(email, propiedadId) {
    try {
        await fetch(`${API_BASE}/favoritos`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, propiedad_id: propiedadId })
        });
    } catch(e) { console.error("Error eliminando favorito:", e); }
}

/* ─── MODAL FAVORITOS ────────────────────── */
async function abrirModalFavoritos() {
    const email = getUserEmail();
    if (!email) return;
    const favoritos = await getFavoritos(email);
    const modal = document.getElementById("modalFavoritos");
    const lista = document.getElementById("listaFavoritos");
    lista.innerHTML = favoritos.length === 0
        ? '<p style="color:var(--text-muted);text-align:center;padding:20px">No tienes favoritos guardados aún.</p>'
        : favoritos.map(f => `
            <div class="fav-item">
                <span class="fav-nombre">${f.propiedad_nombre || f.propiedad_id}</span>
                <button class="fav-eliminar" onclick="deleteFavorito('${email}','${f.propiedad_id}');this.closest('.fav-item').remove()">✕</button>
            </div>`).join("");
    modal.classList.add("open");
}

function cerrarModalFavoritos() {
    document.getElementById("modalFavoritos").classList.remove("open");
}

/* ─── MODAL PROPIEDAD ────────────────────── */
function abrirModalPropiedad(card) {
    const d     = card.dataset;
    const modal = document.getElementById("modalPropiedad");

    const img = document.getElementById("mpImg");
    img.src = d.image || "";
    img.alt = d.name  || "";

    document.getElementById("mpLocation").textContent = d.location || "";
    document.getElementById("mpName").textContent     = d.name     || "";
    document.getElementById("mpRating").textContent   = "★ " + (d.rating || "—") + "  (" + (d.reviews || "0") + " reseñas)";
    document.getElementById("mpDesc").textContent     = d.description || "";

    const priceEl = document.getElementById("mpPrice");
    if (d.priceNight && d.priceNight !== "" && d.priceNight !== "undefined") {
        priceEl.innerHTML = "<strong>COP " + Number(d.priceNight).toLocaleString("es-CO") + "</strong> <span>/ noche</span>";
    } else if (d.priceSale && d.priceSale !== "" && d.priceSale !== "undefined") {
        priceEl.innerHTML = "<strong>COP " + Number(d.priceSale).toLocaleString("es-CO") + "</strong>";
    } else {
        priceEl.innerHTML = "<strong>Consultar precio</strong>";
    }

    const amenidades = JSON.parse(d.amenities || "[]");
    const amenEl     = document.getElementById("mpAmenidades");
    amenEl.innerHTML = amenidades.length > 0
        ? amenidades.map(function(a) { return '<span class="mp-tag">' + a + '</span>'; }).join("")
        : '<span style="color:var(--text-muted);font-size:13px">Sin amenidades registradas</span>';

    modal.dataset.trackId  = d.track || "";
    modal.dataset.propName = d.name  || "";

    document.getElementById("mpFechaEntrada").value = "";
    document.getElementById("mpFechaSalida").value  = "";
    document.getElementById("mpHuespedes").value    = "";

    const hoy = new Date().toISOString().split("T")[0];
    document.getElementById("mpFechaEntrada").min = hoy;
    document.getElementById("mpFechaSalida").min  = hoy;

    modal.classList.add("open");
    trackEvent("property_modal_open", { property_id: d.track });
}

function cerrarModalPropiedad() {
    document.getElementById("modalPropiedad").classList.remove("open");
}

async function crearReserva() {
    const modal        = document.getElementById("modalPropiedad");
    const email        = getUserEmail();
    const propiedadId  = modal.dataset.trackId;
    const propNombre   = modal.dataset.propName;
    const fechaEntrada = document.getElementById("mpFechaEntrada").value;
    const fechaSalida  = document.getElementById("mpFechaSalida").value;
    const huespedes    = document.getElementById("mpHuespedes").value;
    const btnReservar  = document.getElementById("btnReservar");

    if (!fechaEntrada || !fechaSalida || !huespedes) {
        alert("Por favor completa todos los campos antes de reservar.");
        return;
    }

    if (fechaSalida <= fechaEntrada) {
        alert("La fecha de salida debe ser posterior a la fecha de entrada.");
        return;
    }

    btnReservar.disabled    = true;
    btnReservar.textContent = "Reservando...";

    try {
        const res = await fetch(API_BASE + "/reservas", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuario_email:    email,
                propiedad_id:     propiedadId,
                propiedad_nombre: propNombre,
                fecha_entrada:    fechaEntrada,
                fecha_salida:     fechaSalida,
                huespedes:        parseInt(huespedes)
            })
        });

        const data = await res.json();

        if (data.status === "ok") {
            cerrarModalPropiedad();
            mostrarToast("✅ ¡Reserva exitosa! Puedes verla en tu perfil → Mis reservas");
            trackEvent("reserva_creada", {
                property_id:   propiedadId,
                property_name: propNombre,
                fecha_entrada: fechaEntrada,
                fecha_salida:  fechaSalida,
                huespedes:     parseInt(huespedes),
            });
        } else {
            alert("Error al crear la reserva. Intenta de nuevo.");
        }
    } catch (e) {
        console.error("Error reserva:", e);
        alert("Error de conexión. Intenta de nuevo.");
    } finally {
        btnReservar.disabled    = false;
        btnReservar.textContent = "Reservar";
    }
}

/* ─── TOAST NOTIFICATION ─────────────────── */
function mostrarToast(mensaje) {
    const toast = document.getElementById("toastNotification");
    if (!toast) return;
    toast.textContent = mensaje;
    toast.classList.add("visible");
    setTimeout(function() { toast.classList.remove("visible"); }, 5000);
}

/* ─── MODAL RESERVAS ─────────────────────── */
async function abrirModalReservas() {
    const email = getUserEmail();
    if (!email) return;

    const modal = document.getElementById("modalReservas");
    const lista = document.getElementById("listaReservas");
    lista.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px">Cargando...</p>';
    modal.classList.add("open");

    try {
        const res    = await fetch(API_BASE + "/reservas?email=" + encodeURIComponent(email));
        const data   = await res.json();
        const reservas = data.data || [];

        if (reservas.length === 0) {
            lista.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px">No tienes reservas aún.</p>';
        } else {
            lista.innerHTML = reservas.map(function(r) {
                return '<div class="reserva-item">' +
                    '<div class="reserva-nombre">' + (r.propiedad_nombre || r.propiedad_id) + '</div>' +
                    '<div class="reserva-detalle">' +
                        '<span>📅 ' + r.fecha_entrada + ' → ' + r.fecha_salida + '</span>' +
                        '<span>👥 ' + r.huespedes + ' huéspedes</span>' +
                    '</div>' +
                '</div>';
            }).join("");
        }
    } catch(e) {
        lista.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px">Error cargando reservas.</p>';
    }
}

function cerrarModalReservas() {
    document.getElementById("modalReservas").classList.remove("open");
}

/* ─── TRACKING / ANALYTICS ───────────────── */
const _events = [];

function trackEvent(eventName, data = {}) {
    const event = {
        event:     eventName,
        timestamp: new Date().toISOString(),
        url:       window.location.href,
        ...data
    };

    _events.push(event);
    console.log("[TRACK]", event);

    // Enviar a Google Analytics 4
    if (typeof gtag !== "undefined") {
        gtag("event", eventName, {
            ...data,
            page_location: window.location.href,
        });
    }
}

function trackCardClick(propertyId) {
    trackEvent("property_click", { property_id: propertyId });
}

// Tracking automático para elementos con data-track
function initAutoTracking() {
    document.querySelectorAll("[data-track]").forEach(el => {
        el.addEventListener("click", () => {
            const trackId = el.getAttribute("data-track");
            trackEvent("element_click", { element: trackId });
        });
    });
}

/* ─── USER DROPDOWN ──────────────────────── */
function initUserMenu() {
    const userBtn      = document.getElementById("userBtn");
    const userDropdown = document.getElementById("userDropdown");
    if (!userBtn || !userDropdown) return;

    userBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("open");
        trackEvent("user_menu_open");
    });

    document.addEventListener("click", (e) => {
        if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove("open");
        }
    });
}

/* ─── SEARCH TABS ────────────────────────── */
function initSearchTabs() {
    const tabs = document.querySelectorAll(".search-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            trackEvent("search_tab_change", { tab: tab.dataset.tab });
        });
    });
}

/* ─── FILTER CHIPS ───────────────────────── */
function initFilterChips() {
    const chips = document.querySelectorAll(".chip");
    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            chips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");

            const filter = chip.dataset.filter;
            filterProperties(filter);
            trackEvent("filter_chip", { filter });
        });
    });
}

function filterProperties(type) {
    const cards = document.querySelectorAll(".prop-card");
    cards.forEach(card => {
        if (type === "all" || card.dataset.type === type) {
            card.style.display = "";
            card.style.animation = "heroFadeIn 0.35s ease both";
        } else {
            card.style.display = "none";
        }
    });
}

/* ─── ADVANCED FILTERS ───────────────────── */
let filterState = { rooms: 0, baths: 0 };

function toggleFilters() {
    const panel = document.getElementById("filterPanel");
    panel.classList.toggle("open");
    trackEvent("advanced_filters_toggle", { open: panel.classList.contains("open") });
}

function changeCount(type, delta) {
    filterState[type] = Math.max(0, filterState[type] + delta);
    const el = document.getElementById(type === "rooms" ? "roomsCount" : "bathsCount");
    if (el) el.textContent = filterState[type] === 0 ? "Cualquiera" : `+${filterState[type]}`;
    updateFilterCount();
}

function updateFilterCount() {
    const count   = document.getElementById("filterCount");
    const priceMin = document.getElementById("priceMin")?.value;
    const priceMax = document.getElementById("priceMax")?.value;
    const area     = document.getElementById("areaMin")?.value;
    const region   = document.getElementById("regionFilter")?.value;

    let n = 0;
    if (filterState.rooms > 0) n++;
    if (filterState.baths  > 0) n++;
    if (priceMin) n++;
    if (priceMax) n++;
    if (area)     n++;
    if (region)   n++;

    if (count) {
        count.style.display = n > 0 ? "inline" : "none";
        count.textContent   = n;
    }
}

function clearFilters() {
    filterState = { rooms: 0, baths: 0 };
    document.getElementById("roomsCount").textContent = "Cualquiera";
    document.getElementById("bathsCount").textContent = "Cualquiera";

    ["priceMin", "priceMax", "areaMin", "regionFilter"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    document.querySelectorAll(".amenity-checks input").forEach(cb => cb.checked = false);
    updateFilterCount();
    trackEvent("filters_cleared");
}

function applyFilters() {
    const priceMin = parseInt(document.getElementById("priceMin")?.value) || 0;
    const priceMax = parseInt(document.getElementById("priceMax")?.value) || Infinity;

    trackEvent("filters_applied", {
        rooms:    filterState.rooms,
        baths:    filterState.baths,
        priceMin,
        priceMax,
        region:   document.getElementById("regionFilter")?.value
    });

    updateFilterCount();
    document.getElementById("filterPanel")?.classList.remove("open");
    // Lógica de filtrado real se añade cuando las propiedades vengan de API
}

/* ─── SEARCH HANDLER ─────────────────────── */
function handleSearch() {
    const location = document.getElementById("locationInput")?.value;
    const date     = document.getElementById("dateInput")?.value;
    const guests   = document.getElementById("guestsInput")?.value;
    const activeTab = document.querySelector(".search-tab.active")?.dataset.tab;

    trackEvent("search_executed", {
        location,
        date,
        guests,
        type: activeTab
    });

    console.log("Búsqueda:", { location, date, guests, type: activeTab });
    
    // Aquí se integraría con la API para buscar propiedades
    // fetch('/api/properties/search', { method: 'POST', body: JSON.stringify(...) })
}

/* ─── LOAD MORE ──────────────────────────── */
let currentPage = 1;

function loadMore() {
    currentPage++;
    trackEvent("load_more", { page: currentPage });
    
    console.log("Cargando página:", currentPage);
    
    // Aquí se integraría con la API para cargar más propiedades
    // fetch(`/api/properties?page=${currentPage}`)
    //   .then(res => res.json())
    //   .then(properties => appendPropertiesToGrid(properties))
}

/* ─── HEADER SCROLL EFFECT ──────────────── */
function initHeaderScroll() {
    const header = document.getElementById("siteHeader");
    if (!header) return;

    let lastScroll = 0;
    
    window.addEventListener("scroll", () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
        
        lastScroll = currentScroll;
    });
}

/* ─── SET MINIMUM DATE FOR DATE INPUT ─────── */
function initDateInput() {
    const dateInput = document.getElementById("dateInput");
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
}

/* ─── FAVORITE BUTTON TOGGLE ─────────────── */
async function initFavoriteButtons() {
    const email = getUserEmail();
    if (!email) return;

    const favoritosActivos = await getFavoritos(email);
    const idsActivos = new Set(favoritosActivos.map(f => f.propiedad_id));

    document.querySelectorAll(".prop-fav").forEach(btn => {
        const card = btn.closest(".prop-card");
        const propId = card?.dataset.track;
        const propNombre = card?.querySelector(".prop-name")?.textContent || "";

        if (idsActivos.has(propId)) btn.classList.add("saved");

        btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const esFavorito = btn.classList.contains("saved");
            if (esFavorito) {
                await deleteFavorito(email, propId);
                btn.classList.remove("saved");
                trackEvent("favorito_eliminado", {
                    property_id:   propId,
                    property_name: propNombre,
                });
            } else {
                await saveFavorito(email, propId, propNombre);
                btn.classList.add("saved");
                trackEvent("favorito_guardado", {
                    property_id:   propId,
                    property_name: propNombre,
                });
            }
        });
    });
}

/* ─── PROPERTY CARD CLICK ────────────────── */
function initPropertyCardClicks() {
    document.querySelectorAll(".prop-card").forEach(card => {
        const propId       = card.dataset.track    || "";
        const propName     = card.dataset.name     || "";
        const propType     = card.dataset.type     || "";
        const propLocation = card.dataset.location || "";

        // Clic en la imagen específicamente
        const img = card.querySelector(".prop-card-img-wrap");
        if (img) {
            img.addEventListener("click", (e) => {
                if (e.target.closest(".prop-fav")) return;
                trackEvent("property_image_click", {
                    property_id:       propId,
                    property_name:     propName,
                    property_type:     propType,
                    property_location: propLocation,
                });
                abrirModalPropiedad(card);
            });
        }

        // Clic en botón "Ver propiedad"
        const cta = card.querySelector(".prop-cta");
        if (cta) {
            cta.addEventListener("click", (e) => {
                e.stopPropagation();
                trackEvent("property_cta_click", {
                    property_id:       propId,
                    property_name:     propName,
                    property_type:     propType,
                    property_location: propLocation,
                });
                abrirModalPropiedad(card);
            });
        }

        // Clic en cualquier otra zona de la card
        card.addEventListener("click", (e) => {
            if (e.target.closest(".prop-fav"))           return;
            if (e.target.closest(".prop-cta"))           return;
            if (e.target.closest(".prop-card-img-wrap")) return;
            trackEvent("property_card_click", {
                property_id:       propId,
                property_name:     propName,
                property_type:     propType,
                property_location: propLocation,
            });
            abrirModalPropiedad(card);
        });
    });
}

/* ─── REGION CARD CLICKS ─────────────────── */
function initRegionCardClicks() {
    document.querySelectorAll(".region-card").forEach(card => {
        card.addEventListener("click", () => {
            const region = card.dataset.track;
            trackEvent("region_card_click", { region });
            console.log("Navegando a región:", region);
            // window.location.href = `/region/${region}`;
        });
    });
}

/* ─── EXPERIENCE CARD CLICKS ─────────────── */
function initExperienceCardClicks() {
    document.querySelectorAll(".exp-card").forEach(card => {
        card.addEventListener("click", () => {
            const experience = card.dataset.track;
            trackEvent("experience_card_click", { experience });
            console.log("Navegando a experiencia:", experience);
            // window.location.href = `/experiences/${experience}`;
        });
    });
}

/* ─── PRICE INPUTS UPDATE FILTER COUNT ───── */
function initFilterInputListeners() {
    const filterInputs = ["priceMin", "priceMax", "areaMin", "regionFilter"];
    
    filterInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("change", updateFilterCount);
        }
    });
}

/* ─── INIT ON PAGE LOAD ──────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Inicializar sesión (Cognito)
    await initSession();
    
    // 2. Inicializar componentes UI
    initUserMenu();
    initSearchTabs();
    initFilterChips();
    initHeaderScroll();
    initDateInput();
    initFavoriteButtons();
    initPropertyCardClicks();
    initRegionCardClicks();
    initExperienceCardClicks();
    initFilterInputListeners();
    
    // 3. Inicializar tracking automático
    initAutoTracking();
    
    // 4. Track inicial
    trackEvent("page_loaded", { 
        page: window.location.pathname,
        referrer: document.referrer 
    });
    
    console.log("✓ FincaMarket inicializado correctamente");
});
