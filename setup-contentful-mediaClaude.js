// ═══════════════════════════════════════════════════════════════
//  FINCAMARKET — setup-contentful-media.js  v2.0
//  Compatible con contentful-management v11+  (plain client API)
//
//  USO:
//    1. npm install contentful-management
//    2. node setup-contentful-media.js
//
//  Qué hace esta versión:
//    - Actualiza siteConfig (hero + CTA)
//    - Crea/actualiza 6 regiones (incluye Valle del Cauca y Caribe)
//    - Crea/actualiza 12 propiedades con fotos y datos coherentes con Colombia
// ═══════════════════════════════════════════════════════════════

require("dotenv").config();
const { createClient } = require("contentful-management");

// ── Credenciales (leídas de .env — ver .env.example) ─────────
const CMA_TOKEN = process.env.CONTENTFUL_CMA_TOKEN || "";
const SPACE_ID  = process.env.CONTENTFUL_SPACE_ID  || "";
const ENV_ID    = process.env.CONTENTFUL_ENV_ID    || "master";
const LOCALE    = process.env.CONTENTFUL_LOCALE    || "en-US";

// ── Imágenes de siteConfig ────────────────────────────────────
const SITE_CONFIG = {
  hero: {
    imageUrl:   "https://images.unsplash.com/photo-1572882602941-ba4fba8d3b1f?w=1800&q=80",
    imageTitle: "FincaMarket Hero Background",
    fileName:   "hero-background.jpg",
  },
  cta: {
    imageUrl:   "https://images.unsplash.com/photo-1760044280686-c5bf1edf3cbb?w=700&q=80",
    imageTitle: "FincaMarket CTA Banner",
    fileName:   "cta-banner.jpg",
  },
};

// ── Regiones ──────────────────────────────────────────────────
// Nota: Las 4 primeras actualizan las existentes.
// Valle del Cauca y Caribe son nuevas — debes agregar sus cards
// en index.html manualmente para que aparezcan en el sitio.
const REGIONS = [
  {
    name:          "Antioquia",
    slug:          "region-antioquia",
    propertyCount: 127,
    imageUrl:      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80",
    imageTitle:    "Antioquia Colombia — Guatapé",
    fileName:      "region-antioquia.jpg",
  },
  {
    name:          "Eje Cafetero",
    slug:          "region-cafetero",
    propertyCount: 89,
    imageUrl:      "https://images.unsplash.com/photo-1549888834-3ec93abae044?w=600&q=80",
    imageTitle:    "Eje Cafetero Colombia — Cafetales",
    fileName:      "region-cafetero.jpg",
  },
  {
    name:          "Santander",
    slug:          "region-santander",
    propertyCount: 54,
    imageUrl:      "https://images.unsplash.com/photo-1512654050348-57ef35b2001a?w=600&q=80",
    imageTitle:    "Santander Colombia — Cañón del Chicamocha",
    fileName:      "region-santander.jpg",
  },
  {
    name:          "Cundinamarca",
    slug:          "region-cundinamarca",
    propertyCount: 73,
    imageUrl:      "https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=600&q=80",
    imageTitle:    "Cundinamarca Colombia — Montañas andinas",
    fileName:      "region-cundinamarca.jpg",
  },
  {
    name:          "Valle del Cauca",
    slug:          "region-valle",
    propertyCount: 48,
    imageUrl:      "https://images.unsplash.com/photo-1599651317690-b0283c307261?w=600&q=80",
    imageTitle:    "Valle del Cauca Colombia — Haciendas",
    fileName:      "region-valle.jpg",
  },
  {
    name:          "Caribe Colombiano",
    slug:          "region-caribe",
    propertyCount: 62,
    imageUrl:      "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600&q=80",
    imageTitle:    "Caribe Colombiano — Playas y fincas",
    fileName:      "region-caribe.jpg",
  },
];

