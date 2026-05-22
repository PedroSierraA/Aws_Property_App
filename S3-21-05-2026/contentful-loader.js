// ═══════════════════════════════════════════════════════════════
//  FINCAMARKET — contentful-loader.js
//
//  Qué hace:
//    1. Carga en paralelo: propiedades, siteConfig y regiones
//    2. Inyecta imágenes en hero, CTA y region cards
//    3. Muestra skeletons mientras carga las propiedades
//    4. Re-inicializa listeners de script.js
//    5. Falla silenciosamente por sección — si una falla, las otras continúan
//
//  No modifica: script.js, styles.css
// ═══════════════════════════════════════════════════════════════

(function () {

  // ── Config Contentful (Delivery API — solo lectura) ──────────
  const SPACE = "24kune07rf06";
  const TOKEN = "6GvHZsW5QsExV5S3Orou4pxEkAPRF-Xkofy5n8Gns8E";
  const BASE  =
    "https://cdn.contentful.com/spaces/" + SPACE +
    "/environments/master/entries" +
    "?access_token=" + TOKEN;

  // URLs de cada content type
  const PROPS_URL   = BASE + "&content_type=property&include=1&limit=100";
  const CONFIG_URL  = BASE + "&content_type=siteConfig&include=1&limit=1";
  const REGIONS_URL = BASE + "&content_type=region&include=1&limit=10";

  // ── SVG corazón — idéntico al index.html ────────────────────
  const SVG_HEART =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2">' +
    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06' +
    'a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06' +
    'a5.5 5.5 0 0 0 0-7.78z"/></svg>';

  // ── Skeleton card — misma estructura de .prop-card ───────────
  const SKELETON_CARD =
    '<article class="prop-card prop-card--skeleton">' +
      '<div class="prop-card-img-wrap skeleton-img"></div>' +
      '<div class="prop-card-body">' +
        '<div class="skeleton-line skeleton-line--short"></div>' +
        '<div class="skeleton-line skeleton-line--title"></div>' +
        '<div class="skeleton-line"></div>' +
        '<div class="skeleton-line skeleton-line--short"></div>' +
        '<div class="prop-card-footer" style="padding-top:16px;border-top:1px solid rgba(255,255,255,0.07)">' +
          '<div class="skeleton-line skeleton-line--price"></div>' +
        '</div>' +
      '</div>' +
    '</article>';

  // ── CSS del skeleton — se inyecta una sola vez ───────────────
  const SKELETON_CSS = `
    .prop-card--skeleton { pointer-events: none; cursor: default; }
    .prop-card--skeleton:hover {
      transform: none !important;
      box-shadow: none !important;
      border-color: rgba(255,255,255,0.07) !important;
    }
    .skeleton-img { height: 210px; }
    .skeleton-line {
      height: 13px; border-radius: 6px;
      margin-bottom: 10px; width: 100%;
    }
    .skeleton-line--short  { width: 45%; }
    .skeleton-line--title  { height: 20px; width: 80%; margin-bottom: 14px; }
    .skeleton-line--price  { width: 50%; height: 16px; }
    .skeleton-img, .skeleton-line {
      background: linear-gradient(
        90deg,
        var(--obsidian-4) 25%,
        var(--obsidian-5) 50%,
        var(--obsidian-4) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.6s infinite;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .contentful-error {
      grid-column: 1 / -1; text-align: center;
      padding: 64px 24px; color: var(--text-muted);
      font-size: 15px; line-height: 1.8;
    }
    .contentful-error strong {
      display: block; font-size: 18px;
      color: var(--text-secondary); margin-bottom: 8px;
    }
  `;

  // ── Inyectar / eliminar CSS de skeletons ─────────────────────
  function injectSkeletonCSS() {
    var s = document.createElement("style");
    s.id  = "skeleton-styles";
    s.textContent = SKELETON_CSS;
    document.head.appendChild(s);
  }
  function removeSkeletonCSS() {
    var s = document.getElementById("skeleton-styles");
    if (s) s.remove();
  }

  // ── Mapa assetId → URL completa ──────────────────────────────
  //    Las URLs de Contentful vienen con // → se añade "https:"
  function buildAssetMap(includes) {
    var map = {};
    if (!includes || !includes.Asset) return map;
    includes.Asset.forEach(function (asset) {
      var url = asset.fields.file.url;
      map[asset.sys.id] = url.startsWith("//") ? "https:" + url : url;
    });
    return map;
  }

  // ── Helpers de formato ───────────────────────────────────────
  function formatPrice(n)  { return n.toLocaleString("es-CO"); }
  function formatRating(r) { return Number.isInteger(r) ? r.toFixed(1) : String(r); }

  // ── HTML de una property card ────────────────────────────────
  function buildCard(fields, imageUrl) {
    var isVenta    = fields.listingType === "venta";
    var badgeClass = isVenta ? "prop-badge prop-badge--venta" : "prop-badge";
    var badgeText  = isVenta ? "Venta" : "Arriendo";

    var priceInner;
    if (fields.priceNight) {
      priceInner = "<strong>COP " + formatPrice(fields.priceNight) + "</strong><span>/ noche</span>";
    } else if (fields.priceSale) {
      priceInner = "<strong>COP " + formatPrice(fields.priceSale) + "</strong>";
    } else {
      priceInner = "<strong>—</strong>";
    }

    var amenitiesInner = (fields.amenities || [])
      .map(function (a) { return "<span>" + a + "</span>"; }).join("");

    return (
      '<article class="prop-card"' +
      ' data-type="'         + fields.type                                                    + '"' +
      ' data-track="'        + fields.trackId                                                 + '"' +
      ' data-image="'        + imageUrl                                                       + '"' +
      ' data-name="'         + fields.name                                                    + '"' +
      ' data-location="'     + fields.location                                                + '"' +
      ' data-description="'  + fields.description                                             + '"' +
      ' data-rating="'       + fields.rating                                                  + '"' +
      ' data-reviews="'      + fields.reviewCount                                             + '"' +
      ' data-price-night="'  + (fields.priceNight  || "")                                    + '"' +
      ' data-price-sale="'   + (fields.priceSale   || "")                                    + '"' +
      ' data-amenities="'    + JSON.stringify(fields.amenities || []).replace(/"/g, "&quot;") + '"' +
      ' data-listing-type="' + (fields.listingType || "")                                    + '">' +
        '<div class="prop-card-img-wrap">' +
          '<img src="' + imageUrl + '" alt="' + fields.name + '" loading="lazy">' +
          '<div class="' + badgeClass + '">' + badgeText + '</div>' +
          '<button class="prop-fav" aria-label="Guardar en favoritos">' + SVG_HEART + '</button>' +
          '<div class="prop-card-overlay">' +
            '<div class="prop-amenities">' + amenitiesInner + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="prop-card-body">' +
          '<div class="prop-card-top">' +
            '<div>' +
              '<p class="prop-location">' + fields.location + '</p>' +
              '<h3 class="prop-name">'    + fields.name     + '</h3>' +
            '</div>' +
            '<div class="prop-rating">' +
              '<span>★</span> ' + formatRating(fields.rating) +
              ' <span class="prop-reviews">(' + fields.reviewCount + ')</span>' +
            '</div>' +
          '</div>' +
          '<p class="prop-desc">' + fields.description + '</p>' +
          '<div class="prop-card-footer">' +
            '<div class="prop-price">' + priceInner + '</div>' +
            '<button class="prop-cta" onclick="abrirModalPropiedad(this.closest(\'.prop-card\'))">' +
              'Ver propiedad' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  // ── Cargar propiedades ───────────────────────────────────────
  async function loadProperties() {
    var grid = document.getElementById("propertiesGrid");
    if (!grid) return;

    injectSkeletonCSS();
    grid.innerHTML = Array(6).fill(SKELETON_CARD).join("");

    try {
      var res  = await fetch(PROPS_URL);
      if (!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();
      if (!data.items || data.items.length === 0) throw new Error("Sin items");

      var assetMap = buildAssetMap(data.includes);
      var html = data.items.map(function (item) {
        var fields  = item.fields;
        var assetId = fields.image && fields.image.sys ? fields.image.sys.id : null;
        return buildCard(fields, assetId ? (assetMap[assetId] || "") : "");
      }).join("");

      grid.innerHTML = html;
      removeSkeletonCSS();

      if (typeof initFavoriteButtons    === "function") initFavoriteButtons();
      if (typeof initPropertyCardClicks === "function") initPropertyCardClicks();
      if (typeof initAutoTracking       === "function") initAutoTracking();

      var activeChip = document.querySelector(".chip.active");
      if (activeChip && activeChip.dataset.filter !== "all") {
        if (typeof filterProperties === "function") filterProperties(activeChip.dataset.filter);
      }

      console.log("[ContentfulLoader] " + data.items.length + " propiedades cargadas.");
    } catch (err) {
      console.error("[ContentfulLoader] Propiedades — Error:", err.message);
      grid.innerHTML =
        '<div class="contentful-error">' +
          '<strong>No pudimos cargar las propiedades</strong>' +
          'Por favor recarga la página o intenta más tarde.' +
        '</div>';
    }
  }

  // ── Cargar siteConfig (hero + CTA) ───────────────────────────
  async function loadSiteConfig() {
    try {
      var res  = await fetch(CONFIG_URL);
      if (!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();
      if (!data.items || data.items.length === 0) throw new Error("Sin siteConfig");

      var fields   = data.items[0].fields;
      var assetMap = buildAssetMap(data.includes);

      // Hero background
      var heroImg = document.getElementById("heroImg");
      if (heroImg && fields.heroImage && fields.heroImage.sys) {
        var heroUrl = assetMap[fields.heroImage.sys.id];
        if (heroUrl) heroImg.src = heroUrl;
      }

      // CTA banner
      var ctaImg = document.getElementById("ctaImg");
      if (ctaImg && fields.ctaImage && fields.ctaImage.sys) {
        var ctaUrl = assetMap[fields.ctaImage.sys.id];
        if (ctaUrl) ctaImg.src = ctaUrl;
      }

      console.log("[ContentfulLoader] siteConfig cargado.");
    } catch (err) {
      console.error("[ContentfulLoader] siteConfig — Error:", err.message);
      // Fallback: las imágenes quedan vacías, el layout se mantiene
    }
  }

  // ── Cargar regiones ──────────────────────────────────────────
  async function loadRegions() {
    try {
      var res  = await fetch(REGIONS_URL);
      if (!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();
      if (!data.items || data.items.length === 0) throw new Error("Sin regiones");

      var assetMap = buildAssetMap(data.includes);

      data.items.forEach(function (item) {
        var fields = item.fields;
        // Busca el region-card por data-track — coincide con el slug de Contentful
        var card = document.querySelector('[data-track="' + fields.slug + '"]');
        if (!card) return;

        var img = card.querySelector("img");
        if (img && fields.image && fields.image.sys) {
          var url = assetMap[fields.image.sys.id];
          if (url) img.src = url;
        }

        // Actualizar conteo de propiedades
        var countEl = card.querySelector(".region-info p");
        if (countEl && fields.propertyCount) {
          countEl.textContent = fields.propertyCount + " propiedades";
        }
      });

      console.log("[ContentfulLoader] Regiones cargadas.");
    } catch (err) {
      console.error("[ContentfulLoader] Regiones — Error:", err.message);
      // Fallback: las imágenes de región quedan como estaban en el HTML
    }
  }

  // ── Carga principal — todo en paralelo ───────────────────────
  async function init() {
    await Promise.all([
      loadProperties(),
      loadSiteConfig(),
      loadRegions(),
    ]);
  }

  // ── Ejecutar cuando el DOM esté listo ────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
