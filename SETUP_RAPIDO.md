# ⚡ Setup Rápido - Deploy Completo

## 🎯 Resumen de 5 Pasos

### 1️⃣ Backend en Railway (5 minutos)

```bash
# 1. Ve a https://railway.app y crea cuenta
# 2. New Project → Deploy from GitHub repo
# 3. Selecciona tu repo
# 4. Railway detectará automáticamente el Dockerfile
# 5. Agrega estas variables de entorno:
```

**Variables de entorno en Railway:**
```
ASPNETCORE_ENVIRONMENT=Production
Cors__Origins__0=https://tu-app.vercel.app
Cors__Origins__1=https://*.vercel.app
```

**Anota la URL del backend:** `https://tu-proyecto.up.railway.app`

---

### 2️⃣ Actualizar Frontend (1 minuto)

Edita `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-proyecto.up.railway.app' // ← PEGA TU URL DE RAILWAY AQUÍ
};
```

---

### 3️⃣ Deploy en Vercel (3 minutos)

1. Ve a https://vercel.com
2. New Project → Import GitHub repo
3. Configuración:
   - **Framework:** Angular
   - **Root Directory:** (vacío)
   - **Build Command:** `cd frontend && npm install && npm run build -- --configuration production`
   - **Output Directory:** `frontend/dist/mro-lite`
4. Deploy

**Anota la URL del frontend:** `https://tu-app.vercel.app`

---

### 4️⃣ Actualizar CORS en Railway (1 minuto)

1. Ve a Railway → Settings → Variables
2. Actualiza:
   ```
   Cors__Origins__0=https://tu-app.vercel.app  ← PEGA TU URL DE VERCEL
   Cors__Origins__1=https://*.vercel.app
   ```
3. Railway redeployará automáticamente

---

### 5️⃣ Verificar (2 minutos)

1. Abre `https://tu-app.vercel.app`
2. F12 → Network tab
3. Verifica que:
   - ✅ Requests van al backend correcto
   - ✅ Status 200 (sin errores CORS)
   - ✅ Los datos cargan

---

## ✅ Listo!

Tienes tu app en producción:
- **Backend:** `https://tu-proyecto.up.railway.app`
- **Frontend:** `https://tu-app.vercel.app`

## 🔧 Si algo falla

Ver `DEPLOY_COMPLETO.md` para troubleshooting detallado.