// ── Propiedades ───────────────────────────────────────────────
// Field IDs exactos del content type 'property' en Contentful:
//   name, slug, trackId, location, region, type, listingType,
//   image, amenities, description, priceNight, priceSale,
//   rating, reviewCount, featured
const PROPERTIES = [

  // ═══════ ANTIOQUIA ═══════

  {
    name:        "Finca La Esmeralda",
    slug:        "finca-la-esmeralda",
    trackId:     "finca-la-esmeralda",
    location:    "Guatapé, Antioquia",
    region:      "antioquia",
    type:        "finca",
    listingType: "arriendo",
    priceNight:  680000,
    amenities:   ["Piscina", "WiFi", "Zona BBQ", "Caballos", "Río/quebrada"],
    description: "Hermosa finca con vista panorámica al Embalse de Guatapé. Rodeada de naturaleza exuberante y a pocos minutos del famoso Peñol, ofrece el equilibrio perfecto entre aventura y descanso en el oriente antioqueño.",
    rating:      4.8,
    reviewCount: 47,
    featured:    true,
    imageUrl:    "https://images.unsplash.com/photo-1741287541128-50080b7cadc6?w=900&q=80",
    imageTitle:  "Finca La Esmeralda — Guatapé Antioquia",
    fileName:    "finca-la-esmeralda.jpg",
  },

  {
    name:        "Finca El Peñol",
    slug:        "finca-el-penol",
    trackId:     "finca-el-penol",
    location:    "El Peñol, Antioquia",
    region:      "antioquia",
    type:        "finca",
    listingType: "arriendo",
    priceNight:  520000,
    amenities:   ["Piscina", "WiFi", "Jacuzzi", "Zona BBQ"],
    description: "Finca campestre a orillas del embalse con vista directa al imponente Peñol de Guatapé. Ideal para grupos familiares que buscan contacto con la naturaleza, paseos en lancha y gastronomía antioqueña auténtica.",
    rating:      4.6,
    reviewCount: 33,
    featured:    false,
    imageUrl:    "https://images.unsplash.com/photo-1611148261486-4e315d904232?w=900&q=80",
    imageTitle:  "Finca El Peñol — Antioquia",
    fileName:    "finca-el-penol.jpg",
  },

  {
    name:        "Retiro de Montaña El Silencio",
    slug:        "retiro-el-silencio",
    trackId:     "retiro-el-silencio",
    location:    "Jardín, Antioquia",
    region:      "antioquia",
    type:        "retiro",
    listingType: "arriendo",
    priceNight:  390000,
    amenities:   ["WiFi", "Zona BBQ", "Río/quebrada", "Caballos"],
    description: "Refugio íntimo en las montañas del suroeste antioqueño, uno de los pueblos más bellos de Colombia. Rodeado de cafetales, quebradas cristalinas y senderos de extraordinaria belleza en Jardín.",
    rating:      4.9,
    reviewCount: 28,
    featured:    false,
    imageUrl:    "https://images.unsplash.com/photo-1568489711036-9c94a7d5aea6?w=900&q=80",
    imageTitle:  "Retiro El Silencio — Jardín Antioquia",
    fileName:    "retiro-el-silencio.jpg",
  },

  {
    name:        "Casa Campestre Los Helechos",
    slug:        "casa-los-helechos",
    trackId:     "casa-los-helechos",
    location:    "Santa Fe de Antioquia",
    region:      "antioquia",
    type:        "casa",
    listingType: "arriendo",
    priceNight:  450000,
    amenities:   ["Piscina", "WiFi", "Zona BBQ", "Jacuzzi"],
    description: "Casa campestre de estilo colonial en la Ciudad Madre de Antioquia. Calles empedradas, clima cálido y arquitectura colonial de tapia pisada rodean esta propiedad de encanto histórico único.",
    rating:      4.7,
    reviewCount: 52,
    featured:    false,
    imageUrl:    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80",
    imageTitle:  "Casa Los Helechos — Santa Fe de Antioquia",
    fileName:    "casa-los-helechos.jpg",
  },

  // ═══════ EJE CAFETERO ═══════

  {
    name:        "Retiro Cafetero El Origen",
    slug:        "retiro-cafetero-el-origen",
    trackId:     "retiro-cafetero-el-origen",
    location:    "Salento, Quindío",
    region:      "eje-cafetero",
    type:        "retiro",
    listingType: "arriendo",
    priceNight:  580000,
    amenities:   ["WiFi", "Zona BBQ", "Caballos", "Río/quebrada"],
    description: "Auténtico retiro en pleno corazón del Paisaje Cultural Cafetero, Patrimonio de la Humanidad. Rodeado de guaduales, palmas de cera y cultivos de café de especialidad a minutos del Valle del Cocora.",
    rating:      4.9,
    reviewCount: 89,
    featured:    true,
    imageUrl:    "https://images.unsplash.com/photo-1620292361418-f48e64590736?w=900&q=80",
    imageTitle:  "Retiro Cafetero El Origen — Salento Quindío",
    fileName:    "retiro-cafetero-el-origen.jpg",
  },

  {
    name:        "Hacienda La Cafetera",
    slug:        "hacienda-la-cafetera",
    trackId:     "hacienda-la-cafetera",
    location:    "Montenegro, Quindío",
    region:      "eje-cafetero",
    type:        "hacienda",
    listingType: "venta",
    priceSale:   2800000000,
    amenities:   ["Piscina", "WiFi", "Caballos", "Zona BBQ", "Jacuzzi"],
    description: "Imponente hacienda cafetera de 12 hectáreas con casa principal restaurada, secadero tradicional y cultivo activo de café de exportación. Oportunidad única de inversión en el corazón del Eje Cafetero.",
    rating:      4.8,
    reviewCount: 19,
    featured:    true,
    imageUrl:    "https://images.unsplash.com/photo-1672851612794-6687bf0bf1a3?w=900&q=80",
    imageTitle:  "Hacienda La Cafetera — Montenegro Quindío",
    fileName:    "hacienda-la-cafetera.jpg",
  },

  // ═══════ CUNDINAMARCA / BOYACÁ ═══════

  {
    name:        "Casa Serrana Moderna",
    slug:        "casa-serrana-moderna",
    trackId:     "casa-serrana-moderna",
    location:    "La Calera, Cundinamarca",
    region:      "cundinamarca",
    type:        "casa",
    listingType: "arriendo",
    priceNight:  620000,
    amenities:   ["WiFi", "Jacuzzi", "Zona BBQ", "Piscina"],
    description: "Casa de diseño contemporáneo con ventanales panorámicos y vista espectacular a la Sabana de Bogotá. Arquitectura minimalista integrada al paisaje andino a 2.800 metros sobre el nivel del mar.",
    rating:      4.7,
    reviewCount: 41,
    featured:    false,
    imageUrl:    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80",
    imageTitle:  "Casa Serrana Moderna — La Calera Cundinamarca",
    fileName:    "casa-serrana-moderna.jpg",
  },

  {
    name:        "Casa Colonial La Candelaria",
    slug:        "casa-colonial-la-candelaria",
    trackId:     "casa-colonial-la-candelaria",
    location:    "Villa de Leyva, Boyacá",
    region:      "cundinamarca",
    type:        "casa",
    listingType: "arriendo",
    priceNight:  480000,
    amenities:   ["WiFi", "Zona BBQ", "Jacuzzi"],
    description: "Casa colonial de piedra en el centro histórico de Villa de Leyva, uno de los pueblos más hermosos de Colombia. Patio interior con jardín, techos de teja y ambiente de época incomparable.",
    rating:      4.8,
    reviewCount: 63,
    featured:    false,
    imageUrl:    "https://images.unsplash.com/photo-1536308037887-165852797016?w=900&q=80",
    imageTitle:  "Casa Colonial La Candelaria — Villa de Leyva Boyacá",
    fileName:    "casa-colonial-la-candelaria.jpg",
  },

  // ═══════ SANTANDER ═══════

  {
    name:        "Hacienda Cañón del Chicamocha",
    slug:        "hacienda-canon-del-chicamocha",
    trackId:     "hacienda-canon-chicamocha",
    location:    "San Gil, Santander",
    region:      "santander",
    type:        "hacienda",
    listingType: "venta",
    priceSale:   3500000000,
    amenities:   ["Piscina", "WiFi", "Caballos", "Zona BBQ"],
    description: "Majestuosa hacienda frente al espectacular Cañón del Chicamocha con 8 hectáreas y vista de 360 grados. Ideal para turismo de aventura, parapente, rafting y deportes extremos en la capital de aventura de Colombia.",
    rating:      4.6,
    reviewCount: 24,
    featured:    false,
    imageUrl:    "https://images.unsplash.com/photo-1599651317690-b0283c307261?w=900&q=80",
    imageTitle:  "Hacienda Cañón del Chicamocha — San Gil Santander",
    fileName:    "hacienda-canon-chicamocha.jpg",
  },

  // ═══════ CARIBE ═══════

  {
    name:        "Villa Caribe",
    slug:        "villa-caribe-cartagena",
    trackId:     "villa-caribe-cartagena",
    location:    "Cartagena, Bolívar",
    region:      "caribe",
    type:        "finca",
    listingType: "arriendo",
    priceNight:  1200000,
    amenities:   ["Piscina", "WiFi", "Jacuzzi", "Zona BBQ"],
    description: "Villa de lujo a minutos del Mar Caribe y la Ciudad Amurallada de Cartagena. Arquitectura caribeña con detalles coloniales, piscina infinita, palmas y atardeceres sobre el Caribe colombiano.",
    rating:      4.9,
    reviewCount: 76,
    featured:    true,
    imageUrl:    "https://images.unsplash.com/photo-1534834427032-2a5ffb812597?w=900&q=80",
    imageTitle:  "Villa Caribe — Cartagena Bolívar",
    fileName:    "villa-caribe-cartagena.jpg",
  },

  {
    name:        "Finca Los Flamencos",
    slug:        "finca-los-flamencos",
    trackId:     "finca-los-flamencos",
    location:    "Palomino, La Guajira",
    region:      "caribe",
    type:        "finca",
    listingType: "arriendo",
    priceNight:  750000,
    amenities:   ["Piscina", "WiFi", "Río/quebrada", "Zona BBQ"],
    description: "Finca tropical entre la Sierra Nevada de Santa Marta y el Mar Caribe en Palomino. Río cristalino que desemboca en el mar, vegetación exuberante y tranquilidad absoluta en el norte de Colombia.",
    rating:      4.8,
    reviewCount: 38,
    featured:    false,
    imageUrl:    "https://images.unsplash.com/photo-1635079552384-dd8adecd8a7c?w=900&q=80",
    imageTitle:  "Finca Los Flamencos — Palomino La Guajira",
    fileName:    "finca-los-flamencos.jpg",
  },

  // ═══════ VALLE DEL CAUCA ═══════

  {
    name:        "Hacienda El Trapiche",
    slug:        "hacienda-el-trapiche",
    trackId:     "hacienda-el-trapiche",
    location:    "Buga, Valle del Cauca",
    region:      "valle",
    type:        "hacienda",
    listingType: "venta",
    priceSale:   4200000000,
    amenities:   ["Piscina", "WiFi", "Caballos", "Zona BBQ", "Jacuzzi"],
    description: "Espléndida hacienda vallecaucana de 15 hectáreas con trapiche colonial restaurado. Casa principal de bahareque con corredor, jardines tropicales y cultivos de caña dulce y frutales en el Valle del Cauca.",
    rating:      4.7,
    reviewCount: 31,
    featured:    true,
    imageUrl:    "https://images.unsplash.com/photo-1741287541128-50080b7cadc6?w=900&q=80",
    imageTitle:  "Hacienda El Trapiche — Buga Valle del Cauca",
    fileName:    "hacienda-el-trapiche.jpg",
  },

  // ═══════ CARIBE (ampliado) ═══════

  {
    name:        "Villa Santa Marta Bello",
    slug:        "villa-santa-marta-bello",
    trackId:     "villa-santa-marta-bello",
    location:    "El Rodadero, Santa Marta",
    region:      "caribe",
    type:        "finca",
    listingType: "arriendo",
    priceNight:  950000,
    amenities:   ["Piscina", "WiFi", "Jacuzzi", "Zona BBQ"],
    description: "Espléndida villa de lujo a pasos del Mar Caribe en El Rodadero. Arquitectura tropical contemporánea con piscina infinita, palmeras y vistas al océano. A minutos de la Sierra Nevada de Santa Marta y los mejores spots de snorkeling del Caribe colombiano.",
    rating:      4.8,
    reviewCount: 52,
    featured:    false,
    imageUrl:    "https://images.unsplash.com/photo-1627262274924-3e53e173672f?w=900&q=80",
    imageTitle:  "Villa Santa Marta Bello — El Rodadero Santa Marta",
    fileName:    "villa-santa-marta-bello.jpg",
  },

  {
    name:        "Hacienda Ganadera Los Nogales",
    slug:        "hacienda-ganadera-los-nogales",
    trackId:     "hacienda-ganadera-los-nogales",
    location:    "Montería, Córdoba",
    region:      "caribe",
    type:        "hacienda",
    listingType: "venta",
    priceSale:   5500000000,
    amenities:   ["Piscina", "WiFi", "Caballos", "Zona BBQ"],
    description: "Majestuosa hacienda ganadera de 35 hectáreas en las fértiles sabanas de Córdoba con hato de 180 cabezas de ganado Cebú de alta genética. Casa principal de bahareque restaurada, pista de aterrizaje privada, bebederos automatizados y pozo profundo. Inversión con retorno ganadero inmediato.",
    rating:      4.6,
    reviewCount: 18,
    featured:    false,
    imageUrl:    "https://images.unsplash.com/photo-1595709915817-38e68573934d?w=900&q=80",
    imageTitle:  "Hacienda Ganadera Los Nogales — Montería Córdoba",
    fileName:    "hacienda-ganadera-los-nogales.jpg",
  },

  // ═══════ TOLIMA ═══════

  {
    name:        "Finca Productiva El Cedral",
    slug:        "finca-productiva-el-cedral",
    trackId:     "finca-productiva-el-cedral",
    location:    "Ibagué, Tolima",
    region:      "tolima",
    type:        "hacienda",
    listingType: "venta",
    priceSale:   1900000000,
    amenities:   ["Caballos", "WiFi", "Zona BBQ", "Río/quebrada"],
    description: "Finca productiva de 20 hectáreas en el fértil Valle del Tolima con cultivos de arroz, maíz y ganadería extensiva. Incluye casa principal restaurada, bodega agrícola, acequias propias y fuente de agua permanente. Oportunidad única de inversión agrícola en el corazón cafetero.",
    rating:      4.5,
    reviewCount: 14,
    featured:    false,
    imageUrl:    "https://images.unsplash.com/photo-1545803836-10aa6a44ee66?w=900&q=80",
    imageTitle:  "Finca Productiva El Cedral — Ibagué Tolima",
    fileName:    "finca-productiva-el-cedral.jpg",
  },

  // ═══════ CUNDINAMARCA (ampliado) ═══════

  {
    name:        "Casa Campestre Cajicá",
    slug:        "casa-campestre-cajica",
    trackId:     "casa-campestre-cajica",
    location:    "Cajicá, Cundinamarca",
    region:      "cundinamarca",
    type:        "casa",
    listingType: "arriendo",
    priceNight:  520000,
    amenities:   ["Piscina", "WiFi", "Zona BBQ", "Jacuzzi"],
    description: "Casa campestre moderna a solo 30 minutos de Bogotá en el municipio de Cajicá. Diseño contemporáneo con amplios jardines, piscina climatizada y zonas sociales abiertas. El escapatorio perfecto para familias bogotanas que buscan naturaleza sin alejarse de la ciudad.",
    rating:      4.6,
    reviewCount: 38,
    featured:    false,
    imageUrl:    "https://images.unsplash.com/photo-1666993724963-ceb241907962?w=900&q=80",
    imageTitle:  "Casa Campestre Cajicá — Cundinamarca",
    fileName:    "casa-campestre-cajica.jpg",
  },

  {
    name:        "Retiro Aventura Boyacá",
    slug:        "retiro-aventura-boyaca",
    trackId:     "retiro-aventura-boyaca",
    location:    "Monguí, Boyacá",
    region:      "cundinamarca",
    type:        "retiro",
    listingType: "arriendo",
    priceNight:  420000,
    amenities:   ["Caballos", "WiFi", "Río/quebrada", "Zona BBQ"],
    description: "Retiro de aventura en las montañas de Boyacá a 3.100 metros sobre el nivel del mar, cerca del páramo de Ocetá. Senderismo extremo, avistamiento de frailejones, cabalgatas por páramo y aguas termales naturales. Para quienes buscan Colombia auténtica e indómita.",
    rating:      4.7,
    reviewCount: 29,
    featured:    false,
    imageUrl:    "https://images.unsplash.com/photo-1607613960015-f42a9da36204?w=900&q=80",
    imageTitle:  "Retiro Aventura Boyacá — Monguí Páramo de Ocetá",
    fileName:    "retiro-aventura-boyaca.jpg",
  },

  {
    name:        "Villa Anapoima Termal",
    slug:        "villa-anapoima-termal",
    trackId:     "villa-anapoima-termal",
    location:    "Anapoima, Cundinamarca",
    region:      "cundinamarca",
    type:        "casa",
    listingType: "arriendo",
    priceNight:  680000,
    amenities:   ["Piscina", "WiFi", "Jacuzzi", "Zona BBQ"],
    description: "Villa tropical privada en el cálido municipio de Anapoima, a solo 2 horas de Bogotá. Clima primaveral de 28°C todo el año, piscina olímpica, jardines tropicales con palmeras y mango, y zona de hamacas. El antídoto perfecto contra el frío bogotano.",
    rating:      4.7,
    reviewCount: 44,
    featured:    false,
    imageUrl:    "https://images.unsplash.com/photo-1684226910423-a4eb43a03257?w=900&q=80",
    imageTitle:  "Villa Anapoima Termal — Anapoima Cundinamarca",
    fileName:    "villa-anapoima-termal.jpg",
  },

  // ═══════ ANTIOQUIA (ampliado) ═══════

  {
    name:        "Finca Lujo Las Lomas",
    slug:        "finca-lujo-las-lomas",
    trackId:     "finca-lujo-las-lomas",
    location:    "Envigado, Antioquia",
    region:      "antioquia",
    type:        "finca",
    listingType: "arriendo",
    priceNight:  850000,
    amenities:   ["Piscina", "WiFi", "Jacuzzi", "Zona BBQ", "Caballos"],
    description: "Finca de lujo en las exclusivas lomas de Envigado con vista panorámica al Valle de Aburrá. Arquitectura paisa contemporánea, piscina desbordante con vista nocturna a Medellín, helipad privado y cuadra para 4 caballos. La mejor dirección del sur antioqueño.",
    rating:      4.9,
    reviewCount: 61,
    featured:    true,
    imageUrl:    "https://images.unsplash.com/photo-1613013546273-fdedae34436c?w=900&q=80",
    imageTitle:  "Finca Lujo Las Lomas — Envigado Antioquia",
    fileName:    "finca-lujo-las-lomas.jpg",
  },

  // ═══════ NARIÑO ═══════

  {
    name:        "Retiro Ecológico Galeras",
    slug:        "retiro-ecologico-galeras",
    trackId:     "retiro-ecologico-galeras",
    location:    "La Florida, Nariño",
    region:      "narino",
    type:        "retiro",
    listingType: "arriendo",
    priceNight:  360000,
    amenities:   ["WiFi", "Río/quebrada", "Zona BBQ", "Caballos"],
    description: "Refugio ecológico en las faldas del Volcán Galeras, en uno de los territorios más biodiversos del planeta. Selva andina de niebla, orquídeas endémicas y ríos cristalinos. Territorio ancestral con comunidades indígenas Quillacingas y senderos de interpretación ambiental.",
    rating:      4.8,
    reviewCount: 22,
    featured:    false,
    imageUrl:    "https://images.unsplash.com/photo-1768168794837-01dbd3708dfa?w=900&q=80",
    imageTitle:  "Retiro Ecológico Galeras — La Florida Nariño",
    fileName:    "retiro-ecologico-galeras.jpg",
  },

];

