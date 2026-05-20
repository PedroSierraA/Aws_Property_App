# FincaMarket

Marketplace de fincas y propiedades campestres en Colombia. Desarrollado con HTML/CSS/JS vanilla, AWS Cognito, API Gateway, y Contentful como CMS.

## Setup

Este proyecto requiere dos archivos de credenciales que **no están en el repo**. Debes crearlos manualmente.

### 1. `config.js` — credenciales del sitio web

Crea este archivo en la raíz del proyecto:

```js
window.FM_CONFIG = {
  API_BASE:         "",   // URL de tu API Gateway
  COGNITO_DOMAIN:   "",   // Dominio de tu User Pool
  CLIENT_ID:        "",   // App Client ID de Cognito
  CLIENT_SECRET:    "",   // App Client Secret de Cognito
  REDIRECT_URI:     "",   // URL de tu distribución CloudFront
  CONTENTFUL_SPACE: "",   // Space ID de Contentful
  CONTENTFUL_TOKEN: "",   // Delivery API Token de Contentful
  GA4_ID:           "",   // Measurement ID de Google Analytics
};
```

### 2. `.env` — credenciales para el script de Contentful

Crea este archivo en la raíz del proyecto:

```
CONTENTFUL_CMA_TOKEN=
CONTENTFUL_SPACE_ID=
CONTENTFUL_ENV_ID=master
CONTENTFUL_LOCALE=en-US
```

### 3. Instalar dependencias

```bash
npm install
```
