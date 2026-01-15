# 🚀 Guía Completa: Deploy Angular en Vercel + Backend Docker

## 📋 BLOQUE 1 — Entender el backend

### ❌ ¿Mi backend Docker está expuesto públicamente con una URL estable?

**RESPUESTA: NO**

Tu backend actualmente:
- ✅ Corre en Docker en `localhost:5085` (solo accesible localmente)
- ❌ **NO está expuesto públicamente**
- ❌ **NO tiene una URL pública estable**

**SOLUCIÓN NECESARIA:**
Necesitas exponer tu backend Docker públicamente. Opciones:

1. **Opción A: Servicio de hosting con Docker** (Recomendado)
   - Railway.app (https://railway.app) - Gratis para empezar
   - Render.com - Gratis con limitaciones
   - DigitalOcean App Platform
   - Fly.io

2. **Opción B: VPS con Docker**
   - DigitalOcean Droplet
   - AWS EC2
   - Linode

3. **Opción C: Backend en Vercel también** (si migras a serverless)

**Para verificar que funciona:**
```bash
# Una vez expuesto, debería responder a:
curl https://tu-backend-url.com/technicians
# O crear un endpoint /health:
curl https://tu-backend-url.com/health
```

### ⚠️ ¿Mi backend tiene CORS habilitado para Vercel?

**RESPUESTA: PARCIALMENTE - NECESITA CONFIGURACIÓN**

**Estado actual:**
- ✅ CORS está configurado en `Program.cs`
- ❌ Solo acepta: `http://localhost:5173` y `http://localhost:3000`
- ❌ **NO acepta el dominio de Vercel** (ej: `https://tu-app.vercel.app`)

**Archivo:** `backend/MroLite.Api/appsettings.json`
```json
{
  "Cors": {
    "Origins": []  // ← VACÍO en producción
  }
}
```

**Archivo:** `backend/MroLite.Api/appsettings.Development.json`
```json
{
  "Cors": {
    "Origins": [
      "http://localhost:5173",
      "http://localhost:3000"
    ]
  }
}
```

**SOLUCIÓN:**
Necesitas agregar el dominio de Vercel. Ver sección de configuración abajo.

### ❌ ¿Mi backend depende de localhost?

**RESPUESTA: SÍ - PROBLEMA CRÍTICO**

**Problemas encontrados:**

1. **ConnectionString en Development:**
   ```json
   "Server=localhost,1433;Database=MroLiteDb;..."
   ```
   ✅ Esto está bien para desarrollo local

2. **CORS solo localhost:**
   ❌ Solo acepta `localhost:5173` y `localhost:3000`
   ❌ **ROMPERÁ en producción** cuando Vercel intente hacer requests

3. **Docker Compose:**
   ```yaml
   ports:
     - "5085:8080"  # Solo expone en localhost
   ```
   ❌ No está expuesto públicamente

**IMPACTO:** El frontend en Vercel **NO podrá conectarse** al backend si sigue en localhost.

---

## 📋 BLOQUE 2 — Preparar Angular para producción

### ⚠️ ¿Mi frontend usa proxy o URLs relativas?

**RESPUESTA: USA PROXY - NECESITA CAMBIOS**

**Estado actual:**
- `technician.service.ts`: `private readonly apiUrl = '/api';`
- `maintenance-job.service.ts`: `private readonly apiUrl = '/api';`

**Problema:**
- ✅ Funciona en desarrollo con `proxy.conf.json`
- ❌ **NO funcionará en Vercel** (el proxy solo funciona con `ng serve`)

**SOLUCIÓN:** Usar environment files con URL absoluta del backend.

### ❌ ¿Tengo environment.ts configurado?

**RESPUESTA: NO - NECESITA CREARSE**

No existen los archivos `environment.ts` y `environment.prod.ts`.

**SOLUCIÓN:** Crearlos (ver archivos generados abajo).

### ✅ Cambios necesarios en services

**Archivos a modificar:**
1. `technician.service.ts` - Cambiar `apiUrl` a usar environment
2. `maintenance-job.service.ts` - Cambiar `apiUrl` a usar environment

---

## 📋 BLOQUE 3 — Build y estructura para Vercel

### ✅ ¿El proyecto compila correctamente?

**RESPUESTA: PROBABLEMENTE SÍ, pero verificar**

**Para verificar:**
```bash
cd frontend
npm run build -- --configuration production
```

**Output esperado:** `dist/mro-lite/`

### ✅ OutputPath de Angular

**RESPUESTA:** `dist/mro-lite`

**Archivo:** `angular.json` línea 15:
```json
"outputPath": "dist/mro-lite"
```

**Para Vercel:** Output Directory = `dist/mro-lite`

### ✅ ¿.gitignore está bien?

**RESPUESTA: SÍ, pero puede mejorarse**

**Actual:**
```
dist/
node_modules/
```

**Recomendación:** Agregar:
```
# Environment files (opcional, algunos prefieren versionarlos)
# src/environments/environment.prod.ts

# Build artifacts
.angular/
```

---

## 📋 BLOQUE 4 — Configuración de Vercel

### ✅ Configuración del proyecto en Vercel

**Framework Preset:** Angular

**Build Command:**
```bash
cd frontend && npm install && npm run build -- --configuration production
```

**Output Directory:**
```
frontend/dist/mro-lite
```

**Install Command:**
```bash
cd frontend && npm install
```

**Root Directory:** (dejar vacío o `/`)

### ✅ Variables de entorno en Vercel

**RESPUESTA: SÍ, CONVIENE USARLAS**

**Variable a crear:**
- **Nombre:** `API_URL`
- **Valor:** `https://tu-backend-url.com` (sin `/api` al final)
- **Ambiente:** Production, Preview, Development

**Cómo usarla:** Ver archivos `environment.ts` generados abajo.

### ✅ ¿Necesito vercel.json?

**RESPUESTA: SÍ, para SPA routing**

Angular usa routing del lado del cliente, necesitas redirigir todas las rutas a `index.html`.

**Archivo:** `frontend/vercel.json` (ver abajo)

---

## 📋 BLOQUE 5 — Errores comunes y debugging

### ⚠️ Errores típicos

1. **CORS Error:**
   ```
   Access to XMLHttpRequest at 'https://backend.com/api/...' 
   from origin 'https://app.vercel.app' has been blocked by CORS policy
   ```
   **Solución:** Agregar dominio de Vercel en CORS del backend

2. **404 Not Found:**
   ```
   GET https://backend.com/api/technicians 404
   ```
   **Solución:** Verificar que la URL del backend sea correcta

3. **Network Error:**
   ```
   Failed to fetch
   ```
   **Solución:** Backend no accesible públicamente o URL incorrecta

4. **Mixed Content:**
   ```
   Mixed Content: The page was loaded over HTTPS, but requested an insecure resource
   ```
   **Solución:** Backend debe usar HTTPS

### ✅ Verificación en navegador

1. Abrir DevTools (F12)
2. Pestaña **Network**
3. Filtrar por **XHR** o **Fetch**
4. Recargar página
5. Verificar:
   - ✅ Status 200 para requests al backend
   - ✅ Headers `Access-Control-Allow-Origin` con tu dominio
   - ❌ Si hay errores CORS, verás mensaje en rojo

### ✅ Checklist de debugging

Si datos no cargan en producción pero sí en local:

1. ✅ Verificar que backend esté accesible públicamente
2. ✅ Verificar CORS en backend (incluir dominio de Vercel)
3. ✅ Verificar variable de entorno `API_URL` en Vercel
4. ✅ Verificar que `environment.prod.ts` use la variable
5. ✅ Verificar Network tab en navegador (errores CORS/404)
6. ✅ Verificar que backend use HTTPS (Vercel solo HTTPS)
7. ✅ Verificar logs de Vercel (Build logs y Function logs)
8. ✅ Verificar logs del backend

---

## 🎯 CHECKLIST FINAL

### Paso 1: Exponer Backend Públicamente
- [ ] Elegir hosting (Railway, Render, etc.)
- [ ] Deploy backend Docker
- [ ] Obtener URL pública (ej: `https://api.mro-lite.railway.app`)
- [ ] Verificar que responde: `curl https://tu-backend.com/technicians`

### Paso 2: Configurar CORS en Backend
- [ ] Agregar dominio de Vercel en `appsettings.json`:
  ```json
  "Cors": {
    "Origins": [
      "https://tu-app.vercel.app",
      "https://*.vercel.app"  // Para previews
    ]
  }
  ```
- [ ] Redeploy backend
- [ ] Verificar CORS con: `curl -H "Origin: https://tu-app.vercel.app" https://tu-backend.com/technicians -v`

### Paso 3: Crear Environment Files en Angular
- [ ] Crear `frontend/src/environments/environment.ts` (desarrollo)
- [ ] Crear `frontend/src/environments/environment.prod.ts` (producción)
- [ ] Actualizar `angular.json` para usar environments

### Paso 4: Actualizar Services
- [ ] Modificar `technician.service.ts` para usar `environment.apiUrl`
- [ ] Modificar `maintenance-job.service.ts` para usar `environment.apiUrl`
- [ ] Probar localmente con `npm run build -- --configuration production`

### Paso 5: Configurar Vercel
- [ ] Crear proyecto en Vercel
- [ ] Conectar repositorio
- [ ] Configurar:
  - Framework: Angular
  - Build Command: `cd frontend && npm install && npm run build -- --configuration production`
  - Output Directory: `frontend/dist/mro-lite`
- [ ] Agregar variable de entorno: `API_URL=https://tu-backend.com`
- [ ] Crear `frontend/vercel.json` para SPA routing

### Paso 6: Testing
- [ ] Deploy en Vercel
- [ ] Abrir DevTools → Network
- [ ] Verificar que requests van a backend correcto
- [ ] Verificar que no hay errores CORS
- [ ] Verificar que datos cargan correctamente

---

## 📝 PRÓXIMOS PASOS

1. **Exponer backend** (más crítico)
2. **Crear environment files** (ver archivos generados)
3. **Actualizar services** (ver cambios)
4. **Configurar Vercel** (seguir checklist)