// ── Helpers ───────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(msg, type = "info") {
  const icons = { info: "→", ok: "✓", warn: "⚠", error: "✗" };
  console.log(`  ${icons[type] || "·"} ${msg}`);
}

const spaceEnv = () => ({ spaceId: SPACE_ID, environmentId: ENV_ID });

// ── Crear asset desde URL ─────────────────────────────────────
async function createAsset(client, imageUrl, title, fileName) {
  log(`Creando asset: ${title}`);

  const asset = await client.asset.create(spaceEnv(), {
    fields: {
      title: { [LOCALE]: title },
      file: {
        [LOCALE]: {
          contentType: "image/jpeg",
          fileName:    fileName,
          upload:      imageUrl,
        },
      },
    },
  });

  await client.asset.processForLocale(
    { ...spaceEnv(), assetId: asset.sys.id },
    asset,
    LOCALE
  );
  await sleep(4000);

  const processed = await client.asset.get({
    ...spaceEnv(),
    assetId: asset.sys.id,
  });

  const published = await client.asset.publish(
    { ...spaceEnv(), assetId: processed.sys.id },
    processed
  );

  log(`Asset publicado: ${title}`, "ok");
  return published;
}

// ── Archivar asset ────────────────────────────────────────────
async function archiveAsset(client, assetId) {
  try {
    let asset = await client.asset.get({ ...spaceEnv(), assetId });
    if (asset.sys.publishedVersion) {
      asset = await client.asset.unpublish({ ...spaceEnv(), assetId }, asset);
    }
    await client.asset.archive({ ...spaceEnv(), assetId }, asset);
    log(`Asset anterior archivado: ${assetId}`, "warn");
  } catch (err) {
    log(`No se pudo archivar asset ${assetId}: ${err.message}`, "warn");
  }
}

