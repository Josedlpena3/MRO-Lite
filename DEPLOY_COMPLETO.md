# 🚀 Guía Completa: Deploy Backend + Frontend Vercel

## 📋 PASO 1: Exponer Backend en Railway (RECOMENDADO)

### Opción A: Railway.app (Más fácil - Recomendado)

#### 1.1 Crear cuenta y proyecto en Railway

1. Ve a https://railway.app
2. Inicia sesión con GitHub
3. Clic en **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Conecta tu repositorio

#### 1.2 Configurar Backend en Railway

1. En Railway, clic en **"+ New"** → **"GitHub Repo"**
2. Selecciona tu repo
3. Railway detectará automáticamente el Dockerfile

#### 1.3 Variables de entorno en Railway

Agregar estas variables en Railway (Settings → Variables):

```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
ConnectionStrings__DefaultConnection=Server=tu-sql-server;Database=MroLiteDb;User Id=sa;Password=TuPassword;TrustServerCertificate=True;
Cors__Origins__0=https://tu-app.vercel.app
Cors__Origins__1=https://*.vercel.app
```

#### 1.4 Configurar SQL Server en Railway

1. En Railway, clic en **"+ New"** → **"Database"** → **"Add PostgreSQL"** (o MySQL)
2. **NOTA:** Railway no tiene SQL Server nativo. Opciones:
   - **Opción A:** Usar PostgreSQL (necesitarás cambiar el backend)
   - **Opción B:** Usar servicio externo de SQL Server (Azure SQL, AWS RDS)
   - **Opción C:** Usar contenedor SQL Server en Railway (más complejo)

#### 1.5 Obtener URL pública

1. Railway generará automáticamente una URL pública
2. Formato: `https://tu-proyecto.up.railway.app`
3. **Anota esta URL** - la necesitarás para el frontend

#### 1.6 Verificar que funciona

```bash
curl https://tu-proyecto.up.railway.app/technicians
```

---

### Opción B: Render.com (Alternativa)

1. Ve a https://render.com
2. Inicia sesión con GitHub
3. Clic en **"New +"** → **"Web Service"**
4. Conecta tu repositorio
5. Configuración:
   - **Name:** mro-lite-api
   - **Environment:** Docker
   - **Dockerfile Path:** `backend/MroLite.Api/Dockerfile`
   - **Docker Context:** `backend`
6. Variables de entorno (mismas que Railway)
7. Render generará URL: `https://mro-lite-api.onrender.com`

---

## 📋 PASO 2: Configurar CORS en Backend

### 2.1 Actualizar appsettings.json

Una vez que tengas la URL de Vercel, actualiza `backend/MroLite.Api/appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "Origins": [
      "https://tu-app.vercel.app",
      "https://*.vercel.app"
    ]
  }
}
```

**IMPORTANTE:** Usa variables de entorno en Railway/Render en lugar de hardcodear, para que funcione con cualquier URL de Vercel.

### 2.2 Configurar CORS mediante variables de entorno

En Railway/Render, usa esta configuración:

```
Cors__Origins__0=https://tu-app.vercel.app
Cors__Origins__1=https://*.vercel.app
```

El sistema .NET automáticamente creará el array `["https://tu-app.vercel.app", "https://*.vercel.app"]`

---

## 📋 PASO 3: Actualizar Frontend (Angular)

### 3.1 Actualizar environment.prod.ts

Edita `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-proyecto.up.railway.app' // ← URL de tu backend
};
```

**Reemplaza** `https://tu-proyecto.up.railway.app` con la URL real de tu backend.

### 3.2 Verificar que los services usan environment

Ya está configurado:
- ✅ `technician.service.ts` usa `environment.apiUrl`
- ✅ `maintenance-job.service.ts` usa `environment.apiUrl`

---

## 📋 PASO 4: Deploy en Vercel

### 4.1 Crear proyecto en Vercel

1. Ve a https://vercel.com
2. Inicia sesión con GitHub
3. Clic en **"Add New..."** → **"Project"**
4. Importa tu repositorio

### 4.2 Configurar proyecto en Vercel

**Framework Preset:** Angular

**Root Directory:** (dejar vacío)

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

### 4.3 Variables de entorno (OPCIONAL)

Si quieres usar variables de entorno en lugar de hardcodear:

**Nombre:** `API_URL`  
**Valor:** `https://tu-proyecto.up.railway.app`

Luego actualiza `environment.prod.ts` para leerla (requiere configuración adicional).

### 4.4 Deploy

1. Clic en **"Deploy"**
2. Vercel construirá y desplegará tu aplicación
3. Obtendrás una URL: `https://tu-app.vercel.app`

---

## 📋 PASO 5: Verificación Final

### 5.1 Verificar Backend

```bash
# Debe responder con datos
curl https://tu-proyecto.up.railway.app/technicians

# Debe permitir CORS
curl -H "Origin: https://tu-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://tu-proyecto.up.railway.app/technicians \
     -v
```

### 5.2 Verificar Frontend

1. Abre `https://tu-app.vercel.app`
2. Abre DevTools (F12) → Pestaña **Network**
3. Recarga la página
4. Verifica:
   - ✅ Requests van a `https://tu-proyecto.up.railway.app`
   - ✅ Status 200 (no errores CORS)
   - ✅ Los datos cargan correctamente

### 5.3 Checklist Final

- [ ] Backend deployado y accesible públicamente
- [ ] CORS configurado correctamente
- [ ] `environment.prod.ts` tiene la URL correcta del backend
- [ ] Frontend deployado en Vercel
- [ ] Datos cargan correctamente en producción
- [ ] No hay errores CORS en consola
- [ ] No hay errores 404 en Network tab

---

## 🔧 Solución de Problemas

### Error: CORS

**Síntoma:** Error en consola sobre CORS policy

**Solución:**
1. Verificar que CORS en backend incluya la URL de Vercel
2. Verificar formato de URL (debe ser exacto, incluyendo `https://`)
3. Redeploy backend después de cambiar CORS

### Error: 404 Not Found

**Síntoma:** Requests devuelven 404

**Solución:**
1. Verificar URL en `environment.prod.ts`
2. Verificar que no tenga `/api` al final (ya está en los services)
3. Probar URL manualmente con curl

### Error: Network Error / Failed to fetch

**Síntoma:** No se pueden hacer requests

**Solución:**
1. Verificar que backend esté accesible públicamente
2. Verificar que URL sea HTTPS (Vercel requiere HTTPS)
3. Verificar firewall/proxy

---

## 📝 URLs a Anotar

Anota estas URLs:

1. **Backend URL:** `https://tu-proyecto.up.railway.app`
2. **Frontend URL:** `https://tu-app.vercel.app`

¡Listo! Tu aplicación está en producción. 🎉