// ── Archivar entry ────────────────────────────────────────────
async function archiveEntry(client, entryId) {
  try {
    let entry = await client.entry.get({ ...spaceEnv(), entryId });
    if (entry.sys.publishedVersion) {
      entry = await client.entry.unpublish({ ...spaceEnv(), entryId }, entry);
    }
    await client.entry.archive({ ...spaceEnv(), entryId }, entry);
    log(`Entry anterior archivada: ${entryId}`, "warn");
  } catch (err) {
    log(`No se pudo archivar entry ${entryId}: ${err.message}`, "warn");
  }
}

// ── Step 1: Content Type siteConfig ──────────────────────────
async function createSiteConfigType(client) {
  log("Verificando content type 'siteConfig'...");
  try {
    await client.contentType.get({ ...spaceEnv(), contentTypeId: "siteConfig" });
    log("'siteConfig' ya existe — saltando.", "warn");
    return;
  } catch {}

  log("Creando content type 'siteConfig'...");
  const ct = await client.contentType.createWithId(
    { ...spaceEnv(), contentTypeId: "siteConfig" },
    {
      name:         "Site Config",
      description:  "Configuración global del sitio — hero, CTA y otros assets",
      displayField: "title",
      fields: [
        { id: "title",     name: "Título interno",  type: "Symbol", required: true },
        { id: "heroImage", name: "Hero Background",  type: "Link",   linkType: "Asset", required: true },
        { id: "ctaImage",  name: "CTA Banner Image", type: "Link",   linkType: "Asset", required: true },
      ],
    }
  );

  await client.contentType.publish(
    { ...spaceEnv(), contentTypeId: ct.sys.id },
    ct
  );
  log("Content type 'siteConfig' creado y publicado.", "ok");
}

// ── Step 2: Content Type region ───────────────────────────────
async function createRegionType(client) {
  log("Verificando content type 'region'...");
  try {
    await client.contentType.get({ ...spaceEnv(), contentTypeId: "region" });
    log("'region' ya existe — saltando.", "warn");
    return;
  } catch {}

  log("Creando content type 'region'...");
  const ct = await client.contentType.createWithId(
    { ...spaceEnv(), contentTypeId: "region" },
    {
      name:         "Region",
      description:  "Región geográfica con imagen",
      displayField: "name",
      fields: [
        { id: "name",          name: "Nombre",     type: "Symbol",  required: true },
        { id: "slug",          name: "Slug",        type: "Symbol",  required: true },
        { id: "image",         name: "Imagen",      type: "Link",    linkType: "Asset", required: true },
        { id: "propertyCount", name: "Propiedades", type: "Integer", required: true },
      ],
    }
  );

  await client.contentType.publish(
    { ...spaceEnv(), contentTypeId: ct.sys.id },
    ct
  );
  log("Content type 'region' creado y publicado.", "ok");
}

// ── Step 3: Entry siteConfig ──────────────────────────────────
async function createSiteConfigEntry(client) {
  log("Verificando entry siteConfig...");

  let existing = null;
  try {
    existing = await client.entry.get({ ...spaceEnv(), entryId: "siteConfig" });
    log("Entry 'siteConfig' encontrada — actualizando imágenes...", "warn");
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  const heroAsset = await createAsset(client, SITE_CONFIG.hero.imageUrl, SITE_CONFIG.hero.imageTitle, SITE_CONFIG.hero.fileName);
  const ctaAsset  = await createAsset(client, SITE_CONFIG.cta.imageUrl,  SITE_CONFIG.cta.imageTitle,  SITE_CONFIG.cta.fileName);

  if (existing) {
    const oldHeroId = existing.fields.heroImage?.[LOCALE]?.sys?.id;
    const oldCtaId  = existing.fields.ctaImage?.[LOCALE]?.sys?.id;
    if (oldHeroId) await archiveAsset(client, oldHeroId);
    if (oldCtaId)  await archiveAsset(client, oldCtaId);

    const toUpdate = {
      sys:    existing.sys,
      fields: {
        title:     { [LOCALE]: "FincaMarket Config" },
        heroImage: { [LOCALE]: { sys: { type: "Link", linkType: "Asset", id: heroAsset.sys.id } } },
        ctaImage:  { [LOCALE]: { sys: { type: "Link", linkType: "Asset", id: ctaAsset.sys.id  } } },
      },
    };
    const updated = await client.entry.update({ ...spaceEnv(), entryId: "siteConfig" }, toUpdate);
    await client.entry.publish({ ...spaceEnv(), entryId: "siteConfig" }, updated);
    log("Entry 'siteConfig' actualizada y publicada.", "ok");
  } else {
    const entry = await client.entry.createWithId(
      { ...spaceEnv(), contentTypeId: "siteConfig", entryId: "siteConfig" },
      {
        fields: {
          title:     { [LOCALE]: "FincaMarket Config" },
          heroImage: { [LOCALE]: { sys: { type: "Link", linkType: "Asset", id: heroAsset.sys.id } } },
          ctaImage:  { [LOCALE]: { sys: { type: "Link", linkType: "Asset", id: ctaAsset.sys.id  } } },
        },
      }
    );
    await client.entry.publish({ ...spaceEnv(), entryId: entry.sys.id }, entry);
    log("Entry 'siteConfig' creada y publicada.", "ok");
  }
}

// ── Step 4: Regiones ──────────────────────────────────────────
async function createRegionEntries(client) {
  for (const region of REGIONS) {
    const idx = REGIONS.indexOf(region) + 1;
    console.log(`\n  ── Región ${idx}/${REGIONS.length}: ${region.name}`);
    try {
      const existing = await client.entry.getMany({
        ...spaceEnv(),
        query: { content_type: "region", "fields.slug": region.slug, limit: 1 },
      });

      if (existing.items.length > 0) {
        const old = existing.items[0];
        log(`Región '${region.name}' encontrada — archivando versión anterior...`, "warn");
        const oldImageId = old.fields.image?.[LOCALE]?.sys?.id;
        await archiveEntry(client, old.sys.id);
        if (oldImageId) await archiveAsset(client, oldImageId);
      }

      const asset = await createAsset(client, region.imageUrl, region.imageTitle, region.fileName);

      const entry = await client.entry.create(
        { ...spaceEnv(), contentTypeId: "region" },
        {
          fields: {
            name:          { [LOCALE]: region.name },
            slug:          { [LOCALE]: region.slug },
            image:         { [LOCALE]: { sys: { type: "Link", linkType: "Asset", id: asset.sys.id } } },
            propertyCount: { [LOCALE]: region.propertyCount },
          },
        }
      );

      await client.entry.publish({ ...spaceEnv(), entryId: entry.sys.id }, entry);
      log(`Región publicada: ${region.name}`, "ok");
      await sleep(600);
    } catch (err) {
      log(`Error en ${region.name}: ${err.message}`, "error");
      if (err.details) console.error(JSON.stringify(err.details, null, 2));
    }
  }
}

// ── Step 5: Propiedades ───────────────────────────────────────
async function createPropertyEntries(client) {
  for (const prop of PROPERTIES) {
    const idx = PROPERTIES.indexOf(prop) + 1;
    console.log(`\n  ── Propiedad ${idx}/${PROPERTIES.length}: ${prop.name}`);
    try {
      // Buscar por nombre para detectar si ya existe
      const existing = await client.entry.getMany({
        ...spaceEnv(),
        query: { content_type: "property", "fields.name": prop.name, limit: 1 },
      });

      if (existing.items.length > 0) {
        const old = existing.items[0];
        log(`'${prop.name}' encontrada — archivando versión anterior...`, "warn");
        const oldImageId = old.fields.image?.[LOCALE]?.sys?.id;
        await archiveEntry(client, old.sys.id);
        if (oldImageId) await archiveAsset(client, oldImageId);
      }

      // Crear nuevo asset
      const asset = await createAsset(client, prop.imageUrl, prop.imageTitle, prop.fileName);

      // Construir campos — precio dinámico según listingType
      const fields = {
        name:        { [LOCALE]: prop.name        },
        slug:        { [LOCALE]: prop.slug        },
        trackId:     { [LOCALE]: prop.trackId     },
        location:    { [LOCALE]: prop.location    },
        region:      { [LOCALE]: prop.region      },
        type:        { [LOCALE]: prop.type        },
        listingType: { [LOCALE]: prop.listingType },
        amenities:   { [LOCALE]: prop.amenities   },
        description: { [LOCALE]: prop.description },
        rating:      { [LOCALE]: prop.rating      },
        reviewCount: { [LOCALE]: prop.reviewCount },
        featured:    { [LOCALE]: prop.featured    },
        image:       { [LOCALE]: { sys: { type: "Link", linkType: "Asset", id: asset.sys.id } } },
      };

      if (prop.priceNight) fields.priceNight = { [LOCALE]: prop.priceNight };
      if (prop.priceSale)  fields.priceSale  = { [LOCALE]: prop.priceSale  };

      const entry = await client.entry.create(
        { ...spaceEnv(), contentTypeId: "property" },
        { fields }
      );

      await client.entry.publish({ ...spaceEnv(), entryId: entry.sys.id }, entry);
      log(`Propiedad publicada: ${prop.name}`, "ok");
      await sleep(800);
    } catch (err) {
      log(`Error en ${prop.name}: ${err.message}`, "error");
      if (err.details) console.error(JSON.stringify(err.details, null, 2));
    }
  }
}

// ── MAIN ──────────────────────────────────────────────────────
async function main() {
  console.log("\n══════════════════════════════════════════════════");
  console.log("  FincaMarket — Setup Media en Contentful  v2.0");
  console.log("  Space: " + SPACE_ID);
  console.log("  Propiedades: " + PROPERTIES.length);
  console.log("  Regiones:    " + REGIONS.length);
  console.log("══════════════════════════════════════════════════\n");

  const client = createClient({ accessToken: CMA_TOKEN });
  const space  = await client.space.get({ spaceId: SPACE_ID });
  log(`Conectado al space: "${space.name}"`, "ok");

  console.log("\n[1/5] Content Type — siteConfig");
  console.log("──────────────────────────────────────────────────");
  await createSiteConfigType(client);

  console.log("\n[2/5] Content Type — region");
  console.log("──────────────────────────────────────────────────");
  await createRegionType(client);

  console.log("\n[3/5] Entry — siteConfig (hero + CTA)");
  console.log("──────────────────────────────────────────────────");
  await createSiteConfigEntry(client);

  console.log("\n[4/5] Entries — " + REGIONS.length + " regiones");
  console.log("──────────────────────────────────────────────────");
  await createRegionEntries(client);

  console.log("\n[5/5] Entries — " + PROPERTIES.length + " propiedades");
  console.log("──────────────────────────────────────────────────");
  await createPropertyEntries(client);

  console.log("\n══════════════════════════════════════════════════");
  console.log("  ✓ Setup completado");
  console.log("  → Verifica en: https://app.contentful.com");
  console.log("\n  ⚠ NOTA: Valle del Cauca y Caribe son regiones nuevas.");
  console.log("    Para que aparezcan en el sitio agrega sus cards");
  console.log("    en index.html con data-track=\"region-valle\" y");
  console.log("    data-track=\"region-caribe\" respectivamente.");
  console.log("══════════════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("\n✗ Error fatal:", err.message);
  if (err.details) console.error(JSON.stringify(err.details, null, 2));
  process.exit(1);
});
